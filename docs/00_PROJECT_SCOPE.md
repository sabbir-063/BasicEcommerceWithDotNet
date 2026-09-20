# 00 - Project Scope

## Product goal
Build a basic but complete single-vendor e-commerce MVP that demonstrates a real production-style flow from browsing products to Cash on Delivery checkout and order administration.

The application is not a marketplace. There is one store, one inventory, and two roles: Customer and Admin.

## Included customer features

1. Register account
2. Login and logout
3. View/update basic profile data
4. Change password
5. Browse active products
6. Browse by category
7. Search products by name/description
8. View product details
9. See current stock availability
10. Add product to database-backed cart
11. Increase/decrease cart quantity
12. Remove cart item
13. Review cart totals
14. Checkout with Cash on Delivery only
15. Enter shipping name, phone, and address
16. Place order
17. View order confirmation
18. View own order history
19. View own order details and current status
20. Cancel an eligible order

## Included admin features

1. Admin login through the same authentication system
2. View simple dashboard metrics
3. List/create/edit/disable categories
4. List/create/edit/disable products
5. Upload product images through backend to Cloudinary
6. Update stock
7. Browse/search/filter all orders
8. View order details
9. Change order status using valid transitions only
10. Cancel eligible orders

## Order statuses

```text
Pending -> Confirmed -> Shipped -> Delivered
    \          \
     \          -> Cancelled
      -> Cancelled
```

Rules:
- New orders start as `Pending`.
- Customer may cancel only while `Pending`.
- Admin may cancel while `Pending` or `Confirmed`.
- `Delivered` and `Cancelled` are terminal. `Shipped` can move only to `Delivered`.
- When an order is cancelled before shipment, reserved/deducted stock must be restored exactly once.
- Invalid transitions return a validation/conflict response; never silently accept them.

## Payment
Only `CashOnDelivery` is supported in version 1.

Do not implement:
- card payments;
- mobile financial services;
- online payment callbacks/webhooks;
- payment refunds.

Keep the domain field `PaymentMethod` so later payment methods can be added without redesigning orders.

## Cart
Cart is persisted in PostgreSQL. Do not use LocalStorage as the source of truth for cart data.

Rules:
- One active cart per customer.
- A cart item is unique by `(CartId, ProductId)`.
- Adding an existing product increases/upserts quantity.
- Quantity must be at least 1 and cannot exceed available stock.
- Cart totals shown by the API are calculated from current product prices.
- Checkout revalidates all prices and stock. The client total is never trusted.

## Product image storage
Actual image binary files are stored in Cloudinary. PostgreSQL stores image metadata such as:
- `ImageUrl`
- `ImagePublicId`
- optional `ImageAltText`

## Core tables
Exactly these seven core tables are required for the MVP:

1. Users
2. Categories
3. Products
4. Carts
5. CartItems
6. Orders
7. OrderItems

Framework-managed identity tables are allowed only if ASP.NET Core Identity is selected. If Identity is used, document which generated identity tables replace/extend the logical `Users` concept.

## Explicitly out of scope
Do not add these unless explicitly requested:
- Wishlist
- Reviews/ratings
- Coupons/promotions
- Multiple sellers/vendors
- Multiple product variants/SKUs
- Saved addresses/address book
- Online payments
- Email/SMS notifications
- Returns/refunds
- Shipping carrier integration
- Invoice PDF
- Recommendations
- Chat
- Loyalty points
- Multi-currency
- Multi-language
- Advanced analytics
- CMS

## UX expectations
Every data-driven page must define these states:
- initial/loading;
- success;
- empty;
- validation error;
- API/network error.

The UI must be responsive at phone, tablet, and desktop sizes.

## MVP completion test
The MVP is complete only when a newly registered customer can use the real browser to:

`Register -> Login -> Browse -> Search -> View Product -> Add to Cart -> Edit Cart -> Checkout COD -> Place Order -> View Order`

and an admin can:

`Login -> Create/Update Category -> Create Product -> Upload Cloudinary Image -> Update Stock -> View Order -> Change Pending to Confirmed -> Shipped -> Delivered`.
