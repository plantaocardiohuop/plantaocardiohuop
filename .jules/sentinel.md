## 2024-03-24 - Missing Authentication and Input Validation on Server Actions
**Vulnerability:** Next.js Server Actions were completely unauthenticated, bypassing the route-level middleware protection on `/admin`. They also lacked input validation and error handling, potentially leaking internal database stack traces or processing malformed data.
**Learning:** Next.js route-level middleware (`src/middleware.ts`) does not inherently protect Server Actions called directly. If a user discovers the action URL/payload, they can execute it even if they don't have access to the UI page. Furthermore, unhandled errors in Server Actions can leak sensitive internal details.
**Prevention:**
1. Always implement explicit authentication and authorization checks directly inside the Server Action function itself, using `next/headers` to check authorization or a session cookie.
2. Use strict type, existence, and length validation on all inputs.
3. Wrap the logic in a `try/catch` block and fail securely, returning a generic error message or swallowing the error instead of exposing the stack trace.
