import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  History,
  HelpCircle,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Star,
  Pencil,
  Settings,
  Moon,
  Volume2,
  Vibrate,
  Download,
  Upload,
  Phone,
  MessageSquare,
  Link2,
  FileJson,
  FileSpreadsheet,
  Edit3,
  Search,
  X,
} from "lucide-react";
import { WaGenerator } from "@/components/wa/WaGenerator";
import { SwipeToDelete } from "@/components/wa/SwipeToDelete";
import { EditLabelDialog } from "@/components/wa/EditLabelDialog";
import { SiteFooter } from "@/components/layout/SiteFooter";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useWaHistory } from "@/hooks/use-wa-history";
import { toast } from "sonner";
import { getPrefs, setPref } from "@/lib/feedback";
import { copyToClipboard } from "@/lib/clipboard";
import { exportHistoryCSV, exportHistoryJSON, importHistoryJSON } from "@/lib/history-io";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Link WhatsApp Gratis + QR Code — WAlinkQ" },
      {
        name: "description",
        content:
          "Bikin link WhatsApp (wa.me) dengan pesan otomatis dan QR code, gratis dan tanpa daftar. Cocok untuk jualan online dan bio Instagram/TikTok.",
      },
      { property: "og:title", content: "Link WhatsApp Gratis + QR Code — WAlinkQ" },
      {
        property: "og:description",
        content: "Buat link WhatsApp dengan pesan siap kirim + QR code. Gratis dan tanpa login.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://link-wa.alfindigital.com/" },
    ],
    links: [{ rel: "canonical", href: "https://link-wa.alfindigital.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "WAlinkQ",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          inLanguage: "id-ID",
          url: "https://link-wa.alfindigital.com/",
          offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
        }),
      },
    ],
  }),
});

