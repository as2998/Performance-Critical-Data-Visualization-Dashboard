import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { TimeRange, AggregationPeriod } from '@shared/schema';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface FilterPanelProps {
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onClearData: () => void;
  onStressTest: (count: number) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  aggregation: AggregationPeriod;
  onAggregationChange: (period: AggregationPeriod) => void;
  dataPointsCount: number;
}

export function FilterPanel({
  isStreaming,
  onToggleStreaming,
  onClearData,
  onStressTest,
  timeRange,
  onTimeRangeChange,
  aggregation,
  onAggregationChange,
  dataPointsCount,
}: FilterPanelProps) {
  const timeRanges: TimeRange[] = ['1min', '5min', '1hour', 'all'];
  const aggregations: AggregationPeriod[] = ['none', '1min', '5min', '1hour'];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Controls</h3>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-3 block">Stream Control</Label>
          <div className="flex gap-2">
            <Button
              onClick={onToggleStreaming}
              variant={isStreaming ? 'destructive' : 'default'}
              className="flex-1"
              data-testid={isStreaming ? "button-stop-streaming" : "button-start-streaming"}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button
              onClick={onClearData}
              variant="outline"
              data-testid="button-clear-data"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Time Range</Label>
          <div className="grid grid-cols-2 gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange(range)}
                data-testid={`button-time-range-${range}`}
              >
                {range === 'all' ? 'All' : range}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Aggregation</Label>
          <div className="grid grid-cols-2 gap-2">
            {aggregations.map((period) => (
              <Button
                key={period}
                variant={aggregation === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAggregationChange(period)}
                data-testid={`button-aggregation-${period}`}
              >
                {period === 'none' ? 'None' : period}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Stress Test
            </div>
          </Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStressTest(10000)}
                data-testid="button-stress-10k"
              >
                10K Points
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStressTest(25000)}
                data-testid="button-stress-25k"
              >
                25K Points
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStressTest(50000)}
                data-testid="button-stress-50k"
              >
                50K Points
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStressTest(100000)}
                data-testid="button-stress-100k"
              >
                100K Points
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Current: <span className="font-mono font-semibold text-foreground">{dataPointsCount.toLocaleString()}</span> points
          </p>
        </div>
      </div>
    </Card>
  );
}
