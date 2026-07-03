import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  History,
  HelpCircle,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Globe,
  Facebook,
  Youtube,
  Star,
  Pencil,
  Settings,
  Moon,
} from "lucide-react";
import { WaGenerator } from "@/components/wa/WaGenerator";
import { SwipeToDelete } from "@/components/wa/SwipeToDelete";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useWaHistory } from "@/hooks/use-wa-history";
import { toast } from "sonner";
import { getPrefs, setPref } from "@/lib/feedback";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Link WhatsApp Gratis + QR Code — WAlinkQ" },
      {
        name: "description",
        content:
          "Bikin link WhatsApp (wa.me) dengan pesan otomatis dan QR code, gratis dan tanpa daftar. Cocok untuk jualan online dan bio Instagram/TikTok.",
      },
      { property: "og:title", content: "Link WhatsApp Gratis + QR Code — WAlinkQ" },
      {
        property: "og:description",
        content: "Buat link WhatsApp dengan pesan siap kirim + QR code. Gratis dan tanpa login.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://link-wa.alfindigital.com/" },
    ],
    links: [{ rel: "canonical", href: "https://link-wa.alfindigital.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "WAlinkQ",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          inLanguage: "id-ID",
          url: "https://link-wa.alfindigital.com/",
          offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
        }),
      },
    ],
  }),
});

