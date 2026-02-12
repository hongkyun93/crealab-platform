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
            className={`cursor-pointer transition-all hover:shadow-lg border-border/60 bg-background flex flex-col h-full relative group duration-200 overflow-visible ${isPast ? 'opacity-75 grayscale' : ''}`}
            onClick={() => onClick(moment)}
        >
            {/* Post-it Style Proposal Count */}
            {!isPast && offerCount > 0 && (
                <div className="absolute -top-3 -right-3 z-20 transform rotate-6 transition-transform group-hover:rotate-12 duration-300">
                    <div className="bg-[#fff740] hover:bg-[#fffa70] text-slate-900 shadow-[2px_3px_5px_rgba(0,0,0,0.15)] border border-yellow-200/50 p-1 w-[68px] h-[68px] flex flex-col items-center justify-center rounded-sm mask-image-paper">
                        <div className="w-full h-2 bg-black/5 absolute top-0 left-0"></div>
                        <span className="text-[9px] font-bold text-slate-500 tracking-wider mb-0.5">PROPOSAL</span>
                        <span className="text-3xl font-black leading-none font-sans">{offerCount}</span>
                    </div>
                </div>
            )}

            <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">
                        {moment.category || "카테고리"}
                    </Badge>

                    {isPast && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                            종료됨
                        </Badge>
                    )}

                    {/* Action Menu for Past Items */}
                    {isPast && onDelete && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground hover:text-foreground">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => {
                                        if (confirm("정말로 이 기록을 삭제하시겠습니까? (되돌릴 수 없습니다)")) {
                                            onDelete(moment.id)
                                        }
                                    }}>
                                        <Trash2 className="mr-2 h-4 w-4" /> 기록 삭제
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <h3 className={`font-bold text-lg line-clamp-2 leading-tight ${isPast ? 'text-slate-500 line-through' : 'text-slate-900 group-hover:text-primary transition-colors'}`}>
                        {moment.title || moment.event}
                    </h3>
                </div>

                <div className="flex flex-col gap-2 text-xs mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="pb-2 border-b border-slate-200/60">
                        <span className="text-[10px] text-muted-foreground block mb-1">희망 제품</span>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Gift className={`h-3.5 w-3.5 ${isPast ? 'text-slate-400' : 'text-purple-500'} shrink-0`} />
                            <span className="truncate">{moment.targetProduct || "미정"}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div>
                            <span className="text-[10px] text-muted-foreground block mb-1">일정</span>
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>{formatDateToMonth(moment.eventDate) || "미정"}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-muted-foreground block mb-1">업로드</span>
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                <Send className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>
                                    {moment.dateFlexible ? (
                                        <span className="text-emerald-600">협의가능</span>
                                    ) : (
                                        moment.postingDate ? formatDateToMonth(moment.postingDate) : "미정"
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
                        {moment.description || "상세 설명이 없습니다."}
                    </p>
                </div>

                <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-50/50">
                    {moment.tags?.slice(0, 3).map((tag: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                            #{tag}
                        </span>
                    ))}
                    {(moment.tags?.length || 0) > 3 && (
                        <span className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full text-slate-400">
                            +{moment.tags.length - 3}
                        </span>
                    )}
                </div>

                {!isPast && onComplete && (
                    <div className="mt-4 pt-0 flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 hover:bg-emerald-50 hover:text-emerald-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("이 모먼트를 완료 처리하시겠습니까?")) {
                                    onComplete(moment.id);
                                }
                            }}
                        >
                            <span className="mr-1">🎉</span> 완료하기
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
