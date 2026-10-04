## 2024-10-04 - Missing authentication on sensitive endpoint
**Vulnerability:** The `/admin` endpoint lacks any form of authentication, leaving administrative capabilities (adding users, granting points) exposed to anyone.
**Learning:** Added Basic Authentication using `src/middleware.ts` to intercept requests. It is important to wrap base64 decoding with `try-catch` to avoid failing ungracefully (500 error) when receiving invalid basic auth values.
**Prevention:** Always enforce authentication and authorization checks on sensitive administrative endpoints. Validate incoming request values safely without throwing unhandled exceptions.