function Index() {
  const [howOpen, setHowOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const { items, remove, clear, setLabel, toggleFavorite } = useWaHistory();
  const [sound, setSound] = useState(false);
  const [haptic, setHaptic] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const p = getPrefs();
    setSound(p.sound);
    setHaptic(p.haptic);
    // Theme was applied pre-hydration by ScriptOnce in __root.tsx.
    // Just mirror the current DOM state into React so the Switch reflects reality.
    if (typeof document !== "undefined") {
      setDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  function toggleDark(v: boolean) {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    try {
      window.localStorage.setItem("theme", v ? "dark" : "light");
    } catch {
      // ignore
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Berhasil disalin", {
        description: "Link sudah tersimpan di papan klip.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
    } catch {
      toast.error("Gagal menyalin", {
        description: "Coba salin manual atau periksa izin browser.",
        icon: <XCircle className="h-4 w-4 text-destructive" />,
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-primary/20 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-[28px]">
            <span className="text-primary">WA</span>link<span className="text-primary">Q</span>
            <span className="sr-only"> — Bikin Link WhatsApp + QR Code Gratis</span>
          </h1>
          <div className="flex items-center gap-1">
            <Dialog open={histOpen} onOpenChange={setHistOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  aria-label="Riwayat"
                >
                  <History className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-black uppercase tracking-tight">
                    Riwayat
                  </DialogTitle>
                </DialogHeader>
                {items.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Belum ada link tersimpan.
                  </p>
                ) : (
                  <>
                    <p className="px-1 pb-2 text-[11px] text-muted-foreground sm:hidden">
                      Tips: geser ke kiri untuk menghapus.
                    </p>
                    <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
                      {items.map((it) => (
                        <li key={it.id}>
                          <SwipeToDelete onDelete={() => remove(it.id)}>
                            <div className="flex items-center gap-2 py-3">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleFavorite(it.id)}
                                aria-label={it.favorite ? "Hapus dari favorit" : "Jadikan favorit"}
                                aria-pressed={!!it.favorite}
                                className="h-8 w-8 shrink-0"
                              >
                                <Star
                                  className={`h-4 w-4 ${it.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                />
                              </Button>
                              <div className="min-w-0 flex-1">
                                {it.label ? (
                                  <>
                                    <p className="truncate text-sm font-semibold">{it.label}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      +{it.phone}
                                      {it.message ? ` · ${it.message}` : ""}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="truncate text-sm font-medium">+{it.phone}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {it.message || <span className="italic">Tanpa pesan</span>}
                                    </p>
                                  </>
                                )}
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  const next = window.prompt(
                                    "Nama kontak (kosongkan untuk hapus):",
                                    it.label ?? "",
                                  );
                                  if (next !== null) setLabel(it.id, next);
                                }}
                                aria-label="Edit nama"
                                className="h-8 w-8 shrink-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => copyText(it.url)}
                                aria-label="Salin link"
                                className="h-8 w-8 shrink-0"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                asChild
                                aria-label="Buka link"
                                className="h-8 w-8 shrink-0"
                              >
                                <a href={it.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => remove(it.id)}
                                aria-label="Hapus"
                                className="h-8 w-8 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </SwipeToDelete>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end pt-2">
                      <Button variant="ghost" size="sm" onClick={clear}>
                        Hapus semua
                      </Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={howOpen} onOpenChange={setHowOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  aria-label="Cara pakai"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-black uppercase tracking-tight">
                    Cara Pakai
                  </DialogTitle>
                </DialogHeader>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <span className="font-semibold text-foreground">1.</span> Masukkan nomor
                    WhatsApp tanpa angka 0 di depan.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">2.</span> Tulis pesan otomatis
                    (opsional) yang akan muncul saat dibuka.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">3.</span> Salin link atau unduh
                    QR, lalu tempel di bio sosmed.
                  </li>
                </ol>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Pengaturan">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Pengaturan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-2 text-sm">
                  <label htmlFor="pref-dark" className="flex items-center gap-2">
                    <Moon className="h-3.5 w-3.5" /> Mode gelap
                  </label>
                  <Switch id="pref-dark" checked={dark} onCheckedChange={toggleDark} />
                </div>
                <div className="flex items-center justify-between px-2 py-2 text-sm">
                  <label htmlFor="pref-sound">Suara</label>
                  <Switch
                    id="pref-sound"
                    checked={sound}
                    onCheckedChange={(v) => {
                      setSound(v);
                      setPref("sound", v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between px-2 py-2 text-sm">
                  <label htmlFor="pref-haptic">Getar</label>
                  <Switch
                    id="pref-haptic"
                    checked={haptic}
                    onCheckedChange={(v) => {
                      setHaptic(v);
                      setPref("haptic", v);
                    }}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-4 pt-4 sm:px-6 sm:pb-12 sm:pt-8">
        <WaGenerator />
      </main>

      <footer className="flex items-center justify-center gap-2.5 py-3">
        <span className="text-[11px] text-muted-foreground">
          by <span className="font-medium text-foreground">@alfindigital</span>
        </span>
        <span className="text-[11px] text-muted-foreground">|</span>
        <a
          href="https://alfindigital.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Website alfindigital.com"
          title="alfindigital.com"
          className="inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary"
        >
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <a
          href="https://fb.com/alfindigital"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook @alfindigital"
          title="Facebook @alfindigital"
          className="inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary"
        >
          <Facebook className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <a
          href="https://youtube.com/@alfindigital"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube @alfindigital"
          title="YouTube @alfindigital"
          className="inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary"
        >
          <Youtube className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <a
          href="https://tiktok.com/@alfindigital"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok @alfindigital"
          title="TikTok @alfindigital"
          className="inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.83a8.16 8.16 0 0 0 4.77 1.52V7.9a4.83 4.83 0 0 1-1.84-1.21Z" />
          </svg>
        </a>
        <a
          href="https://x.com/alfindigital"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter) @alfindigital"
          title="X @alfindigital"
          className="inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h6.83l4.713 6.231 5.447-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
          </svg>
        </a>
        <a
          href="https://t.me/alfidx"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Telegram @alfidx"
          title="Telegram @alfidx"
          className="inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M21.94 4.34 18.7 19.62c-.24 1.08-.88 1.35-1.78.84l-4.92-3.63-2.37 2.28c-.26.26-.48.48-.99.48l.35-5.02 9.13-8.25c.4-.35-.09-.55-.61-.2L6.22 12.95l-4.86-1.52c-1.06-.33-1.08-1.06.22-1.57l19-7.32c.88-.33 1.65.2 1.36 1.8Z" />
          </svg>
        </a>
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}
