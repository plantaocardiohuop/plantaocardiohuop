## 2024-10-07 - [Missing Server Action Validation]
**Vulnerability:** Next.js Server Actions were executing without any input validation or error handling, exposing the application to potential DoS, bad data insertion, and leaking raw database errors.
**Learning:** Next.js Server Actions bypass route-level constraints and must independently validate their inputs and handle errors securely within the functions themselves.
**Prevention:** Always validate all inputs (type, bounds, length) in Server Actions and wrap database calls in try/catch blocks that securely log the error and return generic user-friendly messages.
