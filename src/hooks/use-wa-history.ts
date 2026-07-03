import { useEffect, useState, useCallback } from "react";

export type WaHistoryItem = {
  id: string;
  phone: string;
  message: string;
  url: string;
  createdAt: number;
  label?: string;
  favorite?: boolean;
};

const KEY = "wa-link-history";
const MAX = 100;
const EVT = "wa-link-history-change";

function read(): WaHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortItems(parsed.filter(isValid));
  } catch {
    return [];
  }
}

function isValid(x: unknown): x is WaHistoryItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.phone === "string" &&
    typeof o.message === "string" &&
    typeof o.url === "string" &&
    typeof o.createdAt === "number"
  );
}

// When capping, keep favorites first, then most-recent.
function capItems(list: WaHistoryItem[]): WaHistoryItem[] {
  if (list.length <= MAX) return list;
  const favs = list.filter((it) => it.favorite);
  const rest = list.filter((it) => !it.favorite);
  const keep = [...favs, ...rest].slice(0, MAX);
  return sortItems(keep);
}

function sortItems(list: WaHistoryItem[]): WaHistoryItem[] {
  return [...list].sort((a, b) => {
    const fa = a.favorite ? 1 : 0;
    const fb = b.favorite ? 1 : 0;
    if (fa !== fb) return fb - fa;
    return b.createdAt - a.createdAt;
  });
}

export function useWaHistory() {
  const [items, setItems] = useState<WaHistoryItem[]>([]);

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

  const persist = useCallback((next: WaHistoryItem[]) => {
    setItems(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(EVT));
    } catch {
      // ignore quota errors
    }
  }, []);

  const add = useCallback(
    (item: Omit<WaHistoryItem, "id" | "createdAt">) => {
      const current = read();
      const existing = current.find((it) => it.url === item.url);
      const next: WaHistoryItem = {
        ...item,
        label: item.label ?? existing?.label,
        favorite: item.favorite ?? existing?.favorite,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      };
      const deduped = current.filter((it) => it.url !== next.url);
      persist(capItems(sortItems([next, ...deduped])));
    },
    [persist],
  );

  const replaceAll = useCallback(
    (list: WaHistoryItem[]) => {
      persist(capItems(sortItems(list.filter(isValid))));
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(read().filter((it) => it.id !== id));
    },
    [persist],
  );

  const setLabel = useCallback(
    (id: string, label: string) => {
      const next = read().map((it) =>
        it.id === id ? { ...it, label: label.trim() || undefined } : it,
      );
      persist(sortItems(next));
    },
    [persist],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = read().map((it) => (it.id === id ? { ...it, favorite: !it.favorite } : it));
      persist(sortItems(next));
    },
    [persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { items, add, remove, clear, setLabel, toggleFavorite, replaceAll };
}
