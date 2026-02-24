"use client"

import { useSocialChannels, useUnifiedProvider } from "@/components/providers/unified-provider"
import { useEffectiveUser } from "@/lib/hooks/use-effective-user"
import { BarChart3, Bookmark, ChevronDown, Eye, Film, Heart, Image as ImageIcon, Instagram, Lightbulb, Loader2, MessageCircle, Plus, Share2, Sparkles, TrendingUp, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// ── Types ────────────────────────────────────────────────
interface IgStats {
    er: number | null; avgReach: number | null; avgLikes: number | null
    avgSaves: number | null; saveRate: number | null; reachRate: number | null
    audienceFemaleRatio: number | null; audienceAge2534Ratio: number | null
    audienceDomesticRatio: number | null; postCount: number; source: string
}
interface PerfStats { avgEngagementRate: number | null; avgCpe: number | null; count: number }
interface AnalysisResult {
    extracted: {
        metrics: { views: number | null; likes: number | null; comments: number | null; shares: number | null; saves: number | null; reposts: number | null; followers: number | null; newFollowers: number | null; reach: number | null; interactions: number | null; contentCount: number | null; period: string | null }
        trafficSources: { feed: number | null; profile: number | null; search: number | null; other: number | null }
        screenshotType: string
    }
    engagementRate: number; engagementGrade: string; engagementEmoji: string
    totalEngagement: number; baseCount: number; recommendedPrice: number | null
    discoveryGrade: string; tips: string[]
}
type SlotKey = "account" | "post" | "reels"
interface SlotState { file: File | null; preview: string | null; result: AnalysisResult | null; isAnalyzing: boolean }

// ── Constants ────────────────────────────────────────────
const CATEGORY_CPE: Record<string, number> = {
    '💊 건강': 1100, '💉 시술/병원': 1100, '🥗 다이어트': 1000,
    '💄 뷰티': 900, '💻 테크/IT': 800, '💍 웨딩/결혼': 750,
    '👶 육아': 650, '🏋️ 헬스/운동': 650, '👗 패션': 600,
    '✈️ 여행': 550, '🏡 리빙/인테리어': 500, '🐶 반려동물': 450,
    '🍽️ 맛집': 350, '🎮 게임': 300,
}
const CONTENT_MULT: Record<string, number> = { reels: 1.5, feed: 1.0, story: 0.5 }
const CONTENT_LABEL: Record<string, string> = { reels: '릴스/쇼츠 ×1.5', feed: '피드(사진) ×1.0', story: '스토리 ×0.5' }
const FEMALE_CATS = ['💄 뷰티', '👗 패션', '👶 육아', '💍 웨딩/결혼']

const SLOTS = [
    { key: "account" as SlotKey, label: "계정 전체 인사이트", description: "프로필 → 프로페셔널 대시보드 → 계정 인사이트", icon: BarChart3, badgeItems: ["도달한 계정 수", "팔로워 수 + 증감", "참여한 계정 수"] },
    { key: "post" as SlotKey, label: "개별 게시물 인사이트", description: "게시물 열기 → 하단 인사이트 보기 탭", icon: ImageIcon, badgeItems: ["좋아요", "댓글", "공유", "저장", "도달 수"] },
    { key: "reels" as SlotKey, label: "릴스 인사이트", description: "릴스 열기 → 인사이트 보기", icon: Film, badgeItems: ["재생 수", "좋아요", "댓글", "저장", "평균 시청 시간"], recommended: true },
]

const fmt = (n: number) => {
    if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억원`
    if (n >= 10000) return `${Math.round(n / 10000)}만원`
    return `${n.toLocaleString()}원`
}
const fmtNum = (n: number | null | undefined) => {
    if (n == null) return "—"
    if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toLocaleString()
}

// ── Notion-style section wrapper ─────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-neutral-700">
            <div className="px-4 py-2.5 bg-stone-100 dark:bg-neutral-800 border-b border-stone-200 dark:border-neutral-700">
                <p className="text-[10px] font-semibold text-stone-500 dark:text-neutral-400 uppercase tracking-wider">{title}</p>
            </div>
            {children}
        </div>
    )
}

function Row({ label, value, sub, badge, last }: { label: string; value?: React.ReactNode; sub?: string; badge?: React.ReactNode; last?: boolean }) {
    return (
        <div className={cn("flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-neutral-900", !last && "border-b border-stone-100 dark:border-neutral-800")}>
            <span className="text-xs text-stone-400 dark:text-neutral-500">{label}</span>
            <div className="flex items-center gap-2">
                {badge}
                {sub && <span className="text-[10px] text-stone-400 dark:text-neutral-600">{sub}</span>}
                {value && <span className="text-sm font-semibold text-stone-800 dark:text-neutral-200">{value}</span>}
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────
export default function InsightAnalyzer() {
    const { channels, fetchChannels, createChannel } = useSocialChannels()
    const { effectiveUser, effectiveUserId } = useEffectiveUser()

    const [igStats, setIgStats] = useState<IgStats | null>(null)
    const [igStatsLoading, setIgStatsLoading] = useState(false)
    const [perfStats, setPerfStats] = useState<PerfStats | null>(null)

    // Calculator state
    const [calcContentType, setCalcContentType] = useState<'reels' | 'feed' | 'story'>('reels')
    const [calcUsageRights, setCalcUsageRights] = useState(false)
    const [calcExclusivity, setCalcExclusivity] = useState(false)
    const [calcHighProduction, setCalcHighProduction] = useState(false)
    const [calcSeason, setCalcSeason] = useState(false)

    // Capture state
    const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
        account: { file: null, preview: null, result: null, isAnalyzing: false },
        post: { file: null, preview: null, result: null, isAnalyzing: false },
        reels: { file: null, preview: null, result: null, isAnalyzing: false },
    })
    const fileInputRefs = useRef<Record<SlotKey, HTMLInputElement | null>>({ account: null, post: null, reels: null })

    const igChannel = channels?.find((ch: any) => ch.platform === 'instagram')
    const isApiConnected = !!igChannel && igStats?.source === 'instagram_api'
    const selectedTags: string[] = (effectiveUser as any)?.tags || []
    const totalFollowers = channels?.reduce((s: number, ch: any) => s + (ch.followersCount || 0), 0) || 0

    // Load channels
    useEffect(() => { if (effectiveUserId) fetchChannels(effectiveUserId) }, [effectiveUserId])

    // Load perf stats
    useEffect(() => {
        if (!effectiveUserId) return
        const supabase = createClient()
        supabase.from('campaign_performance').select('engagement_rate, cpe').eq('creator_id', effectiveUserId)
            .then(({ data }) => {
                if (data && data.length > 0) {
                    const validER = data.filter(d => d.engagement_rate != null)
                    const validCpe = data.filter(d => d.cpe != null)
                    setPerfStats({
                        avgEngagementRate: validER.length > 0 ? validER.reduce((s, d) => s + d.engagement_rate, 0) / validER.length : null,
                        avgCpe: validCpe.length > 0 ? validCpe.reduce((s, d) => s + d.cpe, 0) / validCpe.length : null,
                        count: data.length
                    })
                }
            })
    }, [effectiveUserId])

    // Load IG stats
    useEffect(() => {
        if (!effectiveUserId || !igChannel) return
        setIgStatsLoading(true)
        fetch(`/api/instagram/profile-stats?userId=${effectiveUserId}`)
            .then(r => r.json())
            .then(data => { if (!data.error) setIgStats(data) })
            .catch(() => { })
            .finally(() => setIgStatsLoading(false))
    }, [effectiveUserId, igChannel?.id])

    // ── Calculator logic ──────────────────────────────────
    const primaryTag = selectedTags[0] || ''
    const baseCpe = CATEGORY_CPE[primaryTag] ?? 400
    const igErRaw = igStats?.er != null ? igStats.er / 100 : null
    const er: number = igErRaw
        ?? (perfStats?.avgEngagementRate != null ? perfStats.avgEngagementRate / 100 : null)
        ?? (totalFollowers >= 1000000 ? 0.012 : totalFollowers >= 100000 ? 0.025 : totalFollowers >= 10000 ? 0.04 : 0.06)
    const erSource = igErRaw != null ? 'instagram_api' : perfStats?.avgEngagementRate != null ? 'campaign' : 'estimate'
    const erSourceLabel = erSource === 'instagram_api' ? 'IG 실측' : erSource === 'campaign' ? '캠페인' : '추정값'

    const erBenchmark = totalFollowers >= 1000000 ? 0.010 : totalFollowers >= 500000 ? 0.015 : totalFollowers >= 100000 ? 0.025 : totalFollowers >= 10000 ? 0.040 : 0.060
    const erRatio = erBenchmark > 0 ? er / erBenchmark : 1.0
    const erLabel = erRatio >= 3.0 ? `최상위 (${erRatio.toFixed(1)}x)` : erRatio >= 2.0 ? `팬덤형 (${erRatio.toFixed(1)}x)` : erRatio >= 1.5 ? `우수 (${erRatio.toFixed(1)}x)` : erRatio >= 1.0 ? `평균 (${erRatio.toFixed(1)}x)` : `기대 미달 (${erRatio.toFixed(1)}x)`

    const reachAdj: number | null = igStats?.reachRate != null
        ? (igStats.reachRate >= 40 ? 1.15 : igStats.reachRate >= 25 ? 1.05 : igStats.reachRate >= 15 ? 1.0 : igStats.reachRate >= 8 ? 0.85 : 0.7) : null
    const reachAdjLabel = reachAdj == null ? null : reachAdj >= 1.1 ? `도달${igStats!.reachRate}% 진성 +${Math.round((reachAdj - 1) * 100)}%` : reachAdj < 1.0 ? `도달${igStats!.reachRate}% 유령팔로워 ${Math.round((reachAdj - 1) * 100)}%` : null
    const saveAdj: number | null = igStats?.saveRate != null ? (igStats.saveRate >= 5 ? 1.25 : igStats.saveRate >= 3 ? 1.15 : igStats.saveRate >= 1.5 ? 1.05 : null) : null
    const saveAdjLabel = saveAdj != null ? `저장률${igStats!.saveRate}% +${Math.round((saveAdj - 1) * 100)}%` : null
    const femaleAdj: number | null = (igStats?.audienceFemaleRatio != null && FEMALE_CATS.includes(primaryTag)) ? (igStats.audienceFemaleRatio >= 70 ? 1.20 : igStats.audienceFemaleRatio >= 60 ? 1.10 : null) : null
    const femaleAdjLabel = femaleAdj != null ? `여성${igStats!.audienceFemaleRatio}% +${Math.round((femaleAdj - 1) * 100)}%` : null
    const ageAdj: number | null = (igStats?.audienceAge2534Ratio != null && igStats.audienceAge2534Ratio >= 30) ? 1.10 : null
    const ageAdjLabel = ageAdj != null ? `25~34세 ${igStats!.audienceAge2534Ratio}% +10%` : null
    const domesticAdj: number | null = (igStats?.audienceDomesticRatio != null && igStats.audienceDomesticRatio >= 75) ? 1.08 : null
    const domesticAdjLabel = domesticAdj != null ? `국내${igStats!.audienceDomesticRatio}% +8%` : null

    const effectiveCpe = perfStats?.avgCpe ?? (() => {
        let cpe = baseCpe
        if (reachAdj != null) cpe = Math.round(cpe * reachAdj)
        if (saveAdj != null) cpe = Math.round(cpe * saveAdj)
        if (femaleAdj != null) cpe = Math.round(cpe * femaleAdj)
        if (ageAdj != null) cpe = Math.round(cpe * ageAdj)
        if (domesticAdj != null) cpe = Math.round(cpe * domesticAdj)
        return cpe
    })()

    const contentMult = CONTENT_MULT[calcContentType] ?? 1.0
    const totalAddMult = (calcUsageRights ? 1.35 : 1) * (calcExclusivity ? 1.5 : 1) * (calcHighProduction ? 1.3 : 1) * (calcSeason ? 1.15 : 1)
    const estimatedValue = Math.round(totalFollowers * er * effectiveCpe * contentMult * totalAddMult)
    const minValue = Math.round(estimatedValue * 0.8)
    const maxValue = Math.round(estimatedValue * 1.2)

    const tierLabel = totalFollowers >= 1000000 ? '메가' : totalFollowers >= 100000 ? '매크로' : totalFollowers >= 10000 ? '마이크로' : '나노'

    // ── Capture handlers ──────────────────────────────────
    const handleFile = useCallback((key: SlotKey, f: File) => {
        if (!f.type.startsWith("image/")) { toast.error("이미지 파일만 업로드 가능합니다."); return }
        const reader = new FileReader()
        reader.onload = (e) => setSlots(prev => ({ ...prev, [key]: { file: f, preview: e.target?.result as string, result: null, isAnalyzing: false } }))
        reader.readAsDataURL(f)
    }, [])

    const handleAnalyze = async (key: SlotKey) => {
        const slot = slots[key]
        if (!slot.file) return
        setSlots(prev => ({ ...prev, [key]: { ...prev[key], isAnalyzing: true } }))
        try {
            const formData = new FormData()
            formData.append("image", slot.file)
            const res = await fetch("/api/analyze-insight", { method: "POST", body: formData })
            const data = await res.json()
            if (data.error) { toast.error(data.error); setSlots(prev => ({ ...prev, [key]: { ...prev[key], isAnalyzing: false } })); return }
            setSlots(prev => ({ ...prev, [key]: { ...prev[key], result: data, isAnalyzing: false } }))
            toast.success(`${SLOTS.find(s => s.key === key)?.label} 분석 완료!`)
        } catch {
            toast.error("분석 중 오류가 발생했습니다.")
            setSlots(prev => ({ ...prev, [key]: { ...prev[key], isAnalyzing: false } }))
        }
    }

    const clearSlot = (key: SlotKey) => setSlots(prev => ({ ...prev, [key]: { file: null, preview: null, result: null, isAnalyzing: false } }))
    const hasAnyResult = Object.values(slots).some(s => s.result)

    const erBadgeColor = erSource === 'instagram_api'
        ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800'
        : erSource === 'campaign'
            ? 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800'
            : 'text-stone-500 bg-stone-100 border-stone-200 dark:text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700'

    // ── Render ────────────────────────────────────────────
    return (
        <div className="space-y-6 max-w-2xl mx-auto">

            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-neutral-100 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    AI 단가 분석기
                </h2>
                <p className="text-sm text-stone-400 dark:text-neutral-500 mt-1">
                    소셜 채널을 연결하면 실측 데이터로 자동 계산됩니다.
                </p>
            </div>

            {/* ── Section 1: 소셜 채널 ── */}
            <Section title="소셜 채널">
                {channels && channels.length > 0 ? (
                    <>
                        {channels.map((ch: any, i: number) => {
                            const isLast = i === channels.length - 1
                            const platLabel = ch.platform === 'instagram' ? 'Instagram' : ch.platform === 'youtube' ? 'YouTube' : ch.platform === 'tiktok' ? 'TikTok' : ch.platform
                            const platColor = ch.platform === 'instagram' ? 'text-pink-600 dark:text-pink-400' : ch.platform === 'youtube' ? 'text-red-600 dark:text-red-400' : 'text-stone-600 dark:text-neutral-400'
                            return (
                                <div key={ch.id} className={cn("flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-neutral-900", !isLast && "border-b border-stone-100 dark:border-neutral-800")}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", ch.platform === 'instagram' && igStats?.source === 'instagram_api' ? 'bg-emerald-400' : 'bg-stone-300 dark:bg-neutral-600')} />
                                        <div>
                                            <p className={cn("text-xs font-semibold", platColor)}>{platLabel}</p>
                                            {ch.handle && <p className="text-[10px] text-stone-400 dark:text-neutral-600">@{ch.handle}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {ch.platform === 'instagram' && igStats?.source === 'instagram_api' && (
                                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800">
                                                API 연결됨
                                            </span>
                                        )}
                                        {ch.platform === 'instagram' && igStats === null && igChannel && !igStatsLoading && (
                                            <span className="text-[9px] text-stone-400 dark:text-neutral-600">기본 연결</span>
                                        )}
                                        <span className="text-xs font-semibold text-stone-800 dark:text-neutral-200">
                                            {ch.followersCount ? `${(ch.followersCount / 10000).toFixed(1)}만명` : '—'}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                ) : (
                    <div className="px-4 py-4 bg-stone-50 dark:bg-neutral-900 text-center">
                        <p className="text-xs text-stone-400 dark:text-neutral-600">연결된 채널이 없습니다</p>
                    </div>
                )}
                {/* Connect / Add buttons */}
                {effectiveUserId && (
                    <div className="px-4 py-3 bg-stone-100 dark:bg-neutral-800 border-t border-stone-200 dark:border-neutral-700 flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors">
                                    <Instagram className="h-3.5 w-3.5" />
                                    Instagram {igChannel ? '재연결' : '연결'}
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[240px]">
                                <DropdownMenuLabel>연결 방식</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => window.location.href = `/api/instagram/connect?userId=${effectiveUserId}`} className="cursor-pointer py-2.5 gap-2">
                                    <TrendingUp className="h-4 w-4 text-pink-500" />
                                    <div>
                                        <p className="text-xs font-semibold">비즈니스 계정 <span className="text-pink-500">(추천)</span></p>
                                        <p className="text-[10px] text-muted-foreground">상세 통계 자동 수집</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.location.href = `/api/instagram/connect-basic?userId=${effectiveUserId}`} className="cursor-pointer py-2.5 gap-2">
                                    <Instagram className="h-4 w-4 text-stone-400" />
                                    <div>
                                        <p className="text-xs font-semibold">일반 인스타그램</p>
                                        <p className="text-[10px] text-muted-foreground">계정 인증 전용</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </Section>

            {/* ── Section 2: 광고단가 계산기 ── */}
            {totalFollowers === 0 ? (
                /* No channel state */
                <div className="rounded-xl border-2 border-dashed border-stone-200 dark:border-neutral-700 p-8 text-center bg-stone-50 dark:bg-neutral-900">
                    <p className="text-sm font-medium text-stone-500 dark:text-neutral-400 mb-1">소셜 채널 연결 필요</p>
                    <p className="text-xs text-stone-400 dark:text-neutral-600">채널을 연결하면 팔로워 수를 기반으로 예상 광고 단가를 자동 계산합니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* 핵심 지표 */}
                    <Section title="광고단가 계산기">
                        {[
                            { label: '팔로워', value: totalFollowers >= 10000 ? `${(totalFollowers / 10000).toFixed(1)}만명` : `${totalFollowers.toLocaleString()}명`, sub: tierLabel },
                            { label: '참여율 (ER)', value: `${(er * 100).toFixed(1)}%`, badge: <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-medium", erBadgeColor)}>{erSourceLabel}</span> },
                            { label: '기준 CPE', value: `₩${baseCpe.toLocaleString()}`, sub: primaryTag || '카테고리 미설정' },
                            { label: '실효 CPE', value: `₩${effectiveCpe.toLocaleString()}`, sub: erLabel, highlight: true },
                        ].map((item, i, arr) => (
                            <div key={item.label} className={cn("flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-neutral-900", i < arr.length - 1 && "border-b border-stone-100 dark:border-neutral-800")}>
                                <span className="text-xs text-stone-400 dark:text-neutral-500">{item.label}</span>
                                <div className="flex items-center gap-2">
                                    {'badge' in item && item.badge}
                                    {item.sub && <span className="text-[10px] text-stone-400 dark:text-neutral-600">{item.sub}</span>}
                                    <span className={cn("text-sm font-semibold", item.highlight ? 'text-amber-800 dark:text-amber-400' : 'text-stone-800 dark:text-neutral-200')}>{item.value}</span>
                                </div>
                            </div>
                        ))}
                    </Section>

                    {/* Instagram 실측 인사이트 */}
                    {igStatsLoading ? (
                        <div className="px-4 py-3 rounded-xl border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-900 flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />
                            <span className="text-xs text-stone-400 dark:text-neutral-500">Instagram 실측 데이터 로딩 중...</span>
                        </div>
                    ) : igStats && igStats.source === 'instagram_api' ? (
                        <Section title="Instagram 실측 인사이트">
                            <div className="grid grid-cols-4 bg-stone-50 dark:bg-neutral-900">
                                {[
                                    { label: '평균 도달', value: igStats.avgReach != null ? fmtNum(igStats.avgReach) : '—' },
                                    { label: '도달률', value: igStats.reachRate != null ? `${igStats.reachRate}%` : '—' },
                                    { label: '평균 저장', value: igStats.avgSaves != null ? fmtNum(igStats.avgSaves) : '—' },
                                    { label: '저장률', value: igStats.saveRate != null ? `${igStats.saveRate}%` : '—' },
                                ].map((m, i, arr) => (
                                    <div key={m.label} className={cn("py-3 text-center", i < arr.length - 1 && "border-r border-stone-100 dark:border-neutral-800")}>
                                        <p className="text-[9px] text-stone-400 dark:text-neutral-600 mb-1">{m.label}</p>
                                        <p className="text-xs font-semibold text-stone-800 dark:text-neutral-200">{m.value}</p>
                                    </div>
                                ))}
                            </div>
                            {(igStats.audienceFemaleRatio != null || igStats.audienceAge2534Ratio != null || igStats.audienceDomesticRatio != null) && (
                                <div className="grid grid-cols-3 border-t border-stone-100 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-900">
                                    {[
                                        { label: '여성 팔로워', value: igStats.audienceFemaleRatio != null ? `${igStats.audienceFemaleRatio}%` : '—' },
                                        { label: '25~34세', value: igStats.audienceAge2534Ratio != null ? `${igStats.audienceAge2534Ratio}%` : '—' },
                                        { label: '국내 팔로워', value: igStats.audienceDomesticRatio != null ? `${igStats.audienceDomesticRatio}%` : '—' },
                                    ].map((m, i, arr) => (
                                        <div key={m.label} className={cn("py-2.5 text-center", i < arr.length - 1 && "border-r border-stone-100 dark:border-neutral-800")}>
                                            <p className="text-[9px] text-stone-400 dark:text-neutral-600 mb-0.5">{m.label}</p>
                                            <p className="text-xs font-semibold text-stone-800 dark:text-neutral-200">{m.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                    ) : null}

                    {/* 콘텐츠 유형 */}
                    <div>
                        <p className="text-[10px] font-semibold text-stone-400 dark:text-neutral-500 uppercase tracking-wider mb-2">콘텐츠 유형</p>
                        <div className="flex gap-1 p-1 rounded-xl bg-stone-100 dark:bg-neutral-800">
                            {(['reels', 'feed', 'story'] as const).map(ct => (
                                <button key={ct} onClick={() => setCalcContentType(ct)}
                                    className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all", calcContentType === ct
                                        ? 'bg-white dark:bg-neutral-700 text-amber-800 dark:text-amber-400 shadow-sm'
                                        : 'text-stone-400 dark:text-neutral-600 hover:text-stone-600 dark:hover:text-neutral-400')}>
                                    {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                                    <span className="block text-[9px] mt-0.5 opacity-60">{ct === 'reels' ? '×1.5' : ct === 'feed' ? '×1.0' : '×0.5'}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 부가 조건 */}
                    <div>
                        <p className="text-[10px] font-semibold text-stone-400 dark:text-neutral-500 uppercase tracking-wider mb-2">부가 조건</p>
                        <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-neutral-700">
                            {[
                                { key: 'usage', label: '2차 활용권', desc: '광고 소재 재사용', mult: '+35%', active: calcUsageRights, set: setCalcUsageRights },
                                { key: 'excl', label: '독점 계약', desc: '경쟁사 협업 제한', mult: '+50%', active: calcExclusivity, set: setCalcExclusivity },
                                { key: 'prod', label: '고제작 난이도', desc: '스튜디오·모델 포함', mult: '+30%', active: calcHighProduction, set: setCalcHighProduction },
                                { key: 'season', label: '시의성 콘텐츠', desc: '트렌드·시즌 한정', mult: '+15%', active: calcSeason, set: setCalcSeason },
                            ].map(({ key, label, desc, mult, active, set }, i, arr) => (
                                <button key={key} onClick={() => set(!active)}
                                    className={cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-all", i < arr.length - 1 && "border-b border-stone-100 dark:border-neutral-800", active ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-stone-50 dark:bg-neutral-900')}>
                                    <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all", active ? 'bg-amber-700 border-amber-700 dark:bg-amber-600 dark:border-amber-600' : 'border-stone-300 dark:border-neutral-600')}>
                                        {active && <span className="text-white text-[8px] font-bold">✓</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-xs font-medium", active ? 'text-amber-800 dark:text-amber-400' : 'text-stone-700 dark:text-neutral-300')}>{label}</p>
                                        <p className="text-[10px] text-stone-400 dark:text-neutral-600 mt-0.5">{desc}</p>
                                    </div>
                                    <span className={cn("text-xs font-bold shrink-0", active ? 'text-amber-700 dark:text-amber-500' : 'text-stone-300 dark:text-neutral-700')}>{mult}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 결과 */}
                    <div className="rounded-xl px-5 py-6 text-center bg-neutral-900 dark:bg-black">
                        <p className="text-[10px] text-neutral-500 mb-2">{CONTENT_LABEL[calcContentType]}</p>
                        <p className="text-3xl font-bold tracking-tight text-neutral-100" style={{ letterSpacing: '-0.02em' }}>
                            {fmt(minValue)}<span className="text-neutral-700 mx-2">—</span>{fmt(maxValue)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-2 font-medium">평균 {fmt(Math.round((minValue + maxValue) / 2))}</p>
                    </div>

                    {/* 계산 근거 */}
                    <Section title="실효 CPE 계산 근거">
                        {[
                            { label: '카테고리 기준 CPE', value: `₩${baseCpe.toLocaleString()}`, note: primaryTag || '카테고리 미설정', highlight: false },
                            ...(reachAdj != null && reachAdj !== 1.0 ? [{ label: '도달률 보정', value: `₩${Math.round(baseCpe * reachAdj).toLocaleString()}`, note: reachAdjLabel!, highlight: false }] : []),
                            ...(saveAdj != null ? [{ label: '저장률 보정', value: '', note: saveAdjLabel!, highlight: false }] : []),
                            ...(femaleAdj != null ? [{ label: '여성 오디언스', value: '', note: femaleAdjLabel!, highlight: false }] : []),
                            ...(ageAdj != null ? [{ label: '25~34세 보정', value: '', note: ageAdjLabel!, highlight: false }] : []),
                            ...(domesticAdj != null ? [{ label: '국내 팔로워', value: '', note: domesticAdjLabel!, highlight: false }] : []),
                            { label: '최종 실효 CPE', value: `₩${effectiveCpe.toLocaleString()}`, note: perfStats?.avgCpe ? '실제 캠페인' : '계산값', highlight: true },
                        ].map((step, i, arr) => (
                            <div key={i} className={cn("flex items-center justify-between px-4 py-2.5", i < arr.length - 1 && "border-b border-stone-100 dark:border-neutral-800", step.highlight ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-stone-50 dark:bg-neutral-900')}>
                                <span className="text-[10px] text-stone-400 dark:text-neutral-500">{step.label}</span>
                                <div className="flex items-center gap-2">
                                    {step.note && <span className="text-[9px] text-stone-400 dark:text-neutral-600">{step.note}</span>}
                                    {step.value && <span className={cn("text-[11px] font-semibold", step.highlight ? 'text-amber-800 dark:text-amber-400' : 'text-stone-700 dark:text-neutral-300')}>{step.value}</span>}
                                </div>
                            </div>
                        ))}
                        <div className="px-4 py-2.5 bg-stone-100 dark:bg-neutral-800 border-t border-stone-200 dark:border-neutral-700">
                            <p className="text-[9px] text-stone-400 dark:text-neutral-600 leading-relaxed">
                                {totalFollowers.toLocaleString()} × {(er * 100).toFixed(1)}% × ₩{effectiveCpe.toLocaleString()} × {contentMult} × {totalAddMult.toFixed(2)} = ₩{estimatedValue.toLocaleString()}
                            </p>
                            {!primaryTag && <p className="text-[9px] text-amber-600 dark:text-amber-500 mt-1">프로필에서 카테고리 태그를 설정하면 더 정확합니다</p>}
                        </div>
                    </Section>
                </div>
            )}

            {/* ── Section 3: 캡처 분석 ── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-[10px] font-semibold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">캡처 분석</p>
                        <p className="text-xs text-stone-400 dark:text-neutral-600 mt-0.5">
                            {isApiConnected ? 'API 데이터가 있어 캡처 분석은 참고용으로만 사용됩니다.' : 'Instagram 인사이트 스크린샷으로 AI 분석'}
                        </p>
                    </div>
                </div>
                <div className="space-y-3">
                    {SLOTS.map(slot => {
                        const state = slots[slot.key]
                        const SlotIcon = slot.icon
                        return (
                            <div key={slot.key} className={cn("rounded-xl border overflow-hidden", state.result ? 'border-emerald-200 dark:border-emerald-800' : 'border-stone-200 dark:border-neutral-700')}>
                                <div className={cn("px-4 py-2.5 flex items-center justify-between border-b", state.result ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 dark:bg-neutral-800 border-stone-200 dark:border-neutral-700')}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-stone-700 dark:text-neutral-300">{slot.label}</span>
                                        {slot.recommended && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800">추천</span>}
                                        {state.result && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">✓ 완료</span>}
                                    </div>
                                    {state.result && (
                                        <span className="text-sm font-bold text-stone-700 dark:text-neutral-300">{state.result.engagementRate}% {state.result.engagementEmoji}</span>
                                    )}
                                </div>
                                <div className="p-4 bg-stone-50 dark:bg-neutral-900">
                                    {!state.preview ? (
                                        <div className="border border-dashed border-stone-300 dark:border-neutral-700 rounded-lg p-4 text-center cursor-pointer hover:border-stone-400 dark:hover:border-neutral-600 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
                                            onClick={() => fileInputRefs.current[slot.key]?.click()}>
                                            <SlotIcon className="mx-auto h-5 w-5 text-stone-300 dark:text-neutral-600 mb-2" />
                                            <p className="text-xs text-stone-400 dark:text-neutral-600 mb-2">{slot.description}</p>
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {slot.badgeItems.map(item => (
                                                    <span key={item} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-neutral-800 text-stone-500 dark:text-neutral-500">{item}</span>
                                                ))}
                                            </div>
                                            <input ref={el => { fileInputRefs.current[slot.key] = el }} type="file" accept="image/*" className="hidden"
                                                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(slot.key, f); e.target.value = "" }} />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex gap-3 items-center">
                                                <div className="relative shrink-0">
                                                    <img src={state.preview!} alt={slot.label} className="w-16 h-auto rounded-lg border border-stone-200 dark:border-neutral-700 object-contain max-h-28" />
                                                    <button onClick={() => clearSlot(slot.key)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-stone-700 dark:text-neutral-300 truncate">{state.file?.name}</p>
                                                    <p className="text-[10px] text-stone-400 dark:text-neutral-600">{state.file ? `${(state.file.size / 1024).toFixed(0)}KB` : ""}</p>
                                                    {!state.result && (
                                                        <button onClick={() => handleAnalyze(slot.key)} disabled={state.isAnalyzing}
                                                            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-stone-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors">
                                                            {state.isAnalyzing ? <><Loader2 className="h-3 w-3 animate-spin" /> 분석 중...</> : <><Sparkles className="h-3 w-3" /> AI 분석</>}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {state.result && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                                    {[
                                                        { icon: Eye, label: "조회수", value: state.result.extracted.metrics.views },
                                                        { icon: Heart, label: "좋아요", value: state.result.extracted.metrics.likes },
                                                        { icon: MessageCircle, label: "댓글", value: state.result.extracted.metrics.comments },
                                                        { icon: Share2, label: "공유", value: state.result.extracted.metrics.shares },
                                                        { icon: Bookmark, label: "저장", value: state.result.extracted.metrics.saves },
                                                        { icon: TrendingUp, label: "도달", value: state.result.extracted.metrics.reach },
                                                    ].filter(item => item.value != null).map(item => (
                                                        <div key={item.label} className="flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-neutral-800 rounded-lg px-2.5 py-1.5">
                                                            <item.icon className="h-3 w-3 text-stone-400 dark:text-neutral-600 shrink-0" />
                                                            <span className="text-stone-500 dark:text-neutral-500 text-[10px]">{item.label}</span>
                                                            <span className="font-semibold ml-auto text-stone-800 dark:text-neutral-200 text-[11px]">{fmtNum(item.value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Combined result from captures */}
                {hasAnyResult && (() => {
                    const results = Object.values(slots).filter(s => s.result).map(s => s.result!)
                    const bestPrice = Math.max(...results.map(r => r.recommendedPrice || 0))
                    const avgEr = results.reduce((sum, r) => sum + r.engagementRate, 0) / results.length
                    const totalTips = [...new Set(results.flatMap(r => r.tips))]
                    return (
                        <div className="mt-4 space-y-3 animate-in fade-in-0 duration-500">
                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                                <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-800">
                                    <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">캡처 분석 결과</p>
                                </div>
                                <div className="flex items-center justify-between px-4 py-4 bg-stone-50 dark:bg-neutral-900">
                                    <div>
                                        <p className="text-xs text-stone-400 dark:text-neutral-500 mb-1">AI 추천 단가</p>
                                        <p className="text-2xl font-bold text-stone-900 dark:text-neutral-100">
                                            {bestPrice >= 10000 ? `${Math.round(bestPrice / 10000)}만원` : `${bestPrice.toLocaleString()}원`}
                                        </p>
                                        <p className="text-[10px] text-stone-400 dark:text-neutral-600 mt-1">{results.length}개 캡처 · 평균 ER {avgEr.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>
                            {totalTips.length > 0 && (
                                <div className="rounded-xl border border-stone-200 dark:border-neutral-700 overflow-hidden">
                                    <div className="px-4 py-2.5 bg-stone-100 dark:bg-neutral-800 border-b border-stone-200 dark:border-neutral-700">
                                        <p className="text-[10px] font-semibold text-stone-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Lightbulb className="h-3 w-3 text-amber-500" />개선 팁
                                        </p>
                                    </div>
                                    <div className="px-4 py-3 bg-stone-50 dark:bg-neutral-900 space-y-1">
                                        {totalTips.map((tip, i) => <p key={i} className="text-xs text-stone-500 dark:text-neutral-500">• {tip}</p>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })()}
            </div>
        </div>
    )
}
