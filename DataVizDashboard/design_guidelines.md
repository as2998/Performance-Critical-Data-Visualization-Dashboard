# Design Guidelines: Performance-Critical Data Visualization Dashboard

## Design Approach

**Selected System:** Material Design 3 with Carbon Design influences
**Justification:** Material Design 3 provides robust patterns for data-dense interfaces with strong visual hierarchy, while Carbon Design's emphasis on data visualization and dashboard layouts adds critical guidance for this technical application.

**Core Design Principles:**
- Clarity over decoration - every element serves data comprehension
- Scannable hierarchy - users should instantly locate key metrics
- Predictable interactions - dashboard patterns users expect
- Performance-first aesthetics - visual feedback for real-time updates

## Typography System

**Font Family:** Inter (primary), JetBrains Mono (data/metrics)

**Hierarchy:**
- Dashboard Title: 2xl/3xl, semibold
- Section Headers: lg/xl, semibold  
- Chart Titles: base/lg, medium
- Data Labels: sm, regular
- Metric Values: xl/2xl, bold (JetBrains Mono)
- Secondary Text: sm, regular
- Micro Labels (axes, timestamps): xs, regular

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Component internal padding: p-4
- Section spacing: gap-6 or gap-8
- Card padding: p-6
- Tight groupings: gap-2
- Grid gutters: gap-4

**Grid Structure:**
- Main dashboard: 12-column grid system
- Charts container: grid with gap-6, responsive (grid-cols-1 md:grid-cols-2 lg:grid-cols-2)
- Controls panel: Fixed sidebar (w-64) or collapsible drawer on mobile
- Data table: Full-width below charts

**Container Strategy:**
- Dashboard wrapper: max-w-full with px-4 md:px-6 lg:px-8
- Chart containers: Aspect ratio maintained (aspect-video for line/bar, aspect-square for scatter/heatmap)

## Component Library

### Navigation & Layout
**Header Bar:**
- Full-width fixed header with dashboard title (left), performance metrics display (center), and settings icon (right)
- Height: h-16
- Shadow: subtle elevation

**Control Sidebar:**
- Fixed position on desktop (w-64), slide-out drawer on mobile
- Contains: TimeRangeSelector, FilterPanel, aggregation controls, stress test controls
- Sections separated with divider lines
- Sticky positioning for visibility during scroll

### Data Visualization Components

**Chart Containers:**
- Rounded corners (rounded-lg)
- Border treatment for definition
- Chart title in header section with info icon
- Chart controls (zoom/pan) as icon buttons in top-right
- Loading skeleton states for streaming data
- Canvas element fills container with proper aspect ratio

**Chart Types Layout:**
- Line Chart: Horizontal layout, full width of grid cell
- Bar Chart: Vertical orientation preferred
- Scatter Plot: Square aspect ratio
- Heatmap: Square aspect ratio with legend on right side

**Axes & Labels:**
- Clean, minimal axis lines
- Grid lines: subtle, non-intrusive
- Tick marks: small, consistent spacing
- Labels: rotated 45° only when necessary (x-axis)

### Performance Monitoring

**Metrics Display:**
- Fixed position in header or floating panel (top-right)
- Three key metrics side-by-side: FPS counter, Memory usage, Data points count
- Each metric: Icon + Label (xs) + Value (lg, JetBrains Mono)
- Visual indicators: green (good), yellow (warning), red (critical) border treatment
- Compact size: px-4 py-2

**Performance Graph Mini-Widget:**
- Small sparkline showing FPS over time (w-32 h-16)
- Positioned near metrics display
- No axes, just trend line

### Interactive Controls

**Filter Panel:**
- Grouped controls by category
- Label above each control group (text-sm, font-medium)
- Spacing between groups: mb-6

**Buttons:**
- Primary actions: px-4 py-2, rounded-md, font-medium
- Secondary actions: px-3 py-1.5, text-sm
- Icon buttons for chart controls: p-2, rounded

**Time Range Selector:**
- Segmented button group design
- Options: 1min, 5min, 1hour displayed inline
- Active state clearly distinguished

**Sliders/Range Controls:**
- For zoom and data window controls
- Labels showing current values
- Responsive touch targets (h-10 minimum)

### Data Table

**Virtual Table Layout:**
- Header row: sticky positioning, font-medium, text-sm
- Data rows: alternating subtle background treatment
- Cell padding: px-4 py-3
- Numeric columns: right-aligned, JetBrains Mono
- Timestamp columns: left-aligned
- Hover state on rows for interactivity
- Fixed header height: h-12
- Row height: h-12 for consistent virtualization

**Table Structure:**
- Columns: Timestamp, Value, Category, Status
- Sortable column headers with arrow indicators
- Horizontal scroll on mobile, full width on desktop

### Loading & Empty States

**Loading Skeletons:**
- Shimmer animation for chart placeholders
- Skeleton matches final chart dimensions
- Pulsing circles for scatter plot data points

**Real-time Update Indicator:**
- Small pulse animation in chart corner when new data arrives
- Subtle, non-distracting (small dot with expanding ring)

## Responsive Behavior

**Desktop (lg+):**
- Sidebar visible, 2-column chart grid
- Header metrics always visible
- Data table full-width below charts

**Tablet (md):**
- Collapsible sidebar
- 2-column chart grid (may stack for heatmap)
- Horizontal scroll for data table

**Mobile (base):**
- Hamburger menu for controls
- Single column chart layout
- Charts stack vertically
- Compact metrics in header
- Data table with horizontal scroll, minimal columns visible

## Interaction Patterns

**Chart Interactions:**
- Hover: Crosshair cursor, tooltip showing data point values
- Drag: Pan gesture (hand cursor)
- Scroll: Zoom in/out (with modifier key)
- Double-click: Reset zoom/pan
- Touch: Pinch to zoom, drag to pan

**Feedback:**
- Button clicks: subtle scale animation (scale-95 on active)
- Data updates: brief highlight flash on new data points
- Loading: skeleton screens, not spinners
- Errors: inline messages with icon, rounded-md container

## Accessibility Considerations

- Chart tooltips: ARIA labels for data points
- Keyboard navigation: Tab through controls, Enter to activate
- Focus indicators: clear outline on all interactive elements
- Screen reader announcements for real-time data updates
- High contrast mode support for chart elements
- Minimum touch targets: 44x44px

## Animation Guidelines

**Use Sparingly:**
- Chart rendering: Animate-in only on initial load (fade-in, duration-300)
- Real-time updates: No animation, instant updates for performance
- Data point highlights: Brief pulse (duration-150) when new data arrives
- Panel transitions: Slide-in for sidebar (duration-200, ease-out)
- Loading skeletons: Subtle shimmer only

**Avoid:**
- Continuous animations that compete with real-time data
- Chart transition animations during updates
- Decorative animations that consume performance budget