"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useTeam } from "@/components/providers/team-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ArrowUpDown, BarChart3, Building2, Calendar, ChevronRight, FileText, Instagram, LayoutGrid, Loader2, Save, Search, Table as TableIcon, Users, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
    CreatorSummaryCard, type CreatorStatus, type CreatorSummary
} from "./creator-summary-card"
import { InviteLinkGenerator } from "./invite-link-generator"
import { RevenueSplitEditor } from "./revenue-split-editor"
import { SettlementTab } from "./settlement-tab"
import { TeamCalendar } from "./team-calendar"
import { TeamProposalsTable } from "./team-proposals-table"
import { TeamStatistics } from "./team-statistics"

// ─── Status 판단 유틸 ─────────────────────────────────────────
function getCreatorStatus(c: CreatorSummary): CreatorStatus {
    const totalPending = c.pending_product_applications + c.pending_moment_proposals
    const totalActive = c.active_product_applications + c.active_moment_proposals + c.active_campaign_applications
    const hasAnyActivity = c.total_moments > 0 || c.total_product_applications > 0 ||
        c.total_moment_proposals > 0 || c.total_campaign_applications > 0

    if (totalPending > 0) return 'urgent'
    if (totalActive > 0) return 'active'
    if (!hasAnyActivity) return 'idle'
    return 'normal'
}

type FilterStatus = 'all' | 'urgent' | 'active' | 'idle'
type SortOrder = 'urgent' | 'revenue' | 'followers' | 'moments' | 'name'
type ViewMode = 'grid' | 'table'
type PriceRange = 'all' | 'under30' | '30to100' | 'over100'

const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
    all: '단가 전체',
    under30: '30만 미만',
    '30to100': '30~100만',
    over100: '100만 이상',
}

const FILTER_CHIPS: { value: FilterStatus; label: string; color: string }[] = [
    { value: 'all', label: '전체', color: 'default' },
    { value: 'urgent', label: '🔴 긴급', color: 'urgent' },
    { value: 'active', label: '🟢 협업 중', color: 'active' },
    { value: 'idle', label: '⚪ 비활성', color: 'idle' },
]

