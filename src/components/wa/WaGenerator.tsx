import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle2, Share2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Copy,
  ExternalLink,
  Download,
  Check,
  X,
  Pencil,
  Plus,
  Smile,
  Bold,
  Italic,
  Strikethrough,
  User,
  CheckCheck,
  ChevronDown,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWaHistory } from "@/hooks/use-wa-history";
import { loadDraft, useWaDraft } from "@/hooks/use-wa-draft";
import { useWaTemplates } from "@/hooks/use-wa-templates";
import { vibrate, playBlip } from "@/lib/feedback";
import { copyToClipboard } from "@/lib/clipboard";
import { bumpLinkCreated } from "@/lib/stats";
import { shareOrDownloadBrandedQr } from "@/lib/qr-share";

const MAX_MESSAGE = 1000;
const DIAL = "62";

function cleanPhone(raw: string) {
  let p = raw.replace(/\D/g, "");
  while (p.startsWith("0")) p = p.slice(1);
  if (p.startsWith(DIAL)) p = p.slice(DIAL.length);
  return p;
}

function formatPhoneDisplay(digits: string) {
  // Group as 3-4-4-... e.g. 812 3456 7890
  const d = digits.slice(0, 14);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
}

function getPhoneValidationState(raw: string): "empty" | "valid" | "invalid" {
  if (!raw.trim()) return "empty";
  const cleaned = cleanPhone(raw);
  if (cleaned.length >= 6 && cleaned.length <= 14) return "valid";
  return "invalid";
}

function getPhoneErrorMessage(cleaned: string): string | null {
  if (!cleaned) return "Nomor tidak boleh kosong. Masukkan nomor WhatsApp kamu.";
  if (cleaned.length < 6)
    return `Nomor terlalu pendek (${cleaned.length} digit). Minimal 6 digit tanpa awalan 0 atau 62.`;
  if (cleaned.length > 14)
    return `Nomor terlalu panjang (${cleaned.length} digit). Maksimal 14 digit tanpa awalan 0 atau 62.`;
  return null;
}

type DetectedPrefix =
  | { kind: "plus62" }
  | { kind: "62" }
  | { kind: "zero" }
  | { kind: "warning"; reason: string };

// Deteksi awalan secara ketat. Hanya mengenali pola yang benar-benar terlihat
// seperti nomor seluler Indonesia (diawali 8 setelah prefix), agar angka "62"
// atau "0" yang muncul di tengah/tidak diikuti pola seluler tidak salah
// dianggap sebagai prefix.
function detectPrefix(raw: string): DetectedPrefix | null {
  const digitsOnly = raw.replace(/\D/g, "");
  const trimmed = raw.trim();
  if (!digitsOnly) return null;

  // Prefix internasional eksplisit "+62"
  if (trimmed.startsWith("+62")) {
    const rest = digitsOnly.slice(2);
    if (rest.startsWith("8") && rest.length >= 9 && rest.length <= 13) {
      return { kind: "plus62" };
    }
    if (rest.length >= 1) {
      return {
        kind: "warning",
        reason:
          "Awalan +62 terdeteksi, tapi digit setelahnya tidak seperti nomor seluler Indonesia (biasanya diawali 8). Periksa kembali nomornya.",
      };
    }
  }

  // Prefix "62" tanpa "+" — hanya valid jika diikuti "8" dan panjangnya masuk akal
  if (digitsOnly.startsWith("628") && digitsOnly.length >= 11 && digitsOnly.length <= 15) {
    return { kind: "62" };
  }

  // Prefix lokal "0" — harus "08" untuk nomor seluler Indonesia
  if (digitsOnly.startsWith("08") && digitsOnly.length >= 10 && digitsOnly.length <= 14) {
    return { kind: "zero" };
  }
  if (digitsOnly.startsWith("0") && !digitsOnly.startsWith("08") && digitsOnly.length >= 3) {
    return {
      kind: "warning",
      reason:
        "Awalan 0 terdeteksi, tapi nomor seluler Indonesia biasanya dimulai dengan 08. Periksa kembali nomornya.",
    };
  }

  return null;
}

