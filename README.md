# WEARSUPER — Luxury Streetwear Store

A premium, fully interactive e-commerce experience built with **React 19 + Vite + Tailwind CSS v4 + GSAP**. It pairs a cinematic, scroll-driven image-sequence hero with a complete (demo) shopping flow — cart, login, checkout, payment simulation and order history — all running entirely in the browser.

## ✨ Features

- **Cinematic hero** — 240-frame scroll-scrubbed image sequence (Apple-style) with a custom preloader and intro animation.
- **Working cart** — add from the hero, the shop grid or quick-view; slide-in bag with quantity controls, live subtotal and free-shipping threshold. Badge count in the navbar.
- **Demo login / signup** — any email + password works, plus a one-tap "Continue as Guest". Session persists across refreshes. *(No real credentials are stored or sent.)*
- **Multi-step checkout** — Shipping → Payment → Review → Confirmation, with a **simulated** payment (test card `4242 4242 4242 4242`). No real payment gateway; card details never leave the browser and only the brand + last-4 are kept with the order.
- **Order history** — placed orders are saved and shown in the account panel.
- **Search overlay** — instant product search with trending suggestions.
- **Wishlist** — save/remove items, badge count, dedicated drawer.
- **Product quick-view** — gallery, size & colour selection, ratings, quantity, add-to-bag.
- **Shop filters** — filter the catalogue by category; the collection tiles deep-link into a filtered shop.
- **Premium polish** — Playfair Display + Manrope typography, champagne-gold accent system, announcement bar, trust-badge strip, toast notifications, responsive layout and a mobile menu.

All shopping state (cart, wishlist, orders, session) persists in `localStorage`, so nothing is lost on refresh.

## 🧱 Tech

- React 19 · Vite · Tailwind CSS v4 · GSAP (ScrollTrigger)
- Global state via a single React Context (`src/context/StoreContext.jsx`)
- Product catalogue in `src/data/products.js`
- Feature overlays in `src/components/ui/`

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
