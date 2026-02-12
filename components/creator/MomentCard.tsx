import React from "react"
import { Calendar, Gift, Send, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDateToMonth } from "@/lib/utils"

interface MomentCardProps {
    moment: any
    brandProposals?: any[]
    onClick: (moment: any) => void
    onDelete?: (id: string) => void
    onComplete?: (id: string) => void
    isPast?: boolean
}

export function MomentCard({
    moment,
    brandProposals = [],
    onClick,
    onDelete,
    onComplete,
    isPast = false
}: MomentCardProps) {
    const offerCount = brandProposals.filter((p: any) => p.event_id === moment.id && (p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending')).length;

    return (
        <Card
            className={`cursor-pointer transition-all border-l-4 group ${isPast
                    ? 'opacity-75 hover:opacity-100 border-l-slate-300'
                    : 'hover:shadow-lg border-l-emerald-500'
                }`}
            onClick={() => onClick(moment)}
        >
            <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            {isPast && <Badge variant="secondary" className="text-slate-500">종료됨</Badge>}
                            {!isPast && offerCount > 0 && (
                                <Badge className="bg-indigo-600 hover:bg-indigo-700 animate-pulse">
                                    📥 {offerCount}개의 제안 도착
                                </Badge>
                            )}
                        </div>
                        <h3 className={`font-bold text-lg line-clamp-2 h-14 ${isPast
                                ? 'text-slate-600 line-through decoration-slate-300 decoration-2'
                                : 'group-hover:text-emerald-600 transition-colors'
                            }`}>
                            {moment.event || moment.title}
                        </h3>

                        {/* Tags */}
                        {moment.tags && moment.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {moment.tags.slice(0, 3).map((tag: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className={`text-xs px-2 py-0.5 ${isPast ? 'opacity-60' : ''}`}>
                                        {tag}
                                    </Badge>
                                ))}
                                {moment.tags.length > 3 && (
                                    <Badge variant="secondary" className={`text-xs px-2 py-0.5 text-muted-foreground ${isPast ? 'opacity-60' : ''}`}>
                                        +{moment.tags.length - 3}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    {isPast && onDelete && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm("정말로 이 기록을 삭제하시겠습니까? (되돌릴 수 없습니다)")) {
                                        onDelete(moment.id)
                                    }
                                }}>
                                    <Trash2 className="mr-2 h-4 w-4" /> 기록 삭제
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Key Info Grid */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 ${isPast ? 'grayscale opacity-80' : ''}`}>
                    <div className="col-span-full pb-2 border-b border-slate-200 flex justify-between items-start">
                        <div>
                            <span className="text-xs text-muted-foreground block mb-0.5">광고 가능 아이템</span>
                            <span className="font-medium text-slate-800 flex items-center gap-1.5">
                                <Gift className={`h-3.5 w-3.5 ${isPast ? 'text-slate-400' : 'text-purple-500'}`} />
                                {moment.targetProduct || "미정"}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-muted-foreground block mb-0.5">등록일</span>
                            <span className="text-xs font-medium text-slate-500">
                                {moment.createdAt ? new Date(moment.createdAt).toLocaleDateString() : "-"}
                            </span>
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block mb-0.5">모먼트 일정</span>
                        <span className="font-medium text-slate-700 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {moment.eventDate ? formatDateToMonth(moment.eventDate) : "-"}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block mb-0.5">콘텐츠 업로드</span>
                        <span className="font-medium text-slate-700 flex items-center gap-1.5">
                            <Send className="h-3.5 w-3.5 text-slate-400" />
                            {moment.dateFlexible ? (
                                <span className="text-emerald-600">협의 가능</span>
                            ) : (
                                moment.postingDate ? formatDateToMonth(moment.postingDate) : "-"
                            )}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed h-12">
                        {moment.description || "상세 설명이 없습니다."}
                    </p>
                </div>

                {/* Guide Preview */}
                {moment.guide && (
                    <div className={`border rounded-md p-2.5 ${isPast
                            ? 'bg-slate-100 border-slate-200 opacity-60'
                            : 'bg-amber-50 border-amber-100'
                        }`}>
                        <p className={`text-xs font-medium mb-1 ${isPast ? 'text-slate-700' : 'text-amber-800'}`}>📝 제작 가이드</p>
                        <p className={`text-xs line-clamp-2 leading-relaxed ${isPast ? 'text-slate-600' : 'text-amber-700'}`}>
                            {moment.guide}
                        </p>
                    </div>
                )}
            </CardContent>

            {!isPast && onComplete && (
                <div className="px-5 pb-5 flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("이 모먼트를 완료 처리하시겠습니까?\n완료된 모먼트는 '완료된 모먼트' 탭으로 이동합니다.")) {
                                onComplete(moment.id);
                            }
                        }}
                    >
                        완료하기
                    </Button>
                </div>
            )}
        </Card>
    )
}
