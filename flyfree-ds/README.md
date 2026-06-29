# FlyFree Urban — Design System

**Brand:** FlyFree Urban  
**Tagline:** Always Rolling  
**Web:** [flyfreeurban.com](https://flyfreeurban.com)  
**Social:** Instagram, TikTok, Facebook (@flyfreeurban)

---

## About the Company

FlyFree Urban is a Hispanoamerican urban culture brand centered on roller skating. Founded by passionate skaters, the company sells roller skates, wheels, accessories, and merch via their online store (flyfreeurban.com, built on Odoo). They also offer in-person rental services and run a tight-knit skater community. Beyond products, they offer online skating courses (via a partner platform, aprendepatinando.com).

**Products / Surfaces:**
- **E-commerce website** — flyfreeurban.com (Odoo-powered, desktop + mobile)
- **Instagram / TikTok / Facebook** — carousel posts, reels, stories
- **Newsletter** — promotional and educational
- **Packaging + Stickers** — physical product branding
- **Rental service** — local skate rental offering

**Sources provided:**
- Brand brief (Additional Notes in this project)
- Screenshot: flyfreeurban.com homepage (uploads/screencapture-flyfreeurban-2026-04-29-02_31_27.png)
- Screenshot: flyfreeurban.com/shop (uploads/screencapture-flyfreeurban-shop-2026-04-29-02_31_44.png)
- Social content (uploads/1.png through 8.png, 11.png)
- Futura Std font family (all weights + condensed variants in fonts/)
- Logo files: assets/logo-black.png, assets/logo-white.png
- Avatar + customer journey documents (uploads/*.docx)
- Rental service design offer documents (uploads/*.docx)

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Direct, urban, energetic, with attitude.** Never corporate or stiff.
- **Short, punchy sentences.** Verbs of movement. Impact first.
- **Natural Spanish/English code-switching** — the Hispanoamerican urban audience expects this.
- **Second-person "vos/tú"** — speaks directly to the individual.
- **Imperatives dominate:** "Elegí los tuyos", "Arrancá", "Rodá", "Probátelos".

### Tone Spectrum
| Context | Tone |
|---|---|
| Hero / ads | Maximum energy — "La calle es tuya." |
| Product copy | Clear + benefit-led — "Bota rígida. Más control." |
| Educational / How-to | Friendly expert — "Asegurate de tener un casco certificado." |
| CTA buttons | Action verb + object — "Ver rollers", "Contáctanos" |
| Footer / legal | Neutral, factual |

### Casing
- **Headlines / hero copy:** ALL CAPS, always (in condensed display font)
- **Subtitles / taglines:** ALL CAPS with wide letter-spacing
- **Body copy / product descriptions:** Sentence case (Spanish grammar rules)
- **Buttons:** Sentence case or ALL CAPS depending on context; CTA buttons often sentence case in ecommerce

### Copy Examples ✓ On-Brand
- "Always rolling. Never stopping."
- "La calle es tuya."
- "Born to roll."
- "Elegí los tuyos"
- "¿Qué comprar para empezar a patinar?"
- "Si comprás online en FlyFreeUrban…"

### Copy Examples ✗ Off-Brand
- "Ofrecemos productos de alta calidad para el usuario de patines en línea."
- "Nos especializamos en artículos deportivos urbanos."
- Anything passive, verbose, or formal.

### Emoji Usage
- **Not used in headlines or product copy.** Occasionally used in social captions/comments for engagement. Not part of the core brand vocabulary.

### Language Mix
- Primary: Spanish (Rioplatense — vos, tuyo, probátelos)
- Secondary: English words/phrases for energy (always rolling, never stopping, born to roll, urban, free)

---

## VISUAL FOUNDATIONS

### Color System
**Three colors only. No grays. No gradients.**

| Name | Hex | Usage |
|---|---|---|
| Amarillo FlyFree | `#FFD100` | Primary brand, accent, labels, buttons, backgrounds |
| Negro FlyFree | `#231F20` | Backgrounds, text, containers, outlines |
| Blanco | `#FFFFFF` | Backgrounds, text on dark, clean ecommerce |

**Authorized combinations:**
- Yellow + Black → maximum energy (social, campaigns, hero sections)
- Black + Yellow → urban/nocturnal power (dark-mode, product details)
- White + Black + yellow accents → clean ecommerce (product listings, checkout)

**Never:** gray, gradients on the core brand surfaces.

### Secondary Accent System (Extended Palette)
The yellow + black + white trio is the **permanent anchor** and never changes. To add variety without losing identity, three accent families may be used — **one family at a time**, in small doses (chips, lines, badges, one-off campaign backgrounds). White/black always carries the base; the accent is a spark, never the foundation. See `preview/color-palettes-extended.html`.

| Family | Colors | Use | Inspiration |
|---|---|---|---|
| **Electric Street** | `#C4FF1F` lime · `#7C3AED` violet | Fitness, classes, youth + high-energy social | Rollerblade / goskate |
| **Sunset Energy** | `#FF5A1F` coral · `#FF1F6B` magenta | Drops, offers, urgency | Red Bull |
| **Outdoor Trail** | `#1F6F54` forest · `#2E7CC2` sky · `#C2570C` clay · `#E9E2D0` sand | Community, outings, lifestyle, education | Patagonia / Columbia |

**Accent rules:**
- Pick ONE family per piece — never mix Electric + Sunset + Outdoor together.
- Keep yellow present as the brand thread (a tag, the logo, a CTA).
- Accents support; they never replace the black/white base or dominate a full layout.
- Still no gradients on logo or core brand marks.

### Typography
**Display (headlines, logo text):**  
→ Futura Std Condensed Extra Bold / Futura Std ExtraBold  
→ Always UPPERCASE  
→ Tight letter-spacing (-0.02em)  
→ Line height ~0.9–1.0  
→ Used for: Hero text, slide titles, social headline overlays, CTA banners

**Display en Movimiento (Italic / Nike-style):**  
→ Same condensed display fonts, leaned with synthetic oblique `skewX(-12deg)` (`-9deg` for smaller labels)  
→ Futura Std has **no native italic** — this forward lean IS the brand's motion treatment  
→ Optional **speed-line accent**: yellow dashed streak skewed behind the word (`.type-speed-lines`)  
→ Always UPPERCASE  
→ Used for: hero headlines, CTAs, campaigns, high-energy social posts  
→ Keep **upright** for catalog/product titles and anything reading-oriented — motion is the accent, not the default  
→ CSS: `.type-italic`, `.type-italic-soft`, `.type-speed-lines` in `colors_and_type.css`

**Secondary / Subtitles ("URBAN" style):**  
→ Futura Std Condensed (any weight) with wide letter-spacing (~0.3–0.35em)  
→ Always UPPERCASE  
→ Used for: Section labels, category names, taglines below logo

**Body:**  
→ Futura Std Book / Medium  
→ Sentence case  
→ ~16px, line-height 1.6–1.7  
→ Used for: Product descriptions, educational content, footer, newsletter body

### Backgrounds
- **Dark mode:** full-bleed #231F20 with yellow type
- **Light mode:** #FFFFFF with black type + yellow accents
- **Yellow mode:** full-bleed #FFD100 with black type (CTAs, urgency slides)
- **Photography:** full-bleed outdoor action/street scenes; high contrast, natural light; community-centered
- No gradients. No textures (except the hazard-stripe pattern).

### Graphic Elements
**The Double Chevron `>>` / `<<`:**  
The core brand symbol. Appears:
- Flanking the FLYFREE wordmark in the logo (yellow chevrons)
- As corner decorations on social posts
- As a standalone favicon/icon
- As repeating pattern / watermark
- Only oriented → or ← (never rotated to other angles)

**Hazard Stripe Pattern:**  
Diagonal alternating yellow/black stripes (45°, ~12px each). Appears as:
- Corner accents on carousel slides
- Section dividers
- Promo banners

**Yellow Label Bar:**  
Solid yellow rectangle containing bold italic/condensed text in black. Primary way to call out titles within photography.

**Black Label Bar:**  
Solid black rectangle with yellow italic/condensed text. High-contrast variant.

**Yellow Left Edge:**  
Thick vertical yellow bar on left side of cards/slides — creates urgency framing.

### Imagery Style
- Outdoor, urban, real people (not studio shots)
- Warm natural tones but no color grading applied — clean, honest
- Community and action moments: skating in parks, groups, street
- Always shows real customers / instructors / team members
- No stock-photo aesthetic

### Cards & Containers
- **Product cards:** white bg, black text, yellow add-to-cart button, minimal radius (4px or 0px), flat shadow (offset black, no blur)
- **Social content cards:** bold layout, photo + label overlay, yellow or black bg
- **Info cards:** white bg, thin black border, or yellow bg

### Corner Radius
- Minimal — 0px (flat) to 4px maximum on UI elements
- Pills (999px) used for some tag/badge elements
- **Never** large rounded corners (no 12–24px radius on cards)

### Shadows
- **Flat offset shadow** (e.g. `4px 4px 0px #231F20`) — NOT blurred
- Used on buttons, product cards, UI elements
- Gives bold graphic-design feel vs. soft depth

### Hover / Press States
- Buttons: background darkens (yellow → #e6bb00, black → #3a3536)
- Cards: slight lift with stronger offset shadow
- No opacity fades. No color flashes. Confident, direct interactions.

### Borders
- 1–2px solid black on UI elements in white contexts
- Bold 3–4px borders for emphasis
- No dashed/dotted except hazard pattern decoration

### Animation
- **Minimal.** The brand is confident and static.
- Any animation: fast, direct, no bounce. Easing: ease-out, 150–250ms.
- No parallax, no scroll reveals, no particle effects.

### Layout
- Grid-based, high information density for ecommerce
- Full-bleed hero images (100vw)
- Fixed header (black background, white/yellow text)
- Left-aligned content (not centered) in social posts — asymmetric, energetic

---

## ICONOGRAPHY

**Approach:** Minimal, functional. No decorative icon system.

**Core symbol:** The `>>` chevron. This IS the brand's icon language.

**Website icons:** Simple outline icons used for utility (cart, search, heart/wishlist, phone). Likely default Odoo/Bootstrap icons. No custom icon font found.

**Social icons:** YouTube, Instagram, TikTok (plain platform icons in footer).

**Illustration icons:** Occasionally hand-drawn style (bottle, clothes icon in carousel post 7). Very rare — used in educational social content only, not in brand materials.

**What NOT to do:** No emoji as icons. No decorative iconography. No illustrated mascot in ecommerce or corporate contexts (skull-with-helmet mascot is for informal/merch use only).

**Assets available:**
- `assets/logo-black.png` — Horizontal logo (black wordmark, yellow chevrons)
- `assets/logo-white.png` — Horizontal logo (white wordmark, yellow chevrons)
- `assets/community-photo.jpg` — Community skate session group photo
- `assets/brand-photo.jpg` — Brand/lifestyle photo
- `assets/skater-photo.jpg` — Portrait skater photo
- `assets/product-rollers.png` — Product shot (Stark Billionz rollers)
- `assets/social-1.png` — Social post: ¿Qué comprar para empezar a patinar?
- `assets/social-2.png` — Social post: Un casco
- `assets/social-3.png` — Social post: Rodilleras
- `assets/social-promo.png` — Social post: Yellow promo slide
- `assets/social-offer.png` — Social post: Course bundle offer

---

## FILE INDEX

```
/
├── README.md                  ← You are here
├── SKILL.md                   ← Agent skill definition
├── colors_and_type.css        ← All CSS variables + font-face declarations
├── fonts/                     ← Futura Std OTF family (9 weights/variants)
│   ├── FuturaStd-Book.otf
│   ├── FuturaStd-Medium.otf
│   ├── FuturaStd-Bold.otf
│   ├── FuturaStd-Heavy.otf
│   ├── FuturaStd-ExtraBold.otf
│   ├── FuturaStd-Condensed.otf
│   ├── FuturaStd-CondensedLight.otf
│   ├── FuturaStd-CondensedBold.otf
│   └── FuturaStd-CondensedExtraBd.otf
├── assets/                    ← Logos, photos, brand images
│   ├── logo-black.png         ← Primary logo (horizontal, on white/light)
│   ├── logo-white.png         ← Logo variant (on dark backgrounds)
│   ├── community-photo.jpg    ← Community skate session
│   ├── brand-photo.jpg        ← Lifestyle/brand photo
│   ├── skater-photo.jpg       ← Portrait skater
│   ├── product-rollers.png    ← Product shot
│   └── social-*.png           ← Social content examples
├── preview/                   ← Design system card previews
│   ├── colors-primary.html
│   ├── colors-combos.html
│   ├── type-display.html
│   ├── type-body.html
│   ├── type-scale.html
│   ├── spacing-tokens.html
│   ├── shadows-radius.html
│   ├── graphic-elements.html
│   ├── buttons.html
│   ├── product-card.html
│   ├── logo-variants.html
│   └── social-post-anatomy.html
└── ui_kits/
    └── ecommerce/
        ├── README.md
        ├── index.html         ← Interactive ecommerce prototype
        ├── Header.jsx
        ├── ProductCard.jsx
        ├── Hero.jsx
        └── Footer.jsx
```
