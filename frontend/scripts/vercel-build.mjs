import { execSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = join(frontendDir, "..");

const pooled =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL;

if (!pooled) {
  console.error(`
ERROR: DATABASE_URL is not set.

Connect Neon in Vercel → Storage → Connect to this project, then redeploy.
Also set JWT_SECRET_KEY in Environment Variables.
`);
  process.exit(1);
}

process.env.DATABASE_URL = pooled;

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

// Do not run migrate deploy on Vercel — pooled connections and concurrent builds
// cause P1002 advisory lock timeouts. Run once locally: npm run db:migrate
console.log(
  "\nℹ Skipping prisma migrate deploy on Vercel (run `npm run db:migrate` once with DATABASE_URL_UNPOOLED).\n"
);

run("Next.js build", "npm run build");

// Vercel project root is the repo; Next writes to frontend/.next
if (process.env.VERCEL === "1") {
  console.log("\n▶ Link frontend/.next → repo .next for Vercel deploy\n");
  execSync("rm -rf .next && ln -sfn frontend/.next .next", {
    cwd: repoRoot,
    stdio: "inherit",
  });
}
