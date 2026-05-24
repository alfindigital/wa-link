## Ringkasan
Menambahkan auto-save draft (nomor + pesan) ke localStorage supaya tidak hilang saat refresh atau keluar aplikasi.

## Perubahan

### 1. Hook baru: `src/hooks/use-wa-draft.ts`
- Key: `wa-link-draft`
- Simpan: `{ phone: string; message: string; savedAt: number }`
- Debounce 500 ms sebelum write ke localStorage (hindari write tiap keystroke)
- Fungsi: `load()` → baca draft, `save(phone, message)` → debounced write, `clear()` → hapus draft
- Pattern sama seperti `use-wa-history.ts` (read/write safe + event sync jika perlu)

### 2. Modifikasi: `src/components/wa/WaGenerator.tsx`
- Saat mount, panggil `load()`. Kalau ada draft dan tidak ada `result`, isi `phone` dan `message` dari draft.
- `useEffect` debounced (500 ms) saat `phone` atau `message` berubah → panggil `save(phone, message)`.
- Saat `handleGenerate` sukses, panggil `clear()` supaya draft bersih setelah link jadi.
- Saat user mengosongkan kedua field, panggil `clear()`.

### 3. Batasan
- Tidak menyimpan error atau result state — hanya input fields.
- Draft dianggap expired setelah 7 hari (abaikan kalau `savedAt` terlalu lama).
- Tidak mengubah layout, styling, atau flow lain.

## Hasil
User mengetik nomor/pesan → refresh halaman → kembali ke halaman → nomor & pesan masih ada. Setelah klik "Buat Link", draft dihapus otomatis.