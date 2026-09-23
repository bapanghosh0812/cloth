# WEARSUPER — Luxury Streetwear Store

A premium, fully interactive e-commerce experience built with **React 19 + Vite + Tailwind CSS v4 + GSAP**. It pairs a cinematic, scroll-driven image-sequence hero with a complete (demo) shopping flow — cart, login, checkout, payment simulation and order history — all running entirely in the browser.

## ✨ Features

- **Cinematic hero** — scroll-scrubbed image sequence (Apple-style). Loads progressively (coarse frames first) so the site opens in about 2–3 seconds; phones get a lighter 120-frame set, and portrait screens get a dedicated layout with the headline above the model.
- **Luxury product pages** — six framed photo views per product, desktop hover-zoom, a drag-to-rotate **360° viewer** (auto-rotate, inertia, keyboard), size guides, "Buy it now", delivery promises and "You may also like".
- **Client reviews** — rating summary with a 5★→1★ breakdown (click to filter), fit meter, sorting, "Helpful" votes, and a write-a-review form with a star picker.
- **Working cart & wishlist** — add from the hero, the shop grid or a product page; live totals and free-shipping threshold.
- **Demo login / signup** — any email + password, or "Continue as Guest"; signing in from checkout continues straight to checkout. *(No real credentials are stored or sent.)*
- **Multi-step checkout** — Shipping → Payment → Review → Confirmation with a **simulated** payment (test card `4242 4242 4242 4242`). Only the card brand + last-4 are kept.
- **Receipt / invoice** — every order gets an invoice number and a printable receipt (Print / Save as PDF).
- **Order tracking** — order number + tracking number, carrier, estimated delivery and a live timeline (placed → confirmed → packed → shipped → in transit → out for delivery → delivered) that advances with real time; look up orders by order or tracking number; cancel before shipping.
- **Search, filters & premium polish** — instant search, category filters, gold accent system, toasts, button sheen, responsive layouts and a mobile menu.

All shopping state (cart, wishlist, orders, reviews, session) persists in `localStorage`.

## 🧱 Tech

- React 19 · Vite · Tailwind CSS v4 · GSAP (ScrollTrigger)
- Global state via a single React Context (`src/context/StoreContext.jsx`)
- Product catalogue in `src/data/products.js`
- Feature overlays in `src/components/ui/` (product page, 360° viewer, reviews, checkout, receipt, order tracking)
- Order numbers / tracking timeline in `src/utils/orders.js`, progressive frame loading in `src/hooks/useImageSequence.js`
- `netlify.toml` sets the build and long-term caching for hashed assets

## 🚀 Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

```bash
npm run build     # production build
npm run preview   # preview the production build
```

## ⚠️ Demo note

This is a front-end demo. Login, payment and order placement are **simulated** and run only in your browser — there is no backend, no real authentication and no real payment processing. Do not enter real card details.
