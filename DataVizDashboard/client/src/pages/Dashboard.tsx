import { useState, useCallback, useMemo, useEffect } from 'react';
import type { TimeRange, AggregationPeriod } from '@shared/schema';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useDataStream } from '@/hooks/useDataStream';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { FilterPanel } from '@/components/FilterPanel';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { ScatterPlot } from '@/components/charts/ScatterPlot';
import { Heatmap } from '@/components/charts/Heatmap';
import { DataTable } from '@/components/DataTable';
import { aggregateData, getAggregationPeriod } from '@/lib/performanceUtils';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [aggregation, setAggregation] = useState<AggregationPeriod>('none');
  const [isDark, setIsDark] = useState(false);

  const { metrics, updateDataPointsCount, updateRenderTime, getFPSHistory } = usePerformanceMonitor();
  
  const {
    data,
    isStreaming,
    startStreaming,
    stopStreaming,
    clearData,
    setDataPoints,
  } = useDataStream({
    maxPoints: 50000,
    useServerStream: true,
  });

  // Filter data by time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all' || data.length === 0) return data;
    
    const now = Date.now();
    const timeRangeMs = {
      '1min': 60 * 1000,
      '5min': 5 * 60 * 1000,
      '1hour': 60 * 60 * 1000,
    }[timeRange];
    
    const cutoff = now - timeRangeMs;
    return data.filter(point => point.timestamp >= cutoff);
  }, [data, timeRange]);

  // Apply aggregation to filtered data
  const processedData = useMemo(() => {
    if (aggregation === 'none') return filteredData;
    
    const periodMs = getAggregationPeriod(aggregation);
    return aggregateData(filteredData, periodMs);
  }, [filteredData, aggregation]);

  useEffect(() => {
    updateDataPointsCount(processedData.length);
  }, [processedData.length, updateDataPointsCount]);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Load initial dataset then start streaming
    const initialize = async () => {
      try {
        const response = await fetch('/api/data/initial/10000');
        if (response.ok) {
          const initialData = await response.json();
          setDataPoints(initialData);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        // Always start streaming
        setTimeout(() => startStreaming(), 500);
      }
    };

    initialize();
    
    return () => {
      stopStreaming();
    };
  }, []);

  const handleToggleStreaming = useCallback(() => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  }, [isStreaming, startStreaming, stopStreaming]);

  const handleStressTest = useCallback(async (count: number) => {
    try {
      const response = await fetch(`/api/data/generate?count=${count}`);
      const newData = await response.json();
      setDataPoints(newData);
    } catch (error) {
      console.error('Stress test failed:', error);
    }
  }, [setDataPoints]);

  const handleRenderComplete = useCallback((time: number) => {
    updateRenderTime(time);
  }, [updateRenderTime]);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Performance Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time visualization of 10,000+ data points at 60fps
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-toggle-theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <PerformanceMonitor metrics={metrics} fpsHistory={getFPSHistory()} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel
              isStreaming={isStreaming}
              onToggleStreaming={handleToggleStreaming}
              onClearData={clearData}
              onStressTest={handleStressTest}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              aggregation={aggregation}
              onAggregationChange={setAggregation}
              dataPointsCount={processedData.length}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <LineChart
                data={processedData}
                title="Line Chart"
                onRenderComplete={handleRenderComplete}
              />
              <BarChart
                data={processedData}
                title="Bar Chart"
                onRenderComplete={handleRenderComplete}
              />
              <ScatterPlot
                data={processedData}
                title="Scatter Plot"
                onRenderComplete={handleRenderComplete}
              />
              <Heatmap
                data={processedData}
                title="Heatmap"
                onRenderComplete={handleRenderComplete}
              />
            </div>

            <DataTable data={processedData} maxRows={1000} />
          </div>
        </div>
      </main>
    </div>
  );
}