export function WaGenerator({ initialMessage }: { initialMessage?: string } = {}) {
  // IMPORTANT: do NOT read localStorage in useState initializer — it runs
  // during hydration on the client and produces SSR/CSR mismatches when a
  // draft exists. Hydrate empty, then load draft in an effect.
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(initialMessage ?? "");
  const [hydrated, setHydrated] = useState(false);
  const [detected, setDetected] = useState<DetectedPrefix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; phone: string; message: string } | null>(
    null,
  );
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const phoneWarnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { add } = useWaHistory();
  const { items: templates, add: addTemplate, remove: removeTemplate } = useWaTemplates();
  const [newTemplate, setNewTemplate] = useState("");
  const [tplPopOpen, setTplPopOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const cursorPosRef = useRef(0);

  // Load saved draft after mount to avoid hydration mismatch.
  useEffect(() => {
    const d = loadDraft();
    if (d) {
      if (d.phone) setPhone(cleanPhone(d.phone));
      if (d.message && !initialMessage) setMessage(d.message);
    }
    setHydrated(true);
  }, [initialMessage]);

  // Simpan draft otomatis tanpa menghapus setelah generate
  useWaDraft(phone, message, hydrated);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => messageRef.current?.focus(), 400);
  }

  const charsLeft = MAX_MESSAGE - message.length;
  const phoneState = getPhoneValidationState(phone);
  const phoneDisplay = formatPhoneDisplay(phone);

  function handlePhoneChange(raw: string) {
    // Auto-strip: spaces, dashes, parentheses, "+", leading 0, leading 62
    const cleaned = cleanPhone(raw);
    const prefix = detectPrefix(raw);
    if (prefix && cleaned.length > 0) {
      setDetected(prefix);
      if (phoneWarnTimer.current) window.clearTimeout(phoneWarnTimer.current);
      // Warning tetap terlihat sampai pengguna mengubah input; deteksi sukses
      // akan hilang sendiri setelah 2.5 detik.
      if (prefix.kind !== "warning") {
        phoneWarnTimer.current = setTimeout(() => setDetected(null), 2500);
      }
    } else {
      setDetected(null);
      if (phoneWarnTimer.current) window.clearTimeout(phoneWarnTimer.current);
    }
    setPhone(cleaned.slice(0, 14));
    if (error) setError(null);
  }

  function handlePhonePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    handlePhoneChange(text);
  }

  useEffect(() => {
    if (!result) {
      setQrDataUrl(null);
      setQrError(false);
      return;
    }
    let cancelled = false;
    setQrError(false);
    QRCode.toDataURL(result.url, {
      width: 512,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (cancelled) return;
        setQrDataUrl(null);
        setQrError(true);
        toast.error("Gagal membuat QR", {
          description: "Coba ulangi atau salin link manual.",
          icon: <XCircle className="h-4 w-4 text-destructive" />,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [result]);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = cleanPhone(phone);
    const msg = getPhoneErrorMessage(cleaned);
    if (msg) {
      setError(msg);
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
    vibrate(40);
    playBlip("success");
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function copyText(text: string, label = "Link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (result) add(result);
      vibrate(20);
      playBlip("copy");
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
        if (result) add(result);
        vibrate(20);
        playBlip("copy");
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
    vibrate(30);
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `wa-${result.phone}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function wrapSelection(prefix: string, suffix: string) {
    const el = messageRef.current;
    if (!el) return;
    const start = el.selectionStart ?? cursorPosRef.current;
    const end = el.selectionEnd ?? start;
    const selected = message.slice(start, end);
    const inner = selected || "teks";
    const before = message.slice(0, start);
    const after = message.slice(end);
    const next = (before + prefix + inner + suffix + after).slice(0, MAX_MESSAGE);
    setMessage(next);
    const selStart = start + prefix.length;
    const selEnd = selStart + inner.length;
    cursorPosRef.current = selEnd;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
    vibrate(10);
  }

  return (
    <div className="space-y-5">
      <Card ref={formRef} className="border-border/60 shadow-sm">
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
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="81234567890"
                    value={phoneDisplay}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onPaste={handlePhonePaste}
                    maxLength={16}
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
              {detected && (
                <p
                  className={`text-xs font-medium ${
                    detected.kind === "warning"
                      ? "text-amber-600 dark:text-amber-500"
                      : "text-green-600 dark:text-green-500"
                  }`}
                  role={detected.kind === "warning" ? "alert" : "status"}
                  aria-live="polite"
                >
                  {detected.kind === "plus62"
                    ? "Awalan +62 terdeteksi dan otomatis diubah ke format wa.me."
                    : detected.kind === "62"
                      ? "Awalan 62 terdeteksi dan otomatis diubah ke format wa.me."
                      : detected.kind === "zero"
                        ? "Awalan 0 terdeteksi dan otomatis diubah ke format internasional."
                        : detected.reason}
                </p>
              )}
              {phoneState === "invalid" && (
                <p className="text-xs font-medium text-destructive" role="alert" aria-live="polite">
                  {getPhoneErrorMessage(cleanPhone(phone))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message" className="text-sm font-semibold">
                  Pesan <span className="font-normal text-muted-foreground">(opsional)</span>
                </Label>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs ${
                      charsLeft < 0 ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {charsLeft}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((t) => (
                  <span key={t.id} className="group inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMessage(t.text.slice(0, MAX_MESSAGE));
                        vibrate(15);
                      }}
                      className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted"
                    >
                      {t.text}
                    </button>
                    {!t.isDefault && (
                      <button
                        type="button"
                        onClick={() => removeTemplate(t.id)}
                        aria-label={`Hapus template ${t.text}`}
                        className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
                <Popover open={tplPopOpen} onOpenChange={setTplPopOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Tambah template pesan"
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                      Tambah
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 space-y-2" align="start">
                    <p className="text-xs font-medium">Template baru</p>
                    <Input
                      value={newTemplate}
                      onChange={(e) => setNewTemplate(e.target.value)}
                      placeholder="Tulis pesan template..."
                      className="h-9 text-sm"
                      maxLength={120}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        addTemplate(newTemplate);
                        setNewTemplate("");
                        setTplPopOpen(false);
                      }}
                      disabled={!newTemplate.trim()}
                    >
                      Simpan
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
                <Textarea
                  ref={messageRef}
                  id="message"
                  placeholder="Halo, saya mau tanya soal produknya"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value.slice(0, MAX_MESSAGE));
                    cursorPosRef.current = e.target.selectionStart;
                  }}
                  onKeyUp={(e) => {
                    cursorPosRef.current = (e.target as HTMLTextAreaElement).selectionStart;
                  }}
                  onClick={(e) => {
                    cursorPosRef.current = (e.target as HTMLTextAreaElement).selectionStart;
                  }}
                  rows={4}
                  className="resize-none rounded-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center gap-0.5 border-t border-border bg-muted/40 px-1.5 py-1">
                  <button
                    type="button"
                    aria-label="Tebal"
                    title="Tebal (*teks*)"
                    onClick={() => wrapSelection("*", "*")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted"
                  >
                    <Bold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Miring"
                    title="Miring (_teks_)"
                    onClick={() => wrapSelection("_", "_")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted"
                  >
                    <Italic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Coret"
                    title="Coret (~teks~)"
                    onClick={() => wrapSelection("~", "~")}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </button>
                  <span className="mx-1 h-5 w-px bg-border" />
                  <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Tambah emoji"
                        title="Tambah emoji"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto min-w-[14rem] max-w-[min(20rem,calc(100vw-1.5rem))] p-1.5 sm:min-w-[16rem] sm:p-2"
                      align="start"
                      side="top"
                      sideOffset={8}
                      collisionPadding={8}
                    >
                      <EmojiGrid
                        onSelect={(emoji) => {
                          const el = messageRef.current;
                          if (!el) return;
                          const pos = cursorPosRef.current;
                          const before = message.slice(0, pos);
                          const after = message.slice(pos);
                          const next = (before + emoji + after).slice(0, MAX_MESSAGE);
                          setMessage(next);
                          const newPos = pos + emoji.length;
                          cursorPosRef.current = newPos;
                          requestAnimationFrame(() => {
                            el.focus();
                            el.setSelectionRange(newPos, newPos);
                          });
                          setEmojiOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {(phoneState === "valid" || message.trim().length > 0) && (
                <ChatPreview phone={phone} message={message} />
              )}
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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Link kamu</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={scrollToForm}
              >
                <Pencil className="h-3.5 w-3.5" />
                Ubah Pesan
              </Button>
            </div>

            <div className="min-w-0 break-all rounded-md border border-border bg-background px-3 py-2 text-sm">
              {result.url}
            </div>

            <div className="rounded-md border border-border bg-background px-3 py-2 text-sm">
              <div className="text-xs font-medium text-muted-foreground">Nomor tujuan</div>
              <div className="font-mono tabular-nums">
                +{DIAL}{" "}
                {formatPhoneDisplay(
                  result.phone.startsWith(DIAL) ? result.phone.slice(DIAL.length) : result.phone,
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                className="h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => copyText(result.url, "Link")}
                aria-label="Salin link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                className="h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
                aria-label="Buka di WhatsApp"
              >
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setQrOpen((v) => !v)}
              aria-expanded={qrOpen}
              className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <span>QR code</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${qrOpen ? "rotate-180" : ""}`}
              />
            </button>

            {qrOpen && (
              <>
                <div className="flex justify-center rounded-md border border-border bg-background p-4">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR code link WhatsApp"
                      className="h-56 w-56 rounded-md"
                      width={224}
                      height={224}
                    />
                  ) : qrError ? (
                    <div className="flex h-56 w-56 flex-col items-center justify-center gap-2 rounded-md bg-muted/40 px-3 text-center text-xs text-muted-foreground">
                      <XCircle className="h-6 w-6 text-destructive" />
                      QR gagal dibuat. Coba lagi.
                    </div>
                  ) : (
                    <div className="h-56 w-56 animate-pulse rounded-md bg-muted" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    className="h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => copyText(result.url, "Link")}
                    aria-label="Salin link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    className="h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleDownloadQr}
                    disabled={!qrDataUrl}
                    aria-label="Unduh QR"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {result && copied && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm sm:hidden">
          Link disalin
        </div>
      )}
    </div>
  );
}

type EmojiItem = { e: string; k: string };
const EMOJI_LIST: EmojiItem[] = [
  { e: "😀", k: "senyum smile happy senang grin" },
  { e: "😂", k: "tawa laugh joy lucu ngakak" },
  { e: "🥰", k: "cinta love sayang smiling hearts" },
  { e: "😍", k: "cinta love mata hati kagum" },
  { e: "🤔", k: "mikir think bingung" },
  { e: "😢", k: "sedih cry nangis tear" },
  { e: "😡", k: "marah angry kesal" },
  { e: "👍", k: "jempol thumbs up oke bagus like" },
  { e: "👎", k: "jempol bawah thumbs down tidak" },
  { e: "🙏", k: "terima kasih makasih doa pray thanks" },
  { e: "🔥", k: "api fire keren hot" },
  { e: "❤️", k: "hati love cinta merah heart" },
  { e: "💯", k: "seratus 100 mantap" },
  { e: "✅", k: "ceklis check ok benar done" },
  { e: "❌", k: "silang salah cross no" },
  { e: "⭐", k: "bintang star favorit" },
  { e: "🎉", k: "pesta party tada selamat" },
  { e: "🎁", k: "hadiah gift kado" },
  { e: "🚀", k: "roket rocket cepat launch" },
  { e: "💡", k: "lampu idea ide bohlam" },
  { e: "😊", k: "senyum blush ramah" },
  { e: "😅", k: "ketawa keringat awkward" },
  { e: "🤗", k: "peluk hug pelukan" },
  { e: "😴", k: "tidur sleep ngantuk" },
  { e: "😭", k: "nangis cry sedih sob" },
  { e: "😤", k: "kesal huff frustasi" },
  { e: "🤝", k: "salaman handshake deal" },
  { e: "👏", k: "tepuk tangan clap applause" },
  { e: "💪", k: "kuat strong otot semangat" },
  { e: "🙌", k: "angkat tangan raised hands hore" },
  { e: "😋", k: "enak yummy lapar" },
  { e: "😎", k: "keren cool kacamata" },
  { e: "🤓", k: "nerd kutu buku" },
  { e: "🥳", k: "pesta ulang tahun party hat" },
  { e: "😱", k: "kaget shocked teriak" },
  { e: "😬", k: "grimace meringis canggung" },
  { e: "👋", k: "halo hi dadah wave" },
  { e: "✌️", k: "peace damai victory" },
  { e: "🤞", k: "jari silang fingers crossed harap" },
  { e: "🫡", k: "hormat salute siap" },
  { e: "🤣", k: "ngakak rofl ketawa guling" },
  { e: "🙃", k: "terbalik upside down" },
  { e: "😉", k: "kedip wink" },
  { e: "🥺", k: "memohon pleading sedih" },
  { e: "😇", k: "malaikat angel polos" },
  { e: "🤭", k: "tutup mulut giggle" },
  { e: "🤷", k: "bingung shrug tidak tahu" },
  { e: "👌", k: "ok oke" },
  { e: "👆", k: "tunjuk atas point up" },
  { e: "🫶", k: "hati tangan heart hands love" },
];

const RECENT_KEY = "wa-emoji-recent";
const MAX_RECENT = 16;

function loadRecentEmojis(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function EmojiGrid({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [tab, setTab] = useState<"recent" | "all">(() =>
    loadRecentEmojis().length > 0 ? "recent" : "all",
  );
  const [recent, setRecent] = useState<string[]>(() => loadRecentEmojis());
  const [query, setQuery] = useState("");

  const handlePick = (emoji: string) => {
    onSelect(emoji);
    setRecent((prev) => {
      const next = [emoji, ...prev.filter((x) => x !== emoji)].slice(0, MAX_RECENT);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? EMOJI_LIST.filter((it) => it.e.includes(q) || it.k.toLowerCase().includes(q))
    : null;

  const renderGrid = (items: string[], emptyMsg: string) => {
    if (items.length === 0) {
      return <p className="px-1 py-4 text-center text-xs text-muted-foreground">{emptyMsg}</p>;
    }
    return (
      <div className="grid grid-cols-8 gap-0.5 sm:grid-cols-10 sm:gap-1">
        {items.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            type="button"
            onClick={() => handlePick(emoji)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-base transition-colors hover:bg-muted sm:h-8 sm:w-8 sm:text-lg"
            aria-label={`Insert emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari emoji…"
        aria-label="Cari emoji"
        className="h-8 text-xs"
      />
      {filtered ? (
        renderGrid(
          filtered.map((it) => it.e),
          "Tidak ada emoji yang cocok.",
        )
      ) : (
        <>
          <div className="flex gap-1 border-b border-border" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "recent"}
              onClick={() => setTab("recent")}
              className={`flex-1 rounded-t-md px-2 py-1 text-xs font-medium transition-colors ${
                tab === "recent"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Terakhir
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "all"}
              onClick={() => setTab("all")}
              className={`flex-1 rounded-t-md px-2 py-1 text-xs font-medium transition-colors ${
                tab === "all"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua
            </button>
          </div>
          {tab === "recent"
            ? renderGrid(recent, "Belum ada emoji yang dipakai.")
            : renderGrid(
                EMOJI_LIST.map((it) => it.e),
                "",
              )}
        </>
      )}
    </div>
  );
}

function ChatPreview({ phone, message }: { phone: string; message: string }) {
  const [time, setTime] = useState<string>("—:—");
  useEffect(() => {
    const t = new Date();
    setTime(`${String(t.getHours()).padStart(2, "0")}.${String(t.getMinutes()).padStart(2, "0")}`);
  }, [message]);
  const display = phone ? `+62 ${formatPhoneDisplay(phone)}` : "+62 ...";
  const text = message.trim();
  return (
    <div
      aria-label="Pratinjau pesan"
      className="overflow-hidden rounded-lg border border-border bg-background"
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2">
        <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
          <User className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">{display}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">online</p>
        </div>
      </div>
      <div
        className="relative max-h-[180px] overflow-y-auto px-3 py-3"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, hsl(var(--muted-foreground)/0.05) 0, transparent 40%), radial-gradient(circle at 80% 80%, hsl(var(--muted-foreground)/0.05) 0, transparent 40%)",
        }}
      >
        <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-[#dcf8c6] px-2.5 py-1.5 text-[13px] text-[#111b21] shadow-sm dark:bg-[#005c4b] dark:text-[#e9edef]">
          {text ? (
            <p className="whitespace-pre-wrap break-words">{text}</p>
          ) : (
            <p className="italic opacity-60">Halo!</p>
          )}
          <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] opacity-70">
            <span>{time}</span>
            <CheckCheck className="h-3 w-3 text-sky-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
