import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/moneta.db",
  },
  strict: true,
  verbose: true,
} satisfies Config;
