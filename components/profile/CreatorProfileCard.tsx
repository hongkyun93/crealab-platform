"use client"

import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCreatorProfile } from "@/lib/hooks/use-creator-profile"
import { formatDateToMonth } from "@/lib/utils"
import { ArrowUpRight, BookOpen, Calendar, CheckCircle, Gift, Globe, Instagram, Loader2, MapPin, Music2, Sparkles, Star, Youtube } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

// ============================================================
// Platform Config
// ============================================================
const PLATFORM_CONFIG: Record<string, { icon: React.ReactNode; gradient: string }> = {
    instagram: { icon: <Instagram className="h-4 w-4" />, gradient: "from-purple-500 via-pink-500 to-orange-500" },
    youtube: { icon: <Youtube className="h-4 w-4" />, gradient: "from-red-500 to-red-600" },
    tiktok: { icon: <Music2 className="h-4 w-4" />, gradient: "from-black to-slate-700" },
    blog: { icon: <BookOpen className="h-4 w-4" />, gradient: "from-green-500 to-green-600" },
    other: { icon: <Globe className="h-4 w-4" />, gradient: "from-slate-600 to-slate-700" },
}

// ============================================================
// Helpers
// ============================================================
function fmtFollowers(n: number) {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
    return n.toLocaleString()
}

function fmtPrice(n: number) {
    if (!n) return "-"
    if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}천원`
    return `${n.toLocaleString()}원`
}

function getPriceRange(priceVideo: number, priceFeed: number, priceStory: number) {
    const p = [priceVideo, priceFeed, priceStory].filter(v => v > 0)
    if (!p.length) return "미정"
    const min = Math.min(...p), max = Math.max(...p)
    return min === max ? fmtPrice(min) : `${fmtPrice(min)} ~ ${fmtPrice(max)}`
}

function getSnsUrl(platform: string, handle: string): string {
    if (!handle) return ""
    // 이미 URL 형태인 경우 바로 반환
    if (handle.startsWith("http://") || handle.startsWith("https://")) {
        return handle
    }

    const clean = handle.replace(/^@/, "")
    switch (platform) {
        case "instagram": return `https://instagram.com/${clean}`
        case "youtube": return `https://youtube.com/@${clean}`
        case "tiktok": return `https://tiktok.com/@${clean}`
        default: return `https://${clean}`
    }
}

