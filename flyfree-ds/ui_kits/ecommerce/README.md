# FlyFree Urban — Ecommerce UI Kit

Interactive prototype of the flyfreeurban.com ecommerce website.

## Screens
- **Home** — Hero, TrustBar, Category Grid, Featured Products
- **Shop** — Filterable product grid by category
- **Product Detail** — Size selector, quantity, add to cart
- **Cart Drawer** — Slide-in cart with quantity controls and checkout CTA

## Components
| File | Description |
|---|---|
| `Header.jsx` | Sticky top nav with logo, links, cart badge, CTA button |
| `Hero.jsx` | Full-bleed dark hero with chevron overlay + CTA buttons |
| `ProductCard.jsx` | Product card with badge, wishlist, add-to-cart |
| `Footer.jsx` | Dark footer with logo, about text, contact, links |
| `index.html` | Main interactive prototype (loads all components) |

## Design Tokens Used
- Colors: `#FFD100` / `#231F20` / `#FFFFFF` — strictly no others
- Fonts: FuturaStd Condensed ExtraBold (display), FuturaStd Book/Bold (body)
- Shadows: `4px 4px 0 #231F20` — flat offset, no blur
- Radius: 0px on cards, 0px on buttons — sharp edges throughout
- Borders: `1.5px solid #231F20`

## Navigation Flow
Home → click category or "Ver Tienda" → Shop → click product → Detail → add → Cart Drawer
