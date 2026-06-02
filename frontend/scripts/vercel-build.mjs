import { execSync } from "node:child_process";

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error(`
ERROR: No database URL found for Prisma migrate deploy.

Add one of these in Vercel → Project → Settings → Environment Variables
(enable for Production, Preview, and Development):

  DATABASE_URL = postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require

If you connected Neon via Vercel Storage, copy the pooled URL into DATABASE_URL,
or redeploy after linking the database to this project.

Then redeploy.
`);
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;

execSync("npx prisma generate", { stdio: "inherit" });
execSync("npx prisma migrate deploy", { stdio: "inherit" });
execSync("npx next build", { stdio: "inherit" });
