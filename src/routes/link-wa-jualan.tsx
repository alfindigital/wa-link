import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { WaGenerator } from "@/components/wa/WaGenerator";

export const Route = createFileRoute("/link-wa-jualan")({
  component: JualanPage,
  head: () => ({
    meta: [
      { title: "Link WhatsApp untuk Jualan Online — WAlinkQ" },
      {
        name: "description",
        content:
          "Bikin link WhatsApp siap pakai untuk jualan online: pesan otomatis + QR code untuk bio Instagram, TikTok, Shopee, dan Marketplace.",
      },
      { property: "og:title", content: "Link WhatsApp untuk Jualan Online — WAlinkQ" },
      {
        property: "og:description",
        content: "Link wa.me + QR untuk jualan online. Gratis, tanpa daftar.",
      },
    ],
    links: [{ rel: "canonical", href: "https://link-wa.alfindigital.com/link-wa-jualan" }],
  }),
});

function JualanPage() {
  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
        Link WhatsApp untuk <span className="text-primary">Jualan Online</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pasang link WhatsApp di bio Instagram, TikTok, Shopee, atau marketplace lain. Cukup isi
        nomor & pesan, langsung dapat link wa.me + QR code.
      </p>
      <div className="mt-5">
        <WaGenerator initialMessage="Halo kak, saya mau tanya soal produknya" />
      </div>
    </div>
  );
}