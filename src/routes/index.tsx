import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { WaGenerator } from "@/components/wa/WaGenerator";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">
            WAlink<span className="text-primary">Q</span>
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <WaGenerator />

        <section className="mt-6">
          <button
            type="button"
            onClick={() => setHowOpen((v) => !v)}
            aria-expanded={howOpen}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-muted/60"
          >
            <span>Cara pakai</span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                howOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {howOpen && (
            <ol className="mt-2 space-y-2 rounded-lg border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
              <li><span className="font-semibold text-foreground">1.</span> Masukkan nomor WhatsApp (tanpa 0 di depan).</li>
              <li><span className="font-semibold text-foreground">2.</span> Tulis pesan otomatis (opsional).</li>
              <li><span className="font-semibold text-foreground">3.</span> Salin link atau unduh QR, tempel di bio sosmed.</li>
            </ol>
          )}
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-xl space-y-1 px-4 py-5 text-[11px] leading-relaxed text-muted-foreground sm:px-6">
          <p>Semua data hanya tersimpan di perangkat kamu. Tidak ada yang dikirim ke server.</p>
          <p>Tidak berafiliasi dengan WhatsApp Inc. WhatsApp adalah merek dagang Meta.</p>
        </div>
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}
