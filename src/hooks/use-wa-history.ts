import { useEffect, useState, useCallback } from "react";

export type WaHistoryItem = {
  id: string;
  phone: string;
  message: string;
  url: string;
  createdAt: number;
};

const KEY = "wa-link-history";
const MAX = 10;

function read(): WaHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useWaHistory() {
  const [items, setItems] = useState<WaHistoryItem[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const persist = useCallback((next: WaHistoryItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }, []);

  const add = useCallback(
    (item: Omit<WaHistoryItem, "id" | "createdAt">) => {
      const next: WaHistoryItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      };
      const deduped = read().filter((it) => it.url !== next.url);
      persist([next, ...deduped].slice(0, MAX));
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(read().filter((it) => it.id !== id));
    },
    [persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { items, add, remove, clear };
}
