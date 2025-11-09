import { useMemo } from 'react';
import type { PerformanceMetrics } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Activity, Database, Clock } from 'lucide-react';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  fpsHistory?: number[];
}

export function PerformanceMonitor({ metrics, fpsHistory = [] }: PerformanceMonitorProps) {
  const fpsStatus = useMemo(() => {
    if (metrics.fps >= 55) return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    if (metrics.fps >= 30) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  }, [metrics.fps]);

  const memoryStatus = useMemo(() => {
    if (metrics.memoryUsage < 100) return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    if (metrics.memoryUsage < 200) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  }, [metrics.memoryUsage]);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-4">Performance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${fpsStatus.bg} ${fpsStatus.border}`}>
          <div className={`p-2 rounded-md bg-background/50`}>
            <Activity className={`w-4 h-4 ${fpsStatus.color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">FPS</p>
            <p className={`text-xl font-bold font-mono ${fpsStatus.color}`} data-testid="text-fps-value">
              {metrics.fps}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-3 p-3 rounded-lg border ${memoryStatus.bg} ${memoryStatus.border}`}>
          <div className={`p-2 rounded-md bg-background/50`}>
            <Database className={`w-4 h-4 ${memoryStatus.color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Memory</p>
            <p className={`text-xl font-bold font-mono ${memoryStatus.color}`} data-testid="text-memory-value">
              {metrics.memoryUsage} MB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border bg-primary/10 border-primary/20">
          <div className="p-2 rounded-md bg-background/50">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Data Points</p>
            <p className="text-xl font-bold font-mono text-primary" data-testid="text-data-points-value">
              {metrics.dataPointsCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {fpsHistory.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">FPS History (Last 60s)</p>
          <div className="h-16 flex items-end gap-0.5">
            {fpsHistory.slice(-60).map((fps, i) => {
              const height = (fps / 60) * 100;
              const color = fps >= 55 ? 'bg-green-500' : fps >= 30 ? 'bg-yellow-500' : 'bg-red-500';
              
              return (
                <div
                  key={i}
                  className={`flex-1 ${color} rounded-sm transition-all`}
                  style={{ height: `${height}%` }}
                  title={`${fps} FPS`}
                />
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
