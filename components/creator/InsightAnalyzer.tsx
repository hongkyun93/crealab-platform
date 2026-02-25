"use client"

import { useSocialChannels, useUnifiedProvider } from "@/components/providers/unified-provider"
import { useEffectiveUser } from "@/lib/hooks/use-effective-user"
import { SocialChannelCard } from "@/components/creator/views/SettingsView"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart3, Bookmark, ChevronDown, Eye, Film, Heart,
    Image as ImageIcon, Instagram, Lightbulb, Loader2,
    MessageCircle, Plus, Share2, Sparkles, TrendingUp, X
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ── Types ─────────────────────────────────────────────────
interface IgStats {
    er: number | null; erByReach: number | null; erByFollowers: number | null
    avgReach: number | null; avgLikes: number | null
    avgSaves: number | null; saveRate: number | null; reachRate: number | null
    audienceFemaleRatio: number | null; audienceAge2534Ratio: number | null
    audienceDomesticRatio: number | null; postCount: number; source: string
}
interface PerfStats { avgEngagementRate: number | null; avgCpe: number | null; count: number }
interface AnalysisResult {
    extracted: {
        metrics: {
            views: number | null; likes: number | null; comments: number | null
            shares: number | null; saves: number | null; reposts: number | null
            followers: number | null; newFollowers: number | null; reach: number | null
            interactions: number | null; contentCount: number | null; period: string | null
        }
        trafficSources: { feed: number | null; profile: number | null; search: number | null; other: number | null }
        screenshotType: string
    }
    engagementRate: number; engagementGrade: string; engagementEmoji: string
    totalEngagement: number; baseCount: number; recommendedPrice: number | null
    discoveryGrade: string; tips: string[]
}
type SlotKey = "account" | "post" | "reels"
interface SlotState { file: File | null; preview: string | null; result: AnalysisResult | null; isAnalyzing: boolean }

// ── Constants ──────────────────────────────────────────────
const CATEGORY_CPE: Record<string, number> = {
    '💊 건강': 2200, '💉 시술/병원': 2200, '🥗 다이어트': 2000,
    '💄 뷰티': 1800, '💻 테크/IT': 1600, '💍 웨딩/결혼': 1500,
    '👶 육아': 1300, '🏋️ 헬스/운동': 1300, '👗 패션': 1200,
    '✈️ 여행': 1100, '🏡 리빙/인테리어': 1000, '🐶 반려동물': 900,
    '🍽️ 맛집': 700, '🎮 게임': 600,
}
// CPM (도달 1000명당 단가) - go_gyeol_kim 실데이터(뷰티 ₩17,000) 기준 캘리브레이션
const CATEGORY_CPM: Record<string, number> = {
    '💊 건강': 21000, '💉 시술/병원': 21000, '🥗 다이어트': 19000,
    '💄 뷰티': 17000, '💻 테크/IT': 15000, '💍 웨딩/결혼': 14000,
    '👶 육아': 12000, '🏋️ 헬스/운동': 12000, '👗 패션': 11000,
    '✈️ 여행': 10500, '🏡 리빙/인테리어': 9500, '🐶 반려동물': 8500,
    '🍽️ 맛집': 7000, '🎮 게임': 6000,
}
const CONTENT_MULT: Record<string, number> = { reels: 1.5, feed: 1.0, story: 0.5 }
const CONTENT_LABEL: Record<string, string> = { reels: '릴스 ×1.5', feed: '피드 ×1.0', story: '스토리 ×0.5' }
const FEMALE_CATS = ['💄 뷰티', '👗 패션', '👶 육아', '💍 웨딩/결혼']

