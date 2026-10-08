## 2024-10-08 - Secure Next.js Server Actions
**Vulnerability:** Next.js Server Actions expose stack traces and lack implicit input validation bounds.
**Learning:** Server Actions require explicit boundary validation (length, type) and try/catch blocks for secure error handling without leaking DB exceptions.
**Prevention:** Always wrap Server Actions in try/catch and validate all arguments before processing.