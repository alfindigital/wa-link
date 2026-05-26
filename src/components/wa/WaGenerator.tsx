import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink, Download, Check, X, Share2 } from "lucide-react";
import { useWaHistory } from "@/hooks/use-wa-history";
import { loadDraft, useWaDraft } from "@/hooks/use-wa-draft";

const MAX_MESSAGE = 1000;
const DIAL = "62";

function cleanPhone(raw: string) {
  let p = raw.replace(/\D/g, "");
  while (p.startsWith("0")) p = p.slice(1);
  if (p.startsWith(DIAL)) p = p.slice(DIAL.length);
  return p;
}

function getPhoneValidationState(raw: string): "empty" | "valid" | "invalid" {
  if (!raw.trim()) return "empty";
  const cleaned = cleanPhone(raw);
  if (cleaned.length >= 6 && cleaned.length <= 14) return "valid";
  return "invalid";
}

export function WaGenerator() {
  const [phone, setPhone] = useState(() => loadDraft()?.phone ?? "");
  const [message, setMessage] = useState(() => loadDraft()?.message ?? "");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; phone: string; message: string } | null>(
    null,
  );
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { add } = useWaHistory();
  const clearDraft = useWaDraft(phone, message, true);

  const charsLeft = MAX_MESSAGE - message.length;
  const phoneState = getPhoneValidationState(phone);

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
    clearDraft();
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function copyText(text: string, label = "Link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Berhasil disalin", {
        description: `${label} sudah tersimpan di papan klip.`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Berhasil disalin", {
          description: `${label} sudah tersimpan di papan klip.`,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
      } catch {
        toast.error("Gagal menyalin", {
          description: "Coba salin manual atau periksa izin browser.",
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        });
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

  async function handleShare() {
    if (!result) return;
    if (navigator.vibrate) navigator.vibrate(40);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Link WhatsApp",
          text: result.message || "Halo!",
          url: result.url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Gagal membagikan");
        }
      }
    } else {
      copyText(result.url, "Link");
    }
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
                <div className="relative flex-1">
                  <Input
                    id="phone"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="81234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`h-12 w-full pr-10 text-base transition-colors ${
                      phoneState === "valid"
                        ? "border-green-500 focus-visible:ring-green-500/40"
                        : phoneState === "invalid"
                          ? "border-destructive focus-visible:ring-destructive/40"
                          : ""
                    }`}
                    aria-invalid={!!error || phoneState === "invalid"}
                  />
                  {phoneState !== "empty" && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                    >
                      {phoneState === "valid" ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-destructive" />
                      )}
                    </span>
                  )}
                </div>
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

            <h3 className="text-sm font-semibold">QR code</h3>

            <div className="flex justify-center rounded-md border border-border bg-background p-4">
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
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <div className="h-[calc(56px+env(safe-area-inset-bottom,0px)+12px)] sm:hidden" />
          <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-xl -translate-x-1/2 sm:hidden">
            <div
              className={`mx-auto mb-1 flex w-fit items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-all duration-300 ${
                copied ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Link disalin
            </div>
            <div className="flex items-center gap-2 border-t border-border/60 bg-background/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 gap-2 text-sm font-semibold"
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(40);
                  copyText(result.url, "Link");
                }}
              >
                <Copy className="h-4 w-4" />
                Salin
              </Button>
              <Button
                type="button"
                className="h-11 flex-1 gap-2 text-sm font-semibold"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Bagikan
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}