# 20 - API to Frontend Integration Matrix

This file is the implementation bridge between backend endpoints and React pages/components.

| Backend endpoint | Frontend route/component | Trigger | Success behavior | Important errors |
|---|---|---|---|---|
| `POST /api/auth/register` | `/register` | Submit register form | Show success then login/redirect | duplicate email, validation |
| `POST /api/auth/login` | `/login` | Submit login form | store token in session, load user, redirect | invalid credentials, inactive |
| `GET /api/auth/me` | app bootstrap/profile | authenticated load | populate current-user UI | 401 clears session |
| `PUT /api/auth/profile` | `/profile` | Save profile | refresh displayed user | validation |
| `POST /api/auth/change-password` | `/change-password` | Save | success notice | bad current password |
| `GET /api/categories` | `/`, `/shop` | page load | category cards/filter | network error |
| `GET /api/products` | `/`, `/shop` | load/search/filter/sort/page | product grid | invalid query/network |
| `GET /api/products/{idOrSlug}` | `/products/:slug` | page load | product details | 404 |
| `GET /api/cart` | header, `/cart`, `/checkout` | auth/load/refetch | cart badge/items/summary | 401 |
| `POST /api/cart/items` | product detail/card | Add to Cart | toast + refetch cart | stock conflict, 401 |
| `PATCH /api/cart/items/{id}` | `/cart` | quantity change | update/refetch cart | stock conflict |
| `DELETE /api/cart/items/{id}` | `/cart` | remove | remove/refetch | 404/ownership |
| `DELETE /api/cart` | `/cart` optional | clear cart | empty state | 401 |
| `POST /api/orders` | `/checkout` | Place Order | navigate to order detail | empty cart, stock conflict |
| `GET /api/orders` | `/orders` | page/pagination | order list | 401 |
| `GET /api/orders/{id}` | `/orders/:id` | load | order detail | 404 ownership |
| `POST /api/orders/{id}/cancel` | `/orders/:id` | Cancel | refresh status/stock-facing UX | not cancellable/conflict |
| `GET /api/admin/dashboard/summary` | `/admin` | load | dashboard cards | 403 |
| `GET /api/admin/categories` or admin-capable category list | `/admin/categories` | load | admin list | 403 |
| `POST /api/admin/categories` | `/admin/categories` | create | refresh list | duplicate/validation |
| `PUT /api/admin/categories/{id}` | `/admin/categories` | edit | refresh row | validation |
| `PATCH /api/admin/categories/{id}/status` | `/admin/categories` | enable/disable | update row | conflict |
| `GET /api/admin/products` | `/admin/products` | load/filter/page | product admin list | 403 |
| `POST /api/admin/media/images` | product form | image selected/upload | receive URL/publicId preview | type/size/upload error |
| `POST /api/admin/products` | `/admin/products/new` | save | navigate/list | validation/category |
| `PUT /api/admin/products/{id}` | edit page | save | update/navigate | validation/concurrency |
| `PATCH /api/admin/products/{id}/stock` | product admin | stock edit | refresh | validation |
| `DELETE /api/admin/products/{id}` | product admin | disable | inactive row | conflict |
| `GET /api/admin/orders` | `/admin/orders` | load/filter/search/page | order list | 403 |
| `GET /api/admin/orders/{id}` | `/admin/orders/:id` | load | detail/actions | 404 |
| `PATCH /api/admin/orders/{id}/status` | admin order detail | transition action | refresh order | invalid transition/conflict |

## Integration sequencing rules

### Auth before protected calls
The API wrapper reads the bearer token at request time. Do not copy token into a module constant that becomes stale after login/logout.

### Cart refetch points
Refetch `/api/cart` after:
- login;
- add item;
- update item;
- remove item;
- checkout success;
- returning to cart after a stock conflict.

### Product/category refetch points
Admin UI refetches relevant lists after successful create/update/status actions.

### Order refetch points
Refetch detail after:
- customer cancellation;
- admin status update.

### Error mapping
Use `13_ERROR_HANDLING.md`; do not create endpoint-specific ad-hoc JSON parsing in each page.
