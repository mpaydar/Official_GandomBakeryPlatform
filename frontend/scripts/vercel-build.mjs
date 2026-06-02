import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const frontendDir = fileURLToPath(new URL("..", import.meta.url));

const pooled =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL;

const migration =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  pooled;

if (!migration) {
  console.error(`
ERROR: No database URL found.

Link Neon in Vercel → Storage → Connect to this project, then redeploy.
Vercel should inject DATABASE_URL and DATABASE_URL_UNPOOLED (or POSTGRES_*).

Also add JWT_SECRET_KEY in Settings → Environment Variables.
`);
  process.exit(1);
}

if (pooled) process.env.DATABASE_URL = pooled;
process.env.DIRECT_URL = migration;

console.log("Database env: pooled=%s migration=%s", pooled ? "yes" : "no", "yes");

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
