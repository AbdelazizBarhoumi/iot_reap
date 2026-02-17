 # API Contracts — Reference

 Use this file to declare API request and response shapes used across frontend and backend.

 Recommendations
 - Define API Resource shapes in Laravel (`App\Http\Resources`) and keep examples here.
 - Mirror Resource interfaces in `frontend/src/types` and keep them in sync.
 - Use versioned routes (e.g., `/api/v1/...`) and include examples for each endpoint.

 Example: Auth login response
 ```json
 {
	 "data": {
		"auth": "session-cookies (Breeze) - use browser cookies + XSRF-TOKEN, no bearer token",
		 "user": { "id": "01F...", "name": "Alice", "email": "alice@example.com" }
	 }
 }
 ```

 Keep this file updated when adding or changing endpoints.
