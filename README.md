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

### 1. Neon database

1. In [Vercel](https://vercel.com) → your project → **Storage** → **Create Database** → **Neon** (or use [neon.tech](https://neon.tech) and paste the connection string).
2. Copy the **pooled** Postgres connection string (must include `?sslmode=require`).
3. Link the database to this Vercel project (Storage → your Neon DB → **Connect**).
4. In **Settings** → **Environment Variables**, set (all environments: Production, Preview, Development):
   - `DATABASE_URL` = Neon **pooled** connection string (`?sslmode=require`)
     - If Vercel only created `POSTGRES_URL` / `POSTGRES_PRISMA_URL`, copy the pooled URL into `DATABASE_URL` as well (required at **build** time for migrations).
   - `JWT_SECRET_KEY` = a long random secret

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

### 3. Redeploy

A successful build takes **~1–3 minutes** and logs `prisma generate`, `prisma migrate deploy`, and `next build`.

### Local dev with Neon

```bash
cd frontend
cp .env.example .env.local
# Edit DATABASE_URL and JWT_SECRET_KEY
npm ci
npx prisma migrate deploy
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




