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
    const month = date.getMonth() + 1
    return `${year}년 ${month}월`
  } catch (e) {
    return String(dateStr)
  }
}

export function formatPriceRange(price: number | undefined | null, isNegotiable: boolean = true): string {
  const p = price || 0;
  if (p === 0) return "협의가능";
  if (p < 100000) return `10만원 미만`;
  if (p <= 300000) return `10~30만원`;
  if (p <= 500000) return `30~50만원`;
  if (p <= 1000000) return `50~100만원`;
  return `100만원 이상`;
}

// ── 정확한 날짜 유틸 (크리에이터/MCN 전용) ──────────────────────

/** "2026.03.15" 형식으로 반환 */
export function formatExactDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ""
  try {
    // ISO 날짜를 timezone 오프셋 없이 로컬 기준으로 처리
    const parts = dateStr.split('T')[0].split('-')
    if (parts.length !== 3) return dateStr
    const [year, month, day] = parts
    return `${year}.${month}.${day}`
  } catch {
    return dateStr
  }
}

/** "2026.03.15 ~ 04.02" 형식 (다중일 이벤트용) */
export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (!start) return "미정"
  const s = formatExactDate(start)
  if (!end) return s
  const endParts = end.split('T')[0].split('-')
  if (endParts.length !== 3) return s
  const [, endMonth, endDay] = endParts
  return `${s} ~ ${endMonth}.${endDay}`
}

/**
 * 뷰 context에 따라 올바른 이벤트 날짜 표시.
 * showExact = true: 크리에이터 본인 / MCN 관리 → 정확한 날짜
 * showExact = false: 브랜드 탐색 → 년-월만 (마스킹)
 */
export function displayEventDate(
  item: { momentStartDate?: string; momentEndDate?: string },
  showExact: boolean
): string {
  if (showExact && item.momentStartDate) {
    return formatDateRange(item.momentStartDate, item.momentEndDate)
  }
  return formatDateToMonth(item.momentStartDate) || "미정"
}

/**
 * 뷰 context에 따라 올바른 업로드 일정 표시.
 */
export function displayPostingDate(
  item: { postingDateExact?: string; dateFlexible?: boolean },
  showExact: boolean
): string {
  if (item.dateFlexible) return "협의 가능"
  if (showExact && item.postingDateExact) return formatExactDate(item.postingDateExact)
  return formatDateToMonth(item.postingDateExact) || "미정"
}

/**
 * UTM 트래킹 링크 생성.
 * 크리에이터별 고유 링크로 캠페인 성과 측정에 사용.
 *
 * @param baseUrl 브랜드 제품 URL
 * @param proposalId 제안서 ID (캠페인 식별)
 * @param creatorId 크리에이터 ID (크리에이터 식별)
 */
export function generateUTMLink(
  baseUrl: string,
  proposalId: string,
  creatorId: string
): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'creadypick');
    url.searchParams.set('utm_medium', 'influencer');
    url.searchParams.set('utm_campaign', proposalId);
    url.searchParams.set('utm_content', creatorId);
    return url.toString();
  } catch {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}utm_source=creadypick&utm_medium=influencer&utm_campaign=${proposalId}&utm_content=${creatorId}`;
  }
}
