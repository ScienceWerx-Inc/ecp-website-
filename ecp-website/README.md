# ECP Website

Multi-page marketing and portfolio website for **Engineered Construction Products, Ltd.** — Frederick, Maryland.
Structural engineering, general contracting, construction management, and specialty product supply (CSI Div 05 · 06 · 08) across Maryland, Washington DC, and West Virginia since 1975.

## Architecture

A fast, zero-dependency, multi-page static website with shared styles and interactivity:

```
ecp-website/
├── index.html       Streamlined Home landing page (Hero, Capabilities Snapshot, Featured Projects, Integrated Advantage, CTA)
├── projects.html    Filterable Featured Projects portfolio, 4 Market Sectors & Client Testimonials
├── services.html    Interactive 4-division Service Matrix (16 scopes), Technical Specialties & 4-Step Process
├── about.html       51-Year Heritage, By The Numbers, Active Licenses, Company Directory & Timeline
├── contact.html     Frederick MD HQ details, Light-Mode Project Inquiry / Bid Form & FAQ Accordion
├── styles.css       Unified Light Blueprint + Maroon (#8F3642) & Slate Navy (#0F172A) design system
├── main.js          Shared mobile nav, ARIA service tabs (with hash deep-linking), project category filter & counters
└── README.md
```

## Running Locally

```bash
npx serve -l 3002 .
```

Then open `http://localhost:3002` in your browser.

## Licence

© 2026 Engineered Construction Products, Ltd. All rights reserved.
