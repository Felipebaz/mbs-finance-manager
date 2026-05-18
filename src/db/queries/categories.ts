import "server-only";

import { isNull } from "drizzle-orm";

import { db } from "../client";
import { categories, type Category } from "../schema";

export function listCategories(): Category[] {
  return db
    .select()
    .from(categories)
    .where(isNull(categories.archivedAt))
    .orderBy(categories.kind, categories.name)
    .all();
}

export function listAllCategories(): Category[] {
  return db.select().from(categories).orderBy(categories.kind, categories.name).all();
}
