import type { ImageRecord } from "../notebook/model";
export const dataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(Error("Could not read screenshot"));
    r.readAsDataURL(blob);
  });
export async function prepareImage(file: File): Promise<ImageRecord> {
  if (file.size > 20 * 1024 * 1024)
    throw Error("Screenshots must be at most 20 MiB");
  if (
    !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)
  )
    throw Error("Choose a PNG, JPEG, WebP or GIF screenshot");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 25_000_000)
      throw Error("Screenshots must be at most 25 megapixels");
    for (const [width, q] of [
      [1600, 0.85],
      [1600, 0.7],
      [1200, 0.7],
      [1000, 0.6],
    ]) {
      const c = document.createElement("canvas"),
        scale = Math.min(1, width / bitmap.width);
      c.width = Math.max(1, Math.round(bitmap.width * scale));
      c.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = c.getContext("2d");
      if (!ctx) throw Error("Screenshot processing is unavailable");
      ctx.drawImage(bitmap, 0, 0, c.width, c.height);
      const blob = await new Promise<Blob | null>((r) =>
        c.toBlob(r, "image/webp", q),
      );
      if (blob && blob.size < 700000) {
        const data = await dataUrl(blob);
        if (data.length < 1000000) return { id: crypto.randomUUID(), data };
      }
    }
    throw Error("Screenshot is still too large. Crop it and retry");
  } finally {
    bitmap.close();
  }
}
