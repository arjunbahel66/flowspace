# Flowspace

Marketing site for **Flowspace** — an AI design-intelligence platform that helps
residential developers and architects evaluate, optimize, and visualize homes.

**Live:** https://flowspaceai.netlify.app

## What it is

A static site. No build step, no dependencies, no framework — open `index.html`
and it runs.

| File | Purpose |
|------|---------|
| `index.html` | All page content |
| `styles.css` | Design system: tokens, layout, light/dark themes |
| `app.js` | Pillar tabs, buyer-profile weighting, score counters, scroll reveal |
| `favicon.svg` | Logo mark, optically corrected for small sizes |

## The three pillars

Flowspace scores a floor plan across three pillars of equal standing:

1. **Wellness** — light, air, acoustics, sleep, thermal comfort, biophilia, movement, social connection
2. **Cultural alignment** — Vastu and Feng Shui, each scored on its own criteria
3. **Cost & constraints** — budget, square footage, lot, setbacks, buyer fit

Equal standing does not mean equal weighting: the evaluation profile is set per
project, driven by the target buyer.

## Logo

The mark is a floor plan whose three structural walls trace an **F**. The
secondary partitions are lighter and broken by door openings, so the unbroken
walls read as the letter.

## Running locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Note on the figures

Every score, cost, and recommendation on the site is an illustrative prototype
value. They are not scientifically validated predictions and do not replace
professional architectural judgment.
