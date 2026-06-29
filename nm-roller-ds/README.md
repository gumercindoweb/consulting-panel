# NM Roller Design System

**Comunidad NM Roller** — La comunidad de patinaje urbano que conecta, entrena y celebra a los rollers. Movimiento, libertad y estilo sobre ruedas.

> "Patinamos juntos. Crecemos juntos."

---

## Company Overview

Comunidad NM Roller is Buenos Aires's premier urban roller skating school. Founded by Nicolás Sappia, the school operates 18+ outdoor locations across CABA (Ciudad Autónoma de Buenos Aires) and surroundings, offering group skating classes for all levels — from complete beginners to advanced skaters.

**Core offering:**
- Group roller skating classes, all skill levels
- Outdoor locations (parks, plazas, skateparks)
- Plans: Clase Única / BASIC fUN / BLACK FREE
- Booking via Turnos Web app
- Partner brand: Fly Free Urban (equipment/kit sales)

**Website:** https://lp.comunidadnmroller.com  
**Booking app:** https://nmroller.turnosweb.com

**Sources provided:**
- `uploads/Manual Normativo NM.pdf` — Brand normative manual (Illustrator-based PDF, contains brand colors and visual guidelines)
- `uploads/Sobre.pdf` — About/overview document
- `uploads/Nicolas Sappia.pdf` — Founder profile
- `uploads/Logo NM Roller.png` — Official logo (500×500 PNG, transparent)
- `uploads/Descripción del Negocio NM.docx` — Business description

---

## File Index

```
/
├── README.md                  ← You are here
├── SKILL.md                   ← Agent skill definition
├── colors_and_type.css        ← All CSS vars: colors, type, spacing, buttons
├── assets/
│   └── Logo NM Roller.png     ← Official logo (transparent PNG)
├── fonts/                     ← Futura Std full family (OTF)
│   ├── FuturaStd-Bold.otf
│   ├── FuturaStd-Book.otf
│   ├── FuturaStd-Medium.otf
│   ├── FuturaStd-Heavy.otf
│   ├── FuturaStd-ExtraBold.otf
│   ├── FuturaStd-Light.otf
│   ├── FuturaStd-Condensed.otf
│   ├── FuturaStd-CondensedBold.otf
│   ├── FuturaStd-CondensedExtraBd.otf
│   ├── FuturaStd-CondensedLight.otf
│   └── [oblique variants for all above]
├── preview/                   ← Design System tab cards
│   ├── brand-logo.html
│   ├── colors-primary.html
│   ├── colors-accent.html
│   ├── colors-neutral.html
│   ├── colors-semantic.html
│   ├── type-display.html
│   ├── type-condensed.html
│   ├── type-scale.html
│   ├── type-weights.html
│   ├── spacing-tokens.html
│   ├── spacing-radii.html
│   ├── shadows.html
│   ├── buttons.html
│   ├── cards.html
│   ├── badges.html
│   ├── plan-card.html
│   └── location-card.html
└── ui_kits/
    └── website/               ← Landing page UI kit
        ├── README.md
        ├── index.html
        ├── Header.jsx
        ├── Hero.jsx
        ├── PlanCard.jsx
        └── LocationCard.jsx
```

---

## CONTENT FUNDAMENTALS

### Language & Tone
- **Language:** Argentine Spanish exclusively. Uses voseo ("patinás", "podés", "querés", "tenés", "vení").
- **Register:** Warm, direct, encouraging. Never cold or corporate. Feels like a friend who skates.
- **Person:** Speaks directly to "vos" — the community member. Uses "te" and "vos" constructions.
- **Casing:** UPPERCASE for all major headlines and CTAs. Title case for section labels. Sentence case for body copy.
- **Punctuation:** Bold used heavily within body copy for emphasis. Minimal use of em-dashes.

### Voice Examples
- "Unite a la escuela #1 de patinaje"
- "Aprendé a patinar desde cero o mejorá tu técnica en un entorno seguro y divertido"
- "Llegué con miedo y me fui con ganas de volver."
- "Para los que se enamoran del patinaje y quieren avanzar rápido."
- "NECESITO AYUDA" (CTA — conversational, human)

### Emoji Usage
- Emoji ARE used in the website and communications, but sparingly and functionally.
- Common: 📍 (location), ⚠️ (warnings/redirects), 🗓️ (scheduling), 👇🏻 (directional), 🌟 (social proof), 🛼 (skates, community feel)
- Never decorative clusters; always single, purposeful emoji.

