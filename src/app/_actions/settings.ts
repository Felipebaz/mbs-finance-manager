"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db/client";
import { settings } from "@/db/schema";
import { formDataToObject, settingsSchema } from "@/lib/validation";
import type { ActionState } from "./accounts";

export async function updateSettings(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const parsed = settingsSchema.safeParse(formDataToObject(fd));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { defaultCurrency, locale } = parsed.data;
  db.update(settings)
    .set({ defaultCurrency, locale, updatedAt: new Date() })
    .where(eq(settings.id, 1))
    .run();
  revalidatePath("/");
  revalidatePath("/settings");
  redirect("/settings");
}
