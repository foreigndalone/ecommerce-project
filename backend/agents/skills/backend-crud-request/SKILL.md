---
name: backend-crud-request
description: Generate or extend Node.js, Express, and MongoDB backend requests and CRUD operations using a three-layer Routes → Controllers → Models architecture. Use when Codex must add an entity endpoint, registration or login flow, MongoDB query, validation, normalization, password hashing or verification, authorization, DTO sanitization, or related backend tests while matching the target project's existing JavaScript style.
---

# Backend CRUD Request

Add the requested backend behavior with the smallest coherent change. Preserve the target application's architecture and code style instead of replacing it with a generic template.

## Read the request

Extract these inputs from the user's prompt:

- entity, such as `user` or `product`;
- HTTP method, route, and operation;
- accepted body, path, and query fields;
- response shape and status codes when specified;
- extra behavior such as normalization, hashing, verification, authorization, pagination, or indexes.

Ask only when a missing value materially changes the API contract and cannot be inferred from the project. Never invent secrets, authentication claims, database fields, or response properties.

## Inspect the project first

Before writing code:

1. Read applicable `AGENTS.md` files and the backend `package.json`.
2. Inspect the target application's `models/`, `controllers/`, `routes/`, `config/`, and `utils/` directories.
3. Read the database getter, application/router mount point, related entity files, nearby tests, and error middleware if present.
4. Determine ESM versus CommonJS, import extensions, function and filename patterns, `async/await` style, indentation, quotes, semicolons, error flow, response format, MongoDB driver usage, and test commands.
5. Read [references/style-baseline.md](references/style-baseline.md) only when the local project has sparse precedent or the request explicitly asks for the BOOTCAMP/dev style.

Use this priority order when conventions conflict:

1. explicit user requirements;
2. existing files in the target application;
3. the local style baseline;
4. the defaults in this skill.

Do not rename an existing file merely to satisfy a default naming convention.

## Choose files

Extend an existing entity file when it exists. Otherwise, pluralize the entity and create:

```text
models/<entities>Model.js
controllers/<entities>Controller.js
routes/<entities>Router.js
```

Match a consistent nearby alternative such as `usersModels.js` or `usersRoutes.js` when the target project already uses it. Add or update the router mount in the application entry point only when required.

## Keep layer boundaries

### Model

Keep MongoDB access and persistence transformations in `models/`.

- Name exported operations `<action><Entity>Model`, such as `createUserModel`, `findUserByEmailModel`, `updateProductModel`, or `deleteProductModel`.
- Accept an allowlisted `<entity>Data` object for writes; never pass `req.body` through to MongoDB unchanged.
- Obtain the collection through the project's `getDb()` getter or its established equivalent.
- Normalize persisted lookup keys before querying or writing.
- Hash passwords before persistence and never mutate the caller's object or store plaintext.
- Validate or safely construct `ObjectId` values before database operations.
- Return entity data or a small operation result, not Express responses.
- Convert returned records through a public DTO helper when private or internal fields exist.
- Preserve MongoDB errors that the controller must classify, including duplicate-key code `11000`.

For create operations, build a new allowlisted object:

```js
export const createUserModel = async (userData) => {
    const collection = getCollection()
    const user = {
        name: userData.name,
        normalizedEmail: normalizeEmail(userData.email),
        passwordHash: await hashPassword(userData.password),
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    const result = await collection.insertOne(user)

    return toPublicUser({ _id: result.insertedId, ...user })
}
```

Adapt names and fields to the request and surrounding code. Do not add hashing, timestamps, or DTOs to entities that do not need them.

### Controller

Keep HTTP validation, request extraction, business-flow coordination, and response selection in `controllers/`.

- Read only declared fields from `req.body`, `req.params`, and `req.query`.
- Trim and validate inputs before calling the model.
- Pass an allowlisted object to model functions.
- Return immediately after sending a response.
- Preserve established response envelopes and language.
- Use the project's existing error middleware when present; otherwise follow its local `try/catch` pattern.
- Do not expose stack traces, password fields, password hashes, tokens, timestamps, or raw database errors.

Use status codes consistently unless the project contract says otherwise:

- `200` for successful reads and updates;
- `201` for successful creation;
- `204` for a successful delete with no body;
- `400` for invalid input or malformed identifiers;
- `401` for missing or invalid authentication;
- `403` for insufficient authorization;
- `404` when the requested entity does not exist;
- `409` for deterministic conflicts such as duplicate unique values;
- `500` for unexpected failures.

### Route

Keep `routes/` declarative and thin:

```js
router.post('/signUp', registerUser)
router.get('/:id', getUserById)
```

Import controllers, register only the requested routes, and export the router using the project's established module pattern. Do not put validation, database access, hashing, or business logic directly in the router unless existing middleware owns that responsibility.

## Extract helpers

Do not repeat normalization, cryptography, verification, authorization, or DTO logic inside CRUD functions. Reuse existing helpers or create focused module-level helpers. Move a helper to `utils/` only when it is reused across modules or that is already the project convention.

Use clear names such as:

```js
normalizeEmail(email)
hashPassword(password)
verifyPassword(password, storedHash)
toPublicUser(user)
```

Keep helpers pure where practical. Use the project's installed password library. If none exists, prefer a salted password KDF available in the current Node.js runtime; do not introduce a dependency without checking project conventions and installation constraints.

## Protect data and credentials

- Never hardcode credentials, API keys, tokens, or production origins.
- Keep real `.env` files ignored and expose only placeholders in `.env.example`.
- Do not log passwords, hashes, authorization headers, or entire credential-bearing bodies.
- Reject or allowlist MongoDB filter/update operators received from clients.
- Use deterministic unique indexes for normalized unique identifiers when required.
- Inspect existing data before adding a unique index. Do not delete, overwrite, or merge duplicate records without explicit user approval; prefer a reversible conflict marker or a separate reviewed migration.
- Verify credentials through a dedicated read/authentication flow. Login must not call registration or create a record.
- Add authorization middleware only when the project has an established identity/session/token contract or the user supplies one.

## Implement in order

1. Confirm the endpoint contract and affected files.
2. Add or update helpers.
3. Implement the model operation.
4. Implement controller validation and response handling.
5. Register the route and mount the router if needed.
6. Add focused tests that cover success, invalid input, not-found/authentication failure, conflict, and unexpected model failure as applicable.
7. Run the smallest relevant checks, then the project's full backend validation command when available.

Do not refactor unrelated code, change response contracts silently, add broad abstractions for one endpoint, or alter deployment/database state as part of code generation.

## Verify the result

Before finishing, confirm:

- the route resolves under the intended application mount path;
- imports, exports, filenames, and formatting match nearby files;
- only declared client fields reach the model;
- validation occurs before database access;
- passwords are never persisted or returned in plaintext;
- DTOs omit private and internal fields;
- normalized lookups and unique constraints use the same value;
- duplicate, invalid, unauthorized, not-found, and server errors map correctly;
- tests, lint, syntax checks, and startup/build checks pass, or any unavailable check is reported accurately.

Summarize changed files, API behavior, validation performed, and any external configuration still required.
