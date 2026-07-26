import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Moon, Volume2, Vibrate, Phone, MessageSquare, Link2 } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getPrefs, setPref } from "@/lib/feedback";

export const Route = createFileRoute("/pengaturan")({
  component: PengaturanPage,
  head: () => ({
    meta: [
      { title: "Pengaturan & Cara Pakai — WAlinkQ" },
      {
        name: "description",
        content:
          "Atur mode gelap, suara, getar, dan pelajari cara membuat link WhatsApp + QR code di WAlinkQ.",
      },
      { property: "og:title", content: "Pengaturan & Cara Pakai — WAlinkQ" },
      {
        property: "og:description",
        content: "Preferensi tampilan dan panduan singkat WAlinkQ.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://link-wa.alfindigital.com/pengaturan" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://link-wa.alfindigital.com/pengaturan" }],
  }),
});

function PengaturanPage() {
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

  const steps = [
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
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-primary/20 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-3 py-2.5 sm:px-6 sm:py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 touch-manipulation"
            asChild
            aria-label="Kembali"
            title="Kembali"
          >
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-display text-xl font-black uppercase tracking-tight sm:text-2xl">
            Pengaturan
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-3 pb-8 pt-4 sm:px-6 sm:pt-6">
        <section className="rounded-lg border border-border/60 bg-card">
          <div className="border-b border-border/60 px-4 py-3">
            <h2 className="font-display text-sm font-black uppercase tracking-tight">Preferensi</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <label htmlFor="pref-dark" className="flex items-center gap-3 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Moon className="h-4 w-4" />
                </span>
                <span className="flex flex-col">
                  <span className="font-medium text-foreground">Mode gelap</span>
                  <span className="text-xs text-muted-foreground">
                    Tampilan lebih nyaman di malam hari.
                  </span>
                </span>
              </label>
              <Switch id="pref-dark" checked={dark} onCheckedChange={toggleDark} />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <label htmlFor="pref-sound" className="flex items-center gap-3 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Volume2 className="h-4 w-4" />
                </span>
                <span className="flex flex-col">
                  <span className="font-medium text-foreground">Suara</span>
                  <span className="text-xs text-muted-foreground">
                    Bunyi klik saat aksi berhasil.
                  </span>
                </span>
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
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <label htmlFor="pref-haptic" className="flex items-center gap-3 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Vibrate className="h-4 w-4" />
                </span>
                <span className="flex flex-col">
                  <span className="font-medium text-foreground">Getar</span>
                  <span className="text-xs text-muted-foreground">
                    Getar singkat di perangkat mobile.
                  </span>
                </span>
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
          </div>
        </section>

        <section className="rounded-lg border border-border/60 bg-card">
          <div className="border-b border-border/60 px-4 py-3">
            <h2 className="font-display text-sm font-black uppercase tracking-tight">Cara Pakai</h2>
          </div>
          <ol className="space-y-2 p-3">
            {steps.map((step, i) => {
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
          <p className="px-4 pb-4 text-center text-[11px] text-muted-foreground">
            Semua diproses di perangkat kamu. Tanpa daftar, tanpa server.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
