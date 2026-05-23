## Tujuan
Tool 1 halaman untuk membuat link WhatsApp (`https://wa.me/<no>?text=<pesan>`) + QR code, dalam Bahasa Indonesia, mobile-first, tanpa login, tanpa paywall. Target: orang Indonesia (termasuk pengguna desa) — harus cepat, ringan, dan sangat sederhana.

## Halaman
Single page (`/`), tidak perlu routing tambahan. Konten penting di atas fold mobile.

## Struktur halaman (urut dari atas)
1. **Header tipis** — logo teks "WA Link ID" + tagline pendek "Buat link WhatsApp gratis".
2. **Form generator** (kartu utama):
   - Input nomor WA dengan dropdown kode negara, default **🇮🇩 +62**. Otomatis bersihkan `0` di depan, spasi, strip.
   - Textarea "Pesan (opsional)" — placeholder contoh: *"Halo, saya mau tanya soal produknya"*. Counter karakter.
   - Tombol besar hijau WhatsApp: **"Buat Link Saya"**.
3. **Hasil** (muncul setelah generate, scroll otomatis ke sini di mobile):
   - Link `wa.me/...` dalam kotak + tombol **Salin** (toast "Tersalin!").
   - Tombol **Buka WhatsApp** (membuka link di tab baru untuk test).
   - Tombol **Bagikan** (Web Share API jika tersedia, fallback ke salin).
   - **QR Code** tampil otomatis di bawah + tombol **Unduh QR (PNG)**.
4. **Riwayat** (collapsible, di bawah hasil):
   - Daftar 10 link terakhir dari `localStorage`: nomor (disamarkan sebagian) + preview pesan + tombol Salin / Hapus.
   - Tombol "Hapus semua".
5. **Footer pendek** — penjelasan singkat 3 langkah ("1. Masukkan nomor → 2. Tulis pesan → 3. Salin link"), catatan privasi ("Semua data hanya di perangkat Anda, tidak dikirim ke server"), tanpa link gating.

## Validasi & UX
- Nomor: hanya digit, panjang 6–15. Tampilkan pesan error inline Bahasa Indonesia ("Nomor tidak valid").
- Pesan: maks 1000 karakter (batas aman URL WhatsApp).
- Encode pesan dengan `encodeURIComponent`.
- Tombol Salin pakai `navigator.clipboard` dengan fallback `execCommand`.
- Semua label, error, tooltip dalam Bahasa Indonesia.
- Form tetap terisi setelah generate (tidak reset) supaya mudah diedit.

## Desain
- Mobile-first, container max-w-md di mobile, max-w-2xl di desktop.
- Warna utama: hijau WhatsApp (`#25D366`) sebagai `--primary`, hijau gelap (`#128C7E`) untuk hover. Background putih bersih, teks gelap, radius lembut. Definisikan token di `src/styles.css` (oklch).
- Tombol primer besar (min 48px tinggi) untuk jempol di HP.
- Font sistem (san-serif default) — tanpa import font eksternal demi kecepatan.
- Tanpa animasi berat, tanpa gambar hero — fokus speed.

## SEO
- `<title>`: "WA Link — Buat Link WhatsApp Gratis (Indonesia)"
- Meta description Bahasa Indonesia, OG tags, lang="id".
- Satu H1: "Buat Link WhatsApp Gratis".

## Detail teknis
- Route tunggal `src/routes/index.tsx` (ganti placeholder).
- Komponen: `WaGeneratorForm`, `WaResult`, `QrDisplay`, `HistoryList` di `src/components/wa/`.
- QR pakai library ringan `qrcode` (render ke `<canvas>` → PNG via `toDataURL`). Tambah via `bun add qrcode @types/qrcode`.
- Riwayat: hook `useHistory` membungkus `localStorage` key `wa-link-history` (array, batas 10, simpan timestamp + nomor + pesan).
- Tanpa backend, tanpa Lovable Cloud — semua client-side.
- Pakai komponen shadcn yang sudah ada: `Button`, `Input`, `Textarea`, `Card`, `Select` (kode negara), `Sonner` (toast).

## Di luar scope v1
- Template pesan siap pakai.
- Short link (perlu backend).
- Multi bahasa / toggle EN.
- QR SVG, custom warna QR, logo di tengah QR.
- Login, analytics, ads.
