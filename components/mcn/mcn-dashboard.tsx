"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useTeam } from "@/components/providers/team-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Building2, Calendar, FileText, LayoutDashboard, Loader2, Sparkles, Users, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { SettingsView } from "@/components/creator/views/SettingsView"
import { useMobileSidebar } from "@/lib/hooks/use-mobile-sidebar"
import { SettlementTab } from "./settlement-tab"
import { TeamCalendar } from "./team-calendar"
import { TeamProposalsTableDev } from "./team-proposals-table-dev"
import { McnPortfolioView } from "./views/mcn-portfolio-view"
import { McnQuickDashboardView } from "./views/mcn-quick-dashboard-view"
import { McnSettingsView } from "./views/mcn-settings-view"
import {
    type CreatorSummary, type FilterStatus, type SortOrder, type ViewMode, type PriceRange,
    getCreatorStatus
} from "./types/mcn"

// ─── Local types ──────────────────────────────────────────────────────────────
const NAV_TABS = [
    { value: 'portfolio', icon: Sparkles, label: '포트폴리오' },
    { value: 'quick-dashboard', icon: LayoutDashboard, label: '크리에이터 관리' },
    { value: 'proposals-dev', icon: FileText, label: '마스터 트래커', badge: true },
    { value: 'calendar', icon: Calendar, label: '캘린더' },
    { value: 'settlement', icon: Wallet, label: '정산' },
    { value: 'settings', icon: Users, label: '팀 관리' },
]

