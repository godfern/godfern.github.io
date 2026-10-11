# 4. State Management

## Categorise state first

Before picking a tool, identify what kind of state you're dealing with:

| Type | Description | Where it lives |
|------|-------------|----------------|
| **Server state** | Data fetched from an API | React Query / Apollo |
| **UI state** | Modals open, tabs selected, accordion expanded | Local `useState` |
| **Form state** | Input values, validation errors | React Hook Form / local |
| **URL state** | Filters, pagination, current view | URL search params |
| **Global client state** | Auth user, theme, shopping cart | Zustand / Context |

> Most state in a typical app is **server state**. Reach for a server-state library before a general state manager.

---

## Decision tree

```
Is this data from the server?
  YES → React Query or Apollo (handles caching, refetching, deduplication)
  NO  → Is it needed by many unrelated components?
          YES → Zustand / Context
          NO  → useState / useReducer in the component
```

---

## Server state with React Query

```jsx
function useUserPosts(userId) {
  return useQuery({
    queryKey: ['posts', userId],
    queryFn: () => api.getPosts(userId),
    staleTime: 5 * 60 * 1000,  // 5 min — don't refetch if fresh
  })
}

// Mutation with optimistic update
const mutation = useMutation({
  mutationFn: api.likePost,
  onMutate: async (postId) => {
    // Snapshot current state
    const prev = queryClient.getQueryData(['posts', userId])
    // Optimistically update
    queryClient.setQueryData(['posts', userId], old =>
      old.map(p => p.id === postId ? { ...p, liked: true } : p)
    )
    return { prev }
  },
  onError: (err, postId, context) => {
    // Roll back on failure
    queryClient.setQueryData(['posts', userId], context.prev)
  },
})
```

---

## Global client state with Zustand

Lightweight, no boilerplate, no providers needed (except in tests).

```js
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))

// In any component
const user = useAuthStore(state => state.user)
```

---

## URL as state

Underused but powerful. Filters, pagination, and search terms belong in the URL so they're shareable and survive a refresh.

```jsx
const [searchParams, setSearchParams] = useSearchParams()

const page = Number(searchParams.get('page') ?? 1)
const query = searchParams.get('q') ?? ''

function handleSearch(q) {
  setSearchParams({ q, page: 1 })
}
```

---

## Avoiding common pitfalls

| Pitfall | Fix |
|---------|-----|
| Server data duplicated in Redux | Use React Query — it's the cache |
| Global state for everything | Keep state as local as possible |
| Prop drilling 3+ levels | Lift to context or a store |
| Derived state stored in state | Compute it on render or with `useMemo` |
