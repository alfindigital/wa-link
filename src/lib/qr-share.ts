export async function renderBrandedQr(opts: {
  url: string;
  phone: string;
  watermark?: boolean;
  size?: number;
}): Promise<Blob> {
  const { default: QRCode } = await import("qrcode");
  const size = opts.size ?? 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const qrCanvas = document.createElement("canvas");
  const qrSize = Math.round(size * 0.72);
  await QRCode.toCanvas(qrCanvas, opts.url, {
    width: qrSize,
    margin: 1,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
  const qrX = (size - qrSize) / 2;
  const qrY = Math.round(size * 0.14);
  ctx.drawImage(qrCanvas, qrX, qrY);

  ctx.fillStyle = "#25D366";
  ctx.font = "bold 64px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("WAlinkQ", size / 2, Math.round(size * 0.1));

  ctx.fillStyle = "#111827";
  ctx.font = "600 40px system-ui, -apple-system, sans-serif";
  ctx.fillText(`+${opts.phone}`, size / 2, qrY + qrSize + 70);

  ctx.fillStyle = "#6b7280";
  ctx.font = "500 28px system-ui, -apple-system, sans-serif";
  ctx.fillText("Scan untuk chat via WhatsApp", size / 2, qrY + qrSize + 115);

  if (opts.watermark !== false) {
    ctx.fillStyle = "#9ca3af";
    ctx.font = "500 24px system-ui, -apple-system, sans-serif";
    ctx.fillText("link-wa.alfindigital.com", size / 2, size - 40);
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode PNG gagal"))), "image/png");
  });
}

export async function shareOrDownloadBrandedQr(opts: {
  url: string;
  phone: string;
  watermark?: boolean;
}) {
  const blob = await renderBrandedQr(opts);
  const filename = `walinkq-${opts.phone}.png`;
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
  };
  if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
    try {
      await nav.share({
        files: [file],
        title: "Link WhatsApp",
        text: "Scan QR untuk chat via WhatsApp",
      });
      return { shared: true };
    } catch {
      /* fallthrough */
    }
  }
  const dlUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = dlUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(dlUrl), 1000);
  return { shared: false };
}