import type { DataPoint, ChartConfig } from '@shared/schema';

export function setupCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: true,
  });
  
  if (!ctx) return null;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  ctx.scale(dpr, dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  return { ctx, width: rect.width, height: rect.height };
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor: string = '#ffffff'
) {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  isDark: boolean = false
) {
  const { width, height, margin } = config;
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const gridCountX = 10;
  const gridCountY = 8;

  ctx.beginPath();
  for (let i = 0; i <= gridCountX; i++) {
    const x = margin.left + (chartWidth / gridCountX) * i;
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, height - margin.bottom);
  }

  for (let i = 0; i <= gridCountY; i++) {
    const y = margin.top + (chartHeight / gridCountY) * i;
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
  }
  ctx.stroke();
}

export function drawAxes(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  isDark: boolean = false
) {
  const { width, height, margin } = config;
  const axisColor = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';

  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, height - margin.bottom);
  ctx.lineTo(width - margin.right, height - margin.bottom);
  ctx.stroke();
}

export function getMinMax(data: DataPoint[]): { min: number; max: number } {
  if (data.length === 0) return { min: 0, max: 100 };
  
  let min = Infinity;
  let max = -Infinity;
  
  for (const point of data) {
    if (point.value < min) min = point.value;
    if (point.value > max) max = point.value;
  }
  
  const padding = (max - min) * 0.1;
  return {
    min: min - padding,
    max: max + padding,
  };
}

export function scaleValue(
  value: number,
  min: number,
  max: number,
  height: number,
  margin: { top: number; bottom: number }
): number {
  const range = max - min;
  const chartHeight = height - margin.top - margin.bottom;
  return height - margin.bottom - ((value - min) / range) * chartHeight;
}

export function formatTimestamp(timestamp: number, format: 'time' | 'full' = 'time'): string {
  const date = new Date(timestamp);
  
  if (format === 'time') {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }
  
  return date.toLocaleString();
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
