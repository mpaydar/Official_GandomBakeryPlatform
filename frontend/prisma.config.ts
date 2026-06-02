import "dotenv/config";
import { defineConfig } from "prisma/config";
import { getMigrationDatabaseUrl } from "./lib/database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Neon: use direct/unpooled URL for migrations (see DATABASE_URL_UNPOOLED on Vercel)
    url: getMigrationDatabaseUrl(),
  },
});
