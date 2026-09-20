# 13 - Error Handling

## API error format
Use RFC 7807 Problem Details consistently.

Example validation response:
```json
{
  "type": "https://httpstatuses.com/400",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "detail": "Please correct the highlighted fields.",
  "instance": "/api/admin/products",
  "traceId": "00-...",
  "errors": {
    "price": ["Price must be zero or greater."],
    "name": ["Name is required."]
  }
}
```

Example conflict:
```json
{
  "title": "Stock is no longer available.",
  "status": 409,
  "detail": "One or more cart items exceed current stock.",
  "traceId": "00-...",
  "code": "STOCK_CONFLICT"
}
```

## Stable application error codes
Use a small set when frontend needs behavior:
```text
EMAIL_ALREADY_EXISTS
INVALID_CREDENTIALS
ACCOUNT_INACTIVE
NOT_FOUND
FORBIDDEN
VALIDATION_ERROR
STOCK_CONFLICT
EMPTY_CART
INVALID_ORDER_TRANSITION
ORDER_NOT_CANCELLABLE
UPLOAD_INVALID_TYPE
UPLOAD_TOO_LARGE
CONCURRENCY_CONFLICT
```

Do not expose raw exception class names as API contract.

## Backend exception mapping
Map expected application exceptions centrally:
- validation -> 400;
- auth failure -> 401;
- authorization -> 403/404 according to policy;
- missing entity -> 404;
- duplicate/unique conflict -> 409;
- stock/concurrency/status conflict -> 409;
- unexpected -> 500.

Controllers should not contain repeated try/catch blocks for normal exceptions.

## Unexpected errors
On server:
- log full exception with trace ID;
- include request context without secrets.

To client:
- generic title/detail;
- trace ID;
- no stack trace.

## Frontend API client
Normalize error parsing into a single type:
```ts
interface ApiError {
  status: number;
  code?: string;
  title: string;
  detail?: string;
  fieldErrors?: Record<string, string[]>;
  traceId?: string;
}
```

The fetch wrapper must handle:
- network offline/fetch failure;
- non-JSON response;
- Problem Details;
- 204;
- 401;
- 403;
- 404;
- 409;
- 500.

## Frontend UX mapping
- field validation -> inline messages;
- network/server error -> page/form banner plus retry where safe;
- stock conflict at checkout -> tell user cart changed, reload cart;
- 401 -> clear token, redirect to login, preserve safe return route;
- 403 -> 403 page/message;
- 404 product/order -> not-found state;
- 409 invalid order transition -> refresh order and show updated status;
- image upload failure -> retain form fields and allow retry.

## Retry rules
Automatically retry only safe/idempotent reads when useful. Do not blindly retry:
- checkout POST;
- register;
- product create;
- order status changes;
- cancellation.

For potentially duplicated submissions, disable UI while in flight and make server behavior as idempotent/safe as practical.

## Validation ownership
Client validation improves UX. Server validation is authoritative.

Do not assume because a React form rejected an input that API endpoints cannot receive malicious requests.
