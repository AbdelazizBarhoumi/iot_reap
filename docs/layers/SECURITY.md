 # Security Layer — Reference

 High-level security rules and concrete checks.

 Authentication & Authorization
 - Use FormRequest `authorize()` for request-level authorization.
 - Scope all queries to the authenticated user (never return global records without scoping).
 - Use Gates for admin-only actions and register abilities centrally.

 Input validation
 - Validate every input field with explicit rules (no generic `string` only rules).
 - Sanitize and encode data before sending to external systems.

 Secrets & credentials
 - Never commit secrets. Use `.env` and `config/*.php`.
 - Rotate API tokens and store rotation instructions in `docs/infra` if needed.

 API usage
 - Implement consistent JSON error responses for API endpoints (no redirects).
