
## 2023-10-28 - Next.js Edge Runtime Basic Auth
**Vulnerability:** The application crashed when decoding basic auth headers in middleware, locking all users out of the admin route (Denial of Service risk).
**Learning:** Next.js `middleware.ts` runs strictly in the Edge Runtime where native Node.js APIs like `Buffer` are not available by default.
**Prevention:** Use standard Web APIs like `atob()` instead of `Buffer.from(..., 'base64')` to decode base64 strings in the Edge runtime.

## 2023-10-28 - Server Action Authorization Bypass
**Vulnerability:** Server actions were modifying database state (adding/deleting members, adding points) without checking for authorization, despite the frontend UI being protected by middleware.
**Learning:** Next.js Server Actions can bypass route-level middleware and be invoked directly from any route. Protecting a page via middleware does NOT protect the actions imported into it.
**Prevention:** Always implement explicit authentication and authorization checks directly inside the Server Action functions themselves, e.g., by checking the `Authorization` header or session token at the start of the action block.
