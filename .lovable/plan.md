## Rencana Implementasi: Fitur 1, 2, 7, 8

Mengaplikasikan 4 ide improvement sekaligus ke WAlinkQ. Semua pure frontend, data tersimpan di `localStorage`. Tidak ada perubahan backend.

---

### 1. Template Pesan Cepat (Snippets)

**File baru:** `src/hooks/use-wa-templates.ts`

- Hook `useWaTemplates()` yang baca/tulis ke `localStorage` key `wa-link-templates`.
- API: `{ items, add(text), remove(id) }`.
- Seed default saat pertama kali kosong:
  - "Halo, saya mau order"
  - "Apakah masih ready?"
  - "Bisa nego harga?"
  - "Mau tanya soal produknya"

**Perubahan di `src/components/wa/WaGenerator.tsx`:**

- Di atas `<Textarea>` pesan, render baris chip horizontal (`flex flex-wrap gap-1.5`).
- Tiap chip = `Button` kecil `variant="outline" size="sm"` → klik = isi `message` dengan teks template (replace, bukan append). Chip "+" terakhir membuka popover kecil dengan input untuk menambah template custom.
- Tiap chip custom punya tombol "×" mini untuk hapus (hanya untuk yg ditambah user, bukan default).
- Membedakan default vs custom dengan flag `isDefault` di hook.

---

### 2. Nama Kontak & Favorit di Riwayat

**Perubahan di `src/hooks/use-wa-history.ts`:**

- Tambah field opsional `label?: string` dan `favorite?: boolean` di `WaHistoryItem`.
- Tambah method:
  - `setLabel(id, label)` — update label item.
  - `toggleFavorite(id)` — toggle flag favorite.
- Sortir di `read()`: item favorite muncul di atas (preserve recency di dalam grup).
- Tetap dedupe per `url`; saat re-add dari `WaGenerator`, pertahankan `label` & `favorite` dari item lama yang `url`-nya sama.

**Perubahan di `src/routes/index.tsx` (Dialog Riwayat):**

- Tiap item:
  - Render ikon bintang (`Star` dari lucide) kiri sebagai toggle favorite. Filled kuning jika `favorite`.
  - Render `label` di atas nomor sebagai judul kalau ada; nomor pindah jadi baris kedua (font lebih kecil).
  - Tambah tombol pensil (`Pencil`) yang membuka prompt sederhana (`window.prompt`) untuk set/edit label. Cukup minimal — tidak butuh modal nested.
- Import `Star, Pencil` dari lucide.

---

### 7. Preview Card (Simulasi Chat)

**Perubahan di `src/components/wa/WaGenerator.tsx`:**

- Komponen kecil inline `<ChatPreview phone message />` yang dirender **di dalam form**, tepat di bawah `Textarea` pesan, hanya saat `phone` valid ATAU `message` ada isi.
- Tampilan: kartu kecil mirip bubble chat WhatsApp:
  - Header tipis: avatar lingkaran inisial + "+62 812 …" + status hijau "online".
  - Bubble outgoing hijau (`bg-[#dcf8c6] dark:bg-[#005c4b]`) berisi `message` (atau placeholder "Halo!" italic kalau kosong) + jam saat ini + dua centang biru.
  - Background bubble area pakai pola subtle (`bg-muted/40` + radial gradient kecil) supaya menyerupai WA.
- Maksimal tinggi 180px, scrollable jika pesan panjang.
- Hindari hydration mismatch: jam dirender setelah mount (`useEffect` + state, fallback "—:—" saat SSR).

---

### 8. Sound & Haptic Feedback

**File baru:** `src/lib/feedback.ts`

- `vibrate(pattern: number | number[])` — wrap `navigator.vibrate` dengan guard `typeof navigator !== "undefined"` dan toggle preferensi.
- `playBlip(kind: "success" | "copy")` — pakai Web Audio API (oscillator + envelope), tidak butuh file aset. Lazy-init `AudioContext` saat pertama dipakai.
- Preferensi user disimpan di `localStorage`:
  - `wa-pref-sound` (default: off)
  - `wa-pref-haptic` (default: on)
- Export helper `getPrefs() / setPref(key, value)`.

**Perubahan di `src/components/wa/WaGenerator.tsx`:**

- Di `handleGenerate` (setelah sukses set result): `vibrate(40); playBlip("success");`
- Di `copyText` (setelah sukses): `vibrate(20); playBlip("copy");`
- Di `handleDownloadQr`: `vibrate(30);`
- `handleShare` sudah ada `navigator.vibrate(40)` — ganti ke helper agar respek preferensi.

**Toggle preferensi di header (`src/routes/index.tsx`):**

- Tambah DropdownMenu kecil (ikon `Settings2`) di sebelah `ThemeToggle` berisi 2 switch: "Suara" & "Getar". Pakai komponen `Switch` shadcn yg sudah tersedia.

---

### Detail Teknis Tambahan

- Tidak ada package baru — semua pakai `lucide-react`, `Switch`, `Popover`, `DropdownMenu` yang sudah terpasang.
- Semua perubahan styling pakai token semantic dari `src/styles.css`. Warna bubble WhatsApp hijau adalah pengecualian (signature WA), tetap pakai nilai hex inline.
- Aksesibilitas: chip template = `<button type="button">`, toggle favorite `aria-pressed`, preview punya `aria-label="Pratinjau pesan"`.
- Tidak menyentuh logika deteksi prefix, auto-draft, atau QR yang sudah ada.

### Daftar File yang Berubah

- Baru: `src/hooks/use-wa-templates.ts`
- Baru: `src/lib/feedback.ts`
- Edit: `src/hooks/use-wa-history.ts`
- Edit: `src/components/wa/WaGenerator.tsx`
- Edit: `src/routes/index.tsx`