function getDisplayHandle(platform: string, handle: string): string {
    let clean = handle.replace(/^@/, "").replace(/\/$/, "")

    // URL 형태인 경우 마지막 path 추출
    if (clean.includes("instagram.com/")) clean = clean.split("instagram.com/")[1]?.split(/[/?#]/)[0] || clean
    if (clean.includes("youtube.com/")) {
        const parts = clean.split("youtube.com/")
        const path = parts[1] || ""
        if (path.startsWith("@")) clean = path.split(/[/?#]/)[0].substring(1)
        else if (path.startsWith("channel/") || path.startsWith("c/")) clean = path.split("/")[1]?.split(/[/?#]/)[0] || clean
        else clean = path.split(/[/?#]/)[0]
    }
    if (clean.includes("tiktok.com/")) {
        const parts = clean.split("tiktok.com/")
        const path = parts[1] || ""
        if (path.startsWith("@")) clean = path.split(/[/?#]/)[0].substring(1)
        else clean = path.split(/[/?#]/)[0]
    }

    // 기타 URL 형태 제거
    if (clean.startsWith("http")) {
        try {
            const url = new URL(clean)
            const parts = url.pathname.split("/").filter(Boolean)
            clean = parts[parts.length - 1] || clean
        } catch (e) { }
    }

    return `@${clean}`
}

// ============================================================
// CreatorProfileCard Component
// ============================================================
export interface IgInsightBadge {
    emoji: string
    title: string
    description: string
}

export interface IgDemographics {
    targetAudienceText: string
    femalePct: number
    ageGroups: Array<{ age: string; pct: number }>
    cities: Array<{ city: string; pct: number }>
}

export interface IgDerivedMetrics {
    erByFollowers: number | null
    erByReach: number | null
    saveRate: number | null
    reachRate: number | null
    realFanIndex: number | null
    fqi: number | null
    viralityRate: number | null
    cpr: number | null
    cpe: number | null
    tms: number | null
    roasPrediction: number | null
    avgLikes: number | null
    avgComments: number | null
    avgShares: number | null
    avgViews: number | null
    avgEngagement: number | null
    postCount: number | null
}

export interface IgAccountInsights {
    profileViews30d: number | null
    websiteClicks30d: number | null
    monthlyReach: number | null
    monthlyImpressions: number | null
}

export interface IgPortfolioData {
    er: number | null
    avgReach: number | null
    avgSaves: number | null
    posts: Array<{
        id: string
        media_type: string
        media_url?: string
        thumbnail_url?: string
        permalink: string
        like_count: number
        comments_count: number
        timestamp: string
        media_source?: string
    }>
    insights?: IgInsightBadge[]
    autoInsights?: IgInsightBadge[]
    demographics?: IgDemographics
    derivedMetrics?: IgDerivedMetrics
    accountInsights?: IgAccountInsights
    allAgeGroups?: Array<{ age: string; pct: number }>
    topCities?: Array<{ city: string; pct: number }>
    audienceFemaleRatio?: number | null
    audienceDomesticRatio?: number | null
}

interface CreatorProfileCardProps {
    creatorId: string
    trigger: React.ReactNode
    actionSlot?: React.ReactNode
    igPortfolioData?: IgPortfolioData | null
}

export function CreatorProfileCard({ creatorId, trigger, actionSlot, igPortfolioData }: CreatorProfileCardProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            {open && (
                <CreatorProfileCardContent
                    creatorId={creatorId}
                    onClose={() => setOpen(false)}
                    actionSlot={actionSlot}
                    igPortfolioData={igPortfolioData}
                />
            )}
        </Dialog>
    )
}

// ============================================================
// Card Content (fetches data when mounted)
// ============================================================
function CreatorProfileCardContent({
    creatorId,
    onClose,
    actionSlot,
    igPortfolioData,
}: {
    creatorId: string
    onClose: () => void
    actionSlot?: React.ReactNode
    igPortfolioData?: IgPortfolioData | null
}) {
    const { profile, isLoading } = useCreatorProfile(creatorId)
    const { toggleFavorite, favorites } = useUnifiedProvider()
    const router = useRouter()

    const isFavorited = favorites.some(
        (f: any) => f.target_id === creatorId && f.target_type === "profile"
    )

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await toggleFavorite(creatorId, "profile")
        } catch (err) {
            console.error("[CreatorProfileCard] Favorite toggle error:", err)
        }
    }

    const handleMomentClick = (momentId: string) => {
        onClose()
        router.push(`/moment/${momentId}`)
    }

    const handleChannelClick = (platform: string, handle: string) => {
        window.open(getSnsUrl(platform, handle), "_blank", "noopener,noreferrer")
    }

    if (isLoading || !profile) {
        return (
            <DialogContent className="max-w-xl p-0 overflow-hidden overflow-y-auto max-h-[90vh] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl text-zinc-900 dark:text-zinc-100">
                <DialogTitle className="sr-only">크리에이터 프로필</DialogTitle>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                    <p className="text-sm text-white/50">프로필을 불러오는 중...</p>
                </div>
            </DialogContent>
        )
    }

    const totalFollowers = profile.channels.reduce((s, ch) => s + ch.followersCount, 0)
    const displayHandle = profile.displayName || (profile.handle ? `@${profile.handle.replace(/^@/, '')}` : '@creator')

    return (
        <DialogContent className="max-w-[72rem] w-[95vw] h-[88vh] max-h-[880px] p-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl text-zinc-900 dark:text-zinc-100 [&>button]:text-zinc-500 hover:[&>button]:text-zinc-900 dark:hover:[&>button]:text-zinc-100 flex flex-col">
            <DialogTitle className="sr-only">크리에이터 프로필 (대시보드 뷰)</DialogTitle>

            <div className="flex flex-1 h-full overflow-hidden">
                {/* ========================================== */}
                {/* 왼쪽 사이드바: 프로필 정보 및 기본 스펙 (단가, 채널) */}
                {/* ========================================== */}
                <div className="w-[320px] lg:w-[360px] shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col overflow-y-auto custom-scrollbar p-5">

                    {/* 상하 중앙 정렬 래퍼 */}
                    <div className="my-auto w-full py-2 flex flex-col">

                        {/* 프로필 헤더 — 사진(좌) + 이름/지역/태그(중) + 채널(우 1/3 absolute) */}
                        <div className="relative pb-5 border-b border-zinc-200 dark:border-zinc-800">
                            {/* 채널: absolute로 우측 1/3 중앙에 고정 (Quality ER 컬럼과 정렬) */}
                            {profile.channels.length > 0 && (
                                <div className="absolute right-0 top-0 w-[33.33%] h-16 flex flex-col items-center justify-center gap-1.5">
                                    {profile.channels.map((ch) => {
                                        const cfg = PLATFORM_CONFIG[ch.platform] || PLATFORM_CONFIG.other
                                        return (
                                            <div
                                                key={ch.id}
                                                className="flex flex-col items-center gap-1.5 cursor-pointer group"
                                                onClick={() => handleChannelClick(ch.platform, ch.handle)}
                                            >
                                                <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800 group-hover:border-zinc-300 transition-all [&>svg]:w-4 [&>svg]:h-4">
                                                    {cfg.icon}
                                                </div>
                                                <div className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 truncate max-w-[64px] text-center">
                                                    {getDisplayHandle(ch.platform, ch.handle)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="flex items-start gap-3 pr-[33.33%]">
                                {/* 프로필 사진 */}
                                <div className="shrink-0 h-16 w-16 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden shadow-sm">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-2xl font-bold text-zinc-400">
                                            {profile.displayName[0]?.toUpperCase() || "C"}
                                        </div>
                                    )}
                                </div>

                                {/* 이름/지역/태그/설명 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h2 className="text-base font-bold truncate">{displayHandle}</h2>
                                        <button
                                            onClick={handleToggleFavorite}
                                            className={`shrink-0 h-5 w-5 rounded-sm flex items-center justify-center transition-all ${isFavorited
                                                ? "text-black dark:text-white"
                                                : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                                }`}
                                        >
                                            <Star className={`h-3.5 w-3.5 ${isFavorited ? "fill-current" : ""}`} />
                                        </button>
                                    </div>

                                    {profile.primaryRegion && (
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            <MapPin className="h-2.5 w-2.5 shrink-0" /><span>{profile.primaryRegion}</span>
                                        </div>
                                    )}

                                    {profile.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {profile.tags.slice(0, 4).map(tag => (
                                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200/50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium tracking-tight">#{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    {profile.description && (
                                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">{profile.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* 통계 바 (Followers / Reach / ER) */}
                            {(() => {
                                const erValue = igPortfolioData?.er ?? profile.avgEngagementRate
                                const reachValue = igPortfolioData?.avgReach ?? null
                                const fmtNumber = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString()

                                return (
                                    <div className="mt-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-3 text-center divide-x divide-zinc-200 dark:divide-zinc-800 shadow-sm">
                                        <div className="flex flex-col items-center justify-center px-1">
                                            <div className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{fmtFollowers(totalFollowers)}</div>
                                            <div className="text-[8px] font-bold text-zinc-500 mt-0.5 uppercase tracking-widest leading-tight">Followers</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center px-1">
                                            <div className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                                {reachValue != null ? fmtNumber(reachValue) : <span className="text-zinc-400 text-xs">데이터 없음</span>}
                                            </div>
                                            <div className="text-[8px] font-bold text-zinc-500 mt-0.5 uppercase tracking-widest leading-tight">도달 (Reach)</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center relative px-1">
                                            <div className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                                                {erValue != null ? `${typeof erValue === 'number' && erValue < 1 ? (erValue * 100).toFixed(1) : erValue.toFixed(1)}%` : <span className="text-zinc-400 text-xs">데이터 없음</span>}
                                            </div>
                                            <div className="text-[8px] font-bold text-zinc-500 mt-0.5 uppercase tracking-widest flex items-center gap-[2px] leading-tight">
                                                Quality ER <Sparkles className="h-2 w-2" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* ── Performance Metrics (통계 바 아래) ── */}
                            {igPortfolioData?.derivedMetrics && (() => {
                                const d = igPortfolioData.derivedMetrics!
                                const fmt = (v: number | null | undefined, suffix = '', decimals = 1) =>
                                    v != null ? `${Number(v).toFixed(decimals)}${suffix}` : '—'
                                const fmtN = (v: number | null | undefined) =>
                                    v != null ? Number(v).toLocaleString() : '—'

                                const metrics = [
                                    { label: 'ER (팔로워 기준)', value: fmt(d.erByFollowers, '%', 2), formula: '(좋아요+댓글+저장) ÷ 팔로워 × 100', color: 'text-indigo-600 dark:text-indigo-400' },
                                    { label: 'ER (도달 기준)', value: fmt(d.erByReach, '%', 2), formula: '(좋아요+댓글+저장) ÷ 도달수 × 100', color: 'text-violet-600 dark:text-violet-400' },
                                    { label: '저장률 (구매 의향)', value: fmt(d.saveRate, '%', 2), formula: '저장수(avg) ÷ 도달수(avg) × 100', color: 'text-emerald-600 dark:text-emerald-400' },
                                    { label: '도달률 (팔로워 품질)', value: fmt(d.reachRate, '%', 1), formula: '평균 도달수 ÷ 팔로워수 × 100', color: 'text-sky-600 dark:text-sky-400' },
                                    { label: '진성 팬덤 지수', value: fmt(d.realFanIndex, '%', 2), formula: '댓글수(avg) ÷ 좋아요수(avg) × 100', color: 'text-pink-600 dark:text-pink-400' },
                                    { label: '팔로워 품질 지수 (FQI)', value: fmt(d.fqi, '', 3), formula: '도달률 × (저장수 ÷ 좋아요수)', color: 'text-amber-600 dark:text-amber-400' },
                                    { label: '바이럴 잠재력', value: fmt(d.viralityRate, '%', 2), formula: '공유수(avg) ÷ 도달수(avg) × 100', color: 'text-orange-600 dark:text-orange-400' },
                                    { label: 'CPR (도달당 단가)', value: d.cpr != null ? `${d.cpr}원` : '단가 입력 필요', formula: '광고 단가 ÷ 평균 도달수', color: 'text-zinc-700 dark:text-zinc-300' },
                                    { label: 'CPE (참여당 단가)', value: d.cpe != null ? `${d.cpe}원` : '단가 입력 필요', formula: '광고 단가 ÷ (좋아요+댓글+저장)', color: 'text-zinc-700 dark:text-zinc-300' },
                                    { label: '타겟 매칭 점수 (TMS)', value: d.tms != null ? `${d.tms}/100` : '—', formula: '성별×0.4 + 연령(25-34)×0.4 + 국내×0.2', color: 'text-teal-600 dark:text-teal-400' },
                                    { label: 'ROAS 예측 지수', value: fmt(d.roasPrediction, '', 3), formula: '저장률 × TMS ÷ 100', color: 'text-rose-600 dark:text-rose-400' },
                                ]

                                return (
                                    <div className="mt-4">
                                        <h3 className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                            <span className="h-3.5 w-3.5 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-[9px]">📐</span>
                                            Performance Metrics
                                            <span className="text-[8px] font-normal text-zinc-400">최근 {d.postCount ?? 12}개 게시물 평균</span>
                                        </h3>
                                        {/* 원시 평균값 4칸 */}
                                        <div className="grid grid-cols-4 gap-1 mb-1.5">
                                            {[
                                                { label: '평균 좋아요', val: fmtN(d.avgLikes) },
                                                { label: '평균 댓글', val: fmtN(d.avgComments) },
                                                { label: '평균 저장', val: fmtN(igPortfolioData.avgSaves) },
                                                { label: '평균 공유', val: fmtN(d.avgShares) },
                                            ].map(({ label, val }) => (
                                                <div key={label} className="text-center p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                                    <div className="text-[11px] font-black text-zinc-900 dark:text-zinc-50">{val}</div>
                                                    <div className="text-[7px] text-zinc-500 mt-0.5 leading-tight">{label}</div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* 파생 지표 11개 */}
                                        <div className="flex flex-col gap-1">
                                            {metrics.map(({ label, value, formula, color }) => (
                                                <div key={label} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{label}</div>
                                                        <div className="text-[7px] text-zinc-400 font-mono mt-0.5 leading-tight">{formula}</div>
                                                    </div>
                                                    <div className={`text-[10px] font-black ml-2 shrink-0 ${color}`}>{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })()}

                        </div>

                        {/* 단가표 (컴팩트 뷰) */}
                        {(profile.priceVideo > 0 || profile.priceFeed > 0 || profile.priceStory > 0) && (
                            <div className="pt-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
                                    <span className="text-[10px]">💳</span>Rate Card
                                </h3>
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {profile.priceVideo > 0 && (
                                        <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">🎬 릴스/숏폼</span>
                                            <span className="text-[11px] font-bold">{fmtPrice(profile.priceVideo)}</span>
                                        </div>
                                    )}
                                    {profile.priceFeed > 0 && (
                                        <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">🖼 피드</span>
                                            <span className="text-[11px] font-bold">{fmtPrice(profile.priceFeed)}</span>
                                        </div>
                                    )}
                                    {profile.priceStory > 0 && (
                                        <div className="flex items-center justify-between px-3 py-2">
                                            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">⭕ 스토리</span>
                                            <span className="text-[11px] font-bold">{fmtPrice(profile.priceStory)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 협업 히스토리 (최대 3개 노출) */}
                        {profile.moments.length > 0 && (
                            <div className="pt-4 pb-2">
                                <h3 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
                                    <span className="text-[10px]">✨</span>협업 히스토리
                                </h3>
                                <div className="space-y-1.5">
                                    {profile.moments.slice(0, 3).map((m: any) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 transition-all cursor-pointer shadow-sm"
                                            onClick={() => handleMomentClick(m.id)}
                                        >
                                            <div className={`h-5 w-5 rounded-md shrink-0 flex items-center justify-center text-[10px] ${m.status === "recruiting" ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"}`}>
                                                {m.status === "recruiting" ? "🟢" : "✓"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-50 truncate">{m.title}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 하단 버튼 (공간 띄우기 제거) */}
                    {actionSlot && (
                        <div className="mt-4 shrink-0">
                            {actionSlot}
                        </div>
                    )}
                </div>

                {/* ========================================== */}
                {/* 메인 우측 영역: 인스타 통계 및 성과 배지 뷰어 */}
                {/* ========================================== */}
                <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-zinc-950 p-6 pr-8 overflow-y-auto custom-scrollbar">

                    {/* 상단: BEST Instagram 게시물 */}
                    <div className="flex-1 flex flex-col min-h-0 mb-6">
                        <div className="flex items-center justify-between mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                            <h3 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[9px] font-black">BEST</span>
                                {igPortfolioData ? '실제 Instagram 게시물' : '조회수 터진 레퍼런스'}
                            </h3>
                            {igPortfolioData && (
                                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                    {igPortfolioData.er != null && <span className="font-bold text-indigo-600">ER {igPortfolioData.er.toFixed(1)}%</span>}
                                    {igPortfolioData.avgReach != null && <span>평균도달 {igPortfolioData.avgReach.toLocaleString()}</span>}
                                </div>
                            )}
                        </div>

                        {igPortfolioData && igPortfolioData.posts.length > 0 ? (
                            <div className="grid grid-cols-6 gap-3 pb-4">
                                {igPortfolioData.posts.slice(0, 6).map((post, i) => {
                                    const isReel = post.media_type === 'VIDEO' || post.media_source === 'reel'
                                    const thumb = post.thumbnail_url || post.media_url || ''
                                    const engCount = (post.like_count || 0) + (post.comments_count || 0)
                                    return (
                                        <a
                                            key={post.id}
                                            href={post.permalink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative col-span-2 aspect-[4/5] sm:aspect-auto sm:h-[160px] w-full group rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-900 cursor-pointer"
                                        >
                                            {thumb && <img src={thumb} alt="ig post" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-zinc-900/70 backdrop-blur-md border border-white/10 text-[8px] font-bold text-white tracking-widest">
                                                {isReel ? '릴스' : post.media_type === 'CAROUSEL_ALBUM' ? '게시물' : '이미지'}
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <ArrowUpRight className="h-3 w-3 text-white/60" />
                                            </div>
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <div className="text-sm font-black text-white tracking-tight">
                                                    ❤ {post.like_count >= 10000 ? `${(post.like_count / 10000).toFixed(1)}만` : post.like_count.toLocaleString()}
                                                </div>
                                                <div className="flex justify-between text-[9px] text-zinc-300 font-bold mt-0.5">
                                                    <span>💬 {post.comments_count.toLocaleString()}</span>
                                                    <span>참여 {engCount >= 1000 ? `${(engCount / 1000).toFixed(1)}k` : engCount}</span>
                                                </div>
                                            </div>
                                        </a>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-6 gap-3 pb-4">
                                {[
                                    { id: 1, type: '릴스', plays: 1250000, er: 8.5, saved: 14500, time: '9.2초', img: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=200&auto=format&fit=crop' },
                                    { id: 2, type: '릴스', plays: 840000, er: 7.2, saved: 8200, time: '8.4초', img: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?q=80&w=200&auto=format&fit=crop' },
                                    { id: 3, type: '릴스', plays: 620000, er: 9.1, saved: 5100, time: '8.8초', img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=200&auto=format&fit=crop' },
                                    { id: 4, type: '게시물', plays: 320000, er: 4.5, saved: 4500, time: '-', img: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=200&auto=format&fit=crop' },
                                    { id: 5, type: '이미지', plays: 210000, er: 3.8, saved: 2100, time: '-', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
                                    { id: 6, type: '게시물', plays: 185000, er: 3.2, saved: 1950, time: '-', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=200&auto=format&fit=crop' },
                                ].map((ref) => (
                                    <div key={ref.id} className="relative col-span-2 aspect-[4/5] sm:aspect-auto sm:h-[160px] w-full group rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-900">
                                        <img src={ref.img} alt="reference" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-zinc-900/60 backdrop-blur-md border border-white/10 text-[8px] font-bold text-white tracking-widest">{ref.type}</div>
                                        <div className="absolute bottom-2 left-2 right-2">
                                            <div className="text-sm font-black text-white tracking-tight">▶ {ref.plays >= 10000 ? `${(ref.plays / 10000).toFixed(1)}만` : ref.plays.toLocaleString()}</div>
                                            <div className="flex justify-between text-[9px] text-zinc-300 font-bold">
                                                <span>저장 {ref.saved >= 1000 ? `${(ref.saved / 1000).toFixed(1)}k` : ref.saved}</span>
                                                <span>ER {ref.er}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 하단: 배지(좌) & Demographics(우) -> 1 Row 2 Cols */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0">

                        {/* 왼쪽: 인사이트 배지 */}
                        <div className="flex flex-col justify-between gap-3">
                            <h3 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-1.5 px-1">
                                <span className="h-4 w-4 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-[10px]">✨</span>Creator Insights
                            </h3>
                            <div className="flex flex-col gap-2.5 h-full">
                                {igPortfolioData?.insights && igPortfolioData.insights.length > 0 ? (
                                    igPortfolioData.insights.map((badge, i) => (
                                        <div key={i} className="flex-1 flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300 hover:shadow-md hover:border-zinc-400">
                                            <div className="h-7 w-7 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm shrink-0">{badge.emoji}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 mb-0.5">{badge.title}</div>
                                                <div className="text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400 pt-0.5">{badge.description}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs text-center p-4">
                                        MCN이 포트폴리오 수정에서<br />인사이트를 입력하면 표시됩니다
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 오른쪽: Demographics */}
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-1.5 px-1">
                                        <span className="h-4 w-4 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-[10px]">🎯</span>Demographics
                                    </h3>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse" /> {igPortfolioData?.demographics ? 'MCN Set' : 'Live API Set'}
                                    </span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-[#0f0f11] text-white shadow-md border border-zinc-800">
                                    <div className="font-black flex items-center gap-1.5 mb-1.5 text-xs text-zinc-200">메인 타겟 오디언스</div>
                                    <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                                        {igPortfolioData?.demographics?.targetAudienceText
                                            ? igPortfolioData.demographics.targetAudienceText
                                            : <span className="text-zinc-600 italic">데이터가 없습니다 — MCN이 포트폴리오 수정에서 입력해주세요</span>
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                                {(() => {
                                    // MCN 편집 데이터 우선, 없으면 API 실데이터 사용
                                    const femalePct = igPortfolioData?.demographics?.femalePct
                                        ?? (igPortfolioData?.audienceFemaleRatio ?? null)
                                    const ageGroups = igPortfolioData?.demographics?.ageGroups?.length
                                        ? igPortfolioData.demographics.ageGroups
                                        : (igPortfolioData?.allAgeGroups ?? [])
                                    const cities = igPortfolioData?.demographics?.cities?.length
                                        ? igPortfolioData.demographics.cities
                                        : (igPortfolioData?.topCities ?? [])

                                    const hasData = femalePct != null || ageGroups.length > 0 || cities.length > 0
                                    if (!hasData) {
                                        return (
                                            <div className="flex-1 flex items-center justify-center text-zinc-400 text-xs text-center p-4">
                                                MCN이 포트폴리오 수정에서<br />인구통계를 입력하면 표시됩니다
                                            </div>
                                        )
                                    }
                                    const malePct = femalePct != null ? 100 - femalePct : null
                                    return (
                                        <>
                                            {/* 성별 */}
                                            {femalePct != null && malePct != null && (
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">
                                                        <span>여성 {femalePct}%</span>
                                                        <span>남성 {malePct}%</span>
                                                    </div>
                                                    <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 bg-zinc-200 dark:bg-zinc-800">
                                                        <div className="bg-zinc-900 dark:bg-white rounded-full transition-all" style={{ width: `${femalePct}%` }} />
                                                        <div className="bg-zinc-400 dark:bg-zinc-600 rounded-full transition-all" style={{ width: `${malePct}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                            {/* 연령 */}
                                            {ageGroups.length > 0 && (
                                                <div className="space-y-2 mb-4">
                                                    {ageGroups.map(({ age, pct }) => (
                                                        <div key={age} className="flex items-center gap-2">
                                                            <span className="text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200 w-10 shrink-0">{age}</span>
                                                            <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all shadow-sm" style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-zinc-500 w-6 text-right shrink-0">{pct}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {/* 도시 */}
                                            {cities.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50 mt-auto">
                                                    {cities.map(({ city, pct }) => (
                                                        <span key={city} className="text-[9px] font-bold px-2 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 tracking-tight shadow-sm">
                                                            {city} <span className="text-zinc-900 dark:text-zinc-100 ml-0.5">{pct}%</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DialogContent>
    )
}

