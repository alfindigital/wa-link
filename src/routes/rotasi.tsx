import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";

type Entry = { phone: string; weight: number };

function encodeConfig(entries: Entry[], msg: string) {
  const data = { e: entries, m: msg };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

export const Route = createFileRoute("/rotasi")({
  component: RotasiPage,
  head: () => ({
    meta: [
      { title: "Rotasi Nomor WhatsApp — WAlinkQ" },
      {
        name: "description",
        content:
          "Bagikan 1 link yang otomatis membagi chat ke beberapa nomor WhatsApp CS secara acak (round-robin).",
      },
    ],
    links: [{ rel: "canonical", href: "https://link-wa.alfindigital.com/rotasi" }],
  }),
});

function RotasiPage() {
  const [entries, setEntries] = useState<Entry[]>([
    { phone: "", weight: 1 },
    { phone: "", weight: 1 },
  ]);
  const [msg, setMsg] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    const valid = entries.filter((e) => e.phone.replace(/\D/g, "").length >= 6);
    if (!valid.length) {
      setLink("");
      return;
    }
    const cleaned = valid.map((e) => ({
      phone: e.phone.replace(/\D/g, "").replace(/^0+/, "").replace(/^62/, ""),
      weight: Math.max(1, e.weight),
    }));
    const cfg = encodeConfig(cleaned, msg);
    setLink(`${window.location.origin}/r#${cfg}`);
  }, [entries, msg]);

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
        Rotasi <span className="text-primary">Nomor</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Satu link untuk beberapa CS. Setiap klik dialihkan acak ke salah satu nomor sesuai bobot.
      </p>

      <div className="mt-5 space-y-3">
        {entries.map((e, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex h-11 shrink-0 items-center rounded-md border border-input bg-muted px-2 text-sm font-semibold">
              +62
            </div>
            <Input
              inputMode="tel"
              placeholder="81234567890"
              value={e.phone}
              onChange={(ev) => {
                const next = [...entries];
                next[i] = { ...e, phone: ev.target.value };
                setEntries(next);
              }}
              className="h-11 flex-1"
            />
            <Input
              type="number"
              min={1}
              max={99}
              value={e.weight}
              onChange={(ev) => {
                const next = [...entries];
                next[i] = { ...e, weight: Number(ev.target.value) || 1 };
                setEntries(next);
              }}
              className="h-11 w-16"
              aria-label="Bobot"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={() => setEntries(entries.filter((_, idx) => idx !== i))}
              disabled={entries.length <= 1}
              aria-label="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={() => setEntries([...entries, { phone: "", weight: 1 }])}
        >
          <Plus className="h-4 w-4" /> Tambah nomor
        </Button>

        <div>
          <label htmlFor="rot-msg" className="mb-1 block text-sm font-semibold">
            Pesan (opsional)
          </label>
          <Input
            id="rot-msg"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Halo, saya mau tanya"
            className="h-11"
          />
        </div>

        {link && (
          <div className="rounded-md border border-primary/40 bg-primary/5 p-3">
            <p className="mb-1 text-xs font-semibold">Link rotasi kamu</p>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1 break-all rounded border border-border bg-background px-2 py-1.5 text-xs">
                {link}
              </div>
              <Button
                type="button"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={async () => {
                  const ok = await copyToClipboard(link);
                  if (ok) toast.success("Link disalin");
                }}
                aria-label="Salin"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}