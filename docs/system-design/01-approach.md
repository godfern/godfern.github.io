# 1. How to Approach the Round

## The framework (use this every time)

```
1. Clarify requirements        (~5 min)
2. Define scope & constraints  (~3 min)
3. High-level architecture     (~10 min)
4. Deep dive key areas         (~20 min)
5. Trade-offs & alternatives   (~5 min)
6. Wrap-up & what you'd do next
```

---

## Step 1 — Clarify requirements

Never start designing before asking questions. It signals senior thinking.

**Functional questions:**
- What are the core user flows we need to support?
- Are we building for web only, or also mobile/native?
- Do we need to support real-time updates?
- Is authentication required?

**Non-functional questions:**
- How many users? (10k DAU vs 10M DAU changes a lot)
- What are the performance targets? (LCP < 2.5s? TTI?)
- Do we need offline support?
- What browsers/devices must we support?
- Is accessibility a hard requirement? (it always should be)

---

## Step 2 — Define scope

After clarifying, **explicitly state what you will and won't cover**:

> "I'll focus on the feed rendering, infinite scroll, and optimistic updates. I'll treat auth and the backend API as given. I won't go deep on the notification system unless we have time."

This shows you can prioritise and prevents going off track.

---

## Step 3 — High-level architecture

Sketch the major pieces before going deep. A rough diagram with boxes and arrows is enough:

```
Browser
├── Routing layer       (React Router / Next.js pages)
├── Data layer          (React Query / Apollo / Zustand)
├── UI layer            (Component tree)
└── Network layer       (API client, WebSocket, caching)

External
├── REST / GraphQL API
├── CDN (static assets)
└── WebSocket server (if real-time)
```

---

## Step 4 — Deep dive

Pick the 2–3 most interesting/complex areas and go deep. Let the interviewer guide if unsure. Common deep-dive areas:

- How does the component tree break down?
- How does state flow?
- How do you handle caching and data freshness?
- How do you handle errors and loading states?
- How do you optimise for performance?

---

## Step 5 — Trade-offs

For every major decision, name the alternative and explain your choice:

> "I'd use React Query over Redux here because the state is all server-derived. If we had complex client-side state shared across many components, I'd reconsider."

---

## Common mistakes to avoid

- Jumping straight into code or component details without high-level design
- Picking a technology without justifying it
- Ignoring non-functional requirements (performance, a11y, error states)
- Not driving the conversation — waiting to be asked
- Over-engineering for scale that wasn't asked for
