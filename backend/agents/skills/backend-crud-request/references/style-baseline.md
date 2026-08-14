# BOOTCAMP/dev Backend Style Baseline

Use this only as a fallback after inspecting the target application. It summarizes the style observed in:

- `/Users/elvisborodkin/Desktop/dev/bootcampDI/bootCampExes/week7/`
- `/Users/elvisborodkin/Desktop/dev/projects/`
- `/Users/elvisborodkin/Desktop/dev/projects/ecommerce/backend/`

Ignore `node_modules`, generated files, copies, and unrelated frontend code when sampling style.

## Observed conventions

- Use JavaScript with ESM imports/exports and explicit `.js` extensions.
- Prefer named exported async functions and `async/await`.
- Use `Router()` or `express.Router()` and keep route files thin.
- Split code into `config`, `models`, `controllers`, and `routes`.
- Obtain MongoDB collections through a database connection helper/getter.
- Put MongoDB calls and persistence transformations in models.
- Put `req`/`res`, input checks, status codes, and `try/catch` handling in controllers.
- Return JSON through `res.status(...).json(...)` and use early returns for failure branches.
- Use direct, readable functions rather than classes or repository/service abstractions unless the target application already has them.
- Preserve local quote, semicolon, indentation, and filename habits even when different reference projects disagree.

## Naming fallback

When no entity files exist, use a plural entity stem with a singular layer suffix:

```text
models/usersModel.js
controllers/usersController.js
routes/usersRouter.js
```

Existing projects contain variants such as `postsModels.js`, `postsControllers.js`, and `postsRoutes.js`. When extending a project, reuse its exact established form rather than creating a parallel naming pattern.

## Architectural fallback

```text
request
  → router selects controller
  → controller validates and allowlists input
  → model normalizes/transforms and accesses MongoDB
  → model returns data or a public DTO
  → controller selects the HTTP response
```

Use module-level helpers for one-file reuse and `utils/` for cross-module reuse. Keep secrets in environment variables and never copy credential patterns from learning exercises.