function Index() {
  const [howOpen, setHowOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const { items, remove, clear, setLabel, toggleFavorite, replaceAll } = useWaHistory();
  const [sound, setSound] = useState(false);
  const [haptic, setHaptic] = useState(false);
  const [dark, setDark] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyQuery, setHistoryQuery] = useState("");

  useEffect(() => {
    const p = getPrefs();
    setSound(p.sound);
    setHaptic(p.haptic);
    if (typeof document !== "undefined") {
      setDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const editingItem = items.find((it) => it.id === editingId) ?? null;

  const filteredItems = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.url.toLowerCase().includes(q) ||
        it.phone.includes(q) ||
        (it.message && it.message.toLowerCase().includes(q)) ||
        (it.label && it.label.toLowerCase().includes(q)),
    );
  }, [items, historyQuery]);

  function toggleDark(v: boolean) {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    try {
      window.localStorage.setItem("theme", v ? "dark" : "light");
    } catch {
      // ignore
    }
  }

  async function copyText(text: string) {
    const ok = await copyToClipboard(text);
    if (ok) {
      toast.success("Link disalin", {
        id: "hist-copy",
        description: "Link sudah tersimpan di papan klip.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        action: {
          label: "Salin ulang",
          onClick: () => copyText(text),
        },
        duration: 5000,
      });
    } else {
      toast.error("Gagal menyalin link", {
        id: "hist-copy",
        description: "Coba salin manual dari daftar riwayat atau periksa izin browser.",
        icon: <XCircle className="h-4 w-4 text-destructive" />,
        action: {
          label: "Coba lagi",
          onClick: () => copyText(text),
        },
      });
    }
  }

  function handleRemove(id: string) {
    const snap = items;
    remove(id);
    toast("Dihapus dari riwayat", {
      id: `undo-${id}`,
      action: {
        label: "Undo",
        onClick: () => replaceAll(snap),
      },
      duration: 5000,
    });
  }

  function handleClearAll() {
    const snap = items;
    clear();
    toast("Semua riwayat dihapus", {
      id: "undo-clear",
      action: {
        label: "Undo",
        onClick: () => replaceAll(snap),
      },
      duration: 6000,
    });
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = await importHistoryJSON(file);
      if (!parsed.length) {
        toast.error("Tidak ada entri valid di file itu");
        return;
      }
      // Merge with existing, dedupe by url, cap kept by hook.
      const merged = [...parsed, ...items].filter(
        (it, idx, arr) => arr.findIndex((x) => x.url === it.url) === idx,
      );
      replaceAll(merged);
      toast.success(`Berhasil import ${parsed.length} entri`);
    } catch {
      toast.error("File tidak bisa dibaca. Pastikan file .json dari WAlinkQ.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-primary/20 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
          <h1 className="font-display text-2xl font-black uppercase tracking-tight sm:text-[28px]">
            <span className="text-primary">WA</span>link<span className="text-primary">Q</span>
            <span className="sr-only"> — Bikin Link WhatsApp + QR Code Gratis</span>
          </h1>
          <div className="flex items-center gap-0.5">
            <Dialog open={histOpen} onOpenChange={setHistOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 touch-manipulation"
                  aria-label="Riwayat"
                >
                  <History className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader className="flex-row items-center justify-between gap-2 pt-4 pb-2 pr-10">
                  <DialogTitle className="font-display text-xl font-black uppercase tracking-tight">
                    Riwayat
                  </DialogTitle>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 touch-manipulation"
                      onClick={() => exportHistoryJSON(items)}
                      disabled={items.length === 0}
                      aria-label="Export JSON"
                    >
                      <FileJson className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 touch-manipulation"
                      onClick={() => exportHistoryCSV(items)}
                      disabled={items.length === 0}
                      aria-label="Export CSV"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                    </Button>
                    <label
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="Import JSON"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={handleImport}
                      />
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 touch-manipulation text-destructive hover:text-destructive"
                      onClick={handleClearAll}
                      disabled={items.length === 0}
                      aria-label="Hapus semua"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogDescription className="sr-only">
                    Daftar link WhatsApp yang pernah kamu buat.
                  </DialogDescription>
                </DialogHeader>
                {items.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Belum ada link tersimpan.
                  </p>
                ) : (
                  <>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <Input
                        type="search"
                        placeholder="Cari link, nomor, atau pesan..."
                        value={historyQuery}
                        onChange={(e) => setHistoryQuery(e.target.value)}
                        className="h-10 pl-9 pr-8 text-sm"
                        aria-label="Cari riwayat"
                      />
                      {historyQuery && (
                        <button
                          type="button"
                          onClick={() => setHistoryQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                          aria-label="Hapus pencarian"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {filteredItems.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        Tidak ada hasil yang cocok.
                      </p>
                    ) : (
                      <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
                      {items.map((it) => (
                        <li key={it.id}>
                          <SwipeToDelete onDelete={() => handleRemove(it.id)}>
                            <div className="flex items-center gap-2 py-3">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleFavorite(it.id)}
                                aria-label={it.favorite ? "Hapus dari favorit" : "Jadikan favorit"}
                                aria-pressed={!!it.favorite}
                                className="h-11 w-11 shrink-0 touch-manipulation"
                              >
                                <Star
                                  className={`h-4 w-4 ${it.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                />
                              </Button>
                              <div className="min-w-0 flex-1">
                                {it.label ? (
                                  <>
                                    <p className="truncate text-sm font-semibold">{it.label}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      +{it.phone}
                                      {it.message ? ` · ${it.message}` : ""}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="truncate text-sm font-medium">+{it.phone}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {it.message || <span className="italic">Tanpa pesan</span>}
                                    </p>
                                  </>
                                )}
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingId(it.id)}
                                aria-label="Edit nama"
                                className="h-11 w-11 shrink-0 touch-manipulation"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  window.dispatchEvent(
                                    new CustomEvent("wa-prefill", {
                                      detail: { phone: it.phone, message: it.message },
                                    }),
                                  );
                                  setHistOpen(false);
                                  toast.success("Pesan dimuat ke form", {
                                    id: "hist-edit",
                                    description: "Ubah pesan lalu tekan Buat Link.",
                                    duration: 4000,
                                  });
                                }}
                                aria-label="Edit pesan & buat link baru"
                                className="h-11 w-11 shrink-0 touch-manipulation"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => copyText(it.url)}
                                aria-label="Salin link"
                                className="h-11 w-11 shrink-0 touch-manipulation"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                asChild
                                aria-label="Buka link"
                                className="h-11 w-11 shrink-0 touch-manipulation"
                              >
                                <a href={it.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRemove(it.id)}
                                aria-label="Hapus"
                                className="h-11 w-11 shrink-0 touch-manipulation"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </SwipeToDelete>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={howOpen} onOpenChange={setHowOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 touch-manipulation"
                  aria-label="Cara pakai"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-black uppercase tracking-tight">
                    Cara Pakai
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Panduan singkat membuat link WhatsApp dan QR code.
                  </DialogDescription>
                </DialogHeader>
                <ol className="space-y-2">
                  {[
                    {
                      icon: Phone,
                      title: "Masukkan nomor",
                      desc: "Format +62, tanpa angka 0 di depan.",
                    },
                    {
                      icon: MessageSquare,
                      title: "Tulis pesan (opsional)",
                      desc: "Muncul otomatis saat link dibuka.",
                    },
                    {
                      icon: Link2,
                      title: "Salin link atau unduh QR",
                      desc: "Tempel di bio sosmed, katalog, atau cetak.",
                    },
                  ].map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/40 p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {i + 1}. {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{step.desc}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <p className="pt-1 text-center text-[11px] text-muted-foreground">
                  Semua diproses di perangkat kamu. Tanpa daftar, tanpa server.
                </p>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 touch-manipulation" aria-label="Pengaturan">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Pengaturan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-2 text-sm">
                  <label htmlFor="pref-dark" className="flex items-center gap-2">
                    <Moon className="h-3.5 w-3.5" /> Mode gelap
                  </label>
                  <Switch id="pref-dark" checked={dark} onCheckedChange={toggleDark} />
                </div>
                <div className="flex items-center justify-between px-2 py-2 text-sm">
                  <label htmlFor="pref-sound" className="flex items-center gap-2">
                    <Volume2 className="h-3.5 w-3.5" /> Suara
                  </label>
                  <Switch
                    id="pref-sound"
                    checked={sound}
                    onCheckedChange={(v) => {
                      setSound(v);
                      setPref("sound", v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between px-2 py-2 text-sm">
                  <label htmlFor="pref-haptic" className="flex items-center gap-2">
                    <Vibrate className="h-3.5 w-3.5" /> Getar
                  </label>
                  <Switch
                    id="pref-haptic"
                    checked={haptic}
                    onCheckedChange={(v) => {
                      setHaptic(v);
                      setPref("haptic", v);
                    }}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-2 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
        <WaGenerator />
      </main>

      <SiteFooter />

      <Toaster position="top-center" />
      <EditLabelDialog
        open={editingId !== null}
        initialLabel={editingItem?.label ?? ""}
        onOpenChange={(v) => !v && setEditingId(null)}
        onSave={(label) => {
          if (editingId) setLabel(editingId, label);
        }}
      />
      
    </div>
  );
}
