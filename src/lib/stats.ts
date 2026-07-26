const KEY = "wa-stats-monthly";

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type Store = Record<string, number>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore quota */
  }
}

export function bumpLinkCreated() {
  const store = read();
  const k = monthKey();
  store[k] = (store[k] ?? 0) + 1;
  write(store);
}

export function getLinksThisMonth(): number {
  return read()[monthKey()] ?? 0;
}
