import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import type { DataPoint, ViewportState } from '@shared/schema';
import { setupCanvas, clearCanvas, drawGrid, drawAxes, getMinMax, scaleValue } from '@/lib/canvasUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface LineChartProps {
  data: DataPoint[];
  title?: string;
  onRenderComplete?: (time: number) => void;
}

export function LineChart({ data, title = 'Line Chart', onRenderComplete }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [viewport, setViewport] = useState<ViewportState>({
    zoomLevel: 1,
    panX: 0,
    panY: 0,
  });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const config = useMemo(() => ({
    width: 800,
    height: 400,
    margin: { top: 20, right: 20, bottom: 40, left: 60 },
    showGrid: true,
    showAxes: true,
  }), []);

  const visibleData = useMemo(() => {
    const zoomFactor = viewport.zoomLevel;
    const dataLength = data.length;
    const visibleCount = Math.max(Math.floor(dataLength / zoomFactor), 10);
    const startIdx = Math.max(0, dataLength - visibleCount);
    
    return data.slice(startIdx);
  }, [data, viewport.zoomLevel]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || visibleData.length === 0) return;

    const startTime = performance.now();
    const setup = setupCanvas(canvas);
    if (!setup) return;

    const { ctx, width, height } = setup;
    const bgColor = isDark ? '#171717' : '#fafafa';
    clearCanvas(ctx, width, height, bgColor);

    if (config.showGrid) {
      drawGrid(ctx, { ...config, width, height }, isDark);
    }

    if (config.showAxes) {
      drawAxes(ctx, { ...config, width, height }, isDark);
    }

    const { min, max } = getMinMax(visibleData);
    const chartWidth = width - config.margin.left - config.margin.right;
    const xStep = chartWidth / Math.max(visibleData.length - 1, 1);

    ctx.strokeStyle = isDark ? 'hsl(217, 91%, 70%)' : 'hsl(217, 91%, 45%)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    visibleData.forEach((point, i) => {
      const x = config.margin.left + i * xStep;
      const y = scaleValue(point.value, min, max, height, config.margin);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)';
    ctx.beginPath();
    visibleData.forEach((point, i) => {
      const x = config.margin.left + i * xStep;
      const y = scaleValue(point.value, min, max, height, config.margin);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width - config.margin.right, height - config.margin.bottom);
    ctx.lineTo(config.margin.left, height - config.margin.bottom);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    ctx.font = '12px JetBrains Mono';
    ctx.textAlign = 'right';
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const value = min + ((max - min) / yTicks) * i;
      const y = scaleValue(value, min, max, height, config.margin);
      ctx.fillText(value.toFixed(1), config.margin.left - 10, y + 4);
    }

    const renderTime = performance.now() - startTime;
    if (onRenderComplete) {
      onRenderComplete(renderTime);
    }
  }, [visibleData, config, viewport, isDark, onRenderComplete]);

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  const handleZoomIn = () => {
    setViewport(prev => ({ ...prev, zoomLevel: Math.min(prev.zoomLevel * 1.5, 10) }));
  };

  const handleZoomOut = () => {
    setViewport(prev => ({ ...prev, zoomLevel: Math.max(prev.zoomLevel / 1.5, 1) }));
  };

  const handleReset = () => {
    setViewport({ zoomLevel: 1, panX: 0, panY: 0 });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" data-testid="text-chart-title">{title}</h3>
        <div className="flex gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleZoomIn}
            data-testid="button-zoom-in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleZoomOut}
            data-testid="button-zoom-out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleReset}
            data-testid="button-reset-zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div ref={containerRef} className="w-full aspect-video">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          data-testid="canvas-line-chart"
        />
      </div>
    </Card>
  );
}