const SLOTS = [
    {
        key: "account" as SlotKey,
        label: "계정 전체 인사이트",
        description: "프로필 → 프로페셔널 대시보드 → 계정 인사이트",
        icon: BarChart3,
        num: 1,
        color: "text-violet-600 dark:text-violet-400",
        bgColor: "bg-violet-100 dark:bg-violet-900/40",
        badgeItems: ["도달한 계정 수", "참여한 계정 수", "팔로워 수 + 증감"],
    },
    {
        key: "post" as SlotKey,
        label: "개별 게시물 인사이트",
        description: '게시물 열기 → 하단 "인사이트 보기" 탭',
        icon: ImageIcon,
        num: 2,
        color: "text-pink-600 dark:text-pink-400",
        bgColor: "bg-pink-100 dark:bg-pink-900/40",
        badgeItems: ["좋아요", "댓글", "공유", "저장", "도달 수", "노출 수"],
    },
    {
        key: "reels" as SlotKey,
        label: "릴스 인사이트",
        description: '릴스 열기 → "인사이트 보기"',
        icon: Film,
        num: 3,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
        badgeItems: ["재생 수", "좋아요", "댓글", "공유", "저장", "평균 시청 시간"],
        recommended: true,
    },
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

// ── Notion Section Wrapper ────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-neutral-700">
            <div className="px-4 py-2 bg-stone-100 dark:bg-neutral-800 border-b border-stone-200 dark:border-neutral-700">
                <p className="text-[10px] font-semibold text-stone-500 dark:text-neutral-400 uppercase tracking-wider">{title}</p>
            </div>
            {children}
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────
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

    // Add channel dialog state
    const [isAddChannelOpen, setIsAddChannelOpen] = useState(false)
    const [newChannelPlatform, setNewChannelPlatform] = useState("instagram")
    const [newChannelHandle, setNewChannelHandle] = useState("")
    const [newChannelFollowers, setNewChannelFollowers] = useState("")

    // Capture state
    const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
        account: { file: null, preview: null, result: null, isAnalyzing: false },
        post: { file: null, preview: null, result: null, isAnalyzing: false },
        reels: { file: null, preview: null, result: null, isAnalyzing: false },
    })
    const fileInputRefs = useRef<Record<SlotKey, HTMLInputElement | null>>({ account: null, post: null, reels: null })

    const igChannel = channels?.find((ch: any) => ch.platform === 'instagram')
    const selectedTags: string[] = (effectiveUser as any)?.tags || []
    const totalFollowers = channels?.reduce((s: number, ch: any) => s + (ch.followersCount || 0), 0) || 0

    useEffect(() => { if (effectiveUserId) fetchChannels(effectiveUserId) }, [effectiveUserId])

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

    useEffect(() => {
        if (!effectiveUserId || !igChannel) return
        setIgStatsLoading(true)
        fetch(`/api/instagram/profile-stats?userId=${effectiveUserId}`)
            .then(r => r.json()).then(data => { if (!data.error) setIgStats(data) })
            .catch(() => { }).finally(() => setIgStatsLoading(false))
    }, [effectiveUserId, (igChannel as any)?.id])

    // ── Calculator logic ───────────────────────────────────
    const primaryTag = selectedTags[0] || ''
    const baseCpe = CATEGORY_CPE[primaryTag] ?? 800
    const baseCpm = CATEGORY_CPM[primaryTag] ?? 10000
    const igErRaw = igStats?.er != null ? igStats.er / 100 : null
    const er: number = igErRaw
        ?? (perfStats?.avgEngagementRate != null ? perfStats.avgEngagementRate / 100 : null)
        ?? (totalFollowers >= 1000000 ? 0.012 : totalFollowers >= 100000 ? 0.025 : totalFollowers >= 10000 ? 0.04 : 0.06)
    const erSource = igErRaw != null ? 'instagram_api' : perfStats?.avgEngagementRate != null ? 'campaign' : 'estimate'
    const erSourceLabel = erSource === 'instagram_api' ? 'IG 실측' : erSource === 'campaign' ? '캠페인' : '추정값'
    const erBenchmark = totalFollowers >= 1000000 ? 0.010 : totalFollowers >= 500000 ? 0.015 : totalFollowers >= 100000 ? 0.025 : totalFollowers >= 10000 ? 0.040 : 0.060
    const erRatio = erBenchmark > 0 ? er / erBenchmark : 1.0
    const erLabel = erRatio >= 2.0 ? `팬덤형 (${erRatio.toFixed(1)}x)` : erRatio >= 1.5 ? `우수 (${erRatio.toFixed(1)}x)` : erRatio >= 1.0 ? `평균 (${erRatio.toFixed(1)}x)` : `기대 미달 (${erRatio.toFixed(1)}x)`
    const tierLabel = totalFollowers >= 1000000 ? '메가' : totalFollowers >= 100000 ? '매크로' : totalFollowers >= 10000 ? '마이크로' : '나노'

    const reachAdj: number | null = igStats?.reachRate != null ? (igStats.reachRate >= 40 ? 1.15 : igStats.reachRate >= 25 ? 1.05 : igStats.reachRate >= 15 ? 1.0 : igStats.reachRate >= 8 ? 0.85 : 0.7) : null
    const reachAdjLabel = reachAdj == null ? null : reachAdj >= 1.1 ? `도달${igStats!.reachRate}% 진성 +${Math.round((reachAdj - 1) * 100)}%` : reachAdj < 1.0 ? `도달${igStats!.reachRate}% 유령팔로워 ${Math.round((reachAdj - 1) * 100)}%` : null
    const saveAdj: number | null = igStats?.saveRate != null ? (igStats.saveRate >= 5 ? 1.25 : igStats.saveRate >= 3 ? 1.15 : igStats.saveRate >= 1.5 ? 1.05 : null) : null
    const saveAdjLabel = saveAdj != null ? `저장률${igStats!.saveRate}% +${Math.round((saveAdj - 1) * 100)}%` : null
    const femaleAdj: number | null = (igStats?.audienceFemaleRatio != null && FEMALE_CATS.includes(primaryTag)) ? (igStats.audienceFemaleRatio >= 70 ? 1.20 : igStats.audienceFemaleRatio >= 60 ? 1.10 : null) : null
    const femaleAdjLabel = femaleAdj != null ? `여성${igStats!.audienceFemaleRatio}% +${Math.round((femaleAdj - 1) * 100)}%` : null
    const ageAdj: number | null = (igStats?.audienceAge2534Ratio != null && igStats.audienceAge2534Ratio >= 30) ? 1.10 : null
    const ageAdjLabel = ageAdj != null ? `25~34세${igStats!.audienceAge2534Ratio}% +10%` : null
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

    // ── CPE 기반 단가 (참여율 기반, 참고용)
    const cpeEstimated = Math.round(totalFollowers * er * effectiveCpe * contentMult * totalAddMult)

    // ── CPM 기반 단가 (도달 기반, API 연결 시 메인 - 실시장 캘리브레이션)
    // 오디언스 품질 보정 (CPM은 도달수 자체에 반영되므로 reach 보정 제외)
    const cpmAudienceAdj = Math.min(1.3, Math.max(0.8,
        1.0
        + (ageAdj != null ? 0.05 : 0)
        + (domesticAdj != null ? 0.05 : 0)
        + (femaleAdj != null ? 0.05 : 0)
        + (saveAdj != null ? 0.05 : 0)
    ))
    const cpmEstimated = (igStats?.avgReach && igStats.avgReach > 0)
        ? Math.round((igStats.avgReach / 1000) * baseCpm * contentMult * totalAddMult * cpmAudienceAdj)
        : null

    // ── 최종 단가: CPM 기반을 메인으로(API 연결 시), CPE 기반을 fallback으로
    const estimatedValue = cpmEstimated ?? cpeEstimated
    const minValue = Math.round(estimatedValue * 0.8)
    const maxValue = Math.round(estimatedValue * 1.2)
    const priceMode = cpmEstimated != null ? 'cpm' : 'cpe'

    const erBadgeColor = erSource === 'instagram_api'
        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800'
        : erSource === 'campaign'
            ? 'text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800'
            : 'text-stone-500 bg-stone-100 border border-stone-200 dark:text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700'

    // ── Capture handlers ───────────────────────────────────
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

    const handleAddChannel = async () => {
        if (!effectiveUserId || !newChannelHandle) { toast.error("채널 핸들(ID)을 입력해주세요"); return }
        try {
            await createChannel({ userId: effectiveUserId, platform: newChannelPlatform as any, handle: newChannelHandle, followersCount: newChannelFollowers ? parseInt(newChannelFollowers.replace(/,/g, "")) : 0, isPrimary: channels.length === 0, isPublic: true })
            setIsAddChannelOpen(false); setNewChannelHandle(""); setNewChannelFollowers("")
            toast.success("채널이 추가되었습니다!")
        } catch { toast.error("채널 추가 중 오류가 발생했습니다.") }
    }

    // ── Render ────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-1 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-neutral-100 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        AI 단가 분석기
                    </h2>
                    <p className="text-sm text-stone-400 dark:text-neutral-500 mt-0.5">
                        🔒 연동 데이터는 단가 계산 외 절대로 다른 목적으로 사용되지 않습니다.
                    </p>
                </div>
            </div>

            {/* ── 2-Column layout ── */}
            <div className="flex flex-col md:flex-row gap-4 flex-1 md:h-[calc(100vh-180px)] md:min-h-0">

                {/* ── LEFT: Tabs ── */}
                <div className="w-full md:w-[44%] md:overflow-y-auto md:overflow-x-hidden scrollbar-thin px-2 pt-1">
                    <Tabs defaultValue="channel" className="space-y-3">
                        <TabsList className="w-full bg-stone-100 dark:bg-neutral-800 p-1 rounded-xl h-9">
                            <TabsTrigger value="channel" className="flex-1 text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:text-stone-900 dark:data-[state=active]:text-neutral-100 data-[state=active]:shadow-sm">
                                소셜 채널
                            </TabsTrigger>
                            <TabsTrigger value="capture" className="flex-1 text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:text-stone-900 dark:data-[state=active]:text-neutral-100 data-[state=active]:shadow-sm">
                                캡처 분석
                            </TabsTrigger>
                        </TabsList>

                        {/* ── 소셜채널 탭 ── */}
                        <TabsContent value="channel" className="space-y-4 mt-0">
                            {/* Channel Cards */}
                            {channels && channels.length > 0 ? (
                                <div className="flex flex-col items-center space-y-4">
                                    {channels.map((ch: any) => (
                                        <div key={ch.id} className="max-w-sm">
                                            <SocialChannelCard channel={ch} userId={effectiveUserId!} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border-2 border-dashed border-stone-200 dark:border-neutral-700 p-6 text-center">
                                    <p className="text-sm text-stone-400 dark:text-neutral-600">연결된 채널이 없습니다</p>
                                </div>
                            )}
                            {/* Description below card */}
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                소셜 채널 연동 시 실측 데이터로 더 정확한 단가를 자동 계산하고, 이후 광고 성과도 자동 집계합니다.
                            </p>


                            {/* Action buttons */}
                            {effectiveUserId && (
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2 border-pink-200 text-pink-600 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-400 dark:hover:bg-pink-950/20">
                                                <Instagram className="h-3.5 w-3.5" />
                                                Instagram {igChannel ? '재연결' : '연결'}
                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                            </Button>
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

                                    <Dialog open={isAddChannelOpen} onOpenChange={setIsAddChannelOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Plus className="h-3.5 w-3.5" />채널 추가
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>채널 추가</DialogTitle></DialogHeader>
                                            <div className="space-y-4 pt-2">
                                                <Select value={newChannelPlatform} onValueChange={setNewChannelPlatform}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="instagram">Instagram</SelectItem>
                                                        <SelectItem value="youtube">YouTube</SelectItem>
                                                        <SelectItem value="tiktok">TikTok</SelectItem>
                                                        <SelectItem value="blog">Blog</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input placeholder="채널 핸들 (예: @username)" value={newChannelHandle} onChange={e => setNewChannelHandle(e.target.value)} />
                                                <Input placeholder="팔로워 수" value={newChannelFollowers} onChange={e => setNewChannelFollowers(e.target.value)} />
                                                <Button onClick={handleAddChannel} className="w-full">추가</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}

                            {/* ── API 데이터 미리보기 (초록박스) ── */}
                            <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-neutral-700">
                                <div className="px-4 py-2 bg-stone-100 dark:bg-neutral-800 border-b border-stone-200 dark:border-neutral-700 flex items-center justify-between">
                                    <p className="text-[10px] font-semibold text-stone-500 dark:text-neutral-400 uppercase tracking-wider">API 연결 시 자동 수집</p>
                                    {igStats?.source === 'instagram_api'
                                        ? <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-full">● 연결됨</span>
                                        : <span className="text-[9px] text-stone-400 dark:text-neutral-600">비즈니스 연결 시 활성화</span>
                                    }
                                </div>
                                {igStatsLoading ? (
                                    <div className="flex items-center gap-2 px-4 py-4 bg-stone-50 dark:bg-neutral-900">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />
                                        <span className="text-xs text-stone-400">데이터 수집 중...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 bg-stone-50 dark:bg-neutral-900">
                                        {[
                                            { label: '평균 도달 수', val: igStats?.avgReach != null ? fmtNum(igStats.avgReach) : null },
                                            { label: '도달률', val: igStats?.reachRate != null ? `${igStats.reachRate}%` : null },
                                            { label: 'ER (팔로워 기준)', val: igStats?.erByFollowers != null ? `${igStats.erByFollowers}%` : null },
                                            { label: 'ER (도달 기준)', val: igStats?.erByReach != null ? `${igStats.erByReach}%` : null },
                                            { label: '평균 저장 수', val: igStats?.avgSaves != null ? fmtNum(igStats.avgSaves) : null },
                                            { label: '저장률', val: igStats?.saveRate != null ? `${igStats.saveRate}%` : null },
                                            { label: '25~34세 오디언스', val: igStats?.audienceAge2534Ratio != null ? `${igStats.audienceAge2534Ratio}%` : null },
                                            { label: '여성 팔로워 비율', val: igStats?.audienceFemaleRatio != null ? `${igStats.audienceFemaleRatio}%` : null },
                                            { label: '국내 팔로워 비율', val: igStats?.audienceDomesticRatio != null ? `${igStats.audienceDomesticRatio}%` : null },
                                            { label: '릴스 시청 완료율', val: null },
                                            { label: '팔로워 성장률', val: null },
                                        ].map(({ label, val }, i) => (
                                            <div key={label} className={cn(
                                                "flex flex-col gap-0.5 px-3 py-2 border-b border-stone-100 dark:border-neutral-800",
                                                i % 2 === 0 && "border-r border-stone-100 dark:border-neutral-800"
                                            )}>
                                                <span className="text-[9px] text-stone-400 dark:text-neutral-600 leading-tight">{label}</span>
                                                {val != null
                                                    ? <span className="text-xs font-semibold text-stone-800 dark:text-neutral-200">{val}</span>
                                                    : <span className="text-xs text-stone-300 dark:text-neutral-700 font-mono">—</span>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* ── 캡처분석 탭 (original design) ── */}
                        <TabsContent value="capture" className="space-y-3 mt-0">
                            {igStats?.source === 'instagram_api' && (
                                <div className="px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-xs text-emerald-700 dark:text-emerald-400">
                                    ✓ API 연결됨 — 캡처 분석은 참고용입니다.
                                </div>
                            )}

                            {SLOTS.map((slot) => {
                                const state = slots[slot.key]
                                const SlotIcon = slot.icon
                                return (
                                    <div key={slot.key} className={cn("rounded-xl border transition-all", state.result ? "border-emerald-300 dark:border-emerald-700" : "border-border")}>
                                        <div className="p-3 sm:p-4">
                                            {/* Slot header */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={cn("h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0", slot.bgColor, slot.color)}>
                                                    {slot.num}
                                                </span>
                                                <span className="font-semibold text-sm">{slot.label}</span>
                                                {slot.recommended && (
                                                    <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600 ml-auto">영상 협업용 추천</Badge>
                                                )}
                                                {state.result && (
                                                    <Badge variant="secondary" className="text-[10px] ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">✓ 분석 완료</Badge>
                                                )}
                                            </div>

                                            {/* Upload area or result */}
                                            {!state.preview ? (
                                                <div className="border border-dashed rounded-lg p-3 sm:p-4 text-center cursor-pointer hover:border-violet-400 hover:bg-muted/30 transition-colors"
                                                    onClick={() => fileInputRefs.current[slot.key]?.click()}>
                                                    <SlotIcon className="mx-auto h-6 w-6 text-muted-foreground/40 mb-1.5" />
                                                    <p className="text-xs text-muted-foreground">{slot.description}</p>
                                                    <div className="flex flex-wrap gap-1 justify-center mt-2">
                                                        {slot.badgeItems.map(item => (
                                                            <Badge key={item} variant="secondary" className="text-[9px] font-normal">{item}</Badge>
                                                        ))}
                                                    </div>
                                                    <input ref={el => { fileInputRefs.current[slot.key] = el }} type="file" accept="image/*" className="hidden"
                                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(slot.key, f); e.target.value = "" }} />
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex gap-3 items-center">
                                                        <div className="relative shrink-0">
                                                            <img src={state.preview!} alt={slot.label} className="w-16 sm:w-20 h-auto rounded-lg border object-contain max-h-28" />
                                                            <button onClick={() => clearSlot(slot.key)} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow hover:scale-110 transition-transform">
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium truncate">{state.file?.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{state.file ? `${(state.file.size / 1024).toFixed(0)}KB` : ""}</p>
                                                            {!state.result && (
                                                                <Button size="sm" onClick={() => handleAnalyze(slot.key)} disabled={state.isAnalyzing}
                                                                    className="mt-1.5 h-7 text-xs bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                                                                    {state.isAnalyzing ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />분석 중...</> : <><Sparkles className="mr-1 h-3 w-3" />분석</>}
                                                                </Button>
                                                            )}
                                                        </div>
                                                        {state.result && (
                                                            <div className="text-right shrink-0">
                                                                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{state.result.engagementRate}%</p>
                                                                <p className="text-[10px] text-muted-foreground">{state.result.engagementEmoji} {state.result.engagementGrade}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {state.result && (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                                            {[
                                                                { icon: Eye, label: "조회수", value: state.result.extracted.metrics.views },
                                                                { icon: Heart, label: "좋아요", value: state.result.extracted.metrics.likes },
                                                                { icon: MessageCircle, label: "댓글", value: state.result.extracted.metrics.comments },
                                                                { icon: Share2, label: "공유", value: state.result.extracted.metrics.shares },
                                                                { icon: Bookmark, label: "저장", value: state.result.extracted.metrics.saves },
                                                                { icon: TrendingUp, label: "도달", value: state.result.extracted.metrics.reach },
                                                            ].filter(item => item.value != null).map((item) => (
                                                                <div key={item.label} className="flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-1">
                                                                    <item.icon className="h-3 w-3 text-muted-foreground shrink-0" />
                                                                    <span className="text-muted-foreground text-[10px]">{item.label}</span>
                                                                    <span className="font-semibold ml-auto text-[11px]">{fmtNum(item.value)}</span>
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

                            {/* Capture result summary */}
                            {hasAnyResult && (() => {
                                const results = Object.values(slots).filter(s => s.result).map(s => s.result!)
                                const bestPrice = Math.max(...results.map(r => r.recommendedPrice || 0))
                                const avgEr = results.reduce((sum, r) => sum + r.engagementRate, 0) / results.length
                                const totalTips = [...new Set(results.flatMap(r => r.tips))]
                                return (
                                    <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                                        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                                            <div className="p-3 sm:p-5">
                                                <p className="text-sm font-medium text-muted-foreground mb-1">💰 AI 추천 영상단가</p>
                                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                    {bestPrice >= 10000 ? `${Math.round(bestPrice / 10000)}만원` : `${bestPrice.toLocaleString()}원`}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">{results.length}개 스크린샷 · 평균 참여율 {avgEr.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                        {totalTips.length > 0 && (
                                            <div className="rounded-xl border p-3 sm:p-4 space-y-1.5">
                                                <p className="text-sm font-medium flex items-center gap-1.5"><Lightbulb className="h-4 w-4 text-amber-500" />개선 팁</p>
                                                {totalTips.map((tip, i) => <p key={i} className="text-xs text-muted-foreground pl-6">• {tip}</p>)}
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}

                            {!hasAnyResult && (
                                <p className="text-xs text-muted-foreground text-center">
                                    💡 최근 릴스 인사이트를 분석하면 가장 정확한 추천 단가를 받을 수 있어요.
                                </p>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* ── DIVIDER ── */}
                <div className="hidden md:block w-px bg-stone-200 dark:bg-neutral-700 shrink-0" />

                {/* ── RIGHT: 광고단가 계산기 ── */}
                <div className="w-full md:flex-1 md:overflow-y-auto md:overflow-x-hidden scrollbar-thin space-y-4 py-1 pr-0.5">
                    <p className="text-[10px] font-semibold text-stone-400 dark:text-neutral-500 uppercase tracking-wider">광고단가 계산기</p>

                    {totalFollowers === 0 ? (
                        <div className="rounded-xl border-2 border-dashed border-stone-200 dark:border-neutral-700 p-8 text-center">
                            <p className="text-sm font-medium text-stone-500 dark:text-neutral-400 mb-1">소셜 채널 연결 필요</p>
                            <p className="text-xs text-stone-400 dark:text-neutral-600">채널을 연결하면 예상 광고 단가를 자동 계산합니다.</p>
                        </div>
                    ) : (
                        <>
                            {/* ── ROW 1: 핵심지표 + 부가조건 (2열) ── */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* 핵심 지표 */}
                                <Section title="핵심 지표">
                                    {[
                                        { label: '팔로워', value: totalFollowers >= 10000 ? `${(totalFollowers / 10000).toFixed(1)}만` : `${totalFollowers.toLocaleString()}`, sub: tierLabel },
                                        { label: 'ER (팔로워)', value: `${(er * 100).toFixed(1)}%`, badge: <span className={cn("text-[8px] px-1 py-0.5 rounded-full font-medium", erBadgeColor)}>{erSourceLabel}</span> },
                                        { label: '기준 CPE', value: `₩${baseCpe.toLocaleString()}`, sub: '' },
                                        { label: '실효 CPE', value: `₩${effectiveCpe.toLocaleString()}`, highlight: true },
                                    ].map((item, i, arr) => (
                                        <div key={item.label} className={cn("flex items-center justify-between px-3 py-2 bg-stone-50 dark:bg-neutral-900", i < arr.length - 1 && "border-b border-stone-100 dark:border-neutral-800")}>
                                            <span className="text-[10px] text-stone-400 dark:text-neutral-500 shrink-0">{item.label}</span>
                                            <div className="flex items-center gap-1 min-w-0">
                                                {'badge' in item && item.badge}
                                                <span className={cn("text-xs font-semibold truncate", item.highlight ? 'text-amber-800 dark:text-amber-400' : 'text-stone-800 dark:text-neutral-200')}>{item.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </Section>

                                {/* 부가 조건 */}
                                <Section title="부가 조건">
                                    {[
                                        { key: 'usage', label: '2차 활용권', mult: '+35%', active: calcUsageRights, set: setCalcUsageRights },
                                        { key: 'excl', label: '독점 계약', mult: '+50%', active: calcExclusivity, set: setCalcExclusivity },
                                        { key: 'prod', label: '고제작 난이도', mult: '+30%', active: calcHighProduction, set: setCalcHighProduction },
                                        { key: 'season', label: '시의성', mult: '+15%', active: calcSeason, set: setCalcSeason },
                                    ].map(({ key, label, mult, active, set }, i, arr) => (
                                        <button key={key} onClick={() => set(!active)}
                                            className={cn("w-full flex items-center gap-2 px-3 py-2 text-left transition-all", i < arr.length - 1 && "border-b border-stone-100 dark:border-neutral-800", active ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-stone-50 dark:bg-neutral-900')}>
                                            <div className={cn("w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-all", active ? 'bg-amber-700 border-amber-700 dark:bg-amber-600 dark:border-amber-600' : 'border-stone-300 dark:border-neutral-600')}>
                                                {active && <span className="text-white text-[7px] font-bold">✓</span>}
                                            </div>
                                            <span className={cn("text-[10px] font-medium flex-1 text-left leading-tight", active ? 'text-amber-800 dark:text-amber-400' : 'text-stone-700 dark:text-neutral-300')}>{label}</span>
                                            <span className={cn("text-[9px] font-bold shrink-0", active ? 'text-amber-700 dark:text-amber-500' : 'text-stone-300 dark:text-neutral-700')}>{mult}</span>
                                        </button>
                                    ))}
                                </Section>
                            </div>

                            {/* ── ROW 2: 콘텐츠 유형 ── */}
                            <div>
                                <p className="text-[10px] font-semibold text-stone-400 dark:text-neutral-500 uppercase tracking-wider mb-2">콘텐츠 유형</p>
                                <div className="flex gap-1 p-1 rounded-xl bg-stone-100 dark:bg-neutral-800">
                                    {(['reels', 'feed', 'story'] as const).map(ct => (
                                        <button key={ct} onClick={() => setCalcContentType(ct)}
                                            className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all", calcContentType === ct
                                                ? 'bg-white dark:bg-neutral-700 text-amber-800 dark:text-amber-400 shadow-sm'
                                                : 'text-stone-400 dark:text-neutral-600')}>
                                            {ct === 'reels' ? '릴스' : ct === 'feed' ? '피드' : '스토리'}
                                            <span className="block text-[9px] mt-0.5 opacity-60">{ct === 'reels' ? '×1.5' : ct === 'feed' ? '×1.0' : '×0.5'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── ROW 3: 총 비용 ── */}
                            <div className="rounded-xl px-5 py-5 text-center bg-neutral-900 dark:bg-black">
                                <p className="text-[10px] text-neutral-500 mb-2">{CONTENT_LABEL[calcContentType]}</p>
                                <p className="text-2xl font-bold tracking-tight text-neutral-100" style={{ letterSpacing: '-0.02em' }}>
                                    {fmt(minValue)}<span className="text-neutral-700 mx-2">—</span>{fmt(maxValue)}
                                </p>
                                <p className="text-xs text-neutral-500 mt-2">평균 {fmt(Math.round((minValue + maxValue) / 2))}</p>
                            </div>

                            {/* ── ROW 4: 계산 근거 ── */}
                             <div className="relative">
                                 {process.env.NODE_ENV === 'production' && (
                                     <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl overflow-hidden">
                                         <div className="absolute inset-0 bg-white/60 dark:bg-neutral-900/70 backdrop-blur-md" />
                                         <div className="relative z-10 flex flex-col items-center gap-2 px-4 py-3">
                                             <div className="flex items-center gap-3">
                                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                                 <img src="/logos/creadypick.png" alt="CreadyPick" className="h-6 object-contain" />
                                                 <span className="text-stone-300 dark:text-neutral-600 text-sm font-light">×</span>
                                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                                 <img src="/logos/kaist.png" alt="KAIST" className="h-5 object-contain" />
                                             </div>
                                             <p className="text-[10px] font-semibold text-stone-500 dark:text-neutral-400 tracking-wide uppercase">🔒 기밀 정보 — 외부 공개 불가</p>
                                         </div>
                                     </div>
                                 )}
                                 <div className={process.env.NODE_ENV === 'production' ? 'blur-sm pointer-events-none select-none' : ''}>
                                     <Section title="계산 근거">
                                {priceMode === 'cpm' ? (
                                    // CPM 기반 계산 근거
                                    <>
                                        {[
                                            { label: '카테고리 CPM', value: `₩${baseCpm.toLocaleString()}`, note: `${primaryTag || '미설정'} / 1000 도달`, highlight: false },
                                            { label: '도달 수', value: `${fmtNum(igStats?.avgReach)}명`, note: 'IG API 실측', highlight: false },
                                            ...(ageAdj != null ? [{ label: '25~34세 보정', value: '', note: `${igStats!.audienceAge2534Ratio}% +5%`, highlight: false }] : []),
                                            ...(domesticAdj != null ? [{ label: '국내 팔로워', value: '', note: `${igStats!.audienceDomesticRatio}% +5%`, highlight: false }] : []),
                                            ...(saveAdj != null ? [{ label: '저장률 보정', value: '', note: saveAdjLabel!, highlight: false }] : []),
                                            { label: '오디언스 보정', value: `×${cpmAudienceAdj.toFixed(2)}`, note: '', highlight: false },
                                            { label: '최종 CPM 단가', value: `₩${Math.round(baseCpm * cpmAudienceAdj).toLocaleString()}`, note: '계산값', highlight: true },
                                        ].map((step, i, arr) => (
                                            <div key={i} className={cn("flex items-center justify-between px-4 py-2 bg-stone-50 dark:bg-neutral-900", i < arr.length - 1 && "border-b border-stone-100 dark:border-neutral-800", step.highlight && 'bg-amber-50 dark:bg-amber-950/20')}>
                                                <span className="text-[10px] text-stone-400 dark:text-neutral-500">{step.label}</span>
                                                <div className="flex items-center gap-2">
                                                    {step.note && <span className="text-[9px] text-stone-400 dark:text-neutral-600">{step.note}</span>}
                                                    {step.value && <span className={cn("text-[11px] font-semibold", step.highlight ? 'text-amber-800 dark:text-amber-400' : 'text-stone-700 dark:text-neutral-300')}>{step.value}</span>}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="px-4 py-2 bg-stone-100 dark:bg-neutral-800 border-t border-stone-200 dark:border-neutral-700">
                                            <p className="text-[9px] text-stone-400 dark:text-neutral-600 leading-relaxed">
                                                {fmtNum(igStats?.avgReach)}도달 ÷ 1000 × ₩{baseCpm.toLocaleString()} × {cpmAudienceAdj.toFixed(2)} × {contentMult} × {totalAddMult.toFixed(2)} = ₩{cpmEstimated?.toLocaleString()}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    // CPE 기반 계산 근거 (기존)
                                    <>
                                        {[
                                            { label: '카테고리 CPE', value: `₩${baseCpe.toLocaleString()}`, note: primaryTag || '미설정', highlight: false },
                                            ...(reachAdj != null && reachAdj !== 1.0 ? [{ label: '도달률 보정', value: `₩${Math.round(baseCpe * reachAdj).toLocaleString()}`, note: reachAdjLabel!, highlight: false }] : []),
                                            ...(saveAdj != null ? [{ label: '저장률 보정', value: '', note: saveAdjLabel!, highlight: false }] : []),
                                            ...(femaleAdj != null ? [{ label: '여성 오디언스', value: '', note: femaleAdjLabel!, highlight: false }] : []),
                                            ...(ageAdj != null ? [{ label: '25~34세 보정', value: '', note: ageAdjLabel!, highlight: false }] : []),
                                            ...(domesticAdj != null ? [{ label: '국내 팔로워', value: '', note: domesticAdjLabel!, highlight: false }] : []),
                                            { label: '최종 실효 CPE', value: `₩${effectiveCpe.toLocaleString()}`, note: perfStats?.avgCpe ? '실제 캠페인' : '계산값', highlight: true },
                                        ].map((step, i, arr) => (
                                            <div key={i} className={cn("flex items-center justify-between px-4 py-2 bg-stone-50 dark:bg-neutral-900", i < arr.length - 1 && "border-b border-stone-100 dark:border-neutral-800", step.highlight && 'bg-amber-50 dark:bg-amber-950/20')}>
                                                <span className="text-[10px] text-stone-400 dark:text-neutral-500">{step.label}</span>
                                                <div className="flex items-center gap-2">
                                                    {step.note && <span className="text-[9px] text-stone-400 dark:text-neutral-600">{step.note}</span>}
                                                    {step.value && <span className={cn("text-[11px] font-semibold", step.highlight ? 'text-amber-800 dark:text-amber-400' : 'text-stone-700 dark:text-neutral-300')}>{step.value}</span>}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="px-4 py-2 bg-stone-100 dark:bg-neutral-800 border-t border-stone-200 dark:border-neutral-700">
                                            <p className="text-[9px] text-stone-400 dark:text-neutral-600 leading-relaxed">
                                                {totalFollowers.toLocaleString()} × {(er * 100).toFixed(1)}% × ₩{effectiveCpe.toLocaleString()} × {contentMult} × {totalAddMult.toFixed(2)} = ₩{cpeEstimated.toLocaleString()}
                                            </p>
                                            {!primaryTag && <p className="text-[9px] text-amber-600 dark:text-amber-500 mt-0.5">카테고리 태그 설정 시 더 정확합니다</p>}
                                        </div>
                                    </>
                                )}
                                     </Section>
                                 </div>
                             </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