export function McnDashboard() {
    const { user, supabase } = useAuth()
    const { currentTeam, teamMembers, switchToMember, isLoading: isTeamLoading } = useTeam()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("dashboard")
    const [summaryData, setSummaryData] = useState<CreatorSummary[]>([])
    const [isLoadingSummary, setIsLoadingSummary] = useState(true)

    // ── Filter / Sort / View state ──────────────────────────────
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [sortOrder, setSortOrder] = useState<SortOrder>('urgent')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [priceRange, setPriceRange] = useState<PriceRange>('all')
    const [tagFilter, setTagFilter] = useState<string>('all')

    // ── Revenue Split state ───────────────────────────────────────
    const [splitEditorCreator, setSplitEditorCreator] = useState<{
        id: string; name: string; avatar: string | null; currentRatio: number
    } | null>(null)
    const [splitRatios, setSplitRatios] = useState<Record<string, number>>({})

    // 수익 배분율을 DB에서 로드 (마운트/팀 변경 시)
    useEffect(() => {
        if (!currentTeam?.id) return
        supabase
            .from('mcn_revenue_splits')
            .select('creator_id, split_ratio')
            .eq('team_id', currentTeam.id)
            .then(({ data }) => {
                if (data && data.length > 0) {
                    const ratios: Record<string, number> = {}
                    data.forEach((r: any) => { ratios[r.creator_id] = r.split_ratio })
                    setSplitRatios(ratios)
                }
            })
    }, [currentTeam?.id, supabase])

    // ── 성과 데이터 로드 (팀 관리 탭) ─────────────────────────────
    const [perfData, setPerfData] = useState<Record<string, { latest: any; count: number }>>({})
    useEffect(() => {
        if (!currentTeam?.id || summaryData.length === 0) return
        const creatorIds = summaryData.map(c => c.user_id)
        supabase
            .from('campaign_performance')
            .select('creator_id, engagement_rate, cpe, cpr, created_at')
            .in('creator_id', creatorIds)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                if (!data) return
                const grouped: Record<string, { latest: any; count: number }> = {}
                data.forEach((row: any) => {
                    if (!grouped[row.creator_id]) grouped[row.creator_id] = { latest: row, count: 1 }
                    else grouped[row.creator_id].count++
                })
                setPerfData(grouped)
            })
    }, [currentTeam?.id, summaryData, supabase])

    const [bizInfo, setBizInfo] = useState({
        business_registration_number: '',
        representative_name: '',
        business_address: '',
        stamp_url: '',
    })
    const [isSavingBiz, setIsSavingBiz] = useState(false)

    // Fetch team business info when settings tab is shown
    useEffect(() => {
        if (!currentTeam?.id || activeTab !== 'settings') return
        supabase
            .from('teams')
            .select('business_registration_number, representative_name, business_address, stamp_url')
            .eq('id', currentTeam.id)
            .single()
            .then(({ data }) => {
                if (data) {
                    setBizInfo({
                        business_registration_number: data.business_registration_number || '',
                        representative_name: data.representative_name || '',
                        business_address: data.business_address || '',
                        stamp_url: data.stamp_url || '',
                    })
                }
            })
    }, [currentTeam?.id, activeTab, supabase])

    const handleSaveBizInfo = async () => {
        if (!currentTeam?.id) return
        setIsSavingBiz(true)
        const { error } = await supabase
            .from('teams')
            .update({
                business_registration_number: bizInfo.business_registration_number || null,
                representative_name: bizInfo.representative_name || null,
                business_address: bizInfo.business_address || null,
                stamp_url: bizInfo.stamp_url || null,
            })
            .eq('id', currentTeam.id)
        setIsSavingBiz(false)
        if (error) {
            console.error('[McnDashboard] save biz info error:', error)
        } else {
            // Light feedback via title flash — avoid importing toast to keep bundle small
            const el = document.getElementById('biz-save-btn')
            if (el) el.textContent = '저장됨 ✓'
            setTimeout(() => { if (el) el.textContent = '저장하기' }, 2000)
        }
    }

    // ── Data Fetch ───────────────────────────────────────────────
    useEffect(() => {
        if (!currentTeam?.id) { setIsLoadingSummary(false); return }
        const fetchSummary = async () => {
            setIsLoadingSummary(true)
            try {
                const { data, error } = await supabase.rpc('get_team_dashboard_summary', {
                    target_team_id: currentTeam.id
                })
                if (error) {
                    const fallback = teamMembers.map(m => ({
                        user_id: m.user_id,
                        display_name: m.profile?.display_name || 'Unknown',
                        avatar_url: m.profile?.avatar_url || null,
                        instagram_handle: m.profile?.instagram_handle || null,
                        followers_count: m.profile?.followers_count || 0,
                        tier: null,
                        tags: m.profile?.tags || null,
                        price_video: m.profile?.price_video || 0,
                        price_feed: m.profile?.price_feed || 0,
                        total_moments: 0,
                        active_moments: 0,
                        total_product_applications: 0,
                        pending_product_applications: 0,
                        active_product_applications: 0,
                        product_revenue: 0,
                        total_moment_proposals: 0,
                        pending_moment_proposals: 0,
                        active_moment_proposals: 0,
                        moment_revenue: 0,
                        total_campaign_applications: 0,
                        pending_campaign_applications: 0,
                        active_campaign_applications: 0,
                    }))
                    setSummaryData(fallback)
                } else {
                    setSummaryData(data || [])
                }
            } catch (err) {
                console.error('[MCN Dashboard] Error:', err)
            } finally {
                setIsLoadingSummary(false)
            }
        }
        fetchSummary()
    }, [currentTeam?.id, teamMembers])

    // ── Aggregate Stats ─────────────────────────────────────────
    const aggregateStats = useMemo(() => ({
        totalMembers: summaryData.length,
        totalMoments: summaryData.reduce((s, c) => s + c.total_moments, 0),
        activeMoments: summaryData.reduce((s, c) => s + c.active_moments, 0),
        pendingProposals: summaryData.reduce((s, c) => s + c.pending_product_applications + c.pending_moment_proposals, 0),
        activeCollabs: summaryData.reduce((s, c) => s + c.active_product_applications + c.active_moment_proposals + c.active_campaign_applications, 0),
        totalRevenue: summaryData.reduce((s, c) => s + c.product_revenue + c.moment_revenue, 0),
    }), [summaryData])

    // ── All unique tags from team ───────────────────────────────
    const allTags = useMemo(() => {
        const tagSet = new Set<string>()
        summaryData.forEach(c => c.tags?.forEach(t => tagSet.add(t)))
        return Array.from(tagSet).sort()
    }, [summaryData])

    // ── Urgent summary counts ───────────────────────────────────
    const urgentCreators = useMemo(() =>
        summaryData.filter(c => c.pending_product_applications + c.pending_moment_proposals > 0),
        [summaryData])
    const idleCreators = useMemo(() =>
        summaryData.filter(c => {
            const hasActivity = c.total_moments > 0 || c.total_product_applications > 0 ||
                c.total_moment_proposals > 0 || c.total_campaign_applications > 0
            return !hasActivity
        }),
        [summaryData])

    // ── Filter + Sort pipeline ──────────────────────────────────
    const filteredCreators = useMemo(() => {
        let list = summaryData.map(c => ({ ...c, _status: getCreatorStatus(c) }))

        // 1. Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            list = list.filter(c =>
                c.display_name?.toLowerCase().includes(q) ||
                c.instagram_handle?.toLowerCase().includes(q) ||
                c.tags?.some(t => t.toLowerCase().includes(q))
            )
        }

        // 2. Status filter
        if (filterStatus !== 'all') {
            list = list.filter(c => c._status === filterStatus)
        }

        // 3. Price range filter
        if (priceRange !== 'all') {
            list = list.filter(c => {
                const p = c.price_video
                if (priceRange === 'under30') return p < 300000
                if (priceRange === '30to100') return p >= 300000 && p < 1000000
                if (priceRange === 'over100') return p >= 1000000
                return true
            })
        }

        // 4. Tag filter
        if (tagFilter !== 'all') {
            list = list.filter(c => c.tags?.includes(tagFilter))
        }

        // 5. Sort
        list.sort((a, b) => {
            if (sortOrder === 'urgent') {
                // urgent > active > normal > idle, then by pending count
                const statusOrder: Record<CreatorStatus, number> = { urgent: 0, active: 1, normal: 2, idle: 3 }
                const diff = statusOrder[a._status] - statusOrder[b._status]
                if (diff !== 0) return diff
                const aPending = a.pending_product_applications + a.pending_moment_proposals
                const bPending = b.pending_product_applications + b.pending_moment_proposals
                return bPending - aPending
            }
            if (sortOrder === 'revenue') return (b.product_revenue + b.moment_revenue) - (a.product_revenue + a.moment_revenue)
            if (sortOrder === 'followers') return b.followers_count - a.followers_count
            if (sortOrder === 'moments') return b.total_moments - a.total_moments
            if (sortOrder === 'name') return (a.display_name || '').localeCompare(b.display_name || '', 'ko')
            return 0
        })

        return list
    }, [summaryData, searchQuery, filterStatus, priceRange, tagFilter, sortOrder])

    const isLoading = isTeamLoading || isLoadingSummary

    const handleViewCreator = (userId: string) => {
        switchToMember(userId)
        router.push('/creator')
    }

    if (isLoading) {
        return (
            <main className="min-h-screen p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">MCN 대시보드 로딩 중...</span>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen p-6 max-w-[1536px] mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {/* Header + Tabs */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-primary" />
                            MCN 관리 대시보드
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {currentTeam?.name || 'My Team'} · 소속 크리에이터 {aggregateStats.totalMembers}명
                        </p>
                    </div>
                    <TabsList className="grid grid-cols-5 h-auto">
                        <TabsTrigger value="dashboard" className="gap-2 px-4">
                            <BarChart3 className="h-4 w-4" />대시보드
                        </TabsTrigger>
                        <TabsTrigger value="proposals" className="gap-2 px-4">
                            <FileText className="h-4 w-4" />제안서
                            {aggregateStats.pendingProposals > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-[10px] px-1.5">
                                    {aggregateStats.pendingProposals}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-2 px-4">
                            <Calendar className="h-4 w-4" />캘린더
                        </TabsTrigger>
                        <TabsTrigger value="settlement" className="gap-2 px-4">
                            <Wallet className="h-4 w-4" />정산
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2 px-4">
                            <Users className="h-4 w-4" />팀 관리
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card><CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">소속 크리에이터</span></div>
                            <p className="text-2xl font-bold">{aggregateStats.totalMembers}명</p>
                        </CardContent></Card>
                        <Card><CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1"><Calendar className="h-4 w-4 text-emerald-600" /><span className="text-xs text-muted-foreground">활성 모먼트</span></div>
                            <p className="text-2xl font-bold">{aggregateStats.activeMoments}건</p>
                            <p className="text-xs text-muted-foreground">전체 {aggregateStats.totalMoments}건</p>
                        </CardContent></Card>
                        <Card><CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-orange-600" /><span className="text-xs text-muted-foreground">미확인 제안</span></div>
                            <p className="text-2xl font-bold text-orange-600">{aggregateStats.pendingProposals}건</p>
                        </CardContent></Card>
                        <Card><CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1"><BarChart3 className="h-4 w-4 text-blue-600" /><span className="text-xs text-muted-foreground">진행중 협업</span></div>
                            <p className="text-2xl font-bold">{aggregateStats.activeCollabs}건</p>
                            <p className="text-xs text-muted-foreground">₩{aggregateStats.totalRevenue.toLocaleString()}</p>
                        </CardContent></Card>
                    </div>

                    {/* ── 긴급 요약 패널 ─────────────────────────────────── */}
                    {(urgentCreators.length > 0 || idleCreators.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {urgentCreators.length > 0 && (
                                <button
                                    className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/40 text-left hover:shadow-sm transition-shadow w-full"
                                    onClick={() => { setFilterStatus('urgent'); setSortOrder('urgent') }}
                                >
                                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                                            ⚡ 미응답 제안 있음 — {urgentCreators.length}명
                                        </p>
                                        <p className="text-xs text-red-500/80 truncate">
                                            {urgentCreators.slice(0, 3).map(c => c.display_name).join(', ')}
                                            {urgentCreators.length > 3 ? ` 외 ${urgentCreators.length - 3}명` : ''}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-red-400 shrink-0" />
                                </button>
                            )}
                            {idleCreators.length > 0 && (
                                <button
                                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900/20 dark:border-slate-700/40 text-left hover:shadow-sm transition-shadow w-full"
                                    onClick={() => { setFilterStatus('idle'); setSortOrder('name') }}
                                >
                                    <Users className="h-5 w-5 text-slate-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                                            💤 비활성 크리에이터 — {idleCreators.length}명
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">
                                            {idleCreators.slice(0, 3).map(c => c.display_name).join(', ')}
                                            {idleCreators.length > 3 ? ` 외 ${idleCreators.length - 3}명` : ''}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── 크리에이터 현황 + 검색·필터·정렬 ───────────────── */}
                    <div>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <h2 className="text-lg font-bold">크리에이터 현황</h2>

                            {/* View toggle */}
                            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon" className="h-7 w-7"
                                    onClick={() => setViewMode('grid')} title="카드형"
                                > <LayoutGrid className="h-4 w-4" /> </Button>
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="icon" className="h-7 w-7"
                                    onClick={() => setViewMode('table')} title="테이블형"
                                > <TableIcon className="h-4 w-4" /> </Button>
                            </div>
                        </div>

                        {/* Search + Sort + Price 한 줄 */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="이름, 인스타, 태그 검색..."
                                    className="pl-9 h-9"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={sortOrder} onValueChange={v => setSortOrder(v as SortOrder)}>
                                <SelectTrigger className="h-9 w-[140px]">
                                    <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="urgent">긴급도순</SelectItem>
                                    <SelectItem value="revenue">수익 높은순</SelectItem>
                                    <SelectItem value="followers">팔로워 많은순</SelectItem>
                                    <SelectItem value="moments">모먼트 많은순</SelectItem>
                                    <SelectItem value="name">이름 가나다순</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={priceRange} onValueChange={v => setPriceRange(v as PriceRange)}>
                                <SelectTrigger className="h-9 w-[130px]">
                                    <SelectValue placeholder="단가 범위" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">단가 전체</SelectItem>
                                    <SelectItem value="under30">30만 미만</SelectItem>
                                    <SelectItem value="30to100">30~100만</SelectItem>
                                    <SelectItem value="over100">100만 이상</SelectItem>
                                </SelectContent>
                            </Select>
                            {allTags.length > 0 && (
                                <Select value={tagFilter} onValueChange={setTagFilter}>
                                    <SelectTrigger className="h-9 w-[120px]">
                                        <SelectValue placeholder="태그" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">태그 전체</SelectItem>
                                        {allTags.map(t => (
                                            <SelectItem key={t} value={t}>#{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Filter chips */}
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            {FILTER_CHIPS.map(chip => (
                                <button
                                    key={chip.value}
                                    onClick={() => setFilterStatus(chip.value)}
                                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${filterStatus === chip.value
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-background border-border hover:border-primary/50 hover:bg-muted'
                                        }`}
                                >
                                    {chip.label}
                                    {chip.value === 'urgent' && urgentCreators.length > 0 && (
                                        <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                                            {urgentCreators.length}
                                        </span>
                                    )}
                                    {chip.value === 'idle' && idleCreators.length > 0 && (
                                        <span className="ml-1.5 bg-slate-400 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                                            {idleCreators.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                                {filteredCreators.length}/{summaryData.length}명
                            </span>
                        </div>

                        {/* Creator list */}
                        {filteredCreators.length === 0 ? (
                            <Card className="p-12 text-center border-dashed">
                                <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                                <p className="text-muted-foreground">
                                    {summaryData.length === 0
                                        ? '소속 크리에이터가 없습니다. 초대 링크를 통해 크리에이터를 초대하세요.'
                                        : '검색 조건에 맞는 크리에이터가 없습니다.'}
                                </p>
                                {summaryData.length > 0 && (
                                    <Button variant="ghost" size="sm" className="mt-3" onClick={() => {
                                        setSearchQuery(''); setFilterStatus('all'); setPriceRange('all'); setTagFilter('all')
                                    }}>
                                        필터 초기화
                                    </Button>
                                )}
                            </Card>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {filteredCreators.map(creator => (
                                    <CreatorSummaryCard
                                        key={creator.user_id}
                                        creator={creator}
                                        status={creator._status}
                                        onViewDashboard={() => handleViewCreator(creator.user_id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            /* ─── 테이블형 뷰 ─────────────────────────────── */
                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/60 border-b">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-[260px]">크리에이터</th>
                                            <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">상태</th>
                                            <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">태그</th>
                                            <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">팔로워</th>
                                            <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">모먼트</th>
                                            <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">미확인 제안</th>
                                            <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">진행 협업</th>
                                            <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">매출</th>
                                            <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">영상단가</th>
                                            <th className="w-[50px]" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredCreators.map(creator => {
                                            const totalPending = creator.pending_product_applications + creator.pending_moment_proposals
                                            const totalActive = creator.active_product_applications + creator.active_moment_proposals + creator.active_campaign_applications
                                            const totalRevenue = creator.product_revenue + creator.moment_revenue
                                            const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString()

                                            const STATUS_ROW_COLORS: Record<CreatorStatus, string> = {
                                                urgent: 'bg-red-50/40 dark:bg-red-900/5',
                                                active: '',
                                                normal: '',
                                                idle: 'opacity-60',
                                            }
                                            const STATUS_BADGE: Record<CreatorStatus, string> = {
                                                urgent: 'bg-red-100 text-red-700 border-red-200',
                                                active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                                normal: 'bg-blue-50 text-blue-600 border-blue-200',
                                                idle: 'bg-slate-100 text-slate-500 border-slate-200',
                                            }
                                            const STATUS_LABELS: Record<CreatorStatus, string> = {
                                                urgent: '🔴 긴급', active: '🟢 협업 중', normal: '🔵 정상', idle: '⚪ 비활성'
                                            }

                                            return (
                                                <tr
                                                    key={creator.user_id}
                                                    className={`hover:bg-muted/40 cursor-pointer transition-colors ${STATUS_ROW_COLORS[creator._status]}`}
                                                    onClick={() => handleViewCreator(creator.user_id)}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8 shrink-0">
                                                                <AvatarImage src={creator.avatar_url || ''} />
                                                                <AvatarFallback className="text-xs font-bold">{creator.display_name?.[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-semibold text-sm leading-tight">{creator.display_name}</p>

                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${STATUS_BADGE[creator._status]}`}>
                                                            {STATUS_LABELS[creator._status]}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {creator.tags?.slice(0, 2).map(t => (
                                                                <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground">#{t}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-medium">{fmt(creator.followers_count)}</td>
                                                    <td className="px-3 py-3 text-right">{creator.total_moments}</td>
                                                    <td className="px-3 py-3 text-right">
                                                        {totalPending > 0 ? (
                                                            <span className="font-bold text-red-600">{totalPending}건</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">{totalActive > 0 ? `${totalActive}건` : '-'}</td>
                                                    <td className="px-3 py-3 text-right font-medium text-primary">
                                                        {totalRevenue > 0 ? `₩${totalRevenue.toLocaleString()}` : '-'}
                                                    </td>
                                                    <td className="px-3 py-3 text-right text-xs text-muted-foreground">
                                                        {creator.price_video > 0 ? `₩${(creator.price_video / 10000).toFixed(0)}만` : '-'}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Proposals Tab */}
                <TabsContent value="proposals">
                    <TeamProposalsTable teamId={currentTeam?.id || ''} />
                </TabsContent>

                {/* Calendar Tab */}
                <TabsContent value="calendar">
                    <TeamCalendar teamId={currentTeam?.id || ''} />
                </TabsContent>

                {/* Settlement Tab */}
                <TabsContent value="settlement">
                    <SettlementTab teamId={currentTeam?.id || ''} mcnName={currentTeam?.name || 'MCN'} />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InviteLinkGenerator />
                        <TeamStatistics summaryData={summaryData} />
                    </div>

                    {/* 수익 배분율 + 성과 패널 2열 그리드 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* 수익 배분율 카드 (좌측) */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    크리에이터 수익 배분율
                                    <span className="text-xs font-normal text-muted-foreground ml-1">(자동 정산 적용)</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {summaryData.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">소속 크리에이터가 없습니다.</p>
                                ) : (
                                    <div className="divide-y">
                                        {summaryData.map(c => {
                                            const ratio = splitRatios[c.user_id] ?? 0.7
                                            return (
                                                <div key={c.user_id} className="flex items-center justify-between py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-7 w-7">
                                                            <AvatarImage src={c.avatar_url || ''} />
                                                            <AvatarFallback className="text-xs">{c.display_name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium leading-tight">{c.display_name}</p>
                                                            <p className="text-xs text-muted-foreground">크리에이터 {Math.round(ratio * 100)}% / MCN {Math.round((1 - ratio) * 100)}%</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => setSplitEditorCreator({
                                                            id: c.user_id,
                                                            name: c.display_name || '크리에이터',
                                                            avatar: c.avatar_url,
                                                            currentRatio: ratio,
                                                        })}
                                                    >
                                                        설정
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 광고 성과 패널 (우측) */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                    크리에이터 광고 성과
                                    <span className="text-xs font-normal text-muted-foreground ml-1">(최근 협업 기준)</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {summaryData.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">소속 크리에이터가 없습니다.</p>
                                ) : (
                                    <div className="divide-y">
                                        {summaryData.map(c => {
                                            const perf = perfData[c.user_id]
                                            return (
                                                <div key={c.user_id} className="flex items-center justify-between py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-7 w-7">
                                                            <AvatarImage src={c.avatar_url || ''} />
                                                            <AvatarFallback className="text-xs">{c.display_name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium leading-tight">{c.display_name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {perf ? `${perf.count}건 완료` : '성과 없음'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {perf?.latest ? (
                                                        <div className="flex gap-3 text-right">
                                                            {perf.latest.cpe != null && (
                                                                <div>
                                                                    <p className="text-[10px] text-muted-foreground">CPE</p>
                                                                    <p className="text-xs font-semibold">₩{Math.round(perf.latest.cpe).toLocaleString()}</p>
                                                                </div>
                                                            )}
                                                            {perf.latest.engagement_rate != null && (
                                                                <div>
                                                                    <p className="text-[10px] text-muted-foreground">참여율</p>
                                                                    <p className="text-xs font-semibold text-emerald-600">{perf.latest.engagement_rate}%</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* MCN 사업자 정보 */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                사업자 정보
                                <span className="text-xs font-normal text-muted-foreground ml-1">(지급명세서에 자동 반영됩니다)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">사업자등록번호</Label>
                                    <Input
                                        placeholder="000-00-00000"
                                        value={bizInfo.business_registration_number}
                                        onChange={e => setBizInfo(p => ({ ...p, business_registration_number: e.target.value }))}
                                        className="h-9 text-sm font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">대표자명</Label>
                                    <Input
                                        placeholder="홍길동"
                                        value={bizInfo.representative_name}
                                        onChange={e => setBizInfo(p => ({ ...p, representative_name: e.target.value }))}
                                        className="h-9 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">사업장 주소</Label>
                                <Input
                                    placeholder="서울특별시 강남구 ..."
                                    value={bizInfo.business_address}
                                    onChange={e => setBizInfo(p => ({ ...p, business_address: e.target.value }))}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">도장 이미지 URL <span className="text-muted-foreground/60">(선택)</span></Label>
                                <Input
                                    placeholder="https://... (PNG/SVG 투명 배경 권장)"
                                    value={bizInfo.stamp_url}
                                    onChange={e => setBizInfo(p => ({ ...p, stamp_url: e.target.value }))}
                                    className="h-9 text-sm"
                                />
                                {bizInfo.stamp_url && (
                                    <div className="flex items-center gap-2 mt-1">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={bizInfo.stamp_url} alt="도장 미리보기" className="h-10 w-10 object-contain border rounded" />
                                        <span className="text-xs text-muted-foreground">미리보기</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end pt-1">
                                <Button
                                    id="biz-save-btn"
                                    size="sm"
                                    onClick={handleSaveBizInfo}
                                    disabled={isSavingBiz}
                                    className="gap-1.5"
                                >
                                    {isSavingBiz ? (
                                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />저장 중...</>
                                    ) : (
                                        <><Save className="h-3.5 w-3.5" />저장하기</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* 수익 배분율 편집 모달 */}
            {splitEditorCreator && currentTeam?.id && (
                <RevenueSplitEditor
                    teamId={currentTeam.id}
                    creator={splitEditorCreator}
                    onClose={() => setSplitEditorCreator(null)}
                    onSaved={(creatorId, newRatio) => {
                        setSplitRatios(prev => ({ ...prev, [creatorId]: newRatio }))
                        setSplitEditorCreator(null)
                    }}
                />
            )}
        </main>
    )
}
