import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import type { DataPoint } from '@shared/schema';
import { setupCanvas, clearCanvas, drawGrid, drawAxes, getMinMax, scaleValue } from '@/lib/canvasUtils';
import { Card } from '@/components/ui/card';

interface ScatterPlotProps {
  data: DataPoint[];
  title?: string;
  onRenderComplete?: (time: number) => void;
}

export function ScatterPlot({ data, title = 'Scatter Plot', onRenderComplete }: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
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
    height: 800,
    margin: { top: 20, right: 20, bottom: 40, left: 60 },
    showGrid: true,
    showAxes: true,
  }), []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

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

    const { min: yMin, max: yMax } = getMinMax(data);
    const chartWidth = width - config.margin.left - config.margin.right;
    const chartHeight = height - config.margin.top - config.margin.bottom;

    const xMin = data.length > 0 ? Math.min(...data.map(d => d.timestamp)) : 0;
    const xMax = data.length > 0 ? Math.max(...data.map(d => d.timestamp)) : 1;
    const xRange = xMax - xMin || 1;

    const colors = [
      isDark ? 'hsl(217, 91%, 70%)' : 'hsl(217, 91%, 45%)',
      isDark ? 'hsl(173, 80%, 65%)' : 'hsl(173, 80%, 40%)',
      isDark ? 'hsl(43, 96%, 70%)' : 'hsl(43, 96%, 56%)',
      isDark ? 'hsl(27, 87%, 75%)' : 'hsl(27, 87%, 67%)',
    ];

    data.forEach((point) => {
      const x = config.margin.left + ((point.timestamp - xMin) / xRange) * chartWidth;
      const y = scaleValue(point.value, yMin, yMax, height, config.margin);

      const colorIndex = point.category 
        ? point.category.charCodeAt(0) % colors.length 
        : 0;
      
      ctx.fillStyle = colors[colorIndex];
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    ctx.font = '12px JetBrains Mono';
    ctx.textAlign = 'right';
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const value = yMin + ((yMax - yMin) / yTicks) * i;
      const y = scaleValue(value, yMin, yMax, height, config.margin);
      ctx.fillText(value.toFixed(1), config.margin.left - 10, y + 4);
    }

    const renderTime = performance.now() - startTime;
    if (onRenderComplete) {
      onRenderComplete(renderTime);
    }
  }, [data, config, isDark, onRenderComplete]);

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

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold" data-testid="text-chart-title">{title}</h3>
      </div>
      <div className="w-full aspect-square">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          data-testid="canvas-scatter-plot"
        />
      </div>
    </Card>
  );
}
