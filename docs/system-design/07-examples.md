# 7. Real-world Examples

Common prompts in frontend system design interviews with how to structure your answer.

---

## "Design a News Feed (like Twitter/LinkedIn)"

**Clarify**: Infinite scroll or paginated? Real-time updates? Media (images/video)?

### Architecture
```
FeedPage
├── FeedContainer        — fetches, owns state
│   ├── FeedFilters      — tabs: For You / Following
│   ├── FeedList         — virtualised list
│   │   └── PostCard     — individual post
│   │       ├── PostHeader, PostBody, PostActions
│   └── NewPostsBar      — "12 new posts" pill (real-time)
```

### Key decisions
- **Cursor-based pagination** + `useInfiniteQuery` for stable infinite scroll
- **Virtualisation** with `@tanstack/react-virtual` — never render all posts
- **Optimistic updates** for likes/reposts
- **WebSocket or SSE** for the "new posts" count
- **Stale-while-revalidate**: show cached feed instantly, refresh in background

---

## "Design an Autocomplete / Search"

**Clarify**: Client-side filtering or server search? Keyboard navigation required? Multi-select?

### Key decisions
- **Debounce** input (300ms) before firing API requests
- **Cancel in-flight requests** when new query arrives (`AbortController`)
- **Cache results** per query string to avoid duplicate fetches
- **Keyboard navigation**: `aria-activedescendant`, arrow keys, Enter, Escape
- **Accessibility**: `role="combobox"`, `aria-expanded`, `aria-autocomplete`

```jsx
function useSearch(query) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: ({ signal }) => api.search(query, { signal }),  // signal for abort
    enabled: query.length > 1,
    staleTime: 60_000,   // cache results for 1 min
  })
}
```

---

## "Design a Dashboard with Charts"

**Clarify**: Real-time data or periodic refresh? How many widgets? User-customisable layout?

### Key decisions
- **Code-split charting library** (Recharts, Nivo) — don't load it in initial bundle
- **Skeleton screens** per widget — each widget loads independently
- **Parallel data fetching** — each widget fetches its own data concurrently
- **Error isolation** — error boundary per widget so one failure doesn't break the page
- **Auto-refresh** with `refetchInterval` in React Query

```jsx
// Each widget is independent — isolated loading, error, data
function RevenueWidget() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['revenue'],
    queryFn: fetchRevenue,
    refetchInterval: 30_000,
  })
  if (isLoading) return <WidgetSkeleton />
  if (error) return <WidgetError />
  return <RevenueChart data={data} />
}
```

---

## "Design a Form with Multi-step Wizard"

**Clarify**: How many steps? Can user go back? Is data saved between steps (draft)?

### Key decisions
- **URL-driven steps** (`?step=2`) — shareable, survives refresh, back button works
- **React Hook Form** for form state — avoids re-renders per keystroke
- **Persist draft to localStorage** (or API) on step change
- **Validation per step** before allowing progression
- **Centralised wizard state** (reducer) for shared data across steps

```
State shape:
{
  currentStep: 2,
  steps: {
    personal: { name, email },      // step 1 data
    address: { city, country },     // step 2 data
    review: {}
  },
  isDraft: true
}
```

---

## "Design a Real-time Collaborative Tool (like Google Docs)"

**Clarify**: Rich text or structured data? How many concurrent users? Offline support?

### Key decisions
- **Operational Transformation (OT)** or **CRDTs** for conflict resolution (mention Yjs)
- **WebSocket** for bidirectional sync
- **Optimistic local apply** — apply change locally, broadcast to server, reconcile
- **Presence** — show who is online and their cursor position
- **Offline**: buffer operations, replay on reconnect

This is a hard problem — in interviews, show awareness of the complexity (CRDTs, OT) rather than claiming you'd build it from scratch. Reference Yjs or Automerge.
