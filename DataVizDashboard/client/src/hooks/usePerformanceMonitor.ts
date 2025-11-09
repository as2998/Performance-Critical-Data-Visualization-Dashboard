import { useState, useEffect, useRef, useCallback } from 'react';
import type { PerformanceMetrics } from '@shared/schema';

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    dataPointsCount: 0,
    renderTime: 0,
    lastUpdate: Date.now(),
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>();

  const measureFPS = useCallback(() => {
    frameCountRef.current++;
    const now = Date.now();
    const delta = now - lastTimeRef.current;

    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      
      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 60) {
        fpsHistoryRef.current.shift();
      }

      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo 
        ? Math.round(memoryInfo.usedJSHeapSize / 1048576) 
        : 0;

      setMetrics(prev => ({
        ...prev,
        fps,
        memoryUsage,
        lastUpdate: now,
      }));

      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(measureFPS);
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [measureFPS]);

  const updateDataPointsCount = useCallback((count: number) => {
    setMetrics(prev => ({ ...prev, dataPointsCount: count }));
  }, []);

  const updateRenderTime = useCallback((time: number) => {
    setMetrics(prev => ({ ...prev, renderTime: time }));
  }, []);

  const getFPSHistory = useCallback(() => {
    return fpsHistoryRef.current;
  }, []);

  return {
    metrics,
    updateDataPointsCount,
    updateRenderTime,
    getFPSHistory,
  };
}
