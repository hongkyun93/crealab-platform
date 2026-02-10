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
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 중`
  } catch (e) {
    return String(dateStr)
  }
}
