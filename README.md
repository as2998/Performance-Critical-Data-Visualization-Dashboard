Performance-Critical Data Visualization Dashboard
Overview
A high-performance real-time data visualization dashboard built with React, TypeScript, and Express that renders 10,000+ data points at 60fps using custom canvas-based rendering. The application demonstrates advanced performance optimization techniques including custom canvas rendering, virtual scrolling, and efficient data streaming via Server-Sent Events (SSE). It features multiple chart types (line, bar, scatter, heatmap) with real-time updates, interactive controls (zoom, pan, filtering), and comprehensive performance monitoring.

User Preferences
Preferred communication style: Simple, everyday language.

System Architecture
Frontend Architecture
Framework & Build System

React 18+ with TypeScript for type-safe component development
Vite as the build tool and development server for fast HMR and optimized production builds
Wouter for lightweight client-side routing
UI Component System

Radix UI primitives for accessible, unstyled components
shadcn/ui component library following Material Design 3 with Carbon Design influences
Tailwind CSS for utility-first styling with custom design tokens
Dark mode support via CSS variables and class-based theme switching
State Management

React hooks (useState, useEffect, useMemo, useCallback) for local component state
Custom hooks for specialized logic:
usePerformanceMonitor: Tracks FPS, memory usage, render times via requestAnimationFrame
useDataStream: Manages real-time data streaming from backend via SSE
useVirtualization: Implements virtual scrolling for large data tables
useChartRenderer: Handles canvas-based chart rendering with RAF scheduling
TanStack Query (React Query) for server state management and caching
Rendering Strategy

Canvas API for high-performance chart rendering (10K+ points)
Custom rendering pipeline with optimizations:
Device pixel ratio scaling for crisp rendering on high-DPI displays
desynchronized: true canvas context for reduced latency
RequestAnimationFrame scheduling to maintain 60fps
Efficient data sampling and aggregation to reduce render complexity
Virtual DOM (React) for UI controls and non-performance-critical components
Performance Optimizations

Memoization (useMemo, useCallback, React.memo) to prevent unnecessary re-renders
Data aggregation by time periods (1min, 5min, 1hour) to reduce point count
Virtual scrolling for data tables (renders only visible rows)
Efficient array operations (mutations for hot paths, immutable updates for React state)
Debounced/throttled event handlers for user interactions
Backend Architecture
Server Framework

Express.js for HTTP server and API routing
TypeScript for type safety across the stack
HTTP server created via Node's http module for SSE support
API Design

RESTful endpoints for data generation and aggregation
Server-Sent Events (SSE) for real-time data streaming at 100ms intervals
Endpoints:
POST /api/data/generate: Generate synthetic time-series data
GET /api/data/aggregate: Aggregate data by time periods
GET /api/data/stream: SSE endpoint for real-time data updates
Data Generation

Synthetic time-series data with realistic patterns (trends, waves, noise)
Configurable data point counts (100 to 100,000)
Category-based data for grouped visualizations
Development Tools

Vite middleware integration for HMR in development
Custom request logging middleware
Error overlay plugin for runtime error visibility
Data Storage Solutions
Storage Strategy

In-memory data generation (no persistent storage required)
Data is generated on-demand based on client requests
Drizzle ORM configured for potential database integration (PostgreSQL via Neon)
Current implementation uses MemStorage class as placeholder for future database integration
Schema Definitions

Zod schemas for runtime validation of API requests
TypeScript interfaces for compile-time type checking:
DataPoint: Time-series data structure with timestamp, value, category
PerformanceMetrics: FPS, memory usage, render time tracking
ChartConfig: Chart dimensions, margins, display options
ViewportState: Zoom and pan state for interactive charts
External Dependencies
UI Component Libraries

Radix UI: Accessible component primitives (dialogs, dropdowns, tooltips, etc.)
shadcn/ui: Pre-styled components built on Radix UI
Lucide React: Icon library for UI elements
Performance & Monitoring

Browser Performance API: Memory usage tracking (performance.memory)
RequestAnimationFrame: Smooth 60fps rendering and FPS measurement
Data Streaming

Server-Sent Events (SSE): Native browser API for real-time server→client streaming
EventSource: Browser-native SSE client
State & Data Management

TanStack Query: Server state management, caching, background refetching
React Hook Form: Form state management with Zod validation
Hookform Resolvers: Zod schema integration for form validation
Build & Development Tools

Vite: Fast build tool with HMR support
ESBuild: JavaScript bundler for production builds
TypeScript: Type checking and compilation
Tailwind CSS: Utility-first CSS framework
PostCSS: CSS processing with autoprefixer
Database (Configured but Not Used)

Drizzle ORM: Type-safe SQL query builder
Neon Serverless: PostgreSQL serverless driver (configured via @neondatabase/serverless)
Drizzle Kit: Schema migration tool
Utility Libraries

clsx & tailwind-merge: Conditional CSS class merging
class-variance-authority: Component variant management
date-fns: Date formatting and manipulation
nanoid: Unique ID generation
Zod: Schema validation library
Development-Only Dependencies

Replit plugins: Cartographer, dev banner, runtime error modal for Replit environment
tsx: TypeScript execution for development server
