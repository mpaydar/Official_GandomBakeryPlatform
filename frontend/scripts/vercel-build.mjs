import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// scripts/vercel-build.mjs → parent directory is frontend/
const frontendDir = fileURLToPath(new URL("..", import.meta.url));

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error(`
ERROR: No database URL found for Prisma migrate deploy.

Add DATABASE_URL in Vercel → Settings → Environment Variables
(Production, Preview, and Development):

  DATABASE_URL = postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
`);
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;

function run(label, cmd) {
  console.log(`\n▶ ${label}\n`);
  try {
    execSync(cmd, {
      stdio: "inherit",
      cwd: frontendDir,
      env: process.env,
    });
  } catch (err) {
    console.error(`\n✗ ${label} failed (exit ${err.status ?? 1})\n`);
    process.exit(err.status ?? 1);
  }
}

run("Prisma generate", "npx prisma generate");
run("Prisma migrate deploy", "npx prisma migrate deploy");
run("Next.js build", "npm run build");
