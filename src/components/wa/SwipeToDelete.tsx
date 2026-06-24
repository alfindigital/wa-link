import { useRef, useState, type ReactNode, type TouchEvent } from "react";
import { Trash2 } from "lucide-react";

const THRESHOLD = 80;
const MAX_TRANSLATE = 120;

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: ReactNode;
}

export function SwipeToDelete({ onDelete, children }: SwipeToDeleteProps) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const locked = useRef<"h" | "v" | null>(null);
  const [offset, setOffset] = useState(0);
  const [removing, setRemoving] = useState(false);

  function handleTouchStart(e: TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    locked.current = null;
  }

  function handleTouchMove(e: TouchEvent) {
    if (startX.current === null || startY.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (locked.current === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      locked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (locked.current !== "h") return;

    const next = Math.max(-MAX_TRANSLATE, Math.min(0, dx));
    setOffset(next);
  }

  function handleTouchEnd() {
    startX.current = null;
    startY.current = null;
    if (locked.current === "h" && Math.abs(offset) >= THRESHOLD) {
      setOffset(-MAX_TRANSLATE * 2);
      setRemoving(true);
      window.setTimeout(() => onDelete(), 180);
    } else {
      setOffset(0);
    }
    locked.current = null;
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{
        maxHeight: removing ? 0 : 200,
        opacity: removing ? 0 : 1,
        transition: "max-height 180ms ease, opacity 180ms ease",
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end bg-destructive pr-5 text-destructive-foreground">
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </div>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="relative bg-background"
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          transition: offset === 0 || removing ? "transform 180ms ease" : "none",
          touchAction: "pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
}
