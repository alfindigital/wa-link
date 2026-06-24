import { useEffect, useState, useCallback } from "react";

export type WaTemplate = {
  id: string;
  text: string;
  isDefault?: boolean;
};

const KEY = "wa-link-templates";
const EVT = "wa-link-templates-change";
const MAX = 20;

const DEFAULTS: WaTemplate[] = [
  { id: "d-1", text: "Halo, saya mau order", isDefault: true },
  { id: "d-2", text: "Apakah masih ready?", isDefault: true },
  { id: "d-3", text: "Mau tanya soal produknya", isDefault: true },
];

function read(): WaTemplate[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULTS;
    return parsed;
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
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const current = read();
      if (current.some((t) => t.text === trimmed)) return;
      const next: WaTemplate = {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: trimmed,
      };
      persist([...current, next].slice(0, MAX));
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
