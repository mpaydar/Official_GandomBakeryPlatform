# Official_GandomBakeryPlatform



#### PHASE 1 — Requirements, System Architecture & Prototyping 

Deliverables

• Final requirements document (ordering, admin dashboard, inventory logic, loyalty, notifications)

• System architecture diagram:

 – Backend: Next.js (App Router + API routes on Vercel)
 
 – Database schema

 – API gateway design
 
 – Real-time messaging (WebSockets/Kafka?)
 
• Technology decisions + justification

• Wireframes for bakery admin dashboard + customer ordering UI

• GitHub repo structure, CI skeleton, environment provisioning

• Proof-of-concept for order creation → bakery confirmation flow

## Deploy (Vercel + Neon)

The Next.js app is in `frontend/`.

### 1. Neon database (Vercel Storage)

1. Vercel → **Storage** → create/connect **Neon** → **Connect** to this project (Production, Preview, Development).
2. Vercel injects (you do **not** need to copy these manually if Connect succeeded):
   - `DATABASE_URL` — pooled (app runtime)
   - `DATABASE_URL_UNPOOLED` — direct (Prisma migrations at build)
   - Legacy: `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, etc. (also supported)
3. Add manually in **Settings** → **Environment Variables** (all environments):
   - `JWT_SECRET_KEY` — long random secret (Neon does not create this)
4. Do **not** wrap values in extra quotes in the Vercel dashboard.

### 2. Vercel build settings

**Project Settings → Build & Deployment**

| Setting | Value |
|--------|--------|
| **Root Directory** | `frontend` ← important |
| **Framework Preset** | **Next.js** (not “Services”) |
| **Install Command** | `npm ci` (or leave default when Root Directory is `frontend`) |
| **Build Command** | `npm run vercel-build` (Prisma migrate + Next build) |
| **Node.js Version** | 20.x (set in `frontend/package.json` `engines`) |

Dependencies install with **npm** (see `frontend/package-lock.json`). Do not use a root `vercel-build` script that skips `npm ci` in `frontend/`.

If **Root Directory** is empty, root `vercel.json` runs `cd frontend && npm ci && npm run vercel-build`.

### 3. Apply database schema (once)

Vercel builds **do not** run `prisma migrate deploy` (Neon pooler + advisory locks cause P1002 timeouts). After connecting Neon, run migrations **once** from your machine:

```bash
cd frontend
vercel env pull .env.local
npm ci
npm run db:migrate
```

Use **`DATABASE_URL_UNPOOLED`** (direct, no `-pooler` in hostname) in `.env.local` for migrations. Keep **`DATABASE_URL`** (pooled) for the app.

### 4. Redeploy

A successful Vercel build logs `prisma generate` and `next build` (~1–3 min).

### Local dev with Neon

```bash
cd frontend
vercel env pull .env.local
npm ci
npm run db:migrate
npm run dev
```

The legacy Python/FastAPI `backend/` folder has been removed.

### POS System Features:


1. Cashier Screen UI
2. Product Selection 
3. Barcode Scanning
4. Cart and Totals
5. Payment Handling
6. Receipt Generation
7. Inventory updates

### Product Selection:

How items get into the sale without scanning.

#### Touch-first behavior:

Cashier taps category → taps product

Modal opens (price, quantity, variants)

Item is added to cart

Used when:

No barcode

Produce priced by weight

Custom items (bakery, deli)




