 # Backend Layer — Reference

 This file summarizes the Laravel backend rules developers must follow. The authoritative source is `.github/copilot-instructions.md`.

 Key responsibilities
 - Controllers: very thin. Accept a FormRequest, call a single Service method, return an API Resource or JsonResponse.
 - FormRequests: validate and authorize inputs. Use `authorize()` for role checks.
 - Services: ALL business logic. Inject repositories and external clients. Throw domain exceptions on failure.
 - Repositories: DB access using Eloquent models only. Return Models or Collections — never arrays.
 - Models: define casts, relationships, scopes. Avoid business logic in Models.

 Best practices
 - Use ULIDs for domain entities where specified (`HasUlids` trait).
 - Use enums for role/status fields and cast them in the model.
 - Never run raw queries in application code — use Eloquent or parameterized queries.
 - Dispatch jobs and events from Services, not Controllers.

 Testing
 - Unit-test every Service method.
 - Feature-test controllers/endpoints with `RefreshDatabase` and factories.

 Example controller shape (thin):
 ```php
 public function store(CreateVMSessionRequest $request): JsonResponse
 {
	 $session = $this->vmSessionService->provision(
		 user: auth()->user(),
		 templateId: $request->validated('template_id'),
		 duration: $request->validated('duration_minutes'),
	 );

	 return response()->json(new VMSessionResource($session), 201);
 }
 ```
