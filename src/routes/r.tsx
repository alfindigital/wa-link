import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type Entry = { phone: string; weight: number };
type Config = { e: Entry[]; m: string };

function decode(hash: string): Config | null {
  try {
    const raw = hash.replace(/^#/, "");
    if (!raw) return null;
    const json = decodeURIComponent(escape(atob(raw)));
    const parsed = JSON.parse(json);
    if (!parsed || !Array.isArray(parsed.e)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function pickWeighted(entries: Entry[]): Entry | null {
  const total = entries.reduce((s, e) => s + Math.max(1, e.weight), 0);
  if (!total) return null;
  let r = Math.random() * total;
  for (const e of entries) {
    r -= Math.max(1, e.weight);
    if (r <= 0) return e;
  }
  return entries[entries.length - 1];
}

export const Route = createFileRoute("/r")({
  component: RedirectPage,
  head: () => ({
    meta: [
      { title: "Redirecting… — WAlinkQ" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function RedirectPage() {
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const cfg = decode(window.location.hash);
    if (!cfg || !cfg.e.length) {
      setErr("Link rotasi tidak valid.");
      return;
    }
    const pick = pickWeighted(cfg.e);
    if (!pick) {
      setErr("Konfigurasi rotasi kosong.");
      return;
    }
    const base = `https://wa.me/62${pick.phone}`;
    const url = cfg.m ? `${base}?text=${encodeURIComponent(cfg.m)}` : base;
    window.location.replace(url);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-4 text-center">
      {err ? (
        <div>
          <p className="text-sm font-semibold text-destructive">{err}</p>
          <a href="/" className="mt-3 inline-block text-xs text-primary underline">
            Ke beranda
          </a>
        </div>
      ) : (
        <p className="animate-pulse text-sm text-muted-foreground">Mengalihkan ke WhatsApp…</p>
      )}
    </div>
  );
}