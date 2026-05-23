import { createFileRoute } from "@tanstack/react-router";
import { WaGenerator } from "@/components/wa/WaGenerator";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "WA Link — Buat Link WhatsApp Gratis (Indonesia)" },
      {
        name: "description",
        content:
          "Buat link WhatsApp (wa.me) lengkap dengan pesan otomatis dan QR code. Gratis, tanpa daftar, Bahasa Indonesia, cocok untuk jualan online dan bio sosmed.",
      },
      { property: "og:title", content: "WA Link — Buat Link WhatsApp Gratis (Indonesia)" },
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
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                <path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.4-1.68a11.83 11.83 0 005.64 1.43h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.43zM12.05 21.5h-.01a9.66 9.66 0 01-4.92-1.35l-.35-.21-3.8 1 1.02-3.7-.23-.38a9.66 9.66 0 01-1.48-5.12c0-5.34 4.35-9.68 9.69-9.68 2.59 0 5.02 1.01 6.85 2.84a9.62 9.62 0 012.84 6.85c0 5.34-4.35 9.69-9.69 9.69zm5.31-7.25c-.29-.15-1.72-.85-1.99-.94-.27-.1-.46-.15-.66.15-.19.29-.76.94-.93 1.13-.17.19-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.45-.86-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.49.1-.19.05-.36-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5-.17-.01-.36-.01-.55-.01s-.51.07-.78.36c-.27.29-1.02 1-1.02 2.44s1.04 2.83 1.19 3.03c.15.19 2.06 3.14 4.99 4.41.7.3 1.24.48 1.66.62.7.22 1.33.19 1.83.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.13-.26-.2-.55-.34z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">WA Link ID</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                Buat link WhatsApp gratis
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <section className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Buat Link WhatsApp Gratis
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Masukkan nomor & pesan, dapatkan link <code>wa.me</code> + QR code dalam sekejap.
            Tanpa daftar, tanpa biaya.
          </p>
        </section>

        <WaGenerator />

        <section className="mt-8 rounded-lg border border-border bg-muted/40 p-5">
          <h2 className="text-sm font-semibold">Cara pakai (3 langkah)</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">1.</span> Masukkan nomor WhatsApp
              kamu (tanpa angka 0 di depan).
            </li>
            <li>
              <span className="font-semibold text-foreground">2.</span> Tulis pesan yang akan
              muncul otomatis (opsional).
            </li>
            <li>
              <span className="font-semibold text-foreground">3.</span> Salin link atau unduh QR,
              tempel di bio Instagram, status, kartu nama, dll.
            </li>
          </ol>
        </section>

        <footer className="mt-8 pb-8 text-center text-xs text-muted-foreground">
          <p>
            🔒 Semua data hanya tersimpan di perangkat kamu. Kami tidak mengirim apa pun ke
            server.
          </p>
          <p className="mt-1">
            Tidak berafiliasi dengan WhatsApp Inc. WhatsApp adalah merek dagang dari Meta.
          </p>
        </footer>
      </main>

      <Toaster position="top-center" />
    </div>
  );
}
