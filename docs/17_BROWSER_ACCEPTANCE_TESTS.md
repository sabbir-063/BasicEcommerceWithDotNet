# 17 - Browser Acceptance Tests

Codex should execute these against the running application in a real browser. Record failures and fixes in `IMPLEMENTATION_STATUS.md`.

## A. Public catalog

### A1 Home
1. Open `/`.
2. Header, hero, categories, products, and footer render.
3. No uncaught browser console errors.
4. Product images load over HTTPS when using Cloudinary.
5. Shop CTA works.

### A2 Shop search/filter/sort
1. Open `/shop`.
2. Search for a seeded product keyword.
3. Confirm matching products only.
4. Select category and confirm URL/query state updates if implemented.
5. Change sort to price low-high; verify visible ordering.
6. Clear filters.
7. Navigate pagination if enough products exist.

### A3 Product detail
1. Open product.
2. Verify name, image, price, stock, category, description.
3. For zero stock item, Add to Cart disabled or clear unavailable state.

## B. Authentication

### B1 Register
1. Register unique customer email.
2. Verify successful account creation.
3. Attempt duplicate email; verify friendly conflict.
4. Verify user cannot select Admin role.

### B2 Login/logout
1. Login valid account.
2. Verify profile/navigation changes.
3. Refresh page; session remains during same browser session.
4. Logout; protected route redirects to login.
5. Invalid password shows generic auth failure without revealing account secrets.

### B3 Customer/admin boundary
1. Login as customer.
2. Navigate to `/admin` manually.
3. UI blocks/redirects.
4. Direct request to admin API returns 403.
5. Login as Admin and verify admin pages load.

## C. Admin categories/products

### C1 Category
1. Admin creates category.
2. It appears in admin list and public filter when active.
3. Disable it.
4. It disappears from public category list/catalog filter.
5. Re-enable and verify return.

### C2 Cloudinary upload/product
1. Admin opens new product.
2. Select valid image.
3. Upload through backend.
4. Verify preview is Cloudinary URL.
5. Save product.
6. Verify product appears publicly.
7. Edit price/stock/description.
8. Verify public details reflect updates.
9. Disable product and verify public product is hidden/not found while historical order references remain unaffected if any.

## D. Cart

### D1 Persistence
1. Login customer.
2. Add product quantity 1.
3. Add same product again; quantity increases rather than duplicate line.
4. Add second product.
5. Open cart and verify totals.
6. Refresh browser; cart remains because DB is source of truth.

### D2 Quantity validation
1. Increase quantity within stock.
2. Attempt above stock.
3. Verify server rejects and UI shows useful message.
4. Decrease quantity.
5. Remove an item.

## E. Checkout COD

### E1 Success
1. Ensure cart contains in-stock item.
2. Open checkout.
3. Verify COD is the only payment method.
4. Enter name, phone, address.
5. Submit once.
6. Verify button disabled while pending.
7. Order succeeds.
8. Cart becomes empty.
9. Stock decreases.
10. Order status is Pending.
11. Order appears in My Orders.
12. Order item unit price equals price at purchase time.

### E2 Price snapshot
1. Place order for a product.
2. Admin changes product price afterward.
3. Customer opens old order.
4. Old order still shows original unit price.

### E3 Stock conflict
1. Put low-stock product in cart.
2. Reduce product stock through admin below cart quantity before checkout.
3. Attempt checkout.
4. Verify 409-style stock conflict and no partial order/stock/cart corruption.

## F. Order cancellation

### F1 Customer Pending cancel
1. Place new order.
2. Note product stock after order.
3. Cancel as customer while Pending.
4. Status becomes Cancelled.
5. Stock restores exactly once.
6. Repeat cancel attempt; stock does not increase again.

### F2 Invalid customer cancel
1. Create order and have admin move it to Confirmed.
2. Customer cannot cancel it under MVP rule.

## G. Admin order lifecycle
1. Create fresh customer order.
2. Admin opens order.
3. Pending -> Confirmed.
4. Confirmed -> Shipped.
5. Shipped -> Delivered.
6. Invalid backwards transition is not offered in UI and rejected by API if forced.
7. Delivered cannot be cancelled.

## H. Ownership/IDOR
Use two customer accounts A and B.
1. A creates order.
2. Capture A order UUID from A's own allowed UI/API response.
3. Login as B.
4. Attempt `/orders/{A-id}` UI/API.
5. B must not receive A order data.
6. Repeat with cart item ID where feasible.

## I. Responsive/browser quality
At 390x844, 768x1024, 1440x900:
- header usable;
- product grid does not overflow;
- forms fit viewport;
- tables have mobile strategy (scroll/cards);
- dialogs accessible;
- buttons not clipped;
- no horizontal page scroll caused by layout bugs.

## J. Error handling
1. Stop backend and use frontend.
2. Verify a useful network error state, not blank page.
3. Restart backend and retry works.
4. Force invalid form data and verify field errors.
5. Verify 404 route page.

## K. Security observation
Using DevTools:
- Cloudinary API secret absent;
- DB URL/password absent;
- JWT signing secret absent;
- admin seed password absent;
- frontend only contains expected public `VITE_*` configuration.
