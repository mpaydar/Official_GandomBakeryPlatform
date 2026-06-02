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

The app lives in `frontend/`.

1. **Root Directory:** `frontend`
2. **Framework Preset:** **Next.js** (recommended). If the preset is stuck on **Services**, `frontend/vercel.json` declares a `web` service so builds still work.
3. **Environment variables:** `DATABASE_URL`, `JWT_SECRET_KEY`

If you see `Project framework is set to "services", but no services are declared`, either switch Framework Preset to **Next.js** in Project Settings → Build & Deployment, or keep **Services** and redeploy (this repo’s `vercel.json` defines the Next app as the `web` service).

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




