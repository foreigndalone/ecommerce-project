---
name: create-redux-state
description: Create or update a Redux Toolkit slice from a natural-language request using a strict feature-folder architecture, optional reducers/actions, optional memoized selectors, normalized or array-based state, and standardized CRUD behavior. Use when the user asks to create Redux state, a Redux Toolkit slice, reducers, actions, or selectors in a JavaScript frontend project.
---

# Create Redux State

Create the requested Redux Toolkit slice in the user's project. Follow the user's explicit state shape and requested operations exactly; use the defaults below only when details are absent.

## Workflow

1. Parse the request for the entity, `initialState`, reducers, selectors, and reducer mount key.
2. Convert the entity to a plural lower-camel-case folder name, such as `users`, `products`, or `videos`. Resolve irregular plurals correctly.
3. Create `src/features/<entity>/<entity>Slice.js`.
4. Generate the file using the exact block order specified below.
5. Inspect the finished file and run the project's relevant lint or test command when available. Do not modify unrelated files.

If an entity name, state shape, or requested operation is genuinely ambiguous and materially changes the output, ask one concise question. Otherwise infer the least surprising choice and proceed.

## File contract

Start the file with this path comment, before imports:

```js
// path: src/features/<entity>/<entity>Slice.js
```

Keep the remaining blocks in this exact order:

1. Imports
2. `initialState`
3. `createSlice`
4. Named actions export, only when reducers are non-empty
5. Selectors, only when requested or logically necessary
6. Default slice reducer export

Name the slice variable `<entity>Slice`, matching the filename. Set `name` to the plural entity folder name.

## Imports and initial state

Always import `createSlice` from `@reduxjs/toolkit`. Import `createSelector` from the same package only when generating selectors. Prefer a single combined named import when both are needed.

Use a user-provided `initialState` exactly, preserving its structure and data. If no state structure is provided, use:

```js
const initialState = { ids: [], entities: {} }
```

Do not introduce extra status, error, or metadata fields unless the request requires them.

## Reducers and actions

If the request contains no reducers, emit `reducers: {}` and do not export actions.

If reducers are requested, implement only the requested reducers. For standard CRUD on normalized `{ ids, entities }` state, use these names and behaviors, replacing `Video` with the singular PascalCase entity:

```js
addVideo: (state, action) => {
  state.ids.push(action.payload.id)
  state.entities[action.payload.id] = action.payload
},
deleteVideoByID: (state, action) => {
  state.ids = state.ids.filter(id => id !== action.payload)
  delete state.entities[action.payload]
},
editByID: (state, action) => {
  if (state.entities[action.payload.id]) {
    state.entities[action.payload.id] = action.payload
  }
}
```

Export non-empty actions by destructuring `<entity>Slice.actions`:

```js
export const { addVideo, deleteVideoByID, editByID } = videosSlice.actions
```

Preserve the exact `ByID` capitalization required above. Do not export an empty action object.

### Array-based state

When the user supplies a simple array state, adapt CRUD to array operations instead of inventing `ids` and `entities`:

- Add with `push`.
- Delete by finding or filtering the item whose `id` matches the payload.
- Edit by locating the item whose `id` matches `action.payload.id` and replacing it only when it exists.
- If the array is nested in an object, operate on the user-provided array field.

Respect any more specific payload contract given by the user.

## Selectors

Do not import `createSelector` and do not create a selector block unless selectors are explicitly requested or clearly required by the requested behavior.

Place selectors after the actions export. First declare the non-exported root input selector:

```js
const selectVideosState = (state) => state.videosReducer
```

Derive the root selector name from the plural PascalCase entity. Use the reducer mount key stated by the user; otherwise default to `<entity>Reducer`.

Name every exported selector `select<Name>`. Create atomic memoized selectors with `createSelector`. For all normalized entities:

```js
export const selectAllVideos = createSelector(
  selectVideosState,
  (videosState) => videosState.ids.map(id => videosState.entities[id])
)
```

For selectors accepting a dynamic argument such as an ID, use an input-selector array and direct normalized lookup:

```js
export const selectVideoById = createSelector(
  [selectVideosState, (_, videoId) => videoId],
  (videosState, videoId) => videosState.entities[videoId]
)
```

Adapt selector projections to a user-provided array or custom state shape without changing that shape. Create only selectors requested or necessary for the stated logic.

## Final export and verification

End the file with:

```js
export default <entity>Slice.reducer
```

Before finishing, verify all of the following:

- The folder, filename, path comment, slice variable, and `name` agree.
- The entity folder is plural.
- The user's explicit `initialState` is unchanged.
- Empty reducers produce no action export.
- Missing selectors produce neither selector code nor a `createSelector` import.
- Normalized CRUD uses `ids` and `entities`; array CRUD uses array operations.
- Selectors use the correct reducer mount key and parameterized-selector input array.
- The file follows the required block order and contains no unrelated boilerplate.
