"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTeam } from "@/components/providers/team-provider"
import { BarChart3, Users, Calendar, TrendingUp } from "lucide-react"

export function TeamStatistics() {
    const { teamMembers } = useTeam()

    // Calculate basic statistics
    const totalMembers = teamMembers.length

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
                        <p className="text-base font-bold">{totalMembers}</p>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs text-muted-foreground">활성 모먼트</span>
                        </div>
                        <p className="text-base font-bold">-</p>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-muted-foreground">진행 중</span>
                        </div>
                        <p className="text-base font-bold">-</p>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-orange-600" />
                            <span className="text-xs text-muted-foreground">완료됨</span>
                        </div>
                        <p className="text-base font-bold">-</p>
                    </div>
                </div>

                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    상세 통계 준비 중
                </p>
            </CardContent>
        </Card>
    )
}
