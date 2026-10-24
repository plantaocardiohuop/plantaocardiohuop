## 2023-10-24 - Server Actions Middleware Bypass
**Vulnerability:** Missing authentication on sensitive endpoints (Server Actions). Next.js server actions are exposed as public HTTP endpoints that can be invoked directly from anywhere, completely bypassing route-level middleware constraints.
**Learning:** Adding HTTP Basic Auth or session checks in `src/middleware.ts` is insufficient for securing operations, as attackers can trigger server actions directly via POST to unrelated public paths (like `/`). Next.js server actions bypass route-level middleware.
**Prevention:** Always implement explicit authentication and authorization checks INSIDE the server action functions themselves (e.g., using `headers()` or `cookies()`), regardless of any route-level middleware configuration.
