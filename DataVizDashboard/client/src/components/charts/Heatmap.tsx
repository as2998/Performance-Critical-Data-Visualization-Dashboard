import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import type { DataPoint } from '@shared/schema';
import { setupCanvas, clearCanvas } from '@/lib/canvasUtils';
import { Card } from '@/components/ui/card';

interface HeatmapProps {
  data: DataPoint[];
  title?: string;
  onRenderComplete?: (time: number) => void;
}

export function Heatmap({ data, title = 'Heatmap', onRenderComplete }: HeatmapProps) {
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
    margin: { top: 20, right: 80, bottom: 40, left: 60 },
  }), []);

  const gridData = useMemo(() => {
    const gridSize = 20;
    const grid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    
    data.forEach((point, idx) => {
      const row = Math.floor((idx / data.length) * gridSize) % gridSize;
      const col = Math.floor((point.value / 100) * gridSize) % gridSize;
      
      if (row < gridSize && col < gridSize) {
        grid[row][col] += point.value;
      }
    });
    
    return grid;
  }, [data]);

  const { min, max } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    
    gridData.forEach(row => {
      row.forEach(value => {
        if (value > 0) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });
    
    return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 100 : max };
  }, [gridData]);

  const getColor = useCallback((value: number) => {
    if (value === 0) return isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    
    const normalized = (value - min) / (max - min || 1);
    const hue = isDark ? 217 : 217;
    const saturation = 91;
    const lightness = isDark ? 40 + normalized * 40 : 80 - normalized * 40;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }, [min, max, isDark]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startTime = performance.now();
    const setup = setupCanvas(canvas);
    if (!setup) return;

    const { ctx, width, height } = setup;
    const bgColor = isDark ? '#171717' : '#fafafa';
    clearCanvas(ctx, width, height, bgColor);

    const chartWidth = width - config.margin.left - config.margin.right;
    const chartHeight = height - config.margin.top - config.margin.bottom;
    const cellWidth = chartWidth / gridData[0].length;
    const cellHeight = chartHeight / gridData.length;

    gridData.forEach((row, i) => {
      row.forEach((value, j) => {
        const x = config.margin.left + j * cellWidth;
        const y = config.margin.top + i * cellHeight;
        
        ctx.fillStyle = getColor(value);
        ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);
      });
    });

    const legendWidth = 20;
    const legendHeight = chartHeight;
    const legendX = width - config.margin.right + 20;
    const steps = 20;

    for (let i = 0; i < steps; i++) {
      const value = min + ((max - min) / steps) * i;
      const y = config.margin.top + legendHeight - (legendHeight / steps) * (i + 1);
      
      ctx.fillStyle = getColor(value);
      ctx.fillRect(legendX, y, legendWidth, legendHeight / steps);
    }

    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, config.margin.top, legendWidth, legendHeight);

    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(max.toFixed(0), legendX + legendWidth + 4, config.margin.top + 10);
    ctx.fillText(min.toFixed(0), legendX + legendWidth + 4, config.margin.top + legendHeight);

    const renderTime = performance.now() - startTime;
    if (onRenderComplete) {
      onRenderComplete(renderTime);
    }
  }, [gridData, config, getColor, min, max, isDark, onRenderComplete]);

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
          data-testid="canvas-heatmap"
        />
      </div>
    </Card>
  );
}
