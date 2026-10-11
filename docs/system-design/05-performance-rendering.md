# 5. Performance & Rendering

## Rendering strategies

| Strategy | Description | Best for |
|----------|-------------|----------|
| **CSR** (Client-Side Rendering) | Browser renders everything via JS | Dashboards, authed apps |
| **SSR** (Server-Side Rendering) | HTML generated per request on server | Dynamic content, SEO |
| **SSG** (Static Site Generation) | HTML pre-built at build time | Blogs, marketing pages |
| **ISR** (Incremental Static Regeneration) | SSG + background revalidation (Next.js) | Semi-dynamic content |
| **Streaming SSR** | HTML streamed in chunks, JS hydrates progressively | Large pages, slow data |

**Interview tip**: explain *why* you'd pick one — don't just list them.

---

## Core Web Vitals (know these)

| Metric | What it measures | Target |
|--------|-----------------|--------|
| **LCP** (Largest Contentful Paint) | Load time of main content | < 2.5s |
| **INP** (Interaction to Next Paint) | Responsiveness to input | < 200ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | < 0.1 |

---

## Reducing bundle size

```
1. Code splitting — lazy load routes and heavy components
2. Tree shaking — import named exports, not entire libraries
3. Analyse the bundle — use webpack-bundle-analyzer or vite-plugin-inspect
4. Replace heavy deps — use date-fns instead of moment, lucide instead of @mui/icons
```

```jsx
// Bad — imports entire library
import _ from 'lodash'

// Good — tree-shakeable
import debounce from 'lodash/debounce'
// Or better
import { debounce } from 'lodash-es'
```

---

## Virtualisation (large lists)

Never render 10,000 DOM nodes. Render only what's in the viewport.

```jsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }) {
  const parentRef = useRef(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div key={virtualRow.key} style={{ transform: `translateY(${virtualRow.start}px)` }}>
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## React rendering optimisations

| Technique | When to use |
|-----------|------------|
| `React.memo` | Pure component that re-renders often with same props |
| `useMemo` | Expensive computation derived from props/state |
| `useCallback` | Stable function reference passed to memoised child |
| `useTransition` | Mark state update as non-urgent (keep UI responsive) |
| `useDeferredValue` | Defer re-render of slow child during typing |

**Don't premature-optimise.** Profile first with React DevTools.

---

## Image optimisation

- Use correct format: WebP/AVIF over PNG/JPEG
- Always set `width` and `height` to prevent CLS
- Lazy load below-the-fold images: `<img loading="lazy" />`
- Use `srcset` for responsive images
- Serve via CDN with proper cache headers

---

## Caching strategy

```
Static assets (JS, CSS, images)  → Cache forever, bust with content hash filename
HTML                              → No cache / short TTL (SSR) or cache + sw (SPA)
API responses                     → React Query staleTime + cacheTime
```

Service Worker for offline support — cache shell, stale-while-revalidate for API.
