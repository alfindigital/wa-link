import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

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
  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <h1 className="font-display text-3xl font-black uppercase tracking-tight">Privasi</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Halaman ini dikelola oleh pemilik WAlinkQ untuk menjelaskan cara kerja aplikasi.
      </p>

      <section className="mt-6 space-y-2 text-sm">
        <h2 className="text-base font-semibold">Data disimpan di perangkat kamu</h2>
        <p className="text-muted-foreground">
          Nomor, pesan, riwayat, template, dan pengaturan disimpan lokal di browser HP kamu
          (localStorage). WAlinkQ tidak punya database, tidak pakai akun, dan tidak mengirim input
          kamu ke server manapun.
        </p>
      </section>

      <section className="mt-5 space-y-2 text-sm">
        <h2 className="text-base font-semibold">Tanpa analytics pihak ketiga</h2>
        <p className="text-muted-foreground">
          Halaman ini tidak memuat Google Analytics, pixel iklan, atau cookie pihak ketiga.
        </p>
      </section>

      <section className="mt-5 space-y-2 text-sm">
        <h2 className="text-base font-semibold">Menghapus data kamu</h2>
        <p className="text-muted-foreground">
          Buka pengaturan browser → hapus data situs untuk domain ini, atau gunakan tombol Hapus /
          Hapus semua di menu Riwayat.
        </p>
      </section>

      <section className="mt-5 space-y-2 text-sm">
        <h2 className="text-base font-semibold">Disclaimer</h2>
        <p className="text-muted-foreground">
          WAlinkQ bukan produk resmi dan tidak berafiliasi dengan WhatsApp Inc. atau Meta.
          WhatsApp adalah merek dagang milik Meta Platforms, Inc.
        </p>
      </section>

      <section className="mt-5 space-y-2 text-sm">
        <h2 className="text-base font-semibold">Roadmap</h2>
        <p className="text-muted-foreground">
          Custom short link (mis. <code>walinkq/toko-budi</code>) dan analytics klik butuh backend
          — belum tersedia. Ada masukan? Hubungi{" "}
          <a
            href="https://x.com/alfindigital"
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @alfindigital
          </a>
          .
        </p>
      </section>

      <section className="mt-5 space-y-2 text-sm">
        <h2 className="text-base font-semibold">Dukung project</h2>
        <p className="text-muted-foreground">
          Kalau merasa terbantu, boleh traktir kopi di{" "}
          <a
            href="https://saweria.co/alfindigital"
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Saweria
          </a>
          . Terima kasih.
        </p>
      </section>

      <p className="mt-10 text-center text-[11px] text-muted-foreground">
        Terakhir diperbarui: 2026-07-03
      </p>
    </div>
  );
}