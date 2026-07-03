import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Row = { phone: string; message: string; label: string };

function cleanPhone(raw: string) {
  let p = raw.replace(/\D/g, "");
  while (p.startsWith("0")) p = p.slice(1);
  if (p.startsWith("62")) p = p.slice(2);
  return p;
}

function parseCSV(text: string): Row[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const first = lines[0].toLowerCase();
  const hasHeader = first.includes("phone") || first.includes("nomor");
  const dataLines = hasHeader ? lines.slice(1) : lines;
  return dataLines
    .map((line) => {
      // simple CSV split — handles quotes basic
      const cells: string[] = [];
      let cur = "";
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQ && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else inQ = !inQ;
        } else if (c === "," && !inQ) {
          cells.push(cur);
          cur = "";
        } else cur += c;
      }
      cells.push(cur);
      const [phone = "", message = "", label = ""] = cells.map((s) => s.trim());
      return { phone: cleanPhone(phone), message, label };
    })
    .filter((r) => r.phone.length >= 6 && r.phone.length <= 14);
}

export const Route = createFileRoute("/bulk")({
  component: BulkPage,
  head: () => ({
    meta: [
      { title: "Bulk Generate Link WhatsApp — WAlinkQ" },
      {
        name: "description",
        content:
          "Upload CSV daftar nomor, pesan, dan label. Unduh ZIP berisi QR code + daftar link WhatsApp sekaligus.",
      },
    ],
    links: [{ rel: "canonical", href: "https://link-wa.alfindigital.com/bulk" }],
  }),
});

function BulkPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      if (!parsed.length) {
        toast.error("Tidak ada baris valid di CSV.");
        return;
      }
      setRows(parsed);
      toast.success(`${parsed.length} baris siap diproses`);
    } catch {
      toast.error("Gagal membaca CSV.");
    }
  }

  function buildUrl(r: Row) {
    const base = `https://wa.me/62${r.phone}`;
    return r.message ? `${base}?text=${encodeURIComponent(r.message)}` : base;
  }

  async function downloadZip() {
    if (!rows.length) return;
    setBusy(true);
    try {
      const [{ default: JSZip }, { default: QRCode }] = await Promise.all([
        import("jszip"),
        import("qrcode"),
      ]);
      const zip = new JSZip();
      const linksTxt: string[] = ["label,phone,url"];
      for (const r of rows) {
        const url = buildUrl(r);
        const png = await QRCode.toDataURL(url, {
          width: 512,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        const b64 = png.split(",")[1];
        const name = (r.label || `62${r.phone}`).replace(/[^\w-]+/g, "_");
        zip.file(`${name}.png`, b64, { base64: true });
        linksTxt.push(`${r.label},${r.phone},${url}`);
      }
      zip.file("links.csv", linksTxt.join("\n"));
      const blob = await zip.generateAsync({ type: "blob" });
      const dl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dl;
      a.download = "walinkq-bulk.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(dl), 1000);
      toast.success("ZIP siap diunduh");
    } catch {
      toast.error("Gagal membuat ZIP");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
        Bulk <span className="text-primary">Generate</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload CSV dengan kolom <code>phone,message,label</code>. Unduh ZIP berisi QR PNG +
        daftar link.
      </p>

      <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-sm font-medium text-muted-foreground hover:bg-muted/50">
        <Upload className="h-4 w-4" /> Pilih file CSV
        <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
      </label>

      {rows.length > 0 && (
        <>
          <div className="mt-4 max-h-[45vh] overflow-y-auto rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted text-left">
                <tr>
                  <th className="px-2 py-1.5 font-medium">Label</th>
                  <th className="px-2 py-1.5 font-medium">Nomor</th>
                  <th className="px-2 py-1.5 font-medium">Pesan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-2 py-1.5">{r.label || "—"}</td>
                    <td className="px-2 py-1.5 font-mono">+62{r.phone}</td>
                    <td className="max-w-[200px] truncate px-2 py-1.5">{r.message || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            type="button"
            className="mt-4 h-11 w-full gap-2"
            onClick={downloadZip}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Unduh ZIP ({rows.length} QR)
          </Button>
        </>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Contoh baris:
        <br />
        <code className="text-[11px]">phone,message,label</code>
        <br />
        <code className="text-[11px]">081234567890,Halo,Toko Budi</code>
      </p>
    </div>
  );
}