import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateToMonth(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return ""
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return String(dateStr) // Return original if invalid
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}.${month}`
  } catch (e) {
    return String(dateStr)
  }
}

export function formatPriceRange(price: number | undefined | null, isNegotiable: boolean = true): string {
  const p = price || 0;
  if (p === 0) return "협의가능";
  const suffix = isNegotiable ? " (협의가능)" : "";
  if (p < 100000) return `10만원 미만${suffix}`;
  if (p <= 300000) return `10~30만원${suffix}`;
  if (p <= 500000) return `30~50만원${suffix}`;
  if (p <= 1000000) return `50~100만원${suffix}`;
  return `100만원 이상${suffix}`;
}
