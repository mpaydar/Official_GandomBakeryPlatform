/** Normalize scanner / manual barcode input (EAN, UPC, Code 128, etc.). */
export function normalizeBarcode(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, "");
  if (!trimmed) return null;

  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  if (digitsOnly.length >= 4 && digitsOnly.length <= 14) {
    return digitsOnly;
  }

  if (/^[A-Za-z0-9\-_.]+$/.test(trimmed) && trimmed.length >= 4 && trimmed.length <= 32) {
    return trimmed.toUpperCase();
  }

  return null;
}
