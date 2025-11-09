import { z } from "zod";

// Data Point for time-series visualization
export interface DataPoint {
  timestamp: number;
  value: number;
  category?: string;
}

// Performance Metrics for monitoring
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  dataPointsCount: number;
  renderTime: number;
  lastUpdate: number;
}

// Chart Configuration
export interface ChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  showGrid: boolean;
  showAxes: boolean;
}

// Time Range for filtering
export type TimeRange = '1min' | '5min' | '1hour' | 'all';

// Aggregation Period
export type AggregationPeriod = '1min' | '5min' | '1hour' | 'none';

// Chart Type
export type ChartType = 'line' | 'bar' | 'scatter' | 'heatmap';

// Zoom/Pan State
export interface ViewportState {
  zoomLevel: number;
  panX: number;
  panY: number;
}

// Data Generation Request
export const dataGenerationRequestSchema = z.object({
  count: z.number().min(100).max(100000),
  timeRange: z.enum(['1min', '5min', '1hour', 'all']),
});

export type DataGenerationRequest = z.infer<typeof dataGenerationRequestSchema>;

// Data Aggregation Request
export const dataAggregationRequestSchema = z.object({
  data: z.array(z.object({
    timestamp: z.number(),
    value: z.number(),
    category: z.string().optional(),
  })),
  period: z.enum(['1min', '5min', '1hour', 'none']),
});

export type DataAggregationRequest = z.infer<typeof dataAggregationRequestSchema>;
