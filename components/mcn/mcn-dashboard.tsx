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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, ArrowUpDown, BarChart3, Building2, Calendar, ChevronRight, FileSignature, FileText, Instagram, LayoutGrid, Loader2, Save, Search, Table as TableIcon, Users, Wallet, Sparkles, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { useEffect, useMemo, useState } from "react"
import {
    CreatorSummaryCard, type CreatorStatus, type CreatorSummary
} from "./creator-summary-card"
import { InviteLinkGenerator } from "./invite-link-generator"
import { RevenueSplitEditor } from "./revenue-split-editor"
import { SettlementTab } from "./settlement-tab"
import { TeamCalendar } from "./team-calendar"

import { TeamProposalsTableDev } from "./team-proposals-table-dev"
import { TeamStatistics } from "./team-statistics"
import { SettingsView } from "@/components/creator/views/SettingsView"
import { useMobileSidebar } from "@/lib/hooks/use-mobile-sidebar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { McnPortfolioView } from "./views/mcn-portfolio-view"
import { McnQuickDashboardView } from "./views/mcn-quick-dashboard-view"
// MCNProxyView는 실제로는 기존 dashboard 내용을 감싸거나 쓰이지 않습니다.
// 기존 dashboard 내용 자체가 proxy 탭으로 이동합니다.

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
    const { currentTeam, teamMembers, switchToMember, removeMember, isLoading: isTeamLoading } = useTeam()
    const router = useRouter()
    const { isOpen: isMobileSidebarOpen, setIsOpen: setIsMobileSidebarOpen } = useMobileSidebar()
    const [activeTab, setActiveTab] = useState("portfolio")
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

    // ── Profile Edit state ───────────────────────────────────────
    const [editingProfileId, setEditingProfileId] = useState<string | null>(null)

    // ── Remove Member state ──────────────────────────────────────
    const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null)
    const [isRemoving, setIsRemoving] = useState(false)

    const handleRemoveMember = async () => {
        if (!memberToRemove) return
        setIsRemoving(true)
        try {
            const memberRecord = teamMembers.find(m => m.user_id === memberToRemove.id)
            if (!memberRecord) {
                toast.error("팀원 정보를 찾을 수 없습니다.")
                return
            }

            const success = await removeMember(memberRecord.id)
            if (success) {
                toast.success(`${memberToRemove.name}님을 팀에서 내보냈습니다.`)
                setSummaryData(prev => prev.filter(c => c.user_id !== memberToRemove.id))
                setTimeout(() => window.location.reload(), 1000)
            } else {
                toast.error("팀 퇴출에 실패 (권한 부족 또는 삭제 오류)")
            }
        } catch (err: any) {
            toast.error("퇴출 중 오류 발생: " + err.message)
        } finally {
            setIsRemoving(false)
            setMemberToRemove(null)
        }
    }

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
    const [contractSettings, setContractSettings] = useState({
        custom_contract_terms: '',
        use_custom_contract: false,
    })
    const [isSavingBiz, setIsSavingBiz] = useState(false)
    const [isSavingContract, setIsSavingContract] = useState(false)

    // Fetch team business info when settings tab is shown
    useEffect(() => {
        if (!currentTeam?.id || activeTab !== 'settings') return
        supabase
            .from('teams')
            .select('business_registration_number, representative_name, business_address, stamp_url, custom_contract_terms, use_custom_contract')
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
                    setContractSettings({
                        custom_contract_terms: data.custom_contract_terms || '',
                        use_custom_contract: data.use_custom_contract || false,
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
            // Light feedback via title flash
            const el = document.getElementById('biz-save-btn')
            if (el) el.textContent = '저장됨 ✓'
            setTimeout(() => { if (el) el.textContent = '저장하기' }, 2000)
        }
    }

    const handleSaveContractSettings = async () => {
        if (!currentTeam?.id) return
        setIsSavingContract(true)
        const { error } = await supabase
            .from('teams')
            .update({
                custom_contract_terms: contractSettings.custom_contract_terms || null,
                use_custom_contract: contractSettings.use_custom_contract,
            })
            .eq('id', currentTeam.id)
        setIsSavingContract(false)
        if (error) {
            console.error('[McnDashboard] save contract error:', error)
        } else {
            const el = document.getElementById('contract-save-btn')
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
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-primary" />
                            MCN 관리 대시보드
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {currentTeam?.name || 'My Team'} · 소속 크리에이터 {aggregateStats.totalMembers}명
                        </p>
                    </div>

                    {/* Mobile Sidebar (controlled by SiteHeader's Hamburger) */}
                    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                        <SheetContent side="left" className="w-[300px] p-0 flex flex-col h-full overflow-hidden">
                            <SheetHeader className="p-4 border-b bg-background z-10 sticky top-0">
                                <SheetTitle className="text-left font-bold text-lg">MCN 메뉴</SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto w-full p-4">
                                <nav className="space-y-2">
                                    <Button
                                        variant={activeTab === "portfolio" ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => { setActiveTab("portfolio"); setIsMobileSidebarOpen(false); }}
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" />포트폴리오
                                    </Button>
                                    <Button
                                        variant={activeTab === "quick-dashboard" ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => { setActiveTab("quick-dashboard"); setIsMobileSidebarOpen(false); }}
                                    >
                                        <LayoutDashboard className="mr-2 h-4 w-4" />크리에이터 관리
                                    </Button>
                                    <Button
                                        variant={activeTab === "proposals-dev" ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => { setActiveTab("proposals-dev"); setIsMobileSidebarOpen(false); }}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />마스터 트래커
                                        {aggregateStats.pendingProposals > 0 && (
                                            <Badge variant="destructive" className="ml-auto min-w-5 h-5 text-[10px] px-1.5">{aggregateStats.pendingProposals}</Badge>
                                        )}
                                    </Button>
                                    <Button
                                        variant={activeTab === "calendar" ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => { setActiveTab("calendar"); setIsMobileSidebarOpen(false); }}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />캘린더
                                    </Button>
                                    <Button
                                        variant={activeTab === "settlement" ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => { setActiveTab("settlement"); setIsMobileSidebarOpen(false); }}
                                    >
                                        <Wallet className="mr-2 h-4 w-4" />정산
                                    </Button>
                                    <Button
                                        variant={activeTab === "settings" ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => { setActiveTab("settings"); setIsMobileSidebarOpen(false); }}
                                    >
                                        <Users className="mr-2 h-4 w-4" />팀 관리
                                    </Button>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <TabsList className="hidden md:flex flex-nowrap h-auto gap-1.5 border bg-transparent p-1 shadow-sm rounded-lg w-full xl:w-fit overflow-x-auto hide-scrollbar">
                        <TabsTrigger value="portfolio" className="gap-2 px-4 shadow-none">
                            <Sparkles className="h-4 w-4" />포트폴리오
                        </TabsTrigger>
                        <TabsTrigger value="quick-dashboard" className="gap-2 px-4 shadow-none">
                            <LayoutDashboard className="h-4 w-4" />크리에이터 관리
                        </TabsTrigger>
                        <TabsTrigger value="proposals-dev" className="gap-2 px-4 shadow-none">
                            <FileText className="h-4 w-4" />마스터 트래커
                            {aggregateStats.pendingProposals > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-[10px] px-1.5">
                                    {aggregateStats.pendingProposals}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-2 px-4 shadow-none">
                            <Calendar className="h-4 w-4" />캘린더
                        </TabsTrigger>
                        <TabsTrigger value="settlement" className="gap-2 px-4 shadow-none">
                            <Wallet className="h-4 w-4" />정산
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2 px-4 shadow-none">
                            <Users className="h-4 w-4" />팀 관리
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* 1. Portfolio Management Tab */}
                <TabsContent value="portfolio" className="space-y-6 mt-6">
                    <McnPortfolioView teamId={currentTeam?.id || ''} summaryData={summaryData} onEditCreator={(id) => handleViewCreator(id)} />
                </TabsContent>

                {/* 2. Quick Dashboard Tab (Split View) */}
                <TabsContent value="quick-dashboard" className="mt-6">
                    <McnQuickDashboardView summaryData={summaryData} />
                </TabsContent>

                {/* Proposals Dev Tab */}
                <TabsContent value="proposals-dev">
                    <TeamProposalsTableDev teamId={currentTeam?.id || ''} />
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
                                    MCN 팀원 관리
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
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs"
                                                            onClick={() => {
                                                                switchToMember(c.user_id)
                                                                setEditingProfileId(c.user_id)
                                                            }}
                                                        >
                                                            프로필 편집
                                                        </Button>
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
                                                            배분율 설정
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => setMemberToRemove({
                                                                id: c.user_id,
                                                                name: c.display_name || '크리에이터',
                                                            })}
                                                        >
                                                            팀 퇴출
                                                        </Button>
                                                    </div>
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

                    {/* 자체 전자계약서 연동 패널 */}
                    <Card className="border-emerald-100 dark:border-emerald-900/40 shadow-sm">
                        <CardHeader className="pb-3 border-b bg-emerald-50/50 dark:bg-emerald-900/10">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <FileSignature className="h-4 w-4 text-emerald-600" />
                                    우리 회사 전용 전자계약서 양식 연동
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="use-custom" className="text-sm font-medium cursor-pointer">
                                        기본 양식 대신 사용하기
                                    </Label>
                                    <Switch
                                        id="use-custom"
                                        checked={contractSettings.use_custom_contract}
                                        onCheckedChange={c => setContractSettings(p => ({ ...p, use_custom_contract: c }))}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                크레디픽 기본 계약서 대신, 소속 크리에이터가 브랜드와 계약할 때 적용될 MCN 자체 표준 계약서 조항을 입력하세요.
                            </p>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">계약서 조항 본문 (표준안)</Label>
                                <Textarea
                                    placeholder={`제1조 (목적)\n본 계약은 아티스트와 MCN 간의 수익 배분 및 계약 조건을 명시합니다...\n\n제2조 (비용 정산)\n브랜드 캠페인 수익은 제세공과금을 제하고 배분율에 따라 정산됩니다...`}
                                    className="min-h-[250px] font-mono text-sm leading-relaxed"
                                    value={contractSettings.custom_contract_terms}
                                    onChange={e => setContractSettings(p => ({ ...p, custom_contract_terms: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    id="contract-save-btn"
                                    size="sm"
                                    onClick={handleSaveContractSettings}
                                    disabled={isSavingContract}
                                    className="gap-1.5 w-[120px] bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {isSavingContract ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    저장하기
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

            {/* 프로필 편집 모달 (Sheet) */}
            <Sheet open={!!editingProfileId} onOpenChange={(open) => !open && setEditingProfileId(null)}>
                <SheetContent side="right" className="w-full sm:w-[540px] md:w-[700px] flex flex-col p-0">
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle>크리에이터 프로필 편집</SheetTitle>
                    </SheetHeader>
                    {editingProfileId && (
                        <div className="flex-1 overflow-y-auto w-full p-2 bg-muted/20">
                            {/* SettingsView 내부에서 effectiveUserId를 인식하도록 Proxy provider가 감싸주는 방식이나, 
                                mcn-dashboard는 이미 useTeam() 등을 통해 Proxy 모드를 지원하는 구조이므로,
                                선택된 크리에이터 ID를 query param 등으로 넘기지 않아도 switchToMember() 호출로 인해 
                                전역 effectiveUser가 설정되어 작동할 것으로 예상됩니다.
                                만약 switchToMember가 적용되어 있지 않다면, Sheet 열릴때 switchToMember(editingProfileId)를 호출해야 합니다. */}
                            <SettingsView />
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* 팀 퇴출 확인 모달 */}
            <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && !isRemoving && setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>크리에이터 팀 퇴출</AlertDialogTitle>
                        <AlertDialogDescription>
                            정말로 <strong>{memberToRemove?.name}</strong>님을 팀에서 내보내시겠습니까?<br /><br />
                            이 작업은 되돌릴 수 없으며, 해당 크리에이터는 더 이상 팀의 관리 및 정산을 받을 수 없게 됩니다. 진행 중인 계약이 있는 경우 법적 분쟁의 소지가 있을 수 있습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleRemoveMember()
                            }}
                            disabled={isRemoving}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            퇴출하기
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    )
}
