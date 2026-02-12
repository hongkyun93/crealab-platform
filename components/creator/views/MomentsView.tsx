import React, { useMemo } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MomentCard } from "@/components/creator/MomentCard"

interface MomentsViewProps {
    activeMoments: any[]
    myMoments: any[]
    pastMoments: any[]
    upcomingMoments: any[]
    brandProposals: any[]
    setCurrentView: (view: string) => void
    handleOpenDetails: (moment: any, type: string) => void
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
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="gap-2">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    돌아가기
                </Button>
                <h1 className="text-2xl font-bold">내 모먼트 아카이브</h1>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="w-full md:w-auto grid grid-cols-2">
                    <TabsTrigger value="upcoming">나의 모먼트 ({activeMoments.length + myMoments.length})</TabsTrigger>
                    <TabsTrigger value="past">완료된 모먼트 ({pastMoments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingMoments.length > 0 ? (
                            upcomingMoments.map((moment: any) => (
                                <MomentCard
                                    key={moment.id}
                                    moment={moment}
                                    brandProposals={brandProposals}
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
                </TabsContent>

                <TabsContent value="past" className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pastMoments.length > 0 ? (
                            pastMoments.map((moment: any) => (
                                <MomentCard
                                    key={moment.id}
                                    moment={moment}
                                    onClick={(m) => handleOpenDetails(m, 'moment')}
                                    onDelete={deleteEvent}
                                    isPast={true}
                                />
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
