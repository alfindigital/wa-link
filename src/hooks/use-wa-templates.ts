import { useEffect, useState, useCallback } from "react";
import { z } from "zod";

export type WaTemplate = {
  id: string;
  text: string;
  title?: string;
  isDefault?: boolean;
};

const KEY = "wa-link-templates";
const EVT = "wa-link-templates-change";
const MAX = 20;
export const TITLE_MAX = 22;
export const TEXT_MAX = 1000;

export const templateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Judul minimal 2 karakter" })
    .max(TITLE_MAX, { message: `Judul maksimal ${TITLE_MAX} karakter` }),
  text: z
    .string()
    .trim()
    .min(1, { message: "Pesan tidak boleh kosong" })
    .max(TEXT_MAX, { message: `Pesan maksimal ${TEXT_MAX} karakter` }),
});

export type AddTemplateResult = { ok: true } | { ok: false; error: string };

const DEFAULTS: WaTemplate[] = [
  { id: "d-1", text: "Halo, saya mau order", title: "Mau order", isDefault: true },
  { id: "d-2", text: "Apakah masih ready?", title: "Masih ready?", isDefault: true },
];

export function templateTitle(t: WaTemplate) {
  const base = (t.title ?? t.text).replace(/\s+/g, " ").trim();
  return base.length > 22 ? `${base.slice(0, 22).trimEnd()}…` : base;
}

function read(): WaTemplate[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULTS;
    const valid = (parsed as unknown[]).filter(
      (t): t is WaTemplate =>
        !!t &&
        typeof t === "object" &&
        typeof (t as WaTemplate).id === "string" &&
        typeof (t as WaTemplate).text === "string" &&
        (t as WaTemplate).text.trim().length > 0,
    );
    return valid.slice(0, MAX);
  } catch {
    return DEFAULTS;
  }
}

export function useWaTemplates() {
  const [items, setItems] = useState<WaTemplate[]>(DEFAULTS);

  useEffect(() => {
    setItems(read());
    const sync = () => setItems(read());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const persist = useCallback((next: WaTemplate[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(EVT));
    } catch {
      /* ignore */
    }
  }, []);

  const add = useCallback(
    (text: string, title?: string): AddTemplateResult => {
      const fallbackTitle = text.trim().split("\n")[0].slice(0, TITLE_MAX);
      const parsed = templateSchema.safeParse({
        title: title?.trim() ? title : fallbackTitle,
        text,
      });
      if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0].message };
      }
      const current = read();
      if (current.length >= MAX) {
        return { ok: false, error: `Maksimal ${MAX} template tersimpan` };
      }
      if (current.some((t) => t.text === parsed.data.text)) {
        return { ok: false, error: "Template dengan pesan ini sudah ada" };
      }
      if (
        current.some(
          (t) => templateTitle(t).toLowerCase() === parsed.data.title.toLowerCase().slice(0, 22),
        )
      ) {
        return { ok: false, error: "Judul sudah dipakai template lain" };
      }
      const next: WaTemplate = {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: parsed.data.text,
        title: parsed.data.title,
      };
      persist([...current, next].slice(0, MAX));
      return { ok: true };
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(read().filter((t) => t.id !== id));
    },
    [persist],
  );

  return { items, add, remove };
}
