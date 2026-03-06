"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useTeam } from "@/components/providers/team-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMobileSidebar } from "@/lib/hooks/use-mobile-sidebar"
import { BarChart3, Building2, Calendar, FileText, LayoutGrid, Loader2, Table as TableIcon, Users, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import type { CreatorStatus } from "./creator-summary-card"
import { SettlementTab } from "./settlement-tab"
import { TeamCalendar } from "./team-calendar"
import { TeamProposalsTable } from "./team-proposals-table"
import type { CreatorSummary, FilterStatus, PriceRange, SortOrder, ViewMode } from "./types/mcn"
import { McnDashboardView } from "./views/mcn-dashboard-view"
import { McnPortfolioView } from "./views/mcn-portfolio-view"
import { McnSettingsView } from "./views/mcn-settings-view"

// ─── Utils ────────────────────────────────────────────────────────────────────
function getCreatorStatus(c: CreatorSummary): CreatorStatus {
    const totalPending = c.pending_product_applications + c.pending_moment_proposals
    const totalActive = c.active_product_applications + c.active_moment_proposals + c.active_campaign_applications
    const hasActivity = c.total_moments > 0 || c.total_product_applications > 0 || c.total_moment_proposals > 0 || c.total_campaign_applications > 0
    if (totalPending > 0) return 'urgent'
    if (totalActive > 0) return 'active'
    if (!hasActivity) return 'idle'
    return 'normal'
}

// ─── Component ────────────────────────────────────────────────────────────────
export function McnDashboard() {
    const { user, supabase } = useAuth()
    const { currentTeam, teamMembers, switchToMember, isLoading: isTeamLoading } = useTeam()
    const router = useRouter()
    const { isOpen: isMobileSidebarOpen, setIsOpen: setIsMobileSidebarOpen } = useMobileSidebar()
    const [activeTab, setActiveTab] = useState("dashboard")
    const [summaryData, setSummaryData] = useState<CreatorSummary[]>([])
    const [isLoadingSummary, setIsLoadingSummary] = useState(true)

    // ── Filter / Sort / View ──────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [sortOrder, setSortOrder] = useState<SortOrder>('urgent')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [priceRange, setPriceRange] = useState<PriceRange>('all')
    const [tagFilter, setTagFilter] = useState<string>('all')

    // ── Revenue Split ─────────────────────────────────────────────────────────
    const [splitEditorCreator, setSplitEditorCreator] = useState<{ id: string; name: string; avatar: string | null; currentRatio: number } | null>(null)
    const [splitRatios, setSplitRatios] = useState<Record<string, number>>({})

    useEffect(() => {
        if (!currentTeam?.id) return
        supabase.from('mcn_revenue_splits').select('creator_id, split_ratio').eq('team_id', currentTeam.id)
            .then(({ data }) => {
                if (data?.length) {
                    const ratios: Record<string, number> = {}
                    data.forEach((r: any) => { ratios[r.creator_id] = r.split_ratio })
                    setSplitRatios(ratios)
                }
            })
    }, [currentTeam?.id, supabase])

    // ── Performance data ──────────────────────────────────────────────────────
    const [perfData, setPerfData] = useState<Record<string, { latest: any; count: number }>>({})
    useEffect(() => {
        if (!currentTeam?.id || summaryData.length === 0) return
        supabase.from('campaign_performance')
            .select('creator_id, engagement_rate, cpe, cpr, created_at')
            .in('creator_id', summaryData.map(c => c.user_id))
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

    // ── Business info ─────────────────────────────────────────────────────────
    const [bizInfo, setBizInfo] = useState({ business_registration_number: '', representative_name: '', business_address: '', stamp_url: '' })
    const [contractSettings, setContractSettings] = useState({ custom_contract_terms: '', use_custom_contract: false })
    const [isSavingBiz, setIsSavingBiz] = useState(false)
    const [isSavingContract, setIsSavingContract] = useState(false)

    useEffect(() => {
        if (!currentTeam?.id || activeTab !== 'settings') return
        supabase.from('teams')
            .select('business_registration_number, representative_name, business_address, stamp_url, custom_contract_terms, use_custom_contract')
            .eq('id', currentTeam.id).single()
            .then(({ data }) => {
                if (data) {
                    setBizInfo({ business_registration_number: data.business_registration_number || '', representative_name: data.representative_name || '', business_address: data.business_address || '', stamp_url: data.stamp_url || '' })
                    setContractSettings({ custom_contract_terms: data.custom_contract_terms || '', use_custom_contract: data.use_custom_contract || false })
                }
            })
    }, [currentTeam?.id, activeTab, supabase])

    const handleSaveBizInfo = async () => {
        if (!currentTeam?.id) return
        setIsSavingBiz(true)
        await supabase.from('teams').update({ business_registration_number: bizInfo.business_registration_number || null, representative_name: bizInfo.representative_name || null, business_address: bizInfo.business_address || null, stamp_url: bizInfo.stamp_url || null }).eq('id', currentTeam.id)
        setIsSavingBiz(false)
        const el = document.getElementById('biz-save-btn')
        if (el) { el.textContent = '저장됨 ✓'; setTimeout(() => { if (el) el.textContent = '저장하기' }, 2000) }
    }

    const handleSaveContractSettings = async () => {
        if (!currentTeam?.id) return
        setIsSavingContract(true)
        await supabase.from('teams').update({ custom_contract_terms: contractSettings.custom_contract_terms || null, use_custom_contract: contractSettings.use_custom_contract }).eq('id', currentTeam.id)
        setIsSavingContract(false)
        const el = document.getElementById('contract-save-btn')
        if (el) { el.textContent = '저장됨 ✓'; setTimeout(() => { if (el) el.textContent = '저장하기' }, 2000) }
    }

    // ── Data Fetch ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!currentTeam?.id) { setIsLoadingSummary(false); return }
        setIsLoadingSummary(true)
        const fetchData = async () => {
            try {
                const { data, error } = await supabase.rpc('get_team_dashboard_summary', { target_team_id: currentTeam.id })
                if (error) {
                    setSummaryData(teamMembers.map(m => ({
                        user_id: m.user_id, display_name: m.profile?.display_name || 'Unknown', avatar_url: m.profile?.avatar_url || null, instagram_handle: m.profile?.instagram_handle || null, followers_count: m.profile?.followers_count || 0, tier: null, tags: m.profile?.tags || null, price_video: m.profile?.price_video || 0, price_feed: m.profile?.price_feed || 0,
                        total_moments: 0, active_moments: 0, total_product_applications: 0, pending_product_applications: 0, active_product_applications: 0, product_revenue: 0, total_moment_proposals: 0, pending_moment_proposals: 0, active_moment_proposals: 0, moment_revenue: 0, total_campaign_applications: 0, pending_campaign_applications: 0, active_campaign_applications: 0,
                    })))
                } else {
                    setSummaryData(data || [])
                }
            } catch (err) {
                console.error('[MCN Dashboard]', err)
            } finally {
                setIsLoadingSummary(false)
            }
        }
        fetchData()
    }, [currentTeam?.id, teamMembers])


    // ── Derived Data ──────────────────────────────────────────────────────────
    const aggregateStats = useMemo(() => ({
        totalMembers: summaryData.length,
        totalMoments: summaryData.reduce((s, c) => s + c.total_moments, 0),
        activeMoments: summaryData.reduce((s, c) => s + c.active_moments, 0),
        pendingProposals: summaryData.reduce((s, c) => s + c.pending_product_applications + c.pending_moment_proposals, 0),
        activeCollabs: summaryData.reduce((s, c) => s + c.active_product_applications + c.active_moment_proposals + c.active_campaign_applications, 0),
        totalRevenue: summaryData.reduce((s, c) => s + c.product_revenue + c.moment_revenue, 0),
    }), [summaryData])

    const allTags = useMemo(() => { const s = new Set<string>(); summaryData.forEach(c => c.tags?.forEach(t => s.add(t))); return Array.from(s).sort() }, [summaryData])
    const urgentCreators = useMemo(() => summaryData.filter(c => c.pending_product_applications + c.pending_moment_proposals > 0), [summaryData])
    const idleCreators = useMemo(() => summaryData.filter(c => !(c.total_moments > 0 || c.total_product_applications > 0 || c.total_moment_proposals > 0 || c.total_campaign_applications > 0)), [summaryData])

    const filteredCreators = useMemo(() => {
        let list = summaryData.map(c => ({ ...c, _status: getCreatorStatus(c) }))
        if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); list = list.filter(c => c.display_name?.toLowerCase().includes(q) || c.instagram_handle?.toLowerCase().includes(q) || c.tags?.some(t => t.toLowerCase().includes(q))) }
        if (filterStatus !== 'all') list = list.filter(c => c._status === filterStatus)
        if (priceRange !== 'all') list = list.filter(c => { const p = c.price_video; if (priceRange === 'under30') return p < 300000; if (priceRange === '30to100') return p >= 300000 && p < 1000000; return p >= 1000000 })
        if (tagFilter !== 'all') list = list.filter(c => c.tags?.includes(tagFilter))
        list.sort((a, b) => {
            if (sortOrder === 'urgent') { const o: Record<CreatorStatus, number> = { urgent: 0, active: 1, normal: 2, idle: 3 }; const d = o[a._status] - o[b._status]; if (d !== 0) return d; return (b.pending_product_applications + b.pending_moment_proposals) - (a.pending_product_applications + a.pending_moment_proposals) }
            if (sortOrder === 'revenue') return (b.product_revenue + b.moment_revenue) - (a.product_revenue + a.moment_revenue)
            if (sortOrder === 'followers') return b.followers_count - a.followers_count
            if (sortOrder === 'moments') return b.total_moments - a.total_moments
            if (sortOrder === 'name') return (a.display_name || '').localeCompare(b.display_name || '', 'ko')
            return 0
        })
        return list
    }, [summaryData, searchQuery, filterStatus, priceRange, tagFilter, sortOrder])

    const isLoading = isTeamLoading || isLoadingSummary
    const teamId = currentTeam?.id || ''
    const nav = (tab: string) => { setActiveTab(tab); setIsMobileSidebarOpen(false) }

    if (isLoading) return (
        <main className="min-h-screen p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">MCN 대시보드 로딩 중...</span>
            </div>
        </main>
    )

    return (
        <main className="min-h-screen p-6 max-w-[1536px] mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {/* ── Header + Navigation ──────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-primary" />
                            MCN 관리 대시보드
                        </h1>
                        <p className="text-muted-foreground mt-1">{currentTeam?.name || 'My Team'} · 소속 크리에이터 {aggregateStats.totalMembers}명</p>
                    </div>

                    {/* Mobile Sidebar */}
                    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                        <SheetContent side="left" className="w-[300px] p-0 flex flex-col h-full overflow-hidden">
                            <SheetHeader className="p-4 border-b bg-background z-10 sticky top-0">
                                <SheetTitle className="text-left font-bold text-lg">MCN 메뉴</SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto w-full p-4">
                                <nav className="space-y-2">
                                    {[
                                        { tab: 'dashboard', icon: <BarChart3 className="mr-2 h-4 w-4" />, label: '대시보드' },
                                        { tab: 'portfolio', icon: <LayoutGrid className="mr-2 h-4 w-4" />, label: '포트폴리오' },
                                        { tab: 'proposals-dev', icon: <TableIcon className="mr-2 h-4 w-4" />, label: '마스터 트래커' },
                                        { tab: 'calendar', icon: <Calendar className="mr-2 h-4 w-4" />, label: '캘린더' },
                                        { tab: 'settlement', icon: <Wallet className="mr-2 h-4 w-4" />, label: '정산' },
                                        { tab: 'settings', icon: <Users className="mr-2 h-4 w-4" />, label: '팀 관리' },
                                    ].map(({ tab, icon, label }) => (
                                        <Button key={tab} variant={activeTab === tab ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => nav(tab)}>
                                            {icon}{label}
                                            {tab === 'proposals' && aggregateStats.pendingProposals > 0 && (
                                                <Badge variant="destructive" className="ml-auto min-w-5 h-5 text-[10px] px-1.5">{aggregateStats.pendingProposals}</Badge>
                                            )}
                                        </Button>
                                    ))}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop TabsList */}
                    <TabsList className="hidden md:grid grid-cols-7 h-auto">
                        <TabsTrigger value="portfolio" className="gap-2 px-4"><LayoutGrid className="h-4 w-4" />포트폴리오</TabsTrigger>
                        <TabsTrigger value="proposals-dev" className="gap-2 px-4"><TableIcon className="h-4 w-4" />마스터 트래커</TabsTrigger>
                        <TabsTrigger value="settlement" className="gap-2 px-4"><Wallet className="h-4 w-4" />정산</TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-2 px-4"><Calendar className="h-4 w-4" />캘린더</TabsTrigger>
                        <TabsTrigger value="dashboard" className="gap-2 px-4"><BarChart3 className="h-4 w-4" />대시보드</TabsTrigger>
                        <TabsTrigger value="proposals" className="gap-2 px-4">
                            <FileText className="h-4 w-4" />제안서
                            {aggregateStats.pendingProposals > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-[10px] px-1.5">{aggregateStats.pendingProposals}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2 px-4"><Users className="h-4 w-4" />팀 관리</TabsTrigger>
                    </TabsList>
                </div>

                {/* ── Tab Contents ──────────────────────────────────────────── */}
                <TabsContent value="dashboard" className="space-y-6">
                    <McnDashboardView
                        summaryData={summaryData}
                        filteredCreators={filteredCreators}
                        aggregateStats={aggregateStats}
                        urgentCreators={urgentCreators}
                        idleCreators={idleCreators}
                        allTags={allTags}
                        searchQuery={searchQuery}
                        filterStatus={filterStatus}
                        sortOrder={sortOrder}
                        viewMode={viewMode}
                        priceRange={priceRange}
                        tagFilter={tagFilter}
                        setSearchQuery={setSearchQuery}
                        setFilterStatus={setFilterStatus}
                        setSortOrder={setSortOrder}
                        setViewMode={setViewMode}
                        setPriceRange={setPriceRange}
                        setTagFilter={setTagFilter}
                        onViewCreator={(userId) => { switchToMember(userId); router.push('/creator') }}
                    />
                </TabsContent>

                <TabsContent value="portfolio">
                    <McnPortfolioView teamId={teamId} summaryData={summaryData} />
                </TabsContent>

                <TabsContent value="proposals-dev">
                    <TeamProposalsTable teamId={teamId} />
                </TabsContent>

                <TabsContent value="proposals">
                    <TeamProposalsTable teamId={teamId} />
                </TabsContent>

                <TabsContent value="calendar">
                    <TeamCalendar teamId={teamId} />
                </TabsContent>

                <TabsContent value="settlement">
                    <SettlementTab teamId={teamId} mcnName={currentTeam?.name || 'MCN'} />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <McnSettingsView
                        summaryData={summaryData}
                        currentTeam={currentTeam}
                        supabase={supabase}
                        splitRatios={splitRatios}
                        splitEditorCreator={splitEditorCreator}
                        setSplitEditorCreator={setSplitEditorCreator}
                        onSplitSaved={(creatorId, newRatio) => setSplitRatios(prev => ({ ...prev, [creatorId]: newRatio }))}
                        perfData={perfData}
                        bizInfo={bizInfo}
                        setBizInfo={setBizInfo}
                        isSavingBiz={isSavingBiz}
                        onSaveBizInfo={handleSaveBizInfo}
                        contractSettings={contractSettings}
                        setContractSettings={setContractSettings}
                        isSavingContract={isSavingContract}
                        onSaveContractSettings={handleSaveContractSettings}
                    />
                </TabsContent>
            </Tabs>
        </main>
    )
}
