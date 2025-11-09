export function generateTimeSeriesData(count: number, timeRangeMs: number = 60000): {
  timestamp: number;
  value: number;
  category?: string;
}[] {
  const data = [];
  const now = Date.now();
  const interval = timeRangeMs / count;
  const categories = ['A', 'B', 'C', 'D'];

  for (let i = 0; i < count; i++) {
    const timestamp = now - timeRangeMs + (i * interval);
    const baseValue = 50;
    const trend = (i / count) * 20;
    const wave = Math.sin((i / count) * Math.PI * 4) * 15;
    const noise = (Math.random() - 0.5) * 10;
    
    data.push({
      timestamp: Math.round(timestamp),
      value: Math.round((baseValue + trend + wave + noise) * 100) / 100,
      category: categories[Math.floor(Math.random() * categories.length)],
    });
  }

  return data;
}

export function aggregateData(
  data: { timestamp: number; value: number; category?: string }[],
  periodMs: number
): { timestamp: number; value: number; category?: string }[] {
  if (data.length === 0) return [];

  const buckets = new Map<number, { sum: number; count: number; category?: string }>();

  for (const point of data) {
    const bucketKey = Math.floor(point.timestamp / periodMs) * periodMs;
    
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, { sum: 0, count: 0, category: point.category });
    }
    
    const bucket = buckets.get(bucketKey)!;
    bucket.sum += point.value;
    bucket.count += 1;
  }

  return Array.from(buckets.entries())
    .map(([timestamp, { sum, count, category }]) => ({
      timestamp,
      value: Math.round((sum / count) * 100) / 100,
      category,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

export function getAggregationPeriod(period: '1min' | '5min' | '1hour' | 'none'): number {
  switch (period) {
    case '1min': return 60 * 1000;
    case '5min': return 5 * 60 * 1000;
    case '1hour': return 60 * 60 * 1000;
    default: return 0;
  }
}

export function measurePerformance<T>(fn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  return { result, duration };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastExecTime >= delay) {
      func.apply(this, args);
      lastExecTime = now;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (now - lastExecTime));
    }
  };
}
