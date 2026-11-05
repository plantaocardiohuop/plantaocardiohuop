## 2024-05-24 - Server Actions bypass middleware

**Vulnerability:** Unauthenticated users can trigger server actions directly without going through the route-level middleware, allowing them to bypass Basic Auth protection on the `/admin` route.
**Learning:** Next.js Server Actions bypass route-level middleware; always implement explicit authentication/authorization checks inside the server action functions themselves.
**Prevention:** Introduce a `requireAuth()` function inside server actions and validate the Authorization header. Also ensure that all server actions are wrapped in try/catch to gracefully handle errors without exposing sensitive information.
