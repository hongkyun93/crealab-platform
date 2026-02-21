import React from "react"
import { ChevronRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, Table as TableIcon } from "lucide-react"
import { MomentGridCard } from "@/components/shared/MomentGridCard"
import { MomentTableView } from "@/components/shared/MomentTableView"

interface MomentsViewProps {
    activeMoments: any[]
    myMoments: any[]
    pastMoments: any[]
    upcomingMoments: any[]
    brandProposals: any[]
    setCurrentView: (view: string) => void
    handleOpenDetails: (moment: any, type: 'moment' | 'campaign') => void
    deleteEvent: (id: string) => void
    updateEvent: (id: string, updates: any) => Promise<boolean>
    user: any
}

export const MomentsView = React.memo(function MomentsView({
    activeMoments,
    myMoments,
    pastMoments,
    upcomingMoments,
    brandProposals,
    setCurrentView,
    handleOpenDetails,
    deleteEvent,
    updateEvent,
    user
}: MomentsViewProps) {
    const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid')

    // Build creator profile from user for the shared card component
    const creatorProfile = {
        id: user?.id,
        name: user?.name || '크리에이터',
        avatar: user?.avatar,
        followers: user?.followers,
        primaryChannel: user?.primaryChannel,
        socialChannels: user?.socialChannels,
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="gap-2">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    돌아가기
                </Button>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">내 모먼트 아카이브</h1>
                    <div className="group relative flex items-center">
                        <Info className="h-5 w-5 text-slate-400 cursor-help" />
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-80 p-3 bg-popover text-popover-foreground text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-border">
                            💡 브랜드에게 보이는 것과 동일한 카드 UI입니다.<br />
                            내 모먼트가 브랜드에게 어떻게 보이는지 확인하세요.
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <TabsList className="w-full md:w-auto grid grid-cols-2">
                        <TabsTrigger value="upcoming">나의 모먼트 ({activeMoments.length + myMoments.length})</TabsTrigger>
                        <TabsTrigger value="past">완료된 모먼트 ({pastMoments.length})</TabsTrigger>
                    </TabsList>

                    {/* View Switcher — identical to brand Discover */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('table')}
                            title="테이블형"
                        >
                            <TableIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('grid')}
                            title="그리드형"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* ─── 나의 모먼트 Tab ──────────────────────────────── */}
                <TabsContent value="upcoming" className="space-y-4">
                    {viewMode === 'grid' ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {upcomingMoments.length > 0 ? (
                                upcomingMoments.map((moment: any) => (
                                    <MomentGridCard
                                        key={moment.id}
                                        item={moment}
                                        creator={creatorProfile}
                                        isPast={false}
                                        offerCount={brandProposals.filter((p: any) => p.event_id === moment.id && (p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending')).length}
                                        onClick={(m) => handleOpenDetails(m, 'moment')}
                                        onComplete={(id) => updateEvent(id, { status: 'completed' })}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                                    나의 모먼트가 없습니다.
                                </div>
                            )}
                        </div>
                    ) : (
                        <MomentTableView
                            items={upcomingMoments}
                            getCreator={() => creatorProfile}
                            brandProposals={brandProposals}
                            onClick={(m) => handleOpenDetails(m, 'moment')}
                        />
                    )}
                </TabsContent>

                {/* ─── 완료된 모먼트 Tab ──────────────────────────────── */}
                <TabsContent value="past" className="space-y-4">
                    {viewMode === 'grid' ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {pastMoments.length > 0 ? (
                                pastMoments.map((moment: any) => (
                                    <MomentGridCard
                                        key={moment.id}
                                        item={moment}
                                        creator={creatorProfile}
                                        isPast={true}
                                        onClick={(m) => handleOpenDetails(m, 'moment')}
                                        onDelete={deleteEvent}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                                    완료된 모먼트가 없습니다.
                                </div>
                            )}
                        </div>
                    ) : (
                        <MomentTableView
                            items={pastMoments}
                            getCreator={() => creatorProfile}
                            isPast={true}
                            onClick={(m) => handleOpenDetails(m, 'moment')}
                            onDelete={deleteEvent}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
})
