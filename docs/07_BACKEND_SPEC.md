# 07 - Backend Specification

## API project responsibilities
Configure:
- controllers;
- JSON options;
- authentication;
- authorization policies;
- CORS;
- exception handling;
- Problem Details;
- request logging with sensitive-data protection;
- health checks;
- OpenAPI in Development;
- DI registrations;
- rate limiting for sensitive public endpoints if practical.

## Application services
Suggested services:
```text
AuthService
ProfileService
CategoryService
ProductService
MediaService
CartService
OrderService
AdminOrderService
DashboardService
```

Keep controllers thin: HTTP mapping, auth context, and response status only. Business rules belong in application/domain services.

## DTO policy
Never return EF entities directly.

Use request/response records/classes such as:
```text
RegisterRequest
LoginRequest
AuthResponse
UserProfileResponse
CategoryResponse
CreateCategoryRequest
ProductListItemResponse
ProductDetailResponse
CreateProductRequest
UpdateProductRequest
CartResponse
CartItemResponse
AddCartItemRequest
UpdateCartItemRequest
CheckoutRequest
OrderSummaryResponse
OrderDetailResponse
UpdateOrderStatusRequest
ProblemDetails/ValidationProblemDetails
```

## Validation
Use either built-in validation plus service-level validation or FluentValidation. Pick one approach and apply consistently.

Validate:
- email shape/length;
- password policy;
- required names;
- phone length/basic format without over-restricting Bangladesh numbers;
- category/product existence;
- price nonnegative;
- stock nonnegative;
- cart quantity positive;
- shipping address reasonable max length;
- supported enum/status values;
- uploaded MIME type and size.

## Authentication implementation
Preferred approach for the MVP:
- password hashing using ASP.NET Core's proven PasswordHasher/Identity primitives;
- JWT access token signed with configured secret;
- include user ID and role claims;
- access token lifetime from config;
- no public role selection;
- inactive users cannot login.

Do not write custom cryptographic password hashing.

## Authorization
Use `[Authorize]` for authenticated endpoints and role/policy authorization for admin endpoints.

Ownership checks:
- Cart derives user ID from authenticated principal; never accepts user ID from request.
- Customer orders query by both order ID and current user ID, or otherwise enforce ownership before return.

## Category rules
- name normalized for slug creation;
- slug unique;
- disabling category removes its products from public catalog without deleting products;
- admin can re-enable.

## Product rules
- category must exist and be active when creating an active product;
- price/stock validated;
- public catalog only returns active products whose category is active;
- disable rather than deleting historical data;
- image URL/public ID originate from successful Cloudinary upload or trusted admin operation;
- ensure admin cannot use media deletion to delete arbitrary Cloudinary assets outside project folder.

## Cart service rules
When cart requested:
- find or create one cart for current user;
- calculate prices from current Products table;
- return stock-aware DTO.

Add/update:
- product must be active and category active;
- quantity >= 1;
- resulting quantity <= available stock;
- unique cart-product row;
- handle race on unique constraint gracefully.

## Checkout algorithm
Pseudo-flow:

```text
Begin transaction
  Load current user's cart + item product IDs
  Reject empty cart

  For each item:
    Reload product authoritative state
    Reject inactive product/category
    Reject insufficient stock
    Snapshot current product name and price

  Compute line totals and total server-side
  Create Order(Pending, COD, shipping snapshot)
  Create OrderItems snapshots

  Atomically decrement stock without allowing negative values
  If any stock update fails -> rollback and return 409

  Delete cart items
Commit
Return created order
```

Do not perform Cloudinary or other external network calls inside checkout DB transaction.

## Cancellation algorithm
Customer:
- only own Pending order.

Admin:
- Pending or Confirmed.

Transaction:
```text
Lock/read order current state
Validate transition to Cancelled
If not already cancelled:
  restore each order item's quantity to product stock
  mark Cancelled
  set cancelled_at
Commit
```

Make repeat request safe: a second cancellation must not restore stock twice. Return a conflict or current cancelled state.

## Order status transitions
Implement a central transition function/map. Do not scatter rules across controllers/UI.

Allowed:
```text
Pending -> Confirmed
Pending -> Cancelled
Confirmed -> Shipped
Confirmed -> Cancelled
Shipped -> Delivered
```

All other transitions rejected.

## Query performance
Use:
- `AsNoTracking` for read-only queries;
- server-side projection to DTOs;
- pagination before materialization;
- indexes from database doc;
- avoid N+1 queries.

## Logging
Log:
- request path/method/status/duration;
- unexpected errors with correlation/trace ID;
- important admin state changes where useful.

Never log:
- passwords;
- JWTs;
- DB passwords;
- Cloudinary API secret;
- complete Authorization headers.

## OpenAPI
In Development expose Swagger/OpenAPI and ensure auth-protected endpoints can be tested with bearer token.

Do not expose detailed exception stack traces in production responses.
