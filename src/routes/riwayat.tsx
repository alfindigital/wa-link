import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Star,
  Pencil,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  Edit3,
  Search,
  X,
} from "lucide-react";
import { SwipeToDelete } from "@/components/wa/SwipeToDelete";
import { EditLabelDialog } from "@/components/wa/EditLabelDialog";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWaHistory } from "@/hooks/use-wa-history";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import { exportHistoryCSV, exportHistoryJSON, importHistoryJSON } from "@/lib/history-io";

export const Route = createFileRoute("/riwayat")({
  component: RiwayatPage,
  head: () => ({
    meta: [
      { title: "Riwayat Link WhatsApp — WAlinkQ" },
      {
        name: "description",
        content:
          "Lihat, cari, dan kelola semua link WhatsApp yang pernah kamu buat di WAlinkQ. Tersimpan lokal di perangkat kamu.",
      },
      { property: "og:title", content: "Riwayat Link WhatsApp — WAlinkQ" },
      {
        property: "og:description",
        content: "Kelola riwayat link WhatsApp kamu. Simpan lokal, tanpa server.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://link-wa.alfindigital.com/riwayat" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://link-wa.alfindigital.com/riwayat" }],
  }),
});

function RiwayatPage() {
  const { items, remove, clear, setLabel, toggleFavorite, replaceAll } = useWaHistory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const editingItem = items.find((it) => it.id === editingId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.url.toLowerCase().includes(q) ||
        it.phone.includes(q) ||
        (it.message && it.message.toLowerCase().includes(q)) ||
        (it.label && it.label.toLowerCase().includes(q)),
    );
  }, [items, query]);

  async function copyText(text: string) {
    const ok = await copyToClipboard(text);
    if (ok) {
      toast.success("Link disalin", {
        id: "hist-copy",
        description: "Link sudah tersimpan di papan klip.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        action: { label: "Salin ulang", onClick: () => copyText(text) },
        duration: 5000,
      });
    } else {
      toast.error("Gagal menyalin link", {
        id: "hist-copy",
        description: "Coba salin manual atau periksa izin browser.",
        icon: <XCircle className="h-4 w-4 text-destructive" />,
        action: { label: "Coba lagi", onClick: () => copyText(text) },
      });
    }
  }

  function handleRemove(id: string) {
    const snap = items;
    remove(id);
    toast("Dihapus dari riwayat", {
      id: `undo-${id}`,
      action: { label: "Undo", onClick: () => replaceAll(snap) },
      duration: 5000,
    });
  }

  function handleClearAll() {
    const snap = items;
    clear();
    toast("Semua riwayat dihapus", {
      id: "undo-clear",
      action: { label: "Undo", onClick: () => replaceAll(snap) },
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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 touch-manipulation"
              asChild
              aria-label="Kembali"
              title="Kembali"
            >
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-display text-xl font-black uppercase tracking-tight sm:text-2xl truncate">
              Riwayat
            </h1>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 touch-manipulation"
              onClick={() => exportHistoryJSON(items)}
              disabled={items.length === 0}
              aria-label="Export JSON"
              title="Export JSON"
            >
              <FileJson className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 touch-manipulation"
              onClick={() => exportHistoryCSV(items)}
              disabled={items.length === 0}
              aria-label="Export CSV"
              title="Export CSV"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
            <label
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Import JSON"
              title="Import JSON"
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
              className="h-10 w-10 touch-manipulation text-destructive hover:text-destructive"
              onClick={handleClearAll}
              disabled={items.length === 0}
              aria-label="Hapus semua"
              title="Hapus semua"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-3 pb-6 pt-4 sm:px-6 sm:pt-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30 py-16 text-center">
            <p className="text-sm text-muted-foreground">Belum ada link tersimpan.</p>
            <Button asChild variant="link" className="mt-2 text-primary">
              <Link to="/">Buat link WhatsApp pertama kamu</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Cari link, nomor, atau pesan..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 pl-9 pr-9 text-sm"
                aria-label="Cari riwayat"
                title="Cari riwayat"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Hapus pencarian"
                  title="Hapus pencarian"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="mb-2 text-xs text-muted-foreground">
              {filtered.length} dari {items.length} entri
            </p>
            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Tidak ada hasil yang cocok.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border/60 bg-card">
                {filtered.map((it) => (
                  <li key={it.id}>
                    <SwipeToDelete onDelete={() => handleRemove(it.id)}>
                      <div className="flex items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleFavorite(it.id)}
                          aria-label={it.favorite ? "Hapus dari favorit" : "Jadikan favorit"}
                          title={it.favorite ? "Hapus dari favorit" : "Jadikan favorit"}
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
                          title="Edit nama"
                          className="h-11 w-11 shrink-0 touch-manipulation"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            try {
                              window.sessionStorage.setItem(
                                "wa-prefill",
                                JSON.stringify({ phone: it.phone, message: it.message }),
                              );
                            } catch {
                              // ignore
                            }
                            toast.success("Pesan dimuat ke form", {
                              id: "hist-edit",
                              description: "Ubah pesan lalu tekan Buat Link.",
                              duration: 4000,
                            });
                            window.location.href = "/";
                          }}
                          aria-label="Edit pesan & buat link baru"
                          title="Edit pesan & buat link baru"
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
                          title="Salin link"
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
                          title="Buka link"
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
                          title="Hapus"
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
      </main>

      <SiteFooter />
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