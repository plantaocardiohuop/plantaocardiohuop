## 2024-10-23 - [Medium] Missing Validation and Error Handling in Server Actions
**Vulnerability:** Next.js Server Actions lacked type checking, length constraints, and try/catch error handling, which could lead to DB exposure on failure and invalid state data.
**Learning:** Server Actions must validate all input fields thoroughly and catch errors generically to prevent exposure of raw Prisma errors or stack traces to clients.
**Prevention:** Ensure every Server Action implements explicit input validation for boundaries and types, and uses a try/catch block to return generic error messages.
