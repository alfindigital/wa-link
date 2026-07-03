import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const KEY = "walinkq:coach-done";

const STEPS = [
  { title: "1. Isi nomor", desc: "Ketik nomor WhatsApp tanpa 0 di depan. Awalan 62 otomatis ditambah." },
  { title: "2. Tulis pesan (opsional)", desc: "Pesan bawaan yang muncul saat link dibuka." },
  { title: "3. Buat & bagikan", desc: "Tekan Buat Link, lalu salin atau tunjukkan QR-nya." },
];

export function CoachMark() {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) {
        const t = setTimeout(() => setStep(0), 700);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function done() {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setStep(null);
  }

  if (step === null) return null;
  const s = STEPS[step];

  return (
    <div
      role="dialog"
      aria-label="Panduan singkat"
      className="fixed left-1/2 top-16 z-30 w-full max-w-xs -translate-x-1/2 px-4"
    >
      <div className="rounded-xl border border-primary/30 bg-background p-4 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{s.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
          </div>
          <button
            type="button"
            onClick={done}
            aria-label="Tutup panduan"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-4 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={done}>
              Lewati
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (step < STEPS.length - 1) setStep(step + 1);
                else done();
              }}
            >
              {step < STEPS.length - 1 ? "Lanjut" : "Mulai"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}