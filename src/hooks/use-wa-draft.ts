import { useEffect, useRef } from "react";
import { MAX_MESSAGE, MAX_PHONE_DIGITS } from "@/lib/wa-limits";

const KEY = "wa-link-draft";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const DEBOUNCE_MS = 500;

export type WaDraft = { phone: string; message: string };

function sanitizeDraft(phone: unknown, message: unknown): WaDraft {
  const p =
    typeof phone === "string" ? phone.replace(/\D/g, "").slice(0, MAX_PHONE_DIGITS + 2) : "";
  const m = typeof message === "string" ? message.slice(0, MAX_MESSAGE) : "";
  return { phone: p, message: m };
}

export function loadDraft(): WaDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { phone?: string; message?: string; savedAt?: number };
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return sanitizeDraft(parsed.phone, parsed.message);
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function useWaDraft(phone: string, message: string, enabled: boolean, onSaved?: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        const safe = sanitizeDraft(phone, message);
        if (!safe.phone && !safe.message) {
          window.localStorage.removeItem(KEY);
          return;
        }
        window.localStorage.setItem(KEY, JSON.stringify({ ...safe, savedAt: Date.now() }));
        onSaved?.();
      } catch {
        // ignore
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phone, message, enabled, onSaved]);
}
