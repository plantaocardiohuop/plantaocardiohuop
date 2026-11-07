## 2023-10-27 - Missing Authentication on Server Actions
**Vulnerability:** Next.js Server Actions were completely unprotected, allowing any user to invoke sensitive operations (e.g., adding/deleting members or modifying points) directly without proper authentication, completely bypassing page-level middleware checks.
**Learning:** Next.js middleware is bypassed when Server Actions are called directly. Next.js does not automatically restrict Server Action execution to authenticated users based on the page they originate from.
**Prevention:** Always implement explicit authentication and authorization checks at the beginning of each Server Action function.
