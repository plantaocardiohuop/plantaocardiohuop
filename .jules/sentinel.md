## 2024-11-10 - [Authentication Bypass via Server Actions]
**Vulnerability:** Next.js Server Actions were implemented without explicit authentication checks, relying solely on route-level middleware protection. Because Server Actions are exposed as POST endpoints and can be called directly, they bypass `middleware.ts`.
**Learning:** Next.js middleware is not a complete defense for Server Actions. Server Actions act as independent API endpoints and require their own explicit authorization checks.
**Prevention:** Always implement explicit authorization checks (e.g., `checkAuth()`) at the very beginning of every Server Action, regardless of any route-level protection.
