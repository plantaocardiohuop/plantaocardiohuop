
## 2024-11-01 - Prevent Information Leakage in Next.js Server Actions
**Vulnerability:** Next.js Server Actions executing raw Prisma database queries were missing `try/catch` wrappers. When database constraints or validation failed, the unhandled exception could leak internal database state (like table structure or raw queries) in stack traces returned to the client. Additionally, user inputs were missing bounds validation, opening potential DoS vectors via excessively large strings.
**Learning:** Always explicitly catch exceptions within Server Actions when interfacing directly with ORMs like Prisma. Next.js can sometimes forward raw error objects containing sensitive backend contexts if not overridden. Furthermore, Next.js Server Actions returning objects directly in `action` props cause TS compilation errors in React 19 unless wrapped in `async (formData) => { 'use server'; await myAction(formData) }`.
**Prevention:**
1. Always validate type, length, and format of inputs passed to server actions.
2. Wrap all database logic in `try { ... } catch { return { error: 'Generic safe message' } }` to ensure errors fail securely and do not leak infrastructure details.
