# 04 - Database Schema

## Entity relationship diagram

```mermaid
erDiagram
    USERS ||--o| CARTS : owns
    USERS ||--o{ ORDERS : places
    CATEGORIES ||--o{ PRODUCTS : contains
    CARTS ||--o{ CART_ITEMS : has
    PRODUCTS ||--o{ CART_ITEMS : referenced_by
    ORDERS ||--o{ ORDER_ITEMS : has
    PRODUCTS ||--o{ ORDER_ITEMS : snapshot_from

    USERS {
      uuid id PK
      varchar name
      varchar email UK
      varchar password_hash
      varchar phone
      varchar role
      boolean is_active
      timestamptz created_at
      timestamptz updated_at
    }

    CATEGORIES {
      uuid id PK
      varchar name
      varchar slug UK
      boolean is_active
      timestamptz created_at
      timestamptz updated_at
    }

    PRODUCTS {
      uuid id PK
      uuid category_id FK
      varchar name
      varchar slug UK
      text description
      numeric price
      integer stock_quantity
      text image_url
      varchar image_public_id
      varchar image_alt_text
      boolean is_active
      timestamptz created_at
      timestamptz updated_at
    }

    CARTS {
      uuid id PK
      uuid user_id FK_UK
      timestamptz created_at
      timestamptz updated_at
    }

    CART_ITEMS {
      uuid id PK
      uuid cart_id FK
      uuid product_id FK
      integer quantity
      timestamptz created_at
      timestamptz updated_at
    }

    ORDERS {
      uuid id PK
      uuid user_id FK
      varchar order_number UK
      varchar customer_name
      varchar phone
      text shipping_address
      numeric total_amount
      varchar payment_method
      varchar status
      timestamptz created_at
      timestamptz updated_at
      timestamptz cancelled_at
    }

    ORDER_ITEMS {
      uuid id PK
      uuid order_id FK
      uuid product_id FK
      varchar product_name
      numeric unit_price
      integer quantity
      numeric line_total
    }
```

## Recommended physical schema

### users
| Column | Type | Rules |
|---|---|---|
| id | uuid | PK |
| name | varchar(120) | required |
| email | varchar(320) | required, normalized lowercase, unique |
| password_hash | text | required |
| phone | varchar(30) | nullable |
| role | varchar(20) | `Customer` or `Admin` |
| is_active | boolean | default true |
| created_at | timestamptz | required |
| updated_at | timestamptz | required |

Password implementation may use ASP.NET Core Identity abstractions. If so, preserve equivalent domain behavior and unique normalized email.

### categories
| Column | Type | Rules |
|---|---|---|
| id | uuid | PK |
| name | varchar(100) | required |
| slug | varchar(120) | unique, required |
| is_active | boolean | default true |
| created_at | timestamptz | required |
| updated_at | timestamptz | required |

### products
| Column | Type | Rules |
|---|---|---|
| id | uuid | PK |
| category_id | uuid | FK categories |
| name | varchar(180) | required |
| slug | varchar(220) | unique, required |
| description | text | required |
| price | numeric(12,2) | `>= 0` |
| stock_quantity | integer | `>= 0` |
| image_url | text | nullable until image uploaded |
| image_public_id | varchar(255) | nullable |
| image_alt_text | varchar(255) | nullable |
| is_active | boolean | default true |
| created_at | timestamptz | required |
| updated_at | timestamptz | required |

Indexes:
- category_id;
- is_active;
- normalized/searchable name if needed;
- unique slug.

### carts
| Column | Type | Rules |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users, unique |
| created_at | timestamptz | required |
| updated_at | timestamptz | required |

### cart_items
| Column | Type | Rules |
|---|---|---|
| id | uuid | PK |
| cart_id | uuid | FK carts |
| product_id | uuid | FK products |
| quantity | integer | `> 0` |
| created_at | timestamptz | required |
| updated_at | timestamptz | required |

Unique composite index: `(cart_id, product_id)`.

### orders
| Column | Type | Rules |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK users |
| order_number | varchar(40) | unique, immutable |
| customer_name | varchar(120) | required snapshot |
| phone | varchar(30) | required snapshot |
| shipping_address | text | required snapshot |
| total_amount | numeric(12,2) | `>= 0`, immutable after creation |
| payment_method | varchar(30) | `CashOnDelivery` |
| status | varchar(30) | enum value |
| created_at | timestamptz | required |
| updated_at | timestamptz | required |
| cancelled_at | timestamptz | nullable |

Indexes:
- user_id + created_at desc;
- status + created_at desc;
- unique order_number.

### order_items
| Column | Type | Rules |
|---|---|---|
| id | uuid | PK |
| order_id | uuid | FK orders |
| product_id | uuid | FK products, keep historical reference |
| product_name | varchar(180) | required snapshot |
| unit_price | numeric(12,2) | required snapshot |
| quantity | integer | `> 0` |
| line_total | numeric(12,2) | required snapshot or computed consistently |

Index: order_id.

## Delete behavior
- User with orders: never hard-delete in MVP; deactivate instead.
- Category with products: disable rather than cascade delete.
- Product referenced by orders/cart: disable rather than hard delete.
- Cart -> CartItems: cascade delete is acceptable.
- Order -> OrderItems: cascade at database relationship level is acceptable only if orders themselves are never deleted by application APIs.

## Data invariants
- `orders.total_amount == SUM(order_items.line_total)` at creation.
- `order_items.line_total == unit_price * quantity`.
- Product stock never negative.
- Cart quantity never less than 1.
- One cart per user.
- User cannot read/write another user's cart.
- Order snapshots do not change when product/category changes later.

## Order number
Generate a unique, user-friendly order number independent of the UUID, for example:

```text
ORD-20260920-7F3A21
```

Do not derive security/authorization decisions from order-number predictability. Authorization always uses authenticated user ownership or Admin role.

## Migrations
- Use EF Core migrations.
- Keep migrations in Infrastructure.
- Never call `EnsureCreated` for normal app startup.
- Development bootstrap may run `dotnet ef database update` explicitly.
- Production migration must be an intentional deployment step; do not silently drop/recreate schema.
