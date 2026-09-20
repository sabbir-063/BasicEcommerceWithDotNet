# 06 - Frontend Specification

## Goals
The frontend should feel like a complete e-commerce MVP, not an admin-only demo. It must be responsive, accessible, and resilient to API errors.

## Routes

### Public/customer routes
```text
/
/shop
/products/:slug
/login
/register
/profile
/change-password
/cart
/checkout
/orders
/orders/:id
```

### Admin routes
```text
/admin
/admin/categories
/admin/products
/admin/products/new
/admin/products/:id/edit
/admin/orders
/admin/orders/:id
```

### System routes
```text
/403
/404
```

## Page requirements

### Home `/`
Include:
- responsive header/navigation;
- hero section;
- primary CTA to Shop;
- active category cards;
- featured/new products section from real API data;
- simple value proposition such as COD and secure ordering;
- footer.

Do not hard-code fake product prices if API seed data exists.

### Shop `/shop`
Include:
- search input;
- category filter;
- sort control;
- product grid;
- pagination;
- result count;
- loading skeleton;
- empty state;
- error/retry state.

Keep filter state in URL query parameters where practical so refresh/back navigation behaves correctly.

### Product details `/products/:slug`
Include:
- image;
- product name;
- category;
- price formatted in BDT;
- stock status;
- description;
- quantity selector bounded by stock;
- Add to Cart button;
- inactive/not-found handling.

If unauthenticated user tries to add to cart, redirect to login and preserve a safe return URL.

### Authentication pages
Register:
- name;
- email;
- phone optional;
- password;
- password confirmation client-side only.

Login:
- email;
- password.

Never log passwords or tokens to console.

### Profile
Show account information and allow name/phone update.

### Change password
Require current password, new password, confirm new password.

### Cart
Render data from `/api/cart`.

Each line:
- image;
- name;
- unit price;
- quantity controls;
- line total;
- remove action.

Summary:
- item count;
- subtotal/total;
- Checkout button.

Handle stock becoming insufficient after the item was placed in cart.

### Checkout
COD only.

Fields:
- customer name;
- phone;
- shipping address.

Show read-only order summary from current cart.

Submit only shipping data plus `CashOnDelivery`. Never submit trusted prices/totals.

Prevent accidental double submission by disabling the submit button while the request is pending.

On success:
- clear/reload cart state;
- navigate to order confirmation/details.

### My Orders
Paginated list with:
- order number;
- date;
- amount;
- status;
- details link.

### Order Details
Include:
- order number;
- status badge;
- placed date;
- shipping snapshot;
- COD method;
- order-item snapshots;
- total;
- Cancel button only when current status permits customer cancellation.

### Admin Dashboard
Cards:
- total products;
- active products;
- total orders;
- pending orders;
- total customers.

### Admin Categories
- table/list;
- create form/modal;
- edit;
- enable/disable;
- loading/empty/error states.

### Admin Products
- paginated list;
- search/filter;
- add/edit;
- stock display;
- active/inactive status;
- Cloudinary upload workflow.

Product form:
- category;
- name;
- description;
- price;
- stock;
- image upload;
- alt text;
- active status.

Image upload UX:
1. user selects file;
2. client validates obvious type/size for fast feedback;
3. upload file to backend media endpoint;
4. backend uploads to Cloudinary;
5. form receives URL/public ID;
6. product save references that image.

Server validation remains authoritative.

### Admin Orders
List supports:
- status filter;
- order search;
- pagination;
- details navigation.

Details page:
- customer/shipping snapshot;
- items;
- total;
- current status;
- only valid next status actions.

## Navigation behavior
Header should include:
- logo/store name;
- Shop;
- Cart with count fetched from cart API after authentication;
- Login/Register when unauthenticated;
- Profile/Orders/Logout when authenticated;
- Admin link only for Admin role.

Avoid a global state library. Refresh cart badge after cart mutations using a lightweight event/callback/refetch mechanism. Keep this simple and documented.

## Authentication module
Suggested functions:
```text
login(credentials)
logout()
getAccessToken()
setAccessToken(token)
getCurrentUser()
isAuthenticated()
isAdmin()
authenticatedFetch(...)
```

Token storage: `sessionStorage` for this MVP.

Do not trust decoded JWT role for backend authorization. Frontend role checks are UX-only; backend role authorization is authoritative.

## Form behavior
- Use client validation for UX;
- display server field errors near fields where possible;
- do not swallow API errors;
- preserve form input after validation failure;
- trim names/search input;
- use numeric inputs carefully and send decimal values as JSON numbers.

## Accessibility minimum
- semantic buttons and links;
- every form control has label;
- keyboard navigable;
- visible focus state;
- alt text for meaningful product images;
- status/error messages accessible to screen readers;
- adequate heading hierarchy;
- no action available only on hover.

## Responsive breakpoints
Test at least:
- 390x844 phone;
- 768x1024 tablet;
- 1440x900 desktop.

## Formatting
Currency:
- use `Intl.NumberFormat` with `BDT`;
- do not manually concatenate currency strings throughout the app.

Dates:
- parse UTC API dates;
- render user-friendly local date/time;
- avoid timezone-dependent business rules in the browser.
