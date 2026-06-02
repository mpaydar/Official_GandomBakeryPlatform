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
| **Root Directory** | `frontend` ← **required** (if empty, Vercel reads repo-root `package.json` and fails “No Next.js version detected”) |
| **Framework Preset** | **Next.js** (not “Other”, not “Services”) |
| **Output Directory** | **leave empty** (do not set `public` — Next.js uses `.next` automatically) |
| **Build Command** | `npm run vercel-build` (or default if empty) |
| **Node.js Version** | 20.x |

If **Output Directory** is set to `public`, the deploy fails after a successful Next build. Clear it and redeploy.

**Recommended (fixes “No Next.js version detected”):**

1. **Root Directory** = `frontend`
2. **Framework** = Next.js  
3. **Output Directory** = empty  
4. In **Settings**, clear custom Install/Build overrides (use `frontend/vercel.json`: `npm ci` + `npm run vercel-build`)

If Root Directory must stay empty, root `vercel.json` runs `npm install` then `cd frontend && npm ci`, and links `frontend/.next` → `.next` at the repo root after build.

**Best:** set **Root Directory** to `frontend` (then Vercel finds `frontend/.next` automatically; no symlink needed).

### 3. Apply database schema (once)

Vercel builds **do not** run `prisma migrate deploy` (Neon pooler + advisory locks cause P1002 timeouts). After connecting Neon, run migrations **once** from your machine:

```bash
cd frontend
vercel link --yes --project official-gandom-bakery-platform
# Secret Neon URLs often pull as empty — copy them manually (see below)
vercel env pull .env.local --environment=production
npm ci
npm run db:migrate
```

**Important:** `vercel env pull` may leave `DATABASE_URL=""` for secret vars. If `npm run db:migrate` fails with P1013, open **Vercel → Storage → Neon** (or **Settings → Environment Variables**) and paste the real URLs into `frontend/.env.local`:

- `DATABASE_URL` — pooled (`-pooler` in host)
- `DATABASE_URL_UNPOOLED` — direct (for migrations)
- `JWT_SECRET_KEY` — add manually (not from Neon)

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




