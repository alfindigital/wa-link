import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink, Download } from "lucide-react";
import { useWaHistory } from "@/hooks/use-wa-history";

const MAX_MESSAGE = 1000;
const DIAL = "62";

function cleanPhone(raw: string) {
  let p = raw.replace(/\D/g, "");
  while (p.startsWith("0")) p = p.slice(1);
  if (p.startsWith(DIAL)) p = p.slice(DIAL.length);
  return p;
}

export function WaGenerator() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; phone: string; message: string } | null>(
    null,
  );
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { add } = useWaHistory();

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
      color: { dark: "#000000", light: "#FFFFFF" },
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
    if (cleaned.length < 6 || cleaned.length > 14) {
      setError("Nomor tidak valid. Masukkan 6–14 digit (tanpa 0 atau 62 di depan).");
      setResult(null);
      return;
    }
    setError(null);
    const fullPhone = `${DIAL}${cleaned}`;
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
      toast.success(`${label} disalin`);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast.success(`${label} disalin`);
      } catch {
        toast.error("Gagal menyalin");
      }
      document.body.removeChild(ta);
    }
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

  return (
    <div className="space-y-5">
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">
                Nomor WhatsApp
              </Label>
              <div className="flex gap-2">
                <div className="flex h-12 shrink-0 items-center justify-center rounded-md border border-input bg-muted px-3 text-sm font-semibold text-foreground">
                  +62
                </div>
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
                Tanpa angka 0 di depan. Contoh: 81234567890.
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
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-base font-semibold"
              disabled={!phone.trim()}
            >
              Buat Link
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card ref={resultRef} className="border-primary/40 bg-primary/5 shadow-sm">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <h2 className="text-sm font-semibold">Link kamu</h2>

            <div className="min-w-0 break-all rounded-md border border-border bg-background px-3 py-2 text-sm">
              {result.url}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => copyText(result.url, "Link")}
                aria-label="Salin link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                asChild
                aria-label="Buka di WhatsApp"
              >
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-background p-4">
              <h3 className="text-sm font-semibold">QR code</h3>
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
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => copyText(result.url, "Link")}
                  aria-label="Salin link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={handleDownloadQr}
                  disabled={!qrDataUrl}
                  aria-label="Unduh QR"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}