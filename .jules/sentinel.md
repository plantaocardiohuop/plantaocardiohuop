## 2024-05-15 - [Missing Authentication in Next.js Server Actions]
**Vulnerability:** Missing Authentication and Authorization on Server Actions. Any user could trigger admin actions (add member, remove member, give points) by directly calling the server action endpoint or intercepting the form submission and replaying it, even if the admin UI route was protected or hidden.
**Learning:** Next.js Server Actions are public API endpoints by default. Even if a Server Action is only imported and used in a page that is protected by middleware (e.g. `/admin`), the action itself can be called directly from any route. Route-based middleware doesn't protect the action.
**Prevention:** Always implement explicit authentication and authorization checks INSIDE every server action that performs sensitive operations. Never rely solely on route middleware to protect Server Actions.

## 2024-05-15 - [Hardcoded secrets avoidance in fallback pattern]
**Vulnerability:** Hardcoded fallback secrets for `process.env.ADMIN_PASSWORD || 'secret'`. If production misses the environment variables, anyone could log in using 'admin':'secret'.
**Learning:** A fallback pattern for environment variable secrets introduces a critical vulnerability when the variables are missing in production.
**Prevention:** Always fail securely by checking if expected environment variable secrets exist before comparison, and throw an error or deny access if they do not exist. Never fall back to 'secret'.
