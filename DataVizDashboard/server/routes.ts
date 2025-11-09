import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { DataPoint } from "@shared/schema";

function generateTimeSeriesData(count: number, timeRangeMs: number = 60000): DataPoint[] {
  const data: DataPoint[] = [];
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

function aggregateDataPoints(
  data: DataPoint[],
  periodMs: number
): DataPoint[] {
  if (data.length === 0 || periodMs === 0) return data;

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Get initial dataset for dashboard
  app.get("/api/data/initial/:count?", (req, res) => {
    try {
      const count = parseInt(req.params.count || "10000", 10);
      
      if (count < 100 || count > 100000) {
        return res.status(400).json({ 
          error: "Count must be between 100 and 100000" 
        });
      }

      const data = generateTimeSeriesData(count, 60000);
      res.json(data);
    } catch (error) {
      console.error("Error generating initial data:", error);
      res.status(500).json({ error: "Failed to generate data" });
    }
  });

  // Generate data for stress testing
  app.get("/api/data/generate", (req, res) => {
    try {
      const count = parseInt(req.query.count as string || "10000", 10);
      
      if (count < 100 || count > 100000) {
        return res.status(400).json({ 
          error: "Count must be between 100 and 100000" 
        });
      }

      const timeRange = parseInt(req.query.timeRange as string || "60000", 10);
      const data = generateTimeSeriesData(count, timeRange);
      
      res.json(data);
    } catch (error) {
      console.error("Error generating stress test data:", error);
      res.status(500).json({ error: "Failed to generate data" });
    }
  });

  // Aggregate data by time period
  app.post("/api/data/aggregate", (req, res) => {
    try {
      const { data, period } = req.body;
      
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Data must be an array" });
      }

      const periodMap: Record<string, number> = {
        '1min': 60 * 1000,
        '5min': 5 * 60 * 1000,
        '1hour': 60 * 60 * 1000,
        'none': 0,
      };

      const periodMs = periodMap[period] || 0;
      const aggregatedData = aggregateDataPoints(data, periodMs);
      
      res.json(aggregatedData);
    } catch (error) {
      console.error("Error aggregating data:", error);
      res.status(500).json({ error: "Failed to aggregate data" });
    }
  });

  // Server-Sent Events for real-time data streaming
  app.get("/api/data/stream", (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const categories = ['A', 'B', 'C', 'D'];
    
    const sendDataPoint = () => {
      const now = Date.now();
      const value = Math.sin(now / 1000) * 50 + Math.random() * 20 + 50;
      
      const dataPoint: DataPoint = {
        timestamp: now,
        value: Math.round(value * 100) / 100,
        category: categories[Math.floor(Math.random() * categories.length)],
      };
      
      res.write(`data: ${JSON.stringify(dataPoint)}\n\n`);
    };

    // Send initial point immediately
    sendDataPoint();

    // Send new point every 100ms
    const interval = setInterval(sendDataPoint, 100);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      timestamp: Date.now(),
      capabilities: {
        maxDataPoints: 100000,
        supportedAggregations: ['1min', '5min', '1hour', 'none'],
      }
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
