import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = dirname(fileURLToPath(new URL("..", import.meta.url)));
config({ path: resolve(frontendDir, ".env.local") });
config({ path: resolve(frontendDir, ".env") });

function isValidPostgresUrl(value) {
  if (!value || !value.trim()) return false;
  const normalized = value.trim().replace(/^["']|["']$/g, "");
  return (
    normalized.startsWith("postgresql://") || normalized.startsWith("postgres://")
  );
}

const migrationUrl =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL;

if (!isValidPostgresUrl(migrationUrl)) {
  console.error(`
DATABASE_URL is missing or empty in frontend/.env.local.

Vercel often cannot download secret Neon URLs via "vercel env pull" (values arrive as "").

Fix:
  1. Vercel Dashboard → your project → Storage → Neon → Connect
  2. Or Settings → Environment Variables → copy DATABASE_URL and DATABASE_URL_UNPOOLED
  3. Paste into frontend/.env.local (no extra quotes in the dashboard; file format is fine):

     DATABASE_URL="postgresql://USER:PASS@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
     DATABASE_URL_UNPOOLED="postgresql://USER:PASS@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
     JWT_SECRET_KEY="your-long-random-secret"

  4. Run: npm run db:migrate
`);
  process.exit(1);
}
