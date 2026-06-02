import { config } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";
import { getMigrationDatabaseUrl } from "./lib/database-url";

// Prisma CLI does not load .env.local by default — Next.js does
config({ path: resolve(__dirname, ".env.local") });
config({ path: resolve(__dirname, ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getMigrationDatabaseUrl(),
  },
});
