import { useEffect, useRef, useCallback } from 'react';
import type { DataPoint, ChartConfig, ViewportState } from '@shared/schema';

interface UseChartRendererOptions {
  data: DataPoint[];
  config: ChartConfig;
  viewport: ViewportState;
  onRenderComplete?: (renderTime: number) => void;
}

export function useChartRenderer(options: UseChartRendererOptions) {
  const { data, config, viewport, onRenderComplete } = options;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastRenderRef = useRef<number>(0);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true 
    });
    if (!ctx) return;

    const startTime = performance.now();

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.clearRect(0, 0, rect.width, rect.height);

    const renderTime = performance.now() - startTime;
    lastRenderRef.current = renderTime;
    
    if (onRenderComplete) {
      onRenderComplete(renderTime);
    }
  }, [data, config, viewport, onRenderComplete]);

  const scheduleRender = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(render);
  }, [render]);

  useEffect(() => {
    scheduleRender();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scheduleRender]);

  return {
    canvasRef,
    scheduleRender,
  };
}
