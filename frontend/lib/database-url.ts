/** Pooled URL for the app at runtime (Neon / Vercel). */
export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL
  );
}

/** True if URL goes through a pooler (advisory locks fail on these). */
export function isPooledConnectionString(url: string): boolean {
  try {
    const host = new URL(url.replace(/^postgres:/, "postgresql:")).hostname;
    return host.includes("-pooler") || host.includes("pooler.");
  } catch {
    return url.includes("-pooler") || url.includes("pooler.");
  }
}

/** Direct URL for Prisma CLI — never fall back to pooled (causes P1002 advisory lock timeout). */
export function getMigrationDatabaseUrl(): string | undefined {
  const direct =
    process.env.DIRECT_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (direct && !isPooledConnectionString(direct)) {
    return direct;
  }

  const fallback = getDatabaseUrl();
  if (fallback && !isPooledConnectionString(fallback)) {
    return fallback;
  }

  return undefined;
}
