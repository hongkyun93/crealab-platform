/**
 * Master category/tag list used across the entire platform.
 * Single source of truth — import this everywhere instead of duplicating.
 *
 * Used in:
 *  - Brand discovery filter (DiscoverView)
 *  - Moment registration form (MomentForm)
 *  - Campaign registration form (CampaignForm)
 *  - Creator dashboard (creator/page.tsx)
 *  - Creator settings (SettingsView)
 *  - Brand product registration (brand/page.tsx)
 */
export const POPULAR_TAGS = [
    "✈️ 여행",
    "💄 뷰티",
    "💊 건강",
    "💉 시술/병원",
    "👗 패션",
    "🍽️ 맛집",
    "🏡 리빙/인테리어",
    "💍 웨딩/결혼",
    "🏋️ 헬스/운동",
    "🥗 다이어트",
    "👶 육아",
    "🐶 반려동물",
    "💻 테크/IT",
    "🎮 게임",
    "📚 도서/자기계발",
    "🎨 취미/DIY",
    "🎓 교육/강의",
    "🎬 영화/문화",
    "💰 재테크",
    "📌 기타",
] as const

export type CategoryTag = (typeof POPULAR_TAGS)[number]
