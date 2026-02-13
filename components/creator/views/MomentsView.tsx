import React, { useMemo } from "react"
import { ChevronRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MomentCard } from "@/components/creator/MomentCard"
import { MomentListRow } from "@/components/creator/MomentListRow"
import { MomentGalleryCard } from "@/components/creator/MomentGalleryCard"
import { MomentCompactRow } from "@/components/creator/MomentCompactRow"
import { LayoutGrid, List, Image as ImageIcon, LayoutList, AlignJustify } from "lucide-react"

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
    updateEvent
}: MomentsViewProps) {
    // View Mode State
    const [viewMode, setViewMode] = React.useState<'grid' | 'list' | 'gallery'>('grid')
    const [archiveViewMode, setArchiveViewMode] = React.useState<'detail' | 'compact'>('detail')

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
                            내 모먼트들은 다른 크리에이터에겐 보이지 않고,<br />
                            엄선된 브랜드 계정들에게만 보여집니다.
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
                </div>

                <TabsContent value="upcoming" className="space-y-4">
                    <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('list')}
                                title="리스트형"
                            >
                                <List className="h-4 w-4" />
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
                            <Button
                                variant={viewMode === 'gallery' ? 'default' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('gallery')}
                                title="갤러리형"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : viewMode === 'gallery' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        {upcomingMoments.length > 0 ? (
                            upcomingMoments.map((moment: any) => (
                                <React.Fragment key={moment.id}>
                                    {viewMode === 'grid' && (
                                        <MomentCard
                                            moment={moment}
                                            brandProposals={brandProposals}
                                            onClick={(m) => handleOpenDetails(m, 'moment')}
                                            onComplete={(id) => updateEvent(id, { status: 'completed' })}
                                        />
                                    )}
                                    {viewMode === 'list' && (
                                        <MomentListRow
                                            moment={moment}
                                            brandProposals={brandProposals}
                                            onClick={(m) => handleOpenDetails(m, 'moment')}
                                            onComplete={(id) => updateEvent(id, { status: 'completed' })}
                                        />
                                    )}
                                    {viewMode === 'gallery' && (
                                        <MomentGalleryCard
                                            moment={moment}
                                            brandProposals={brandProposals}
                                            onClick={(m) => handleOpenDetails(m, 'moment')}
                                            onComplete={(id) => updateEvent(id, { status: 'completed' })}
                                        />
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                                나의 모먼트가 없습니다.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                    <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                            <Button
                                variant={archiveViewMode === 'detail' ? 'default' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setArchiveViewMode('detail')}
                                title="상세 보기"
                            >
                                <LayoutList className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={archiveViewMode === 'compact' ? 'default' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setArchiveViewMode('compact')}
                                title="컴팩트 보기"
                            >
                                <AlignJustify className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className={`grid gap-4 ${archiveViewMode === 'compact' ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        {pastMoments.length > 0 ? (
                            pastMoments.map((moment: any) => (
                                <React.Fragment key={moment.id}>
                                    {archiveViewMode === 'detail' && (
                                        <MomentCard
                                            moment={moment}
                                            onClick={(m) => handleOpenDetails(m, 'moment')}
                                            onDelete={deleteEvent}
                                            isPast={true}
                                        />
                                    )}
                                    {archiveViewMode === 'compact' && (
                                        <MomentCompactRow
                                            moment={moment}
                                            onClick={() => handleOpenDetails(moment, 'moment')}
                                            onDelete={deleteEvent}
                                            isPast={true}
                                        />
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                                완료된 모먼트가 없습니다.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
})
