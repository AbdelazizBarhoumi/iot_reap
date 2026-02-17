 # Testing Layer — Reference

 Testing guidance for backend and frontend.

 Backend
 - Unit-test every Service method.
 - Feature-test API endpoints with `RefreshDatabase` and factories.
 - Mock external services (ProxmoxClient, GuacamoleClient) in tests.
 - Use `php artisan test` and ensure auth-related tests cover success and failure paths.

 Frontend
 - Use React Testing Library for component tests.
 - Mock HTTP calls with MSW and test observable UI behaviour, not internal state.

 CI
 - Include tests in CI; do not merge with failing tests.
