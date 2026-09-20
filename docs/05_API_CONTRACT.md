# 05 - API Contract

Base path: `/api`

Content type: JSON unless an upload endpoint uses multipart form data.

## Response conventions

### Single resource
Return the DTO directly.

### Paginated resource
Use a stable shape:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "totalItems": 0,
  "totalPages": 0
}
```

### Errors
Use `application/problem+json` with fields described in `13_ERROR_HANDLING.md`.

## Authentication

### POST `/api/auth/register`
Public.

Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPassword123!",
  "phone": "+8801XXXXXXXXX"
}
```

Response `201`:
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "Customer"
}
```

Rules:
- public registration always creates Customer;
- never accept role from public client;
- duplicate normalized email returns `409` or validation-style conflict.

### POST `/api/auth/login`
Public.

Request:
```json
{
  "email": "jane@example.com",
  "password": "..."
}
```

Response `200`:
```json
{
  "accessToken": "jwt",
  "expiresAt": "2026-09-20T15:00:00Z",
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "Customer"
  }
}
```

### GET `/api/auth/me`
Authenticated.

### PUT `/api/auth/profile`
Authenticated. Allow name/phone update; email changes are out of scope unless implemented with appropriate uniqueness validation.

### POST `/api/auth/change-password`
Authenticated.

Request:
```json
{
  "currentPassword": "...",
  "newPassword": "..."
}
```

## Categories

### GET `/api/categories`
Public. Return active categories by default.

Query:
- `includeInactive=false` is ignored/rejected for non-admin users.

### GET `/api/admin/categories`
Admin. Paginated or compact list for management; includes inactive categories and optional `search`/`isActive` filtering.

### POST `/api/admin/categories`
Admin.

Request:
```json
{ "name": "Electronics" }
```

### PUT `/api/admin/categories/{id}`
Admin.

### DELETE `/api/admin/categories/{id}`
Admin. Semantics: soft-disable (`isActive=false`) unless it is provably safe to hard-delete and implementation deliberately chooses so. Prefer soft-disable.

### PATCH `/api/admin/categories/{id}/status`
Admin.

Request:
```json
{ "isActive": true }
```

## Products

### GET `/api/products`
Public.

Query parameters:
- `page` default 1;
- `pageSize` default 12, max 100;
- `search` optional;
- `categoryId` optional;
- `sort` one of `newest`, `price_asc`, `price_desc`, `name_asc`.

Only active products in active categories are shown publicly.

### GET `/api/products/{idOrSlug}`
Public. Support UUID or choose slug-only/UUID-only consistently. Slug is preferred for public routes; admin API may use ID.

### GET `/api/admin/products`
Admin. Includes inactive filter support.

### POST `/api/admin/products`
Admin.

Request:
```json
{
  "categoryId": "uuid",
  "name": "Wireless Headphones",
  "description": "...",
  "price": 3499.00,
  "stockQuantity": 20,
  "imageUrl": "https://...",
  "imagePublicId": "ecommerce-dev/products/...",
  "imageAltText": "Black wireless headphones",
  "isActive": true
}
```

### PUT `/api/admin/products/{id}`
Admin. Full editable product update.

### PATCH `/api/admin/products/{id}/stock`
Admin.

Request:
```json
{ "stockQuantity": 25 }
```

### DELETE `/api/admin/products/{id}`
Admin. Soft-disable.

## Media / Cloudinary

### POST `/api/admin/media/images`
Admin. `multipart/form-data` with `file`.

Validations:
- image MIME allowlist;
- reasonable file-size limit (for example 5 MB for MVP);
- reject empty/corrupt/non-image file;
- normalize/sanitize filename metadata;
- store in configured Cloudinary folder.

Response `201`:
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "ecommerce-dev/products/abc123",
  "width": 1200,
  "height": 1200,
  "format": "webp"
}
```

### DELETE `/api/admin/media/images`
Admin. Accept a public ID only if application policy verifies it belongs to the configured application folder. This endpoint is optional; product replacement can also clean old images in a service method.

Never expose Cloudinary API secret to frontend.

## Cart
All cart endpoints require authenticated Customer/Admin account ownership; admin role does not grant access to another user's cart unless an explicit admin cart endpoint is created, which is out of scope.

### GET `/api/cart`
Response:
```json
{
  "id": "uuid",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Wireless Headphones",
      "imageUrl": "https://...",
      "unitPrice": 3499.00,
      "quantity": 2,
      "availableStock": 20,
      "lineTotal": 6998.00
    }
  ],
  "itemCount": 2,
  "totalAmount": 6998.00
}
```

### POST `/api/cart/items`
Request:
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

Behavior: create or increase existing line. Revalidate active product and stock.

### PATCH `/api/cart/items/{itemId}`
Request:
```json
{ "quantity": 3 }
```

### DELETE `/api/cart/items/{itemId}`
Response `204`.

### DELETE `/api/cart`
Clear current user's cart. Response `204`.

## Checkout and customer orders

### POST `/api/orders`
Authenticated. Creates an order from the authenticated user's current cart.

Request:
```json
{
  "customerName": "Jane Doe",
  "phone": "+8801XXXXXXXXX",
  "shippingAddress": "House ..., Dhaka, Bangladesh",
  "paymentMethod": "CashOnDelivery"
}
```

Server ignores any client price/total even if supplied.

Response `201`:
```json
{
  "id": "uuid",
  "orderNumber": "ORD-20260920-7F3A21",
  "status": "Pending",
  "paymentMethod": "CashOnDelivery",
  "totalAmount": 6998.00,
  "createdAt": "2026-09-20T14:30:00Z"
}
```

Potential responses:
- `400` empty cart or invalid address data;
- `409` stock changed/unavailable during checkout.

### GET `/api/orders`
Authenticated. Only current user's orders. Paginated, newest first.

### GET `/api/orders/{id}`
Authenticated. Current user's order only.

### POST `/api/orders/{id}/cancel`
Authenticated. Customer can cancel own `Pending` order. Returns updated order.

## Admin orders

### GET `/api/admin/orders`
Admin. Paginated.

Query:
- `page`, `pageSize`;
- `status`;
- `search` order number/customer name/email if implemented;
- optional date range.

### GET `/api/admin/orders/{id}`
Admin.

### PATCH `/api/admin/orders/{id}/status`
Admin.

Request:
```json
{ "status": "Confirmed" }
```

Validate transition matrix. If transition to Cancelled restores stock, do it transactionally and idempotently.

## Admin dashboard

### GET `/api/admin/dashboard/summary`
Admin.

Response example:
```json
{
  "totalProducts": 42,
  "activeProducts": 38,
  "totalOrders": 123,
  "pendingOrders": 7,
  "totalCustomers": 55
}
```

Do not call revenue a settled/paid revenue metric because payment is COD and payment settlement tracking is out of scope.

## Status codes
Use consistently:
- `200` successful read/update;
- `201` resource created;
- `204` successful delete/clear without body;
- `400` malformed/invalid request;
- `401` not authenticated/invalid token;
- `403` authenticated but insufficient role/ownership where hiding existence is not preferred;
- `404` resource not found or intentionally hidden by ownership policy;
- `409` duplicate/conflict/concurrency/stock/status transition conflict;
- `422` optional for semantic validation only if adopted consistently; otherwise use `400` validation problem;
- `500` unexpected server failure with safe generic client message.
