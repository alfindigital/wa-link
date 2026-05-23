import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { History, HelpCircle, Copy, Trash2, ExternalLink } from "lucide-react";
import { WaGenerator } from "@/components/wa/WaGenerator";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWaHistory } from "@/hooks/use-wa-history";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "WAlinkQ — Buat Link WhatsApp Gratis" },
      {
        name: "description",
        content:
          "Buat link WhatsApp (wa.me) lengkap dengan pesan otomatis dan QR code. Gratis, tanpa daftar, Bahasa Indonesia, cocok untuk jualan online dan bio sosmed.",
      },
      { property: "og:title", content: "WAlinkQ — Buat Link WhatsApp Gratis" },
      {
        property: "og:description",
        content:
          "Buat link WhatsApp dengan pesan siap kirim + QR code. Gratis dan tanpa login.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Index() {
  const [howOpen, setHowOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const { items, remove, clear } = useWaHistory();

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link disalin");
    } catch {
      toast.error("Gagal menyalin");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-primary/20 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-[28px]">
            <span className="text-primary">WA</span>link<span className="text-primary">Q</span>
          </h1>
          <div className="flex items-center gap-1">
            <Dialog open={histOpen} onOpenChange={setHistOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Riwayat">
                  <History className="h-4 w-4" />
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
                    <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
                      {items.map((it) => (
                        <li key={it.id} className="flex items-center gap-2 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">+{it.phone}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {it.message || <span className="italic">Tanpa pesan</span>}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => copyText(it.url)}
                            aria-label="Salin link"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            asChild
                            aria-label="Buka link"
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
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Cara pakai">
                  <HelpCircle className="h-4 w-4" />
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
                    <span className="font-semibold text-foreground">2.</span> Tulis pesan
                    otomatis (opsional) yang akan muncul saat dibuka.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">3.</span> Salin link atau
                    unduh QR, lalu tempel di bio sosmed.
                  </li>
                </ol>
              </DialogContent>
            </Dialog>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-12 pt-5 sm:px-6 sm:pt-8">
        <WaGenerator />
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-xl px-4 py-4 text-center text-[11px] leading-relaxed text-muted-foreground sm:px-6">
          <p>
            Data tersimpan di perangkat kamu &middot; Tidak berafiliasi dengan WhatsApp / Meta
          </p>
        </div>
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}
