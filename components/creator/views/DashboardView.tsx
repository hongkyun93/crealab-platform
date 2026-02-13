import React from "react"
import { Calendar, Megaphone, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CalendarView } from "@/components/dashboard/calendar-view"

interface DashboardViewProps {
    activeMoments: any[]
    myMoments: any[]
    pastMoments: any[]
    outboundApplications: any[]
    inboundProposals: any[]
    allActive: any[]
    allCompleted: any[]
    setCurrentView: (view: string) => void
    setSelectedMomentId: (id: string | null) => void
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
    setSelectedMomentId,
    setChatProposal,
    setIsChatOpen
}: DashboardViewProps) {
    return (
        <>
            {/* 1. Stats Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                {/* Box 1: My Moment Archive */}
                <div
                    className="h-[180px] flex flex-col justify-center items-center bg-card border-2 border-indigo-400/50 dark:border-indigo-500/40 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:border-indigo-500/70 cursor-pointer transition-all group"
                    onClick={() => setCurrentView('moments_list')}
                >
                    <div className="p-4 rounded-full bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                        <Calendar className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">내 모먼트 아카이브</h3>
                            <Badge variant="outline" className="text-muted-foreground border-border text-md px-2 py-0.5">
                                {activeMoments.length + myMoments.length + pastMoments.length}건
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            나의 모먼트 <span className="text-indigo-600 font-bold">{activeMoments.length + myMoments.length}건</span> / 지난 모먼트 {pastMoments.length}건
                        </p>
                    </div>
                </div>

                {/* Box 2: My Campaign Archive */}
                <div
                    className="h-[180px] flex flex-col justify-center items-center bg-card border-2 border-emerald-400/50 dark:border-emerald-500/40 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:border-emerald-500/70 cursor-pointer transition-all group"
                    onClick={() => setCurrentView('campaigns_list')}
                >
                    <div className="p-4 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                        <Megaphone className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">내 캠페인 아카이브</h3>
                            <Badge variant="outline" className="text-muted-foreground border-border text-md px-2 py-0.5">
                                {outboundApplications.length}건
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">나의 지원 현황</p>
                    </div>
                </div>

                {/* Box 3: Received Proposal Archive */}
                <div
                    className="h-[180px] flex flex-col justify-center items-center bg-card border-2 border-pink-400/50 dark:border-pink-500/40 rounded-xl shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:shadow-[0_0_25px_rgba(244,114,182,0.5)] hover:border-pink-500/70 cursor-pointer transition-all group"
                    onClick={() => setCurrentView('inbound_list')}
                >
                    <div className="p-4 rounded-full bg-pink-100/50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                        <Bell className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">받은 제안 아카이브</h3>
                            <Badge variant="outline" className="text-muted-foreground border-border text-md px-2 py-0.5">
                                {inboundProposals.length}건
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">브랜드 직접 제안</p>
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
                        onSelectEvent={(event) => {
                            if (event.type === 'upcoming') {
                                setSelectedMomentId(event.id)
                            } else if (event.type === 'active' || event.type === 'completed') {
                                // For active/completed, open workspace chat/proposal
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
