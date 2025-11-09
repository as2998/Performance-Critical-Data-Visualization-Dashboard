import { useMemo } from 'react';
import type { DataPoint } from '@shared/schema';
import { useVirtualization } from '@/hooks/useVirtualization';
import { Card } from '@/components/ui/card';
import { formatTimestamp, formatNumber } from '@/lib/canvasUtils';

interface DataTableProps {
  data: DataPoint[];
  maxRows?: number;
}

export function DataTable({ data, maxRows = 1000 }: DataTableProps) {
  const displayData = useMemo(() => {
    return data.slice(-maxRows).reverse();
  }, [data, maxRows]);

  const { containerRef, visibleItems, totalHeight } = useVirtualization({
    itemCount: displayData.length,
    itemHeight: 48,
    containerHeight: 400,
    overscan: 10,
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Data Table (Latest {Math.min(displayData.length, maxRows)} points)</h3>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted">
          <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm font-medium">
            <div>Timestamp</div>
            <div className="text-right">Value</div>
            <div>Category</div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="overflow-auto"
          style={{ height: '400px' }}
          data-testid="table-data"
        >
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            {visibleItems.map(({ index, offsetTop }) => {
              const point = displayData[index];
              if (!point) return null;

              return (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 px-4 py-3 text-sm border-b hover-elevate"
                  style={{
                    position: 'absolute',
                    top: `${offsetTop}px`,
                    left: 0,
                    right: 0,
                    height: '48px',
                  }}
                  data-testid={`row-data-${index}`}
                >
                  <div className="font-mono text-xs">
                    {formatTimestamp(point.timestamp, 'time')}
                  </div>
                  <div className="text-right font-mono font-semibold">
                    {formatNumber(point.value)}
                  </div>
                  <div>
                    {point.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        {point.category}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Showing {displayData.length.toLocaleString()} of {data.length.toLocaleString()} total points
      </p>
    </Card>
  );
}
