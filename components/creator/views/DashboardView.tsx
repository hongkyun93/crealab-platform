import { CalendarView } from "@/components/dashboard/calendar-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Briefcase, Calendar, DollarSign, Megaphone, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

interface DashboardViewProps {
    activeMoments: any[]
    myMoments: any[]
    pastMoments: any[]
    outboundApplications: any[]
    inboundProposals: any[]
    allActive: any[]
    allCompleted: any[]
    setCurrentView: (view: string) => void
    handleOpenDetails: (item: any, type: "moment" | "campaign") => void
    setChatProposal: (proposal: any) => void
    setIsChatOpen: (open: boolean) => void
}

export const DashboardView = React.memo(function DashboardView({
    activeMoments,
    myMoments,
    pastMoments,
    outboundApplications,
    inboundProposals,
    allActive,
    allCompleted,
    setCurrentView,
    handleOpenDetails,
    setChatProposal,
    setIsChatOpen
}: DashboardViewProps) {
    const router = useRouter()

    return (
        <>
            {/* 1. Stats Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                {/* Box 1: My Moment Archive */}
                <div
                    className="h-[120px] md:h-[180px] flex flex-row items-center gap-5 px-6 md:flex-col md:justify-center md:items-center md:gap-0 md:px-4 bg-card border-2 border-indigo-400/50 dark:border-indigo-500/40 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:border-indigo-500/70 cursor-pointer transition-all group"
                    onClick={() => setCurrentView('moments_list')}
                >
                    <div className="shrink-0 p-4 rounded-full bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 md:mb-4 group-hover:scale-110 transition-transform">
                        <Calendar className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-start md:items-center gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">내 모먼트 관리</h3>
                            <Badge variant="outline" className="text-muted-foreground border-border text-md px-2 py-0.5">
                                {activeMoments.length + myMoments.length + pastMoments.length}건
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            모집 중인 모먼트 <span className="text-indigo-600 font-bold">{activeMoments.length + myMoments.length}건</span> / 지난 모먼트 {pastMoments.length}건
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 gap-1.5 text-xs h-7 border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Link href="/creator/new">
                                <Plus className="h-3 w-3" /> 새 모먼트 만들기
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Box 2: Workspace Archive */}
                <div
                    className="h-[120px] md:h-[180px] flex flex-row items-center gap-5 px-6 md:flex-col md:justify-center md:items-center md:gap-0 md:px-4 bg-card border-2 border-purple-400/50 dark:border-purple-500/40 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:border-purple-500/70 cursor-pointer transition-all group"
                    onClick={() => setCurrentView('proposals')}
                >
                    <div className="shrink-0 p-4 rounded-full bg-purple-100/50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 md:mb-4 group-hover:scale-110 transition-transform">
                        <Briefcase className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-start md:items-center gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">협업 워크스페이스</h3>
                            {(outboundApplications.length + inboundProposals.length) > 0 && (
                                <Badge variant="destructive" className="px-2 py-0.5 animate-pulse text-[10px] h-5">
                                    새 알림
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            현재 진행 중인 프로젝트 <span className="text-purple-600 font-bold">{allActive.length}건</span>
                        </p>
                    </div>
                </div>

                {/* Box 3: Earnings Management */}
                <div
                    className="h-[120px] md:h-[180px] flex flex-row items-center gap-5 px-6 md:flex-col md:justify-center md:items-center md:gap-0 md:px-4 bg-card border-2 border-emerald-400/50 dark:border-emerald-500/40 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:border-emerald-500/70 cursor-pointer transition-all group"
                    onClick={() => setCurrentView('earnings')}
                >
                    <div className="shrink-0 p-4 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 md:mb-4 group-hover:scale-110 transition-transform">
                        <DollarSign className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-start md:items-center gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">내 수익 관리</h3>
                        </div>
                        <div className="flex items-baseline gap-1 my-1">
                            <span className="text-xs text-muted-foreground mr-1">총</span>
                            <span className="text-xl md:text-2xl font-black text-emerald-600 tracking-tight">
                                {/* 현재 모든 활성/완료 프로젝트의 price_offer 합계 (예상치) */}
                                ₩ {(
                                    [...allActive, ...allCompleted]
                                        .filter(p => p.price_offer)
                                        .reduce((sum, p) => sum + (p.price_offer || 0), 0)
                                ).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">예상 및 정산 완료 금액</p>
                    </div>
                </div>
            </div>

            {/* 2. Calendar Section */}
            <div className="border-2 border-border/50 rounded-xl overflow-hidden h-auto min-h-[400px] flex flex-col shadow-sm bg-card">
                <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/30">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                        내 캘린더
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-1">
                        진행 중인 모든 프로젝트의 일정을 한눈에 관리하세요.
                    </p>
                </div>
                <div className="flex-1 p-6">
                    <CalendarView
                        activeMoments={allActive}
                        upcomingMoments={myMoments}
                        pastMoments={allCompleted}
                        onSelectMoment={(event) => {
                            if (event.type === 'upcoming') {
                                // 내가 올린 모먼트(모집중) → 모먼트 상세 페이지로 이동
                                if (event.id) router.push(`/moment/${event.id}`)
                            } else {
                                // 수락된 제안 → 워크스페이스 바로 열기
                                setChatProposal(event)
                                setIsChatOpen(true)
                            }
                        }}
                    />
                </div>
            </div>
        </>
    )
})
