# 2. Core Pillars of Frontend System Design

Every frontend system design answer should touch on these pillars. Not all will be equally important — use the requirements to decide which to go deep on.

---

## 1. Component Architecture
How the UI is broken into components, how they communicate, and how reusable they are.
→ [Deep dive](./03-component-architecture.md)

## 2. State Management
Where state lives, how it flows, and how it stays consistent.
→ [Deep dive](./04-state-management.md)

## 3. Performance & Rendering
How fast the app loads and stays fast as it grows.
→ [Deep dive](./05-performance-rendering.md)

## 4. Networking & Data Fetching
How the client talks to the server — fetching, caching, mutations, real-time.
→ [Deep dive](./06-networking-data-fetching.md)

---

## Other pillars to mention (even briefly)

### Routing
- Client-side routing (SPA) vs server-side routing (MPA/SSR)
- Code splitting per route to reduce initial bundle
- Protected routes, nested routes, URL as state

### Error Handling
- Error boundaries per feature area (not just one global catch)
- Distinguish network errors, validation errors, unexpected crashes
- Graceful degradation — show partial UI when one section fails

### Accessibility (a11y)
- Semantic HTML as the baseline
- ARIA roles/attributes for custom components
- Keyboard navigation and focus management
- Colour contrast, reduced motion

### Security
- XSS — never dangerouslySetInnerHTML with user content; sanitise inputs
- CSRF — use same-site cookies or CSRF tokens
- Content Security Policy (CSP) headers
- **SRI (Subresource Integrity)** — verify third-party scripts/styles haven't been tampered with → [Deep dive](./security-sri.md)
- Secure storage — don't store tokens in localStorage for sensitive apps

### Internationalisation (i18n)
- Externalise all strings from day one
- RTL layout support (CSS logical properties)
- Date, number, and currency formatting via `Intl` API

### Testing strategy
- Unit: pure functions, hooks, utils
- Component: React Testing Library (test behaviour, not implementation)
- Integration: critical user flows
- E2E: Playwright / Cypress for smoke tests
