## 2024-05-15 - Unvalidated Input and Missing Error Handling in Server Actions
**Vulnerability:** Server Actions lacked input validation (type checking, length limits, bounds checking) and did not use try/catch blocks for database operations.
**Learning:** This exposes the application to denial of service via excessively long strings, logical errors via negative or unreasonable numbers, and leaks internal database details if an error occurs.
**Prevention:** Always validate all inputs (type, bounds, length limits) in Server Actions and wrap database operations in try/catch blocks that return generic user-friendly messages.
