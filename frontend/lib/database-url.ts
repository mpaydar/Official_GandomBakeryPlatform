/** Pooled URL for the app at runtime (Neon / Vercel). */
export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL
  );
}

/** Direct URL for Prisma CLI (migrate deploy). Neon requires non-pooled for migrations. */
export function getMigrationDatabaseUrl(): string | undefined {
  return (
    process.env.DIRECT_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    getDatabaseUrl()
  );
}

/** Set env so Prisma CLI and the app see consistent URLs during Vercel build. */
export function applyDatabaseEnv(): {
  pooled: string | undefined;
  migration: string | undefined;
} {
  const pooled = getDatabaseUrl();
  const migration = getMigrationDatabaseUrl();

  if (pooled) process.env.DATABASE_URL = pooled;
  if (migration) {
    process.env.DIRECT_URL = migration;
    // prisma.config.ts reads migration URL for CLI
  }

  return { pooled, migration };
}
