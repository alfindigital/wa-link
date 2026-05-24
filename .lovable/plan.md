## Rencana: Validasi Real-time Input Nomor WhatsApp

### Tujuan
Memberikan feedback visual instan saat pengguna mengetik nomor WhatsApp — border hijau + ikon centang jika valid, border merah + ikon silang jika tidak valid.

### Perubahan pada `src/components/wa/WaGenerator.tsx`

1. **Tambah import ikon**
   - Impor `Check` dan `X` dari `lucide-react`.

2. **Buat fungsi validasi real-time**
   - Fungsi baru `getPhoneValidationState(raw: string): 'empty' | 'valid' | 'invalid'`.
   - `'empty'` → input kosong (tidak menampilkan indikator).
   - `'valid'` → `cleanPhone(raw).length >= 6 && <= 14`.
   - `'invalid'` → sisanya (ada isian tapi tidak memenuhi syarat).

3. **Update tampilan input nomor**
   - Bungkus area input dalam `relative` container untuk menempatkan ikon di dalam kanan input.
   - Border input berubah dinamis:
     - `'valid'` → `border-green-500` (atau token semantic `text-green-500` jika tersedia, fallback Tailwind util).
     - `'invalid'` → `border-destructive`.
   - Ikon di kanan input:
     - `'valid'` → `<Check className="h-5 w-5 text-green-500" />`
     - `'invalid'` → `<X className="h-5 w-5 text-destructive" />`
     - `'empty'` → tidak ada ikon.
   - Ikon diberi animasi subtle (mis. fade-in via transition-opacity) agar tidak patah mata.

4. **Pertahankan perilaku error submit**
   - State `error` tetap dipakai saat tombol "Buat Link" ditekan dan nomor benar-benar invalid.
   - Pesan error submit tetap muncul di bawah input seperti sekarang.
   - Validasi real-time bersifat kosmetik; validasi bisnis tetap di `handleGenerate`.

5. **Aksesibilitas**
   - Ikon diberi `aria-hidden="true"` karena hanya dekoratif.
   - Border berubah warna memberikan isyarat visual; tidak mengganti `aria-invalid` yang tetap diatur pada saat submit.

### Catatan teknis
- Hanya mengubah 1 file: `src/components/wa/WaGenerator.tsx`.
- Tidak memerlukan instalasi package baru (`Check` dan `X` sudah tersedia di `lucide-react`).
- Tidak memengaruhi fitur draft auto-save atau riwayat yang sudah ada.