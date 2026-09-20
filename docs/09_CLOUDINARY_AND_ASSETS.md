# 09 - Cloudinary and Visual Assets

## Cloudinary purpose
Cloudinary stores product images. PostgreSQL stores only the returned URL/public ID and descriptive metadata.

## Required development credentials
From root `info.txt`:
```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER
```

The API secret is backend-only.

## Backend upload design
Use Cloudinary .NET SDK from Infrastructure through an application interface such as:

```text
IImageStorage
  UploadImageAsync(stream, fileName, cancellationToken)
  DeleteImageAsync(publicId, cancellationToken)
```

Return a result containing:
```text
Url
PublicId
Width
Height
Format
Bytes
```

Upload settings:
- secure HTTPS delivery;
- `resource_type=image`;
- project folder from configuration;
- unique generated public ID;
- reasonable image transformation/quality defaults if supported without destroying source needs.

## Image replacement
When editing a product image:
1. upload new image first;
2. update product record transactionally in DB;
3. after DB success, best-effort delete old Cloudinary image if it belongs to project folder;
4. if old deletion fails, log warning but do not roll back a valid product update.

Avoid a sequence that deletes the only valid old image before a new upload succeeds.

## Development smoke test
After Cloudinary integration:
1. upload one small valid image through authenticated admin API;
2. verify response URL loads in browser;
3. verify public ID belongs to `CLOUDINARY_FOLDER`;
4. optionally delete the test image;
5. ensure no API secret appears in browser Network payloads or frontend files.

## Demo/site images
For home hero/category/demo product images, Codex may source royalty-permitted images online during development.

Preferred source for this project: Unsplash standard free images, with care around trademarks/recognizable people. Do not use Unsplash+ subscriber-only images unless the owner has rights.

Recommended sourcing pages/starting points:
- https://unsplash.com/s/photos/e-commerce-product
- https://unsplash.com/s/photos/minimal-product
- https://unsplash.com/s/photos/flat-lay
- https://unsplash.com/s/photos/ecommerce-website

Example free image pages found during planning:
- https://unsplash.com/photos/a-white-desk-with-a-keyboard-mouse-and-other-electronics-ClWWV8qMJXk
- https://unsplash.com/photos/flat-lay-of-accessories-and-electronics-on-white-background-b0yQi11cHuc
- https://unsplash.com/photos/skincare-bottles-and-jar-on-shelf-with-plant-2c5R1rXF3sQ

## Asset sourcing protocol for Codex
Do not hotlink random third-party images permanently if a stable local/Cloudinary seed is practical.

Preferred flow:
1. choose an image explicitly marked free to use under the source's license;
2. avoid obvious brand/logo/celebrity complications for demo data;
3. record source page URL in `docs/ASSET_SOURCES.md` created by Codex;
4. download a reasonable-size image for development seed;
5. upload it into the development Cloudinary project under the project folder;
6. store resulting Cloudinary URL/public ID in seeded product data;
7. delete temporary local downloaded file unless intentionally retained and licensed for repository use.

## Suggested demo visual categories
Use 6-10 products across 3-4 categories, for example:
- Electronics: headphones, keyboard, desk accessories;
- Fashion/Accessories: backpack, watch, sunglasses without prominent brand marks;
- Home: lamp, mug, organizer;
- Beauty/Personal Care: neutral unbranded bottles.

The images do not have to depict the exact commercial product model. This is demo content; avoid false brand claims.

## Hero image
A single clean flat-lay/lifestyle image can be used as the home hero background/card. Keep text contrast accessible. Prefer CSS gradient/overlay rather than editing copyrighted image text into the image.

## Image alt text
Product alt text should describe the visible item, not repeat SEO keywords. Example:
`Black over-ear wireless headphones on a light background`.