export function McnDashboard() {
    const { supabase } = useAuth()
    const { currentTeam, teamMembers, switchToMember, removeMember, isLoading: isTeamLoading } = useTeam()
    const router = useRouter()
    const { isOpen: isMobileSidebarOpen, setIsOpen: setIsMobileSidebarOpen } = useMobileSidebar()

    const [activeTab, setActiveTab] = useState("portfolio")
    const [summaryData, setSummaryData] = useState<CreatorSummary[]>([])
    const [isLoadingSummary, setIsLoadingSummary] = useState(true)
    const [splitRatios, setSplitRatios] = useState<Record<string, number>>({})
    const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
    const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null)
    const [isRemoving, setIsRemoving] = useState(false)

    // Load summary data
    useEffect(() => {
        if (!currentTeam?.id) { setIsLoadingSummary(false); return }
        setIsLoadingSummary(true)
        supabase.rpc('get_team_dashboard_summary', { target_team_id: currentTeam.id })
            .then(({ data, error }) => {
                if (error || !data) {
                    setSummaryData(teamMembers.map(m => ({
                        user_id: m.user_id,
                        display_name: m.profile?.display_name || 'Unknown',
                        avatar_url: m.profile?.avatar_url || null,
                        instagram_handle: m.profile?.instagram_handle || null,
                        followers_count: m.profile?.followers_count || 0,
                        tier: null, tags: m.profile?.tags || null,
                        price_video: m.profile?.price_video || 0, price_feed: m.profile?.price_feed || 0,
                        total_moments: 0, active_moments: 0,
                        total_product_applications: 0, pending_product_applications: 0, active_product_applications: 0, product_revenue: 0,
                        total_moment_proposals: 0, pending_moment_proposals: 0, active_moment_proposals: 0, moment_revenue: 0,
                        total_campaign_applications: 0, pending_campaign_applications: 0, active_campaign_applications: 0,
                    })))
                } else {
                    setSummaryData(data || [])
                }
                setIsLoadingSummary(false)
            })
    }, [currentTeam?.id, teamMembers, supabase])

    // Load revenue splits
    useEffect(() => {
        if (!currentTeam?.id) return
        supabase.from('mcn_revenue_splits').select('creator_id, split_ratio').eq('team_id', currentTeam.id)
            .then(({ data }) => {
                if (!data?.length) return
                const ratios: Record<string, number> = {}
                data.forEach((r: any) => { ratios[r.creator_id] = r.split_ratio })
                setSplitRatios(ratios)
            })
    }, [currentTeam?.id, supabase])

    const aggregateStats = useMemo(() => ({
        totalMembers: summaryData.length,
        pendingProposals: summaryData.reduce((s, c) => s + c.pending_product_applications + c.pending_moment_proposals, 0),
        activeCollabs: summaryData.reduce((s, c) => s + c.active_product_applications + c.active_moment_proposals + c.active_campaign_applications, 0),
        totalRevenue: summaryData.reduce((s, c) => s + c.product_revenue + c.moment_revenue, 0),
    }), [summaryData])

    const handleRemoveMember = async () => {
        if (!memberToRemove) return
        setIsRemoving(true)
        try {
            const memberRecord = teamMembers.find(m => m.user_id === memberToRemove.id)
            if (!memberRecord) { toast.error("팀원 정보를 찾을 수 없습니다."); return }
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

    const handleEditProfile = (userId: string) => {
        switchToMember(userId)
        setEditingProfileId(userId)
    }

    if (isTeamLoading || isLoadingSummary) {
        return (
            <main className="min-h-screen p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">MCN 대시보드 로딩 중...</span>
                </div>
            </main>
        )
    }

    const setTab = (tab: string) => { setActiveTab(tab); setIsMobileSidebarOpen(false) }

    return (
        <main className="min-h-screen p-6 max-w-[1536px] mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

                    {/* Mobile Sidebar */}
                    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                        <SheetContent side="left" className="w-[300px] p-0 flex flex-col h-full overflow-hidden">
                            <SheetHeader className="p-4 border-b bg-background z-10 sticky top-0">
                                <SheetTitle className="text-left font-bold text-lg">MCN 메뉴</SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto w-full p-4">
                                <nav className="space-y-2">
                                    {NAV_TABS.map(({ value, icon: Icon, label, badge }) => (
                                        <Button key={value} variant={activeTab === value ? "secondary" : "ghost"} className="w-full justify-start" onClick={() => setTab(value)}>
                                            <Icon className="mr-2 h-4 w-4" />{label}
                                            {badge && aggregateStats.pendingProposals > 0 && (
                                                <Badge variant="destructive" className="ml-auto min-w-5 h-5 text-[10px] px-1.5">{aggregateStats.pendingProposals}</Badge>
                                            )}
                                        </Button>
                                    ))}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Tab Bar */}
                    <TabsList className="hidden md:flex flex-nowrap h-auto gap-1.5 border bg-transparent p-1 shadow-sm rounded-lg w-full xl:w-fit overflow-x-auto hide-scrollbar">
                        {NAV_TABS.map(({ value, icon: Icon, label, badge }) => (
                            <TabsTrigger key={value} value={value} className="gap-2 px-4 shadow-none">
                                <Icon className="h-4 w-4" />{label}
                                {badge && aggregateStats.pendingProposals > 0 && (
                                    <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-[10px] px-1.5">{aggregateStats.pendingProposals}</Badge>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <TabsContent value="portfolio" className="space-y-6 mt-6">
                    <McnPortfolioView teamId={currentTeam?.id || ''} summaryData={summaryData} onEditCreator={handleEditProfile} />
                </TabsContent>

                <TabsContent value="quick-dashboard" className="mt-6">
                    <McnQuickDashboardView summaryData={summaryData} />
                </TabsContent>

                {/* forceMount: 탭 전환 시 언마운트 방지 → 첫 로드 이후 스피너 없음 */}
                <TabsContent value="proposals-dev" forceMount className={activeTab !== 'proposals-dev' ? 'hidden' : ''}>
                    <TeamProposalsTableDev teamId={currentTeam?.id || ''} />
                </TabsContent>

                <TabsContent value="calendar" forceMount className={activeTab !== 'calendar' ? 'hidden' : ''}>
                    <TeamCalendar teamId={currentTeam?.id || ''} />
                </TabsContent>

                <TabsContent value="settlement" forceMount className={activeTab !== 'settlement' ? 'hidden' : ''}>
                    <SettlementTab teamId={currentTeam?.id || ''} mcnName={currentTeam?.name || 'MCN'} />
                </TabsContent>

                <TabsContent value="settings" forceMount className={`space-y-6 ${activeTab !== 'settings' ? 'hidden' : ''}`}>
                    <McnSettingsView
                        teamId={currentTeam?.id || ''}
                        summaryData={summaryData}
                        splitRatios={splitRatios}
                        onSplitSaved={(cId, ratio) => setSplitRatios(prev => ({ ...prev, [cId]: ratio }))}
                        onEditProfile={handleEditProfile}
                        onRemoveMember={(id, name) => setMemberToRemove({ id, name })}
                    />
                </TabsContent>
            </Tabs>

            {/* 프로필 편집 Sheet */}
            <Sheet open={!!editingProfileId} onOpenChange={(open) => !open && setEditingProfileId(null)}>
                <SheetContent side="right" className="w-full sm:w-[540px] md:w-[700px] flex flex-col p-0">
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle>크리에이터 프로필 편집</SheetTitle>
                    </SheetHeader>
                    {editingProfileId && (
                        <div className="flex-1 overflow-y-auto w-full p-2 bg-muted/20">
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
                            이 작업은 되돌릴 수 없으며, 진행 중인 계약이 있는 경우 법적 분쟁의 소지가 있을 수 있습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={e => { e.preventDefault(); handleRemoveMember() }}
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
