import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  History,
  HelpCircle,
  Settings,
  Moon,
  Volume2,
  Vibrate,
  Phone,
  MessageSquare,
  Link2,
} from "lucide-react";
import { WaGenerator } from "@/components/wa/WaGenerator";
import { SiteFooter } from "@/components/layout/SiteFooter";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const [sound, setSound] = useState(false);
  const [haptic, setHaptic] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const p = getPrefs();
    setSound(p.sound);
    setHaptic(p.haptic);
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

            <Dialog open={howOpen} onOpenChange={setHowOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 touch-manipulation"
                  aria-label="Cara pakai" title="Cara pakai"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-black uppercase tracking-tight">
                    Cara Pakai
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Panduan singkat membuat link WhatsApp dan QR code.
                  </DialogDescription>
                </DialogHeader>
                <ol className="space-y-2">
                  {[
                    {
                      icon: Phone,
                      title: "Masukkan nomor",
                      desc: "Format +62, tanpa angka 0 di depan.",
                    },
                    {
                      icon: MessageSquare,
                      title: "Tulis pesan (opsional)",
                      desc: "Muncul otomatis saat link dibuka.",
                    },
                    {
                      icon: Link2,
                      title: "Salin link atau unduh QR",
                      desc: "Tempel di bio sosmed, katalog, atau cetak.",
                    },
                  ].map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {i + 1}. {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{step.desc}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <p className="pt-1 text-center text-[11px] text-muted-foreground">
                  Semua diproses di perangkat kamu. Tanpa daftar, tanpa server.
                </p>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 touch-manipulation" aria-label="Pengaturan" title="Pengaturan">
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
                  <label htmlFor="pref-sound" className="flex items-center gap-2">
                    <Volume2 className="h-3.5 w-3.5" /> Suara
                  </label>
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
                  <label htmlFor="pref-haptic" className="flex items-center gap-2">
                    <Vibrate className="h-3.5 w-3.5" /> Getar
                  </label>
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

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-2 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
        <WaGenerator />
      </main>

      <SiteFooter />

      <Toaster position="top-center" />
    </div>
  );
}
