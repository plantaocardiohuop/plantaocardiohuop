## 2026-11-11 - Missing Authentication on Admin Endpoint

**Vulnerability:** The `/admin` path and its associated Server Actions (`addMember`, `recordAttendance`, `addBonusPoints`, `deleteMember`) were missing authentication. Middleware was not configured to protect the route, and even if it were, Server Actions bypass route-level middleware in Next.js.
**Learning:** Next.js Server Actions bypass route-level middleware; therefore, explicit authentication/authorization checks must always be implemented directly inside the server action functions themselves.
**Prevention:** Always implement `requireAuth()` or similar direct authentication checks at the very beginning of all Server Action functions, and also ensure `middleware.ts` is configured to protect the corresponding UI routes.
