"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { categories } from "@/db/schema";
import { categorySchema, formDataToObject } from "@/lib/validation";
import type { ActionState } from "./accounts";

export async function createCategory(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = categorySchema.safeParse(formDataToObject(fd));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, kind, color } = parsed.data;
  db.insert(categories).values({ name, kind, color }).run();
  revalidatePath("/categories");
  revalidatePath("/transactions/new");
  redirect("/categories");
}

export async function archiveCategory(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  db.update(categories)
    .set({ archivedAt: new Date() })
    .where(eq(categories.id, id))
    .run();
  revalidatePath("/categories");
}
