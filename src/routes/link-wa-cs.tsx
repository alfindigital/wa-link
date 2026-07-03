import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { WaGenerator } from "@/components/wa/WaGenerator";

export const Route = createFileRoute("/link-wa-cs")({
  component: CsPage,
  head: () => ({
    meta: [
      { title: "Link WhatsApp untuk Customer Service — WAlinkQ" },
      {
        name: "description",
        content:
          "Bikin link WhatsApp CS: pesan salam otomatis + QR code untuk kartu nama, kemasan, dan website.",
      },
      { property: "og:title", content: "Link WhatsApp untuk Customer Service — WAlinkQ" },
      {
        property: "og:description",
        content: "Link wa.me + QR untuk CS/support. Gratis, tanpa daftar.",
      },
    ],
    links: [{ rel: "canonical", href: "https://link-wa.alfindigital.com/link-wa-cs" }],
  }),
});

function CsPage() {
  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
        Link WhatsApp untuk <span className="text-primary">Customer Service</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bikin link CS yang bisa dipasang di kartu nama, kemasan produk, atau website. Pelanggan
        tinggal scan QR-nya.
      </p>
      <div className="mt-5">
        <WaGenerator initialMessage="Halo, saya butuh bantuan terkait" />
      </div>
    </div>
  );
}