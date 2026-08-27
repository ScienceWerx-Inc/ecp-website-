# ECP Website

Redesigned marketing site for **Engineered Construction Products, Ltd.** — Frederick, Maryland.
Structural engineering, general contracting, construction management and specialty product
supply across Maryland, Washington DC and West Virginia since 1975.

## What this is

A single, self-contained HTML page. No build step, no dependencies, no framework.
Open `index.html` in a browser and it runs.

```
ecp-website/
├── index.html      the entire site — markup, styles and 40 lines of JS
├── README.md
└── .gitignore
```

## Design direction — "Blueprint Bureau"

The page is built to read like an engineering drawing set rather than a generic
contractor site.

| | |
|---|---|
| Ground | White drawing sheet with a faint blueprint grid |
| Ink | Drawing blue `#0B2447` |
| Accent | Signal red `#E1552E` — dimension strings, callouts, primary buttons |
| Tint | `#F3F6FB` for alternating sections |
| Display type | Bricolage Grotesque |
| Body type | Newsreader |
| Labels & data | IBM Plex Mono |

Colours are defined once as CSS custom properties at the top of the `<style>` block.
Change them there and the whole page follows.

### Light and dark

The palette is declared three times so it resolves in every viewer state:

- `:root` — the light palette (the default)
- `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`
- `:root[data-theme="dark"]` — for an explicit toggle

Never declare a colour only inside a media query; add it to all three blocks.

## Illustrations

The hero elevation drawing and the contact site plan are hand-authored inline SVG,
not images. They scale to any width, load instantly, and pick up the theme colours
through `var()` in their `stroke` and `fill` attributes.

If real project photography is added later, it belongs inside the same hairline
plate frames the drawings currently occupy.

## Interactive bits

- **Services tabs** — a small vanilla-JS controller at the bottom of the file.
  Fully keyboard-navigable (arrow keys), uses proper `role="tab"` / `aria-selected`.
- **FAQ** — native `<details>` / `<summary>`. No JavaScript.
- **Contact form** — markup only. It has no backend; `onsubmit` is intercepted so the
  page does not navigate. Wire it to a form endpoint or mail handler before launch.

## Editing

Section order in `index.html`:

1. Header / sticky nav
2. Hero + trust strip
3. About — story, timeline, company profile, licences, service territory
4. Services — four tabs, four cards each
5. Process — five steps
6. Markets — four sectors
7. Why ECP — five reasons
8. Testimonials
9. Specialties
10. FAQ
11. Contact — details, site plan, form
12. Footer

Each is a top-level `<section>` with an `id` matching the nav links.

## Before going live

- [ ] Point the contact form at a real endpoint
- [ ] Replace the schematic site plan with an embedded map, if wanted
- [ ] Add real project photography
- [ ] Add favicon and Open Graph / social preview tags
- [ ] Confirm licence numbers and the BuildZoom figures are current
- [ ] Run a pass on a real phone — the layout reflows, but the services tabs and
      hero stat column deserve a look on a small screen

## Licence

© 2026 Engineered Construction Products, Ltd. All rights reserved.
