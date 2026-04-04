# Medusa + Next.js E-Commerce Storefront — Setup Guide

> **POC-first**: No Docker yet. Everything runs locally or in GitHub Codespaces.
> Later: Vercel for frontend, Azure Container Apps for Medusa backend.

---

## Table of Contents

1. [Quick Start (Codespaces)](#1-quick-start-codespaces)
2. [Quick Start (Local)](#2-quick-start-local)
3. [Environment Variables](#3-environment-variables)
4. [Folder Structure](#4-folder-structure)
5. [Auth Flow (Login / Register)](#5-auth-flow-login--register)
6. [Search (Algolia)](#6-search-algolia)
7. [Cart & Stripe Checkout](#7-cart--stripe-checkout)
8. [Custom Designer (Fabric.js)](#8-custom-designer-fabricjs)
9. [Vercel Deploy (Frontend)](#9-vercel-deploy-frontend)
10. [Future: Dockerise Backend for Azure](#10-future-dockerise-backend-for-azure)

---

## 1. Quick Start (Codespaces)

1. **Open in Codespaces** — click **Code → Codespaces → New codespace** on the
   repo page. The `.devcontainer/devcontainer.json` will:
   - Use **Node 22** image
   - Run `npm install` automatically
   - Forward ports **3000** (Next.js), **8000** (storefront alt), **9000** (Medusa backend)
   - Install VS Code extensions: Tailwind CSS IntelliSense, ESLint, Copilot, Prettier, Prisma

2. **Clone the Medusa Next.js starter** into the `storefront/` directory (if not already present):

   ```bash
   npx create-medusa-app@latest --skip-db        # creates medusa-backend + storefront
   # OR clone just the storefront:
   git clone https://github.com/medusajs/nextjs-starter-medusa.git storefront
   cd storefront && npm install
   ```

3. **Set up env**:

   ```bash
   cp .env.local.example storefront/.env.local
   # Edit storefront/.env.local with your keys
   ```

4. **Start Medusa backend** (in a separate terminal):

   ```bash
   cd my-medusa-store   # or wherever the backend lives
   npx medusa develop   # runs on http://localhost:9000
   ```

5. **Start storefront**:

   ```bash
   cd storefront
   npm run dev           # → http://localhost:8000
   ```

6. Open the forwarded port in your browser — site is live! 🎉

---

## 2. Quick Start (Local)

```bash
# 1. Prerequisites
node -v   # v22+
npm -v    # 10+

# 2. Clone this repo
git clone https://github.com/analyticswithharry/myquizbuilder.git
cd myquizbuilder

# 3. Set up Medusa backend (one-time)
npx create-medusa-app@latest
# Follow prompts, say "yes" to Next.js starter

# 4. Copy env template
cp .env.local.example storefront/.env.local

# 5. Start backend
cd my-medusa-store && npx medusa develop

# 6. Start frontend (new terminal)
cd storefront && npm run dev
```

---

## 3. Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `.env.local` | Medusa server URL (`http://localhost:9000` locally) |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `.env.local` | Publishable API key from Medusa admin |
| `NEXT_PUBLIC_STRIPE_KEY` | `.env.local` | Stripe **publishable** key (`pk_test_...`) |
| `NEXT_PUBLIC_SEARCH_APP_ID` | `.env.local` | Algolia Application ID |
| `NEXT_PUBLIC_SEARCH_API_KEY` | `.env.local` | Algolia Search-only API key |
| `NEXT_PUBLIC_SEARCH_INDEX_NAME` | `.env.local` | Algolia index name (e.g. `products`) |

See `.env.local.example` for the full template.

---

## 4. Folder Structure

After cloning the Medusa Next.js starter into `storefront/`, the layout is:

```
myquizbuilder/
├── .devcontainer/
│   └── devcontainer.json          ← Codespaces config
├── .env.local.example             ← env template
├── ECOMMERCE_SETUP.md             ← this file
│
├── storefront/                    ← Next.js 14+ App Router storefront
│   ├── src/
│   │   ├── app/                   ← Pages (App Router)
│   │   │   ├── (main)/
│   │   │   │   ├── page.tsx       ← Home page
│   │   │   │   ├── products/      ← Product listing & detail
│   │   │   │   ├── cart/          ← Cart page
│   │   │   │   ├── checkout/      ← Stripe checkout flow
│   │   │   │   └── account/       ← Login / Register / Orders
│   │   │   └── layout.tsx
│   │   │
│   │   ├── modules/               ← Feature modules
│   │   │   ├── account/           ← Auth components (login-form, register-form)
│   │   │   ├── cart/              ← Cart components (cart-item, cart-totals)
│   │   │   ├── checkout/          ← Checkout steps (shipping, payment, review)
│   │   │   ├── products/          ← Product card, gallery, info
│   │   │   ├── search/            ← Search bar, search results (Algolia)
│   │   │   └── layout/            ← Header, footer, nav
│   │   │
│   │   └── lib/                   ← Shared utilities
│   │       ├── data/              ← Medusa JS client helpers & fetch functions
│   │       ├── hooks/             ← React hooks (useCart, useCustomer)
│   │       ├── context/           ← React context providers
│   │       └── util/              ← Formatters, helpers
│   │
│   ├── public/                    ← Static assets
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── storefront/components/         ← Custom additions (outside starter)
    └── custom-designer/
        ├── CustomDesigner.tsx      ← Fabric.js canvas component
        └── index.ts
```

### Key directories explained

| Directory | Purpose |
|---|---|
| `app/` | Next.js App Router pages — each folder = a route |
| `modules/account/` | Login / register forms, order history, profile |
| `modules/cart/` | Cart line items, totals, empty-cart state |
| `modules/checkout/` | Multi-step checkout: addresses → shipping → Stripe payment |
| `modules/search/` | Algolia-powered search bar in the header |
| `lib/data/` | Medusa JS SDK client — talks to `localhost:9000` |
| `lib/hooks/` | React hooks wrapping Medusa data fetchers |
| `components/custom-designer/` | **Our addition** — Fabric.js product customisation canvas |

---

## 5. Auth Flow (Login / Register)

The Medusa Next.js starter includes a full customer auth flow out of the box:

- **Route**: `/account` → shows login or register form
- **API**: Uses Medusa's customer endpoints:
  - `POST /store/customers` — register
  - `POST /auth/customer/emailpass` — login (creates session)
  - `DELETE /auth/session` — logout
- **Session**: HTTP-only cookie managed by Medusa; the storefront reads the
  authenticated customer via `GET /store/customers/me`
- **Protected pages**: Account dashboard, order history, saved addresses

No additional setup needed — just ensure `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is set
correctly and the Medusa server is running.

---

## 6. Search (Algolia)

The starter supports Algolia search if the plugin is enabled on the Medusa backend:

1. **Backend**: Install `medusa-plugin-algolia` and configure in `medusa-config.js`:

   ```js
   {
     resolve: "medusa-plugin-algolia",
     options: {
       applicationId: process.env.ALGOLIA_APP_ID,
       adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
       settings: {
         products: {
           indexSettings: { searchableAttributes: ["title", "description"] },
         },
       },
     },
   }
   ```

2. **Frontend**: Set the `NEXT_PUBLIC_SEARCH_*` env vars. The search module in
   `modules/search/` will pick them up automatically.

3. **Fallback**: If Algolia is not configured, the search bar won't appear (or
   you can implement a simple client-side filter over the products list).

---

## 7. Cart & Stripe Checkout

1. **Cart**: Managed via Medusa's cart API — items are added/removed through
   `lib/data/` helpers. The cart is stored server-side and identified by a cookie.

2. **Stripe setup** (Medusa backend):

   ```bash
   # In medusa-config.js
   {
     resolve: "medusa-payment-stripe",
     options: {
       api_key: process.env.STRIPE_API_KEY,   // sk_test_...
     },
   }
   ```

3. **Frontend**: Set `NEXT_PUBLIC_STRIPE_KEY` in `.env.local`. The checkout module
   uses `@stripe/stripe-js` and `@stripe/react-stripe-js` to render the payment
   element.

4. **Flow**: Cart page → Enter address → Choose shipping → Stripe payment →
   Order confirmation.

---

## 8. Custom Designer (Fabric.js)

A stub component is included at `storefront/components/custom-designer/`.

### Install Fabric.js

```bash
cd storefront
npm install fabric
```

### Use in a product page

```tsx
// In a product detail page or template
import { CustomDesigner } from "@/components/custom-designer"

export default function ProductPage({ product }) {
  return (
    <div>
      {/* ... product info ... */}
      <CustomDesigner
        productType="hoodie"       // "tshirt" | "hoodie" | "cap" | "jewelry" | "patch"
        width={500}
        height={500}
        onDesignChange={(dataUrl) => {
          // Save or preview the custom design
          console.log("Design updated:", dataUrl.slice(0, 50))
        }}
      />
    </div>
  )
}
```

### Features (stub)

- **Add text** — custom text with colour picker
- **Upload image** — logos, artwork
- **Drag & resize** — interactive Fabric.js canvas
- **Export PNG** — `canvas.toDataURL()` for order attachment

### Next steps

- Replace the dashed-outline placeholder with real product silhouette SVGs
- Add undo/redo
- Save designs to Medusa as line-item metadata
- Server-side rendering of final design for print

---

## 9. Vercel Deploy (Frontend)

1. Push this repo to GitHub (already done).
2. Go to [vercel.com/new](https://vercel.com/new).
3. **Import** the repository.
4. Set **Root Directory** to `storefront` (if the Next.js app is in a subfolder).
5. Add **Environment Variables** in the Vercel dashboard:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `https://your-medusa-backend.example.com` |
   | `NEXT_PUBLIC_STRIPE_KEY` | `pk_live_...` |
   | `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_...` |
   | `NEXT_PUBLIC_SEARCH_APP_ID` | Algolia App ID |
   | `NEXT_PUBLIC_SEARCH_API_KEY` | Algolia Search key |
   | `REVALIDATE_SECRET` | random secret for ISR |

6. Click **Deploy**. Vercel builds and serves the Next.js app on a `.vercel.app`
   domain (free tier is sufficient for POC).

7. **Custom domain**: Add in Vercel dashboard → Settings → Domains.

---

## 10. Future: Dockerise Backend for Azure

```dockerfile
# Dockerfile (Medusa backend)
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 9000
CMD ["npx", "medusa", "start"]
```

Deploy to **Azure Container Apps**:

```bash
az containerapp up \
  --name medusa-backend \
  --resource-group myquizbuilder-rg \
  --source . \
  --ingress external \
  --target-port 9000 \
  --env-vars DATABASE_URL=<postgres-url> STRIPE_API_KEY=<key>
```

Then update the Vercel env var `NEXT_PUBLIC_MEDUSA_BACKEND_URL` to point to the
Azure Container Apps URL.

---

## Quick Reference — Run Commands

| Action | Command | Port |
|---|---|---|
| Start Medusa backend | `cd my-medusa-store && npx medusa develop` | `9000` |
| Start storefront (dev) | `cd storefront && npm run dev` | `8000` |
| Build storefront | `cd storefront && npm run build` | — |
| Seed demo data | `cd my-medusa-store && npx medusa seed --seed-file=data/seed.json` | — |
| Open Medusa admin | Browser → `http://localhost:9000/app` | `9000` |
