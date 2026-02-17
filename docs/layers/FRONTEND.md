 # Frontend Layer — Reference

 Summary of frontend rules and project layout. See `.github/copilot-instructions.md` for full policy.

 Project layout
 - `pages/` — route-level components that fetch data and pass to presentational components.
 - `components/` — pure presentational UI components. Receive typed props; no direct API calls.
 - `hooks/` — custom hooks for data fetching or subscriptions (e.g., `useVMSession`).
 - `api/` — typed API client wrappers built on `axios`.
 - `store/` — Zustand stores (auth, notifications). Store tokens in memory only.
 - `types/` — TypeScript interfaces and API response types.

 Security & state
 - NEVER store JWTs in `localStorage` or `sessionStorage`. Use an in-memory Zustand store only.
 - Use axios request/response interceptors for Authorization header and global 401 handling.
 - Validate API responses against TypeScript interfaces before using them.

 Component & hook rules
 - Type all props explicitly; do not use `any`.
 - Do not fetch in presentational components; use hooks for side effects.
 - Handle loading and error states in UI.

 Testing
 - Write a test file alongside every component using React Testing Library.
 - Mock network calls with MSW (Mock Service Worker).

