import { createFileRoute, Link } from "@tanstack/react-router";
import { History, Settings } from "lucide-react";
import { WaGenerator } from "@/components/wa/WaGenerator";
import { SiteFooter } from "@/components/layout/SiteFooter";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-primary/20 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
          <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-[28px]">
            <span className="text-primary">WA</span>link<span className="text-primary">Q</span>
            <span className="sr-only"> — Bikin Link WhatsApp + QR Code Gratis</span>
          </h1>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 touch-manipulation"
              asChild
              aria-label="Riwayat"
              title="Riwayat"
            >
              <Link to="/riwayat">
                <History className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 touch-manipulation"
              asChild
              aria-label="Pengaturan"
              title="Pengaturan"
            >
              <Link to="/pengaturan">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-2 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
        <WaGenerator />
      </main>

      <SiteFooter />

      <Toaster position="top-center" />
    </div>
  );
}
