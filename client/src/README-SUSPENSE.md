# Lazy Loading and Suspense Implementation

This document outlines the lazy loading and Suspense patterns implemented in the Diamond Hotel application to optimize performance.

## Overview

The application uses React's `lazy()` and `Suspense` features to:

1. Defer loading of components until they are needed
2. Show loading indicators while components are being loaded
3. Improve initial load time by splitting code into smaller chunks

## Implementation Details

### Lazy Loading Components

All page components are lazy loaded in `App.tsx`:

```tsx
const HomePage = lazy(() => import('./pages/HomePage'));
const RoomDetails = lazy(() => import('./pages/RoomDetails'));
// etc.
```

### Suspense Hierarchy

The application uses a nested Suspense structure:

1. **Root Suspense**: Wraps the entire application and shows `LoadingHydrate` during initial app load
2. **Page-level Suspense**: Wraps routes and shows `PageTransitionLoader` during page transitions

```tsx
<Suspense fallback={<LoadingHydrate />}>
  {/* App shell (navbar, etc.) */}
  <Suspense fallback={<PageTransitionLoader />}>
    <Routes>
      {/* Routes here */}
    </Routes>
  </Suspense>
</Suspense>
```

### Loading Components

1. **LoadingHydrate**: Full-screen loader with animation for initial app load
2. **PageTransitionLoader**: Overlay loader for page transitions
3. **ContentLoader**: Flexible loader for data fetching with multiple styles:
   - `card`: For grid layouts
   - `table`: For tabular data
   - `list`: For item lists
   - `text`: For text content

### HOC for Component-Level Suspense

The `withSuspense` higher-order component makes it easy to wrap any component with Suspense:

```tsx
// Usage example
export default withSuspense(MyComponent, { loaderType: "card", count: 3 });
```

## Adding New Components

When adding new page components:

1. Use lazy loading in App.tsx:
   ```tsx
   const NewPage = lazy(() => import('./pages/NewPage'));
   ```

2. For components with data fetching, consider using the withSuspense HOC:
   ```tsx
   export default withSuspense(NewComponent, { loaderType: "card" });
   ```

## Performance Considerations

- Lazy loading should be used for larger components or pages that aren't needed on initial load
- The suspense boundary should be placed as close as possible to the lazy-loaded component
- Consider using the React DevTools Profiler to measure performance improvements 