import type { WaHistoryItem } from "@/hooks/use-wa-history";
import { parseHistoryList } from "@/lib/wa-history-schema";
import { MAX_IMPORT_BYTES } from "@/lib/wa-limits";

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportHistoryJSON(items: WaHistoryItem[]) {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  triggerDownload(blob, `walinkq-history-${dateStamp()}.json`);
}

export function exportHistoryCSV(items: WaHistoryItem[]) {
  const rows = [
    ["label", "phone", "message", "url", "favorite", "createdAt"],
    ...items.map((it) => [
      it.label ?? "",
      it.phone,
      it.message,
      it.url,
      it.favorite ? "1" : "0",
      new Date(it.createdAt).toISOString(),
    ]),
  ];
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `walinkq-history-${dateStamp()}.csv`);
}

export async function importHistoryJSON(file: File): Promise<WaHistoryItem[]> {
  if (file.size > MAX_IMPORT_BYTES) {
    throw new Error(`File terlalu besar (maks ${Math.round(MAX_IMPORT_BYTES / 1024)} KB).`);
  }
  const text = await file.text();
  if (text.length > MAX_IMPORT_BYTES) {
    throw new Error(`File terlalu besar (maks ${Math.round(MAX_IMPORT_BYTES / 1024)} KB).`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("File JSON tidak valid");
  }
  if (!Array.isArray(parsed)) throw new Error("File JSON tidak valid");
  return parseHistoryList(parsed);
}
