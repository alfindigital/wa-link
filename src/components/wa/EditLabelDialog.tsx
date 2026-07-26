import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function EditLabelDialog({
  open,
  initialLabel,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  initialLabel: string;
  onOpenChange: (v: boolean) => void;
  onSave: (label: string) => void;
}) {
  const [value, setValue] = useState(initialLabel);
  useEffect(() => {
    if (open) setValue(initialLabel);
  }, [open, initialLabel]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Nama kontak</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(value);
            onOpenChange(false);
          }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="label-input" className="text-xs">
              Nama (opsional)
            </Label>
            <Input
              id="label-input"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Contoh: Toko Budi"
              maxLength={40}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onSave("");
                onOpenChange(false);
              }}
            >
              Hapus nama
            </Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
