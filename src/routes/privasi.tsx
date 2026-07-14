import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Database, EyeOff, Trash2, Info, Coffee, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/privasi")({
  component: PrivasiPage,
  head: () => ({
    meta: [
      { title: "Privasi & Disclaimer — WAlinkQ" },
      {
        name: "description",
        content:
          "WAlinkQ menyimpan semua data hanya di perangkat kamu. Tidak ada server, tidak ada login, tidak ada tracking.",
      },
      { property: "og:title", content: "Privasi & Disclaimer — WAlinkQ" },
      {
        property: "og:description",
        content: "Kebijakan privasi WAlinkQ: data lokal, tanpa akun, tanpa server, tanpa tracking.",
      },
    ],
    links: [{ rel: "canonical", href: "https://link-wa.alfindigital.com/privasi" }],
  }),
});

function PrivasiPage() {
  const sections = [
    {
      icon: Database,
      title: "Data tersimpan lokal",
      body:
        "Nomor, pesan, riwayat, template, dan pengaturan disimpan di browser HP kamu (localStorage). WAlinkQ tidak punya database dan tidak mengirim input kamu ke server manapun.",
    },
    {
      icon: EyeOff,
      title: "Tanpa analytics & cookie pihak ketiga",
      body:
        "Tidak ada Google Analytics, pixel iklan, atau cookie pihak ketiga. Tanpa akun, tanpa login.",
    },
    {
      icon: Trash2,
      title: "Menghapus data kamu",
      body:
        "Gunakan tombol Hapus / Hapus semua di menu Riwayat, atau bersihkan data situs untuk domain ini dari pengaturan browser.",
    },
    {
      icon: Info,
      title: "Disclaimer",
      body:
        "WAlinkQ bukan produk resmi dan tidak berafiliasi dengan WhatsApp Inc. atau Meta. WhatsApp adalah merek dagang milik Meta Platforms, Inc.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:py-12">
        <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
            Privasi
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Ringkas, jujur, tanpa server.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
        Semua data yang kamu ketik tetap di HP kamu. Kami tidak mengirim apa pun ke server, tidak
        menyimpan riwayat kamu di cloud, dan tidak pakai tracking.
      </div>

      <ul className="mt-4 space-y-3">
        {sections.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="https://x.com/alfindigital"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Kirim masukan
        </a>
        <a
          href="https://trakteer.id/alfindigital"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01]"
        >
          <Coffee className="h-4 w-4" aria-hidden="true" />
          Traktir di Trakteer
        </a>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}