/** Postgres URL from env (Neon on Vercel may set POSTGRES_* instead of DATABASE_URL). */
export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL
  );
}
