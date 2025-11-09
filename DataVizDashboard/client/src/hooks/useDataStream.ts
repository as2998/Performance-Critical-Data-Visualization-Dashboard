import { useState, useEffect, useCallback, useRef } from 'react';
import type { DataPoint } from '@shared/schema';

interface UseDataStreamOptions {
  initialData?: DataPoint[];
  maxPoints?: number;
  useServerStream?: boolean;
}

export function useDataStream(options: UseDataStreamOptions = {}) {
  const {
    initialData = [],
    maxPoints = 10000,
    useServerStream = true,
  } = options;

  const [data, setData] = useState<DataPoint[]>(initialData);
  const [isStreaming, setIsStreaming] = useState(false);
  const dataWindowRef = useRef<DataPoint[]>(initialData);
  const eventSourceRef = useRef<EventSource | null>(null);

  const addDataPoint = useCallback((point: DataPoint) => {
    // O(1) mutation instead of O(n) array copy
    dataWindowRef.current.push(point);
    
    if (dataWindowRef.current.length > maxPoints) {
      // Remove oldest points efficiently
      dataWindowRef.current.splice(0, dataWindowRef.current.length - maxPoints);
    }
    
    // Still need to create new reference for React to detect change
    setData([...dataWindowRef.current]);
  }, [maxPoints]);

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const startStreaming = useCallback(() => {
    if (eventSourceRef.current || !useServerStream) return;
    
    setIsStreaming(true);
    
    // Use Server-Sent Events for real-time streaming
    console.log('Starting SSE connection to /api/data/stream');
    const eventSource = new EventSource('/api/data/stream');
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => {
      console.log('SSE connection opened successfully');
    };
    
    eventSource.onmessage = (event) => {
      try {
        const dataPoint: DataPoint = JSON.parse(event.data);
        addDataPoint(dataPoint);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error event:', error);
      console.error('ReadyState:', eventSource.readyState);
      
      // Don't stop on temporary errors
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE connection closed, stopping stream');
        stopStreaming();
      }
    };
  }, [addDataPoint, useServerStream, stopStreaming]);

  const clearData = useCallback(() => {
    dataWindowRef.current = [];
    setData([]);
  }, []);

  const setDataPoints = useCallback((points: DataPoint[]) => {
    dataWindowRef.current = points.slice(-maxPoints);
    setData([...dataWindowRef.current]);
  }, [maxPoints]);

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    data,
    isStreaming,
    startStreaming,
    stopStreaming,
    clearData,
    setDataPoints,
    addDataPoint,
  };
}
