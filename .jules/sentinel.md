## 2024-03-20 - Missing Authentication on Admin Endpoint
**Vulnerability:** The `/admin` path and its associated server actions lacked authentication, allowing unauthorized users to modify the state (e.g., adding/deleting members, assigning points).
**Learning:** Next.js Server Actions can bypass route-level middleware if triggered from unprotected paths. Middleware alone is insufficient for securing Server Actions.
**Prevention:** Always implement explicit authentication/authorization checks inside the Server Action functions themselves, in addition to protecting the route via middleware. Also, verify that environment variables used for secrets are not missing or hardcoded.
