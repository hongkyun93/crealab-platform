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

export function DashboardView({
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
                    className="h-[180px] flex flex-col justify-center items-center bg-white border-2 border-emerald-100 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all group"
                    onClick={() => setCurrentView('moments_list')}
                >
                    <div className="p-4 rounded-full bg-emerald-100/50 text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                        <Calendar className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-700">내 모먼트 아카이브</h3>
                            <Badge className="bg-emerald-600 text-white text-md px-2 py-0.5 hover:bg-emerald-700">
                                {activeMoments.length + myMoments.length + pastMoments.length}건
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-400">나의 모먼트 / 지난 모먼트</p>
                    </div>
                </div>

                {/* Box 2: My Campaign Archive */}
                <div
                    className="h-[180px] flex flex-col justify-center items-center bg-white border-2 border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all group"
                    onClick={() => setCurrentView('campaigns_list')}
                >
                    <div className="p-4 rounded-full bg-slate-100 text-slate-600 mb-4 group-hover:scale-110 transition-transform">
                        <Megaphone className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-700">내 캠페인 아카이브</h3>
                            <Badge variant="secondary" className="bg-slate-200 text-slate-700 text-md px-2 py-0.5">
                                {outboundApplications.length}건
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-400">나의 지원 현황</p>
                    </div>
                </div>

                {/* Box 3: Received Proposal Archive */}
                <div
                    className="h-[180px] flex flex-col justify-center items-center bg-white border-2 border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 cursor-pointer transition-all group"
                    onClick={() => setCurrentView('inbound_list')}
                >
                    <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-4 group-hover:scale-110 transition-transform">
                        <Bell className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-500">받은 제안 아카이브</h3>
                            <Badge variant="outline" className="text-slate-500 border-slate-300 text-md px-2 py-0.5">
                                {inboundProposals.length}건
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-400">브랜드 직접 제안</p>
                    </div>
                </div>
            </div>

            {/* 2. Calendar Section */}
            <div className="border-2 border-slate-200 rounded-xl overflow-hidden h-auto min-h-[400px] flex flex-col shadow-sm bg-white">
                <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50/50">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                        내 캘린더
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 mb-1">
                        진행 중인 모든 프로젝트의 일정을 한눈에 관리하세요.
                    </p>
                </div>
                <div className="flex-1 p-6">
                    <CalendarView
                        activeMoments={allActive}
                        myMoments={myMoments}
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
}
