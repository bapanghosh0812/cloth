# WEARSUPER — Luxury Streetwear Store

A premium, full-stack e-commerce experience: a **React 19 + Vite + Tailwind CSS v4 + GSAP** storefront with a cinematic, scroll-driven hero, backed by an **Express + MongoDB (Mongoose)** API with real accounts (bcrypt + JWT), a product catalogue and orders.

## ✨ Features

- **Cinematic hero** — scroll-scrubbed image sequence (Apple-style). Loads progressively (coarse frames first) so the site opens in about 2–3 seconds; phones get a lighter 120-frame set, and portrait screens get a dedicated layout with the headline above the model.
- **Real accounts** — sign up / sign in against the API. Passwords are hashed with bcrypt; sessions use signed JWTs. Signing in from checkout continues straight to checkout.
- **Products from the database** — `GET /api/products`. The storefront renders the bundled catalogue instantly and swaps in the live data as soon as the API answers.
- **Orders stored in MongoDB** — the bag becomes an order on the server, which re-prices every line from the database (browser prices are never trusted), validates sizes/colours and issues order, tracking and invoice numbers.
- **Luxury product pages** — six framed photo views per product, desktop hover-zoom, a drag-to-rotate **360° viewer**, size guides, "Buy it now" and "You may also like".
- **Client reviews** — rating breakdown (click to filter), fit meter, sorting, "Helpful" votes and a write-a-review form (stored on the device).
- **Checkout** — Shipping → Payment → Review → Confirmation. Payment is **simulated** (test card `4242 4242 4242 4242`); only the card brand + last four digits are sent to the server.
- **Receipt / invoice** — printable receipt for every order (Print / Save as PDF).
- **Order tracking** — tracking number, carrier, estimated delivery and a live timeline that advances with real time; look up by order or tracking number; cancel before it ships (enforced by the API).

Cart, wishlist and reviews live in `localStorage`; accounts and orders live in MongoDB.

## 🧱 Project structure

```
├─ src/                    React storefront
│  ├─ context/StoreContext.jsx   app state + API calls (auth, products, orders)
│  ├─ lib/api.js                 fetch wrapper (base URL, JWT header, friendly errors)
│  ├─ data/products.js           product images + helpers
│  └─ components/                sections and overlays (product page, checkout, receipt, tracking…)
├─ shared/catalog.js       the product catalogue (used by the storefront and the API seed)
└─ server/                 Express API
   ├─ src/models/          User, Product, Order (Mongoose)
   ├─ src/routes/          auth, products, orders
   ├─ src/middleware/      JWT auth, error handling
   ├─ functions/api.js     the same API as a Netlify Function
   └─ test/                API + function tests (in-memory MongoDB)
```

## 🔌 API

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | — | `{ name, email, password }` → `{ token, user }` |
| `POST` | `/api/auth/login` | — | `{ email, password }` → `{ token, user }` (rate limited) |
| `GET` | `/api/auth/me` | ✅ | Current user |
| `GET` | `/api/products` | — | Active products in shop order |
| `GET` | `/api/products/:id` | — | One product (`p1` … `p13`) |
| `POST` | `/api/orders` | ✅ | `{ items: [{ productId, size, color, qty }], address, payment: { brand, last4 } }` |
| `GET` | `/api/orders` | ✅ | Your orders, newest first |
| `GET` | `/api/orders/:id` | ✅ | One of your orders |
| `PATCH` | `/api/orders/:id/cancel` | ✅ | Cancel within 20 minutes (before it ships) |

Authenticated routes expect `Authorization: Bearer <token>`. Errors are returned as `{ "error": "message" }`.

## 🚀 Run it locally

**1. Create a free MongoDB Atlas database**

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free **M0** cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add your current IP address.
4. **Connect → Drivers** → copy the connection string.

**2. Configure and start the API**

```bash
npm run server:install
```

Copy `server/.env.example` to `server/.env`, paste your connection string into `MONGODB_URI` (replace `<db_password>` with the real password) and set a long random `JWT_SECRET`. Then:

```bash
npm run server
```

On first start against an empty database the 13 catalogue products are added automatically. After editing `shared/catalog.js`, sync them with `npm run seed`.

> No Atlas yet? `npm run server:memory` runs the API on a temporary in-memory MongoDB (data resets on exit).

**3. Start the storefront** (in a second terminal)

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. In development Vite forwards `/api` to the API on port 5000.

**Tests**

```bash
npm --prefix server test
```

## ☁️ Deploy (everything on Netlify)

The storefront and the API deploy together: the Express app runs as a Netlify Function (`server/functions/api.js`) and `netlify.toml` routes `/api/*` to it, so the site and API share one address.

1. **MongoDB Atlas** → **Network Access** → *Add IP Address* → *Allow access from anywhere* (`0.0.0.0/0`), because Netlify Functions don't have a fixed IP.
2. **Netlify** → your site → **Site configuration → Environment variables** → add
   - `MONGODB_URI` — the Atlas connection string with your real database password (no `<…>` placeholders)
   - `JWT_SECRET` — a long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
3. Push to GitHub (or *Deploys → Trigger deploy*). Then open `https://<your-site>.netlify.app/api/health` — it should show `{"ok":true,"db":"connected"}`. If something is wrong, the same URL explains what to fix.

The 13 products are added to the database automatically on the first request.

> Prefer a separate API host? `server/` also runs as a normal Node server (`npm start`) on Render, Railway, etc. — then set `CLIENT_ORIGIN` on the API and `VITE_API_URL=https://<api-host>/api` on Netlify.

## 🔐 Security notes

- Passwords: bcrypt (cost 12), never returned by the API; login errors don't reveal whether an email exists.
- Sessions: HS256 JWTs (7 days by default) sent as a Bearer token and stored in `localStorage`.
- Orders: server-side pricing, size/colour validation, per-user access checks, atomic cancellation.
- Hardening: Helmet headers, CORS limited to `CLIENT_ORIGIN` (when the API runs on its own host), auth rate limiting, 100 kB body limit, Mongo query-operator sanitising.
- Secrets live in `server/.env`, which is git-ignored — only `.env.example` is committed.
