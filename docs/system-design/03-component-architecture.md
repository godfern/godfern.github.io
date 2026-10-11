# 3. Component Architecture

## Breaking down the UI

Start from the top — identify major regions, then recursively break them down.

```
App
├── Layout
│   ├── Sidebar / Nav
│   └── Main content area
├── Feature A
│   ├── FeatureAContainer  (data fetching, state)
│   └── FeatureAView       (pure rendering)
└── Feature B
    └── ...
```

**Rule of thumb**: separate data concerns from rendering concerns.

---

## Container / Presentational pattern

| Container | Presentational |
|-----------|---------------|
| Fetches data, manages state | Renders UI from props |
| Knows about the store/API | Has no side effects |
| Not reusable | Highly reusable |
| Few or no DOM elements | All DOM elements |

```jsx
// Container — knows about data
function UserProfileContainer() {
  const { data, isLoading } = useUser(userId)
  if (isLoading) return <Skeleton />
  return <UserProfileCard user={data} />
}

// Presentational — pure rendering
function UserProfileCard({ user }) {
  return <div>{user.name}</div>
}
```

---

## Composition over configuration

Prefer composing small focused components over one god-component with many props.

```jsx
// Bad — one component trying to do everything
<DataTable
  showSearch
  showPagination
  showExport
  searchPlaceholder="Search..."
  onExport={handleExport}
/>

// Good — composed from focused pieces
<DataTableProvider data={rows}>
  <DataTable.Search placeholder="Search..." />
  <DataTable.Grid />
  <DataTable.Pagination />
  <DataTable.Export onExport={handleExport} />
</DataTableProvider>
```

---

## Feature-based folder structure

Group by feature, not by file type. Scales better as the codebase grows.

```
src/
├── features/
│   ├── feed/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── index.ts       ← public API of the feature
│   └── profile/
│       ├── components/
│       └── ...
├── shared/
│   ├── components/        ← truly cross-feature UI
│   ├── hooks/
│   └── utils/
└── app/
    ├── router.tsx
    └── providers.tsx
```

**Key rule**: features should not import from each other. Cross-feature dependencies go through `shared/`.

---

## Code splitting

Split at route and feature boundaries to reduce initial load:

```jsx
const FeedPage = React.lazy(() => import('./features/feed/FeedPage'))
const ProfilePage = React.lazy(() => import('./features/profile/ProfilePage'))

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/feed" element={<FeedPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Routes>
</Suspense>
```

Also split heavy third-party libraries (charts, rich text editors) using dynamic import.
