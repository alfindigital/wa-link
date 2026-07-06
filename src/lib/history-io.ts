import type { WaHistoryItem } from "@/hooks/use-wa-history";

function isValidWaUrl(u: string): boolean {
  return /^https:\/\/wa\.me\//.test(u);
}

function isValidItem(x: unknown): x is WaHistoryItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.phone === "string" &&
    typeof o.message === "string" &&
    typeof o.url === "string" &&
    isValidWaUrl(o.url) &&
    typeof o.createdAt === "number"
  );
}

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
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("File JSON tidak valid");
  return parsed.filter(isValidItem);
}