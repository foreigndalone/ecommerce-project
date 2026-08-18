# Ecommerce Project

Full-stack ecommerce application with a React + Redux Toolkit frontend and an Express + MongoDB backend.

The project supports user authentication, product browsing, product details, cart persistence, favorites, checkout review, and account profile updates. Product data is imported from DummyJSON into a MongoDB `products` collection and then served through the local backend API.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Redux Toolkit
- React Router
- React Hook Form
- Tailwind CSS
- Vitest + React Testing Library

### Backend

- Node.js
- Express
- MongoDB native driver
- JSON Web Token authentication
- Node test runner
- DummyJSON product migration script

## Project Structure

```text
backend/
  app.js
  config/
  controllers/
  models/
  routes/
  scripts/
  test/
  utils/

frontend/
  src/
    app/
    components/
    features/
    pages/
    test/
    types/
```

There is no root-level package script. Install and run the backend and frontend separately.

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`:

```env
MONGODB_URI=mongodb://username:password@host:27017/database
DB_NAME=ecommerce
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:5173
PORT=3000
```

Required:

- `MONGODB_URI`
- `DB_NAME`
- `JWT_SECRET`

Optional:

- `FRONTEND_ORIGIN` defaults to `http://localhost:5173`
- `PORT` defaults to `3000`

### Frontend

Create `frontend/.env` if the backend URL differs from the local defaults:

```env
VITE_API_URL=http://localhost:3000/api
VITE_API_BASE_URL=http://localhost:3000
```

Current usage:

- `VITE_API_URL` is used by product requests.
- `VITE_API_BASE_URL` is used by user/auth requests.

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running the App

Start the backend:

```bash
cd backend
node app.js
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Product Migration

Products are migrated from:

```text
https://dummyjson.com/products
```

Run the migration manually:

```bash
cd backend
npm run migrate:products
```

The migration:

- fetches all DummyJSON products;
- normalizes product fields through an allowlist;
- stores products in MongoDB collection `products`;
- uses `externalId` from DummyJSON `id`;
- sets imported products to `status: "active"`;
- converts review dates to `Date`;
- creates MongoDB `_id` values for reviews;
- uses `bulkWrite` with `updateOne` and `upsert: true`;
- is designed to be idempotent;
- updates `updatedAt` on every import;
- sets `createdAt` only on insert;
- checks unique index conflicts before creating indexes;
- closes the MongoDB connection after completion.

Migration output includes:

```text
received
inserted
updated
skipped
failed
```

Do not run the migration without a valid MongoDB connection and reviewed environment variables.

## MongoDB Collections

### `products`

Main product document shape:

```ts
interface Product {
  _id: ObjectId
  externalId?: number
  slug: string
  sku: string
  title: string
  description: string
  category: string
  brand?: string
  tags: string[]
  price: number
  discountPercentage: number
  stock: number
  minimumOrderQuantity: number
  rating: number
  images: string[]
  thumbnail?: string
  shippingInformation?: string
  warrantyInformation?: string
  returnPolicy?: string
  status: 'draft' | 'active' | 'archived'
  reviews: ProductReview[]
  createdAt: Date
  updatedAt: Date
}
```

### Product Indexes

The backend ensures these indexes:

```js
{ externalId: 1 } // unique partial index for numeric externalId
{ slug: 1 }       // unique
{ sku: 1 }        // unique
{ status: 1, category: 1 }
{ status: 1, brand: 1 }
```

## API Contract

Base URL:

```text
http://localhost:3000/api
```

### Products

#### `GET /api/products`

Supported query parameters:

```ts
{
  search?: string
  category?: string
  brand?: string
  limit?: number
  skip?: number
}
```

Response:

```json
{
  "products": [],
  "total": 0,
  "limit": 30,
  "skip": 0
}
```

Validation:

- only `search`, `category`, `brand`, `limit`, and `skip` are accepted;
- `limit` must be an integer from `1` to `100`;
- `skip` must be a non-negative integer.

#### `GET /api/products/:id`

Uses MongoDB `_id`.

Responses:

- `200 OK` — public product DTO
- `400 Bad Request` — invalid product id
- `404 Not Found` — product not found
- `500 Internal Server Error` — server failure

Public product DTO converts:

- `_id` to `id`
- `review._id` to `review.id`
- `review.userId` to string when present

### Users

#### `POST /api/users/signUp`

Creates a user.

Body:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

#### `POST /api/users/login`

Logs in and returns:

```json
{
  "user": {},
  "token": "jwt-token"
}
```

#### `GET /api/users/me`

Requires:

```http
Authorization: Bearer <token>
```

#### `PATCH /api/users/me`

Requires:

```http
Authorization: Bearer <token>
```

Body:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

## Frontend State

Redux reducer mount keys:

```ts
productsReducer
usersReducer
cartReducer
favoritesReducer
```

Products use normalized Redux Toolkit entity state. Cart items store product IDs as strings and resolve full product data from `productsReducer.entities`.

## Verification

### Backend

Run backend tests:

```bash
cd backend
npm test
```

### Frontend

Run the full frontend verification:

```bash
cd frontend
npm run verify
```

This runs:

```text
lint
typecheck
tests
build
```

Individual frontend commands:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

## Current Test Coverage

Backend tests cover:

- product controllers;
- product migration helpers;
- auth utilities;
- auth middleware.

Frontend tests cover:

- app rendering;
- products slice API behavior;
- cart totals and string product IDs;
- favorites behavior;
- users session restoration;
- auth page flows;
- checkout empty state;
- product page loading;
- account page behavior;
- navbar and like button behavior.

## Manual QA Checklist

Before submission, manually verify:

- product migration runs against the intended MongoDB database;
- products list loads from the backend API;
- product details page opens by MongoDB string ID;
- signup works;
- login works;
- refresh restores authenticated session;
- logout clears session state;
- account profile update works;
- favorites can be added and removed;
- cart can add/remove products;
- cart persists correctly for guest and logged-in users;
- checkout empty state and filled-cart state work.

## Known Notes

- Backend is still JavaScript ESM.
- Frontend source is TypeScript/TSX and has a real `tsc --noEmit` typecheck.
- Product endpoints are public and do not send credentials.
- User endpoints use JWT bearer authentication.
- The migration is not run automatically by app startup.
- The migration should only be run manually with reviewed environment variables.