### Copy Patterns
- CTAs are short, imperative: "COMPRAR PLAN", "AGENDAR TURNO", "RESERVAR", "VER HORARIOS"
- Social proof: testimonials from real members, plan + location attribution
- Numbers used for impact: "+18 Sedes", "+3.000 patinadores", "más de 12 sedes"
- Plan names use playful branding: "BASIC fUN" (intentional lowercase f), "BLACK FREE"

---

## VISUAL FOUNDATIONS

### Color System
- **Primary Red (PANTONE 1795 C):** The brand red. Vivid, energetic. Used for logo fill, CTAs, highlights, borders. Approximate hex: `#D01C1F`.
- **Dark Maroon (PANTONE 181 C):** Deep brownish-red. Used for logo border ring, dark variant of red. Approximate hex: `#7C2F2A`.
- **Teal Accent (PANTONE 7472 C):** Fresh, modern contrast to red. Used for secondary accents, highlights, badges. Approximate hex: `#62C3BF`.
- **Black:** Near-black `#111111` as the primary background on the website. Dark, bold, urban.
- **White:** `#FFFFFF` for text on dark backgrounds, and light-mode surfaces.

### Typography
- **Font family:** Futura Std exclusively — geometric, clean, modern, forward-looking.
- **Display (headings):** Futura Std ExtraBold or Heavy, UPPERCASE, tight tracking (-0.02em to 0em).
- **Condensed variant:** Used for labels, prices, tight spaces — Futura Std Condensed Bold/ExtraBold.
- **Body:** Futura Std Book or Medium, sentence case, normal tracking.
- **No secondary typeface.** Futura does all the heavy lifting across all weights.
- **Letter-spacing:** Wide (0.08–0.25em) for labels and overlines; tight for large display type.

### Backgrounds & Surfaces
- **Dark-first:** The website uses near-black as the primary background. This creates contrast for the vivid red.
- **No photographic backgrounds.** Hero sections use bold type over dark or red fields.
- **No gradients** (gradient backgrounds are NOT part of this brand).
- **Full-bleed product/lifestyle photography** is used in plan sections (people skating).
- **Flat color sections** alternate between black and red for rhythm.

### Layout & Spacing
- **Bold, blocky layouts.** Large type, generous whitespace.
- **Grid:** Content centered, max-width around 1200px, generous padding.
- **Fixed nav:** Sticky header with logo + CTA.
- **Section structure:** Label (small caps) → Headline (large, CAPS) → Body → CTA.
- **Cards:** Sharp corners (border-radius: 0) or very minimal rounding. No decorative shadows on cards — they use contrast instead.

### Animation & Interaction
- **Minimal animation.** The brand is bold and direct — no playful bounces.
- **Hover states:** Buttons darken or lift slightly (translateY(-1px)). Color intensifies.
- **Transitions:** Fast (150–250ms), ease curve. Nothing elastic or bouncy.
- **No parallax, no scroll-triggered animations.**

### Imagery
- **Lifestyle photography:** People skating in outdoor urban settings. Warm, social, active.
- **Color treatment:** Natural, warm tones. No heavy filters or grain.
- **Product images:** Equipment shots (rollers, helmets, pads) on light backgrounds.
- **No illustrations or hand-drawn elements detected.**

### Cards & Components
- **Plan cards:** Sharp-edged, dark background, price prominently displayed, bullet list of features. "MEJOR OPCIÓN" badge on recommended plan.
- **Location cards:** Simple — name, address, link. Minimal chrome.
- **Buttons:** Square/sharp edges (border-radius: 0). Bold uppercase text. Primary = red. Secondary = white outline.
- **Borders:** 2px solid white or red. No subtle shadows — contrast is the separator.

### Corner Radii
- **Generally: 0px** (sharp corners throughout).
- Pill shapes only for badges/labels when contrast is needed.

### Shadow System
- Minimal. Dark backgrounds make shadow redundant.
- Red glow `box-shadow: 0 4px 24px rgba(208,28,31,0.35)` used subtly on primary CTAs.

### Iconography
- See ICONOGRAPHY section below.

---

## ICONOGRAPHY

- **No custom icon system detected.** The brand relies primarily on emoji and text for iconographic needs.
- **Emoji icons used in-content:** 📍 for location, ⚠️ for caution, 🗓️ for scheduling, 🛼 for community.
- **WhatsApp button:** Custom floating button for support (external widget).
- **App store badges:** Google Play and Apple App Store icons used as PNGs (standard badges).
- **No icon font.** No Lucide, Heroicons, or similar library detected.
- **Logo is the primary visual mark.** The circular NM badge functions as both brand mark and icon.
- **Recommendation for new work:** Use emoji inline for functional icons; for UI icons (arrows, chevrons, check marks) use Lucide via CDN — its clean stroke weight matches Futura's geometric character.
  - CDN: `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`

---
