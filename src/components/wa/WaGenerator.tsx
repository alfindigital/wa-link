import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, ExternalLink, Share2, Download, Trash2, History } from "lucide-react";
import { useWaHistory } from "@/hooks/use-wa-history";

const COUNTRIES: { code: string; dial: string; flag: string; name: string }[] = [
  { code: "ID", dial: "62", flag: "🇮🇩", name: "Indonesia" },
  { code: "MY", dial: "60", flag: "🇲🇾", name: "Malaysia" },
  { code: "SG", dial: "65", flag: "🇸🇬", name: "Singapura" },
  { code: "US", dial: "1", flag: "🇺🇸", name: "Amerika Serikat" },
  { code: "GB", dial: "44", flag: "🇬🇧", name: "Inggris" },
  { code: "AU", dial: "61", flag: "🇦🇺", name: "Australia" },
  { code: "IN", dial: "91", flag: "🇮🇳", name: "India" },
  { code: "PH", dial: "63", flag: "🇵🇭", name: "Filipina" },
  { code: "TH", dial: "66", flag: "🇹🇭", name: "Thailand" },
  { code: "VN", dial: "84", flag: "🇻🇳", name: "Vietnam" },
  { code: "SA", dial: "966", flag: "🇸🇦", name: "Arab Saudi" },
  { code: "AE", dial: "971", flag: "🇦🇪", name: "Uni Emirat Arab" },
];

const MAX_MESSAGE = 1000;

function cleanPhone(raw: string) {
  let p = raw.replace(/\D/g, "");
  // strip leading zero (common in ID)
  while (p.startsWith("0")) p = p.slice(1);
  return p;
}

function maskPhone(full: string) {
  if (full.length <= 6) return full;
  return full.slice(0, 3) + "•".repeat(full.length - 6) + full.slice(-3);
}

export function WaGenerator() {
  const [dial, setDial] = useState("62");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; phone: string; message: string } | null>(
    null,
  );
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { items, add, remove, clear } = useWaHistory();

  const charsLeft = MAX_MESSAGE - message.length;

  useEffect(() => {
    if (!result) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(result.url, {
      width: 512,
      margin: 2,
      color: { dark: "#128C7E", light: "#FFFFFF" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [result]);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = cleanPhone(phone);
    if (cleaned.length < 6 || cleaned.length > 15) {
      setError("Nomor tidak valid. Masukkan 6–15 digit (tanpa kode negara).");
      setResult(null);
      return;
    }
    setError(null);
    const fullPhone = `${dial}${cleaned}`;
    const trimmed = message.trim();
    const url = trimmed
      ? `https://wa.me/${fullPhone}?text=${encodeURIComponent(trimmed)}`
      : `https://wa.me/${fullPhone}`;
    const next = { url, phone: fullPhone, message: trimmed };
    setResult(next);
    add(next);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function copyText(text: string, label = "Link") {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} berhasil disalin`);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast.success(`${label} berhasil disalin`);
      } catch {
        toast.error("Gagal menyalin, coba salin manual");
      }
      document.body.removeChild(ta);
    }
  }

  async function handleShare() {
    if (!result) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Hubungi saya di WhatsApp",
          text: "Klik link berikut untuk chat di WhatsApp:",
          url: result.url,
        });
        return;
      } catch {
        // user cancelled or share failed → fallback
      }
    }
    copyText(result.url, "Link");
  }

  function handleDownloadQr() {
    if (!qrDataUrl || !result) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `wa-${result.phone}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.dial === dial) ?? COUNTRIES[0],
    [dial],
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">
                Nomor WhatsApp
              </Label>
              <div className="flex gap-2">
                <Select value={dial} onValueChange={setDial}>
                  <SelectTrigger className="h-12 w-[120px] shrink-0" aria-label="Kode negara">
                    <SelectValue>
                      <span className="flex items-center gap-1">
                        <span aria-hidden>{selectedCountry.flag}</span>
                        <span>+{selectedCountry.dial}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.dial}>
                        <span className="flex items-center gap-2">
                          <span aria-hidden>{c.flag}</span>
                          <span>+{c.dial}</span>
                          <span className="text-muted-foreground">{c.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="81234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 flex-1 text-base"
                  aria-invalid={!!error}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Contoh: 81234567890 (tanpa angka 0 di depan).
              </p>
              {error && (
                <p className="text-xs font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message" className="text-sm font-semibold">
                  Pesan <span className="font-normal text-muted-foreground">(opsional)</span>
                </Label>
                <span
                  className={`text-xs ${
                    charsLeft < 0 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {charsLeft}
                </span>
              </div>
              <Textarea
                id="message"
                placeholder="Halo, saya mau tanya soal produknya"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                rows={4}
                className="resize-none text-base"
              />
              <p className="text-xs text-muted-foreground">
                Pesan ini akan muncul otomatis saat orang membuka link.
              </p>
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-base font-semibold"
              disabled={!phone.trim()}
            >
              Buat Link Saya
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card
          ref={resultRef}
          className="border-primary/30 bg-primary/5 shadow-sm"
        >
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div>
              <h2 className="text-base font-semibold">Link WhatsApp kamu siap 🎉</h2>
              <p className="text-xs text-muted-foreground">
                Salin link di bawah, tempel di bio Instagram, status, atau pesan.
              </p>
            </div>

            <div className="flex items-stretch gap-2">
              <div className="flex-1 min-w-0 rounded-md border border-border bg-background px-3 py-2 text-sm break-all">
                {result.url}
              </div>
              <Button
                type="button"
                size="icon"
                className="h-auto shrink-0"
                onClick={() => copyText(result.url, "Link")}
                aria-label="Salin link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => copyText(result.url, "Link")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Salin
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Bagikan
              </Button>
              <Button
                type="button"
                variant="outline"
                className="col-span-2 h-11"
                asChild
              >
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buka di WhatsApp
                </a>
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">QR Code</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadQr}
                  disabled={!qrDataUrl}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Unduh PNG
                </Button>
              </div>
              <div className="flex justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR code link WhatsApp"
                    className="h-56 w-56 rounded-md"
                    width={224}
                    height={224}
                  />
                ) : (
                  <div className="h-56 w-56 animate-pulse rounded-md bg-muted" />
                )}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Scan dengan kamera HP untuk langsung chat.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <History className="h-4 w-4" />
                Riwayat ({items.length})
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={clear}>
                Hapus semua
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">+{maskPhone(it.phone)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {it.message || <span className="italic">Tanpa pesan</span>}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => copyText(it.url, "Link")}
                    aria-label="Salin link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(it.id)}
                    aria-label="Hapus dari riwayat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
