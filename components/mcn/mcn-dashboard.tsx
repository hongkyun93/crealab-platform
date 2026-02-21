"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTeam } from "@/components/providers/team-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { CreatorSummaryCard } from "./creator-summary-card"
import { TeamStatistics } from "./team-statistics"
import { InviteLinkGenerator } from "./invite-link-generator"
import { TeamProposalsTable } from "./team-proposals-table"
import { TeamCalendar } from "./team-calendar"
import { SettlementTab } from "./settlement-tab"
import { Users, BarChart3, FileText, Calendar, Loader2, Building2, Link2, Wallet } from "lucide-react"
import { toast } from "sonner"

interface CreatorSummary {
    user_id: string
    display_name: string
    avatar_url: string | null
    instagram_handle: string | null
    followers_count: number
    tier: string | null
    tags: string[] | null
    price_video: number
    price_feed: number
    total_moments: number
    active_moments: number
    total_brand_proposals: number
    pending_brand_proposals: number
    active_brand_proposals: number
    brand_revenue: number
    total_moment_proposals: number
    pending_moment_proposals: number
    active_moment_proposals: number
    moment_revenue: number
    total_campaign_applications: number
    pending_campaign_applications: number
    active_campaign_applications: number
}

export function McnDashboard() {
    const { user, supabase } = useAuth()
    const { currentTeam, teamMembers, switchToMember, isLoading: isTeamLoading } = useTeam()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("dashboard")
    const [summaryData, setSummaryData] = useState<CreatorSummary[]>([])
    const [isLoadingSummary, setIsLoadingSummary] = useState(true)

    // Fetch team summary data
    useEffect(() => {
        if (!currentTeam?.id) {
            setIsLoadingSummary(false)
            return
        }

        const fetchSummary = async () => {
            setIsLoadingSummary(true)
            try {
                const { data, error } = await supabase.rpc('get_team_dashboard_summary', {
                    target_team_id: currentTeam.id
                })

                if (error) {
                    // RPC not deployed yet — expected, use fallback profile data
                    console.warn('[MCN Dashboard] RPC not available yet (deploy migration SQL). Using fallback profile data.')
                    // Fallback: build summary from teamMembers profile data
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
                        total_brand_proposals: 0,
                        pending_brand_proposals: 0,
                        active_brand_proposals: 0,
                        brand_revenue: 0,
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

    // Aggregate stats
    const aggregateStats = useMemo(() => {
        const totalMembers = summaryData.length
        const totalMoments = summaryData.reduce((sum, c) => sum + c.total_moments, 0)
        const activeMoments = summaryData.reduce((sum, c) => sum + c.active_moments, 0)
        const pendingProposals = summaryData.reduce((sum, c) =>
            sum + c.pending_brand_proposals + c.pending_moment_proposals, 0)
        const activeCollabs = summaryData.reduce((sum, c) =>
            sum + c.active_brand_proposals + c.active_moment_proposals + c.active_campaign_applications, 0)
        const totalRevenue = summaryData.reduce((sum, c) =>
            sum + c.brand_revenue + c.moment_revenue, 0)

        return { totalMembers, totalMoments, activeMoments, pendingProposals, activeCollabs, totalRevenue }
    }, [summaryData])

    const isLoading = isTeamLoading || isLoadingSummary

    // Handle navigate to creator dashboard (proxy mode)
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
                {/* Header + Tabs inline */}
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
                            <BarChart3 className="h-4 w-4" />
                            대시보드
                        </TabsTrigger>
                        <TabsTrigger value="proposals" className="gap-2 px-4">
                            <FileText className="h-4 w-4" />
                            제안서
                            {aggregateStats.pendingProposals > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-[10px] px-1.5">
                                    {aggregateStats.pendingProposals}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-2 px-4">
                            <Calendar className="h-4 w-4" />
                            캘린더
                        </TabsTrigger>
                        <TabsTrigger value="settlement" className="gap-2 px-4">
                            <Wallet className="h-4 w-4" />
                            정산
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2 px-4">
                            <Users className="h-4 w-4" />
                            팀 관리
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span className="text-xs text-muted-foreground">소속 크리에이터</span>
                                </div>
                                <p className="text-2xl font-bold">{aggregateStats.totalMembers}명</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs text-muted-foreground">활성 모먼트</span>
                                </div>
                                <p className="text-2xl font-bold">{aggregateStats.activeMoments}건</p>
                                <p className="text-xs text-muted-foreground">전체 {aggregateStats.totalMoments}건</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-4 w-4 text-orange-600" />
                                    <span className="text-xs text-muted-foreground">미확인 제안</span>
                                </div>
                                <p className="text-2xl font-bold text-orange-600">{aggregateStats.pendingProposals}건</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs text-muted-foreground">진행중 협업</span>
                                </div>
                                <p className="text-2xl font-bold">{aggregateStats.activeCollabs}건</p>
                                <p className="text-xs text-muted-foreground">
                                    ₩{(aggregateStats.totalRevenue).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Creator Cards */}
                    <div>
                        <h2 className="text-lg font-bold mb-4">크리에이터 현황</h2>
                        {summaryData.length === 0 ? (
                            <Card className="p-12 text-center border-dashed">
                                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
                                <h3 className="text-xl font-bold mb-2">소속 크리에이터가 없습니다</h3>
                                <p className="text-muted-foreground mb-4">초대 링크를 통해 크리에이터를 초대하세요</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {summaryData.map((creator) => (
                                    <CreatorSummaryCard
                                        key={creator.user_id}
                                        creator={creator}
                                        onViewDashboard={() => handleViewCreator(creator.user_id)}
                                    />
                                ))}
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
                    <SettlementTab
                        teamId={currentTeam?.id || ''}
                        mcnName={currentTeam?.name || 'MCN'}
                    />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InviteLinkGenerator />
                        <TeamStatistics summaryData={summaryData} />
                    </div>
                </TabsContent>
            </Tabs>
        </main>
    )
}
