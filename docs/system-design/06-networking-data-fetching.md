# 6. Networking & Data Fetching

## API style choices

| Style | Pros | Cons | Use when |
|-------|------|------|----------|
| **REST** | Simple, widely understood, HTTP caching | Over/under-fetching | Standard CRUD apps |
| **GraphQL** | Fetch exactly what you need, single endpoint | Complexity, no HTTP caching by default | Complex data graphs, many clients |
| **tRPC** | End-to-end type safety, no schema | Couples client/server (same repo) | Full-stack TypeScript monorepos |
| **WebSocket** | Bidirectional, real-time | Stateful, harder to scale | Chat, live feeds, collaboration |
| **SSE** (Server-Sent Events) | Server push, simpler than WS | One-directional only | Notifications, live scores |

---

## Data fetching patterns

### Fetch on render (default)
```jsx
function Profile({ userId }) {
  const { data } = useQuery({ queryKey: ['user', userId], queryFn: fetchUser })
  return <div>{data?.name}</div>
}
```

### Prefetch on hover / intent
```jsx
function UserLink({ userId }) {
  const queryClient = useQueryClient()
  return (
    <a
      onMouseEnter={() => queryClient.prefetchQuery({
        queryKey: ['user', userId],
        queryFn: fetchUser,
      })}
      href={`/user/${userId}`}
    >
      View Profile
    </a>
  )
}
```

### Parallel queries
```jsx
const [user, posts] = useQueries({
  queries: [
    { queryKey: ['user', id], queryFn: fetchUser },
    { queryKey: ['posts', id], queryFn: fetchPosts },
  ]
})
```

---

## Pagination strategies

| Strategy | How it works | Best for |
|----------|-------------|----------|
| **Offset pagination** | `?page=2&limit=20` | Simple, sortable lists |
| **Cursor pagination** | `?after=cursor_xyz` | Feeds, infinite scroll (stable) |
| **Infinite scroll** | Load more on scroll | Social feeds, images |
| **Load more button** | Explicit user trigger | Less disorienting than auto-scroll |

```jsx
// Infinite scroll with React Query
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['feed'],
  queryFn: ({ pageParam }) => fetchFeed({ cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

---

## Optimistic updates

Update the UI immediately, sync with server in background, roll back on error.

```
User action → Update local cache instantly → Fire API request
                                           → Success: confirm
                                           → Error: revert + show toast
```

Good for: likes, follows, reorder, toggle — any action where latency would feel slow.

---

## Real-time: WebSocket vs SSE vs Polling

```
Polling         → Simple but wasteful. OK for low-frequency updates (every 30s).
Long polling    → Server holds request open until data available. Step up from polling.
SSE             → Server pushes events. Good for notifications, live stats.
WebSocket       → Full duplex. Needed for chat, collaborative editing, live cursors.
```

WebSocket connection management:
- Reconnect with exponential backoff on disconnect
- Send heartbeat pings to detect silent disconnects
- Queue messages client-side during reconnect

---

## Error handling and resilience

```jsx
// API client — centralise error handling
async function apiFetch(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new ApiError(res.status, error.message)
  }
  return res.json()
}

// In components — distinguish error types
if (error instanceof ApiError && error.status === 404) {
  return <NotFound />
}
if (error) {
  return <ErrorBoundaryFallback onRetry={refetch} />
}
```

Retry strategy: React Query retries 3x by default with exponential backoff. Disable for 4xx errors (they won't recover).
