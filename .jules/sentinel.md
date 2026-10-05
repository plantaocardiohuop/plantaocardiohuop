## 2025-10-05 - Missing authentication on sensitive admin endpoint
**Vulnerability:** The application had an unprotected `/admin` endpoint allowing unauthenticated users to add/delete members and modify user points, a critical vulnerability.
**Learning:** Next.js uses proxies (previously called middleware) that can be used to easily protect wild-card paths (e.g. `/admin*`) using Basic Auth logic before components render. It is important to write comparison mechanisms securely (e.g., constant-time logic for password comparisons). In the edge runtime, native Node `crypto` is not always available or recommended.
**Prevention:** Implement endpoint protection (Basic Auth or otherwise) from the start for any route mapped to administrative privileges.
