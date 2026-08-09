name: api-request-thunk
description: Create simple Redux Toolkit createAsyncThunk API requests in the project's existing fetch style. Use when Codex needs to add or refactor a small frontend request with a dynamic endpoint, method, query parameters, payload, optional dates, input trimming, an 8-second timeout, rejectWithValue error handling, environment-based base URL, and lightweight response metadata.
---

# API Request Thunk

Create a small, readable `createAsyncThunk` that resembles the surrounding project. Prefer direct code over abstractions.

## Read the request

Determine from the prompt or nearby files:

- thunk name and Redux action name;
- endpoint and HTTP method;
- query parameters and payload;
- date fields and required date format;
- whether cookies or an authorization header are needed.

Ask only when a required value cannot be inferred. Do not invent endpoints, API keys, or response fields.

## Follow the project pattern

Use this structure:

```js
export const requestName = createAsyncThunk(
  "feature/requestName",
  async (args, { rejectWithValue }) => {
    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          message: res.statusText,
        }));
        return rejectWithValue(errorData.message || "Failed to fetch");
      }

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
```

Start from [assets/apiRequestThunk.js](assets/apiRequestThunk.js) when a generic implementation is useful. Rename the thunk, action prefix, and error message for the feature.

## Keep these safeguards

1. Give the argument object and all fields defaults:
   `{ endpoint = "", method = "GET", params = {}, payload = null } = {}`.
2. Trim the endpoint, method, and string values in `params` and `payload`.
3. For declared date fields, call `new Date(value)`. Use the current date when the input is empty or invalid. Format it as required by the API; use ISO only when no format is specified.
4. Build query parameters with `URLSearchParams`.
5. Read the base URL from the environment convention already used by the project. Use `import.meta.env.VITE_API_URL` for Vite or `process.env.REACT_APP_API_URL` for Create React App. Never hardcode secrets.
6. Cancel the request after `8000` ms with `AbortController` and clear the timer in `finally`.
7. Parse server errors with `await res.json().catch(() => ({ message: res.statusText }))`.
8. Return errors through `rejectWithValue`. Use a clear timeout message for `AbortError`.
9. Add `credentials: "include"` or an authorization header only when the existing feature requires it.

## Return data

For a plain project request, return the parsed API data directly. When the prompt asks for metadata, return:

```js
{
  data,
  queryParams,
  fetchedAt: new Date().toISOString(),
}
```

Do not transform response fields unless the slice needs a specific documented shape. Add `pending`, `fulfilled`, and `rejected` reducers only when the user asks for a complete slice.

## Check the result

Confirm that the generated code handles an empty endpoint, an invalid date, a timeout, a non-JSON server error, and the project's environment-variable syntax. Keep helpers local and short; do not introduce Axios, interceptors, schemas, classes, or recursive utilities unless the existing project already uses them.