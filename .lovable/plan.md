
Implementasi semua ide audit (55 item) dalam 4 batch berurutan. Semua di client-side, tanpa backend baru. Domain tetap `link-wa.alfindigital.com`.

## Batch 1 — Critical + Quick Wins P1 (fondasi)

**File baru:**
- `src/lib/clipboard.ts` — `copyToClipboard()` dengan fallback `execCommand`.
- `src/lib/history-storage.ts` — cap 100 entri, drop non-favorit dulu, wrap dengan Zod schema (menggabungkan #4 + #53).
- `src/components/wa/EditLabelDialog.tsx` — dialog input pengganti `window.prompt` (#2).
- `src/components/wa/CoachMark.tsx` — 3-step tooltip first-visit, flag `walinkq:coach-done` (#24).
- `src/routes/privasi.tsx` — halaman statis Privasi + disclaimer WhatsApp (#39 + #41).

**File diedit:**
- `src/components/wa/WaGenerator.tsx`:
  - Nama file QR: `walinkq-<phone>.png` (#1)
  - Semua copy → `copyToClipboard()` (#3)
  - Bungkus input dalam `<form onSubmit>` + `enterKeyHint="go"` (#13)
  - Auto-scroll `resultRef.scrollIntoView` setelah generate (#12)
  - Tombol besar hijau "Buka di WhatsApp" di bawah input (#14)
  - Debounce generate 300ms + `toast.success({id:"gen"})` dedupe (#6)
  - QR container: skeleton "Isi nomor dulu" saat kosong (#10)
  - Support `{nama}`, `{produk}` di template — prompt via Dialog kalau ada placeholder (#20)
- `src/hooks/use-wa-history.ts` → pakai `history-storage.ts` (cap + Zod).
- `src/routes/index.tsx`:
  - Header: tombol jadi 36px, Riwayat+Cara pakai ke dropdown "menu" tunggal di 360px (#7)
  - Footer: `flex-nowrap gap-1.5`, tap target `p-2` (#8 + #35), link `/privasi`
  - Ganti `window.prompt` label pakai `EditLabelDialog` (#2)
  - Undo toast setelah delete/clear riwayat (#16)
  - Mount `<CoachMark />` (#24)
- `src/routes/__root.tsx`:
  - Theme script: tambah `matchMedia('prefers-color-scheme')` listener saat `theme` belum di-set manual (#5)
  - `body` tambah `pb-[env(safe-area-inset-bottom)]` (#37)

## Batch 2 — Performance + Mobile polish

- Lazy import `qrcode` di dalam handler generate QR (#31)
- `React.lazy` untuk `ChatPreview` + `EmojiPicker` dengan Suspense skeleton (#32)
- `__root.tsx` head: swap font link Archivo ke `&text=WAlinkQ` subset weight 900 (#33)
- `WaGenerator`: `useVisualViewport` hook → toggle `position:static` untuk header saat keyboard aktif (#36)
- `EmojiPicker`: `w-[min(320px,92vw)]` (#38)
- Placeholder nomor + caption "Contoh: 812-3456-7890 (tanpa 0)" (#25)
- Template chip: `title=` attribute + long-press (touch) reveal preview via Popover (#15)
- `ChatPreview`: tambah "online", timestamp, double blue check (#23)
- Style dark: `--input` border kontras naikkan ke ~4:1 (#11)
- History row: pindah Edit/Delete ke `DropdownMenu` overflow (#9)

## Batch 3 — Data, Trust, Retensi, Growth (P1)

- `src/lib/history-io.ts`: `exportJSON`, `exportCSV`, `importJSON` (validasi Zod). UI: tombol di dialog Riwayat (#27 + #28)
- `src/lib/qr-share.ts`: render canvas 1080×1080 (QR + brand `walinkq.com` + nomor), `navigator.share({files})` fallback download (#48)
- Toggle "Sertakan watermark WAlinkQ" saat unduh QR (#49)
- `src/lib/stats.ts`: counter `links_created` per bulan di localStorage; tampilkan chip "Kamu buat X link bulan ini" di header dialog Riwayat (#47)
- PWA installable (manifest-only per skill PWA — tanpa service worker):
  - `public/manifest.webmanifest` (name, short_name WAlinkQ, theme #25D366, display standalone, ikon 192/512)
  - `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` via imagegen
  - Meta di `__root.tsx`: `manifest`, `theme-color`, `apple-touch-icon` (#45)
- Timing: "Cara pakai" auto-open kalau form kosong 10 detik + belum pernah dibuka (#26)

## Batch 4 — Fitur core + Monetisasi + SEO + Teknis

- **QR logo center** (#21): input file upload di section QR, canvas overlay logo ke tengah (max 20% area). Simpan dataURL logo di localStorage.
- **QR warna custom + frame "Scan me"** (#22): color picker + checkbox frame.
- **Bulk generate CSV** (#18): route `/bulk` — upload CSV `phone,message,label`, preview tabel, tombol "Unduh ZIP QR" via `jszip`.
- **Multi-nomor round-robin** (#19): route `/rotasi` — config n nomor + weight, generate hash-based link `/r#<id>`, page `/r` client-side pick random → redirect wa.me.
- **Custom short link** (#17): tandai "Roadmap — butuh domain" di halaman `/privasi`, tidak diimplementasi (butuh backend).
- **Sync via URL hash** (#30): tombol "Salin preset" encode `{phone,msg}` base64 ke `#p=…`, parse di mount.
- **CTA Pro** (#42): footer strip subtle "Perlu link custom + analytics? Hubungi alfindigital" link mailto/WA.
- **Donasi Traktir kopi** (#44): link Saweria di `/privasi`.
- **Affiliate banner** (#43): satu slot subtle di bawah result card, hardcoded config array kosong dulu (siap diisi).
- **SEO landing per use-case** (#50): route `/link-wa-jualan` + `/link-wa-cs` dengan H1 unik, template pre-filled, canonical + sitemap update.
- **OG image dinamis** (#51): server route `src/routes/api/og.ts` render PNG via `@vercel/og` compatible di Cloudflare Workers (satori + resvg-wasm). Kalau bundle size problem, fallback ke static OG.
- **Playwright E2E** (#52): `tests/generate.spec.ts` — buka `/`, isi nomor, submit, verifikasi wa.me link + copy toast.
- **Error boundary** (#54): tambah `errorComponent` di `/` + `__root.tsx` sudah `defaultErrorComponent`.
- **Reduce bundle** (#55): jalankan `bun run build`, verifikasi lucide tree-shaken (no action bila OK).

## Technical notes

- Push notification (#46) sengaja di-skip (butuh backend + FCM), sudah dicatat di trade-off audit.
- Custom short link (#17) tetap roadmap, tidak dibangun sekarang.
- Semua state persist pakai localStorage dengan try/catch + Zod parse; migrasi lama tetap dibaca.
- Ikon PWA di-generate via imagegen (transparent PNG WA green logo abstract "WQ").
- Tidak menambah dependency berat: `jszip`, `@vercel/og`+satori butuh cek Worker compat — kalau gagal build, bulk ZIP downgrade ke sekuensial download PNG, OG dinamis downgrade ke static.

## Checklist eksekusi

1. Batch 1 → build + smoke test manual
2. Batch 2 → verifikasi bundle size turun (`bun run build`)
3. Batch 3 → test PWA install di HP + export/import roundtrip
4. Batch 4 → Playwright hijau + preview semua route baru

Konfirmasi untuk mulai eksekusi Batch 1.
