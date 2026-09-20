# 15 - Development Seed Data

## Purpose
Seed enough realistic data to make the UI testable while keeping the seed idempotent and clearly non-production.

## Admin seed
Source credentials from `info.txt`-derived backend secret configuration.

Rules:
- create only when email does not exist;
- normalized email unique;
- Admin role assigned only by server seeder;
- password hashed using normal password hasher;
- never print password.

## Suggested categories
Use 4:
```text
Electronics
Accessories
Home & Living
Personal Care
```

## Suggested products
Use 8-10 products with varied stock and prices. Example names:

### Electronics
- Wireless Headphones
- Compact Mechanical Keyboard
- Portable Bluetooth Speaker

### Accessories
- Everyday Backpack
- Minimal Wrist Watch
- Classic Sunglasses

### Home & Living
- Modern Desk Lamp
- Ceramic Coffee Mug

### Personal Care
- Daily Skin Care Set
- Travel Toiletry Kit

Avoid using trademarked model names in seed data.

## Price/stock examples
Use BDT values that exercise formatting, for example:
```text
890.00
1290.00
2499.00
3499.00
5990.00
```

Stocks should include:
- some low stock (2-3);
- normal stock (10-25);
- optionally one zero-stock active product to test out-of-stock UX.

## Images
If `SEED_DEMO_IMAGE_ASSETS=true` and Cloudinary credentials are valid:
- follow `09_CLOUDINARY_AND_ASSETS.md`;
- source permitted images;
- upload once;
- record resulting public IDs so seed is idempotent.

A safer implementation is an explicit development seed command that checks products by stable slug before uploading.

## Seed safety
- Seed runs only in Development unless explicitly invoked with an override.
- Never delete existing owner data merely to make seed deterministic.
- Never reset the Neon database automatically on app startup.
- If tables already contain user-created data, add only missing stable seed records.

## Test users
Automated integration tests should create their own users in disposable test DB.

Development browser E2E may use a dedicated non-owner test customer whose credentials are generated locally and not committed.
