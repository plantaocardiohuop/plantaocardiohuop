## 2024-05-24 - Missing Server Action validation and error handling
**Vulnerability:** Next.js Server Actions were receiving input from forms and arguments directly without robust validation (e.g., verifying types, length, valid integer ranges) and without generic error handling, meaning errors could lead to unhandled exceptions or potential leaks of DB constraints if not masked.
**Learning:** Server Actions must always treat arguments and `formData` values as untrusted input just like API routes. Relying on client-side constraints is not sufficient.
**Prevention:** Implement strict typing, bounding, and validation checks early in the Server Action body, and wrap interactions with external systems (like databases) in `try/catch` blocks that return generic user-friendly errors.
