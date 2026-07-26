import { z } from "zod";
import {
  MAX_HISTORY_ID,
  MAX_LABEL,
  MAX_MESSAGE,
  MAX_PHONE_DIGITS,
  MIN_PHONE_DIGITS,
} from "@/lib/wa-limits";

/** Full E.164-ish digits stored by the generator (e.g. 62812…). */
const phoneSchema = z
  .string()
  .regex(/^\d+$/, "Nomor harus angka")
  .refine(
    (p) => {
      const local = p.startsWith("62") ? p.slice(2) : p;
      return local.length >= MIN_PHONE_DIGITS && local.length <= MAX_PHONE_DIGITS;
    },
    { message: "Panjang nomor tidak valid" },
  );

/** Only wa.me links with a numeric path; optional ?text= query. */
const waUrlSchema = z
  .string()
  .max(MAX_MESSAGE * 4 + 64)
  .regex(/^https:\/\/wa\.me\/\d{8,17}(\?text=[^#]*)?$/, "URL wa.me tidak valid");

export const waHistoryItemSchema = z.object({
  id: z.string().min(1).max(MAX_HISTORY_ID),
  phone: phoneSchema,
  message: z.string().transform((m) => m.slice(0, MAX_MESSAGE)),
  url: waUrlSchema,
  createdAt: z.number().finite().nonnegative(),
  label: z
    .string()
    .optional()
    .transform((l) => {
      if (l == null) return undefined;
      const t = l.trim().slice(0, MAX_LABEL);
      return t || undefined;
    }),
  favorite: z.boolean().optional(),
});

export type WaHistoryItemParsed = z.infer<typeof waHistoryItemSchema>;

export function parseHistoryItem(x: unknown): WaHistoryItemParsed | null {
  const result = waHistoryItemSchema.safeParse(x);
  return result.success ? result.data : null;
}

export function parseHistoryList(x: unknown): WaHistoryItemParsed[] {
  if (!Array.isArray(x)) return [];
  const out: WaHistoryItemParsed[] = [];
  for (const item of x) {
    const parsed = parseHistoryItem(item);
    if (parsed) out.push(parsed);
  }
  return out;
}
