## 2024-11-04 - Next.js Server Action Authentication Bypass

**Vulnerability:** The application had Server Actions (`addMember`, `recordAttendance`, `addBonusPoints`, `deleteMember`) that could be invoked directly without authentication, allowing attackers to bypass middleware-based route protection for the `/admin` path.

**Learning:** Next.js Server Actions expose an endpoint that can be called directly using a POST request with the `Next-Action` header. Protecting the page route with middleware (`middleware.ts`) is insufficient because the actions can be executed independently.

**Prevention:** Always implement an explicit authentication/authorization check (e.g., a `checkAuth()` helper function) directly inside the Server Action function before executing any privileged logic.
