import "server-only";

import { eq } from "drizzle-orm";

import { db } from "../client";
import { settings, type Settings } from "../schema";

export function getSettings(): Settings {
  const row = db.select().from(settings).where(eq(settings.id, 1)).get();
  if (!row) {
    throw new Error("Settings row missing — seed must run before first read.");
  }
  return row;
}
