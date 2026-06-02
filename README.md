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

## Deploy (Vercel)

The Next.js app is in `frontend/`. A **2s build** and **404 NOT_FOUND** mean Vercel did not build Next.js (wrong framework or root directory).

### Required Vercel settings

In [Project Settings → Build & Deployment](https://vercel.com/docs/deployments/configure-a-build):

| Setting | Value |
|--------|--------|
| **Root Directory** | `frontend` |
| **Framework Preset** | **Next.js** (not “Services”) |
| **Install Command** | (leave default, or `pnpm install`) |
| **Build Command** | (leave default, or `prisma generate && next build`) |

### Environment variables

- `DATABASE_URL` — Postgres connection string (e.g. Neon)
- `JWT_SECRET_KEY` — long random string for admin sessions

After saving settings, redeploy. A healthy build takes **~1–3 minutes**, not 2 seconds.

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




