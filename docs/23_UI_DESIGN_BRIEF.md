# 23 - UI Design Brief

## Direction
A clean, modern, neutral e-commerce interface. Prioritize readability and product imagery over decorative complexity.

## Layout
- centered max-width content container;
- generous spacing;
- simple top navigation;
- responsive product-card grid;
- clear checkout/admin forms;
- mobile-first behavior.

## Home composition
1. Header
2. Hero: short store headline + CTA + licensed lifestyle/flat-lay image
3. Category cards
4. Featured/new products
5. Small COD/value section
6. Footer

## Product cards
Show:
- consistent image aspect ratio;
- product name;
- category subtle label;
- BDT price;
- stock/out-of-stock indication only when useful;
- accessible click target.

Do not overload cards with long descriptions.

## Color and typography
Use Tailwind defaults/custom tokens with a restrained palette. Define a small semantic set:
```text
background
surface
text
muted
primary
border
success
warning
danger
```

Do not scatter arbitrary hex values across components.

Use one clean system/web font stack unless a font package is deliberately added.

## Status badges
Order states need visually distinct badges, but text labels must carry meaning independent of color:
```text
Pending
Confirmed
Shipped
Delivered
Cancelled
```

## Admin UX
Prefer tables on desktop and horizontal scrolling/card fallback on mobile.

Destructive/disable actions require explicit confirmation when data impact is meaningful.

## Images
See `09_CLOUDINARY_AND_ASSETS.md`.

Do not copy images from arbitrary commercial e-commerce sites. Use a source with clear usage permission, then upload demo assets to development Cloudinary.

## Empty states
Create useful actions:
- empty cart -> `Continue shopping`;
- no orders -> `Start shopping`;
- no search results -> `Clear filters`;
- no admin products -> `Add product`.

## Loading
Use skeletons/spinners appropriate to scope. Avoid replacing entire page with a blocking full-screen loader for small background updates.
