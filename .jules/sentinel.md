## 2026-11-06 - Missing Admin Endpoint Authentication and Authorization
**Vulnerability:** The Server Actions in `src/app/actions.ts` (e.g., `deleteMember`, `addBonusPoints`) and the `/admin` page itself do not have any authentication checks.
**Learning:** Next.js Server Actions bypass route-level middleware and require explicit authentication/authorization checks inside the server action functions themselves. A missing middleware for the `/admin` path also means anyone can access the admin UI.
**Prevention:** Implement explicit authentication checks using `middleware.ts` for UI paths and inline checks for Server Actions.
