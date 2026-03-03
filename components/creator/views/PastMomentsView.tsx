import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Calendar, Send, Gift, Banknote } from "lucide-react"
import { formatPriceRange } from "@/lib/utils"

interface PastMomentsViewProps {
    pastMoments: any[]
    setCurrentView: (view: string) => void
    updateMoment: (id: string, updates: any) => void
    displayUser: any
}

export function PastMomentsView({ pastMoments, setCurrentView, updateMoment, displayUser }: PastMomentsViewProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')}>
                    <ChevronRight className="h-4 w-4 rotate-180" /> 돌아가기
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">완료된 모먼트</h1>
            </div>
            <div className="grid gap-4">
                {pastMoments.length === 0 ? (
                    <div className="text-center py-10 border rounded-lg border-dashed text-muted-foreground">
                        완료된 모먼트가 없습니다.
                    </div>
                ) : pastMoments.map((moment) => (
                    <Card key={moment.id} className="opacity-75">
                        <CardHeader>
                            <CardTitle className="text-lg">{moment.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                    <span className="font-medium">일정:</span> {moment.momentDate || "미정"}
                                </div>
                                {moment.postingDate && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Send className="h-3.5 w-3.5 text-primary" />
                                        <span className="font-medium">업로드:</span>
                                        {moment.dateFlexible ? (
                                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 text-emerald-600 bg-emerald-50 border-emerald-100">협의가능</Badge>
                                        ) : (
                                            moment.postingDate
                                        )}
                                    </div>
                                )}
                                <div className="flex flex-col gap-2 text-xs bg-muted/30 p-3 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-2">
                                        <Gift className="h-3.5 w-3.5 text-purple-500" />
                                        <span className="text-muted-foreground shrink-0">희망 제품:</span>
                                        <span className="font-medium truncate">{moment.targetProduct || "미정"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                        <Banknote className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-muted-foreground shrink-0">예상 단가:</span>
                                        <span className="font-bold text-blue-600">{formatPriceRange(displayUser?.priceVideo || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-0 pb-4 pr-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("모먼트를 다시 진행하시겠습니까? '내 모먼트' 탭으로 이동합니다.")) {
                                        updateMoment(moment.id, { status: "active" });
                                    }
                                }}
                            >
                                진행하기
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
