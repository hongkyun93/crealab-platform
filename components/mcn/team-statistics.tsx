"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Calendar, TrendingUp, DollarSign } from "lucide-react"

interface CreatorSummary {
    total_moments: number
    active_moments: number
    active_brand_proposals: number
    active_moment_proposals: number
    active_campaign_applications: number
    pending_brand_proposals: number
    pending_moment_proposals: number
    brand_revenue: number
    moment_revenue: number
}

interface TeamStatisticsProps {
    summaryData?: CreatorSummary[]
}

export function TeamStatistics({ summaryData }: TeamStatisticsProps) {
    // Calculate real statistics from summary data
    const totalMembers = summaryData?.length || 0
    const activeMoments = summaryData?.reduce((sum, c) => sum + c.active_moments, 0) || 0
    const activeCollabs = summaryData?.reduce((sum, c) =>
        sum + c.active_brand_proposals + c.active_moment_proposals + c.active_campaign_applications, 0) || 0
    const pendingProposals = summaryData?.reduce((sum, c) =>
        sum + c.pending_brand_proposals + c.pending_moment_proposals, 0) || 0
    const totalRevenue = summaryData?.reduce((sum, c) =>
        sum + c.brand_revenue + c.moment_revenue, 0) || 0

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    팀 통계
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-xs text-muted-foreground">총 멤버</span>
                        </div>
                        <p className="text-base font-bold">{totalMembers}명</p>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs text-muted-foreground">활성 모먼트</span>
                        </div>
                        <p className="text-base font-bold">{activeMoments}건</p>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-muted-foreground">진행 중 협업</span>
                        </div>
                        <p className="text-base font-bold">{activeCollabs}건</p>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-orange-600" />
                            <span className="text-xs text-muted-foreground">대기 제안</span>
                        </div>
                        <p className="text-base font-bold">{pendingProposals}건</p>
                    </div>

                    {totalRevenue > 0 && (
                        <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-primary/5">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-primary" />
                                <span className="text-xs text-muted-foreground">총 매출</span>
                            </div>
                            <p className="text-base font-bold text-primary">₩{totalRevenue.toLocaleString()}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
