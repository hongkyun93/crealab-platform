import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"
import {
    Banknote, Calendar,
    Gift, Lock, MoreVertical, Send, Trash2
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface MomentCardProps {
    moment: any
    productApplications?: any[]
    onClick: (moment: any) => void
    onDelete?: (id: string) => void
    onComplete?: (id: string) => void
    isPast?: boolean
}

export function MomentCard({
    moment,
    productApplications = [],
    onClick,
    onDelete,
    onComplete,
    isPast = false
}: MomentCardProps) {
    const offerCount = productApplications.filter((p: any) =>
        p.moment_id === moment.id &&
        (p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending') &&
        p.status !== 'cancelled'
    ).length;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)

    const CHANNEL_LABELS: Record<string, string> = {
        instagram_reels: '🎞️ 릴스', instagram_feed: '📷 피드', instagram_story: '⭕ 스토리',
        youtube_longform: '▶️ 롱폼', youtube_shorts: '⚡ 숏츠',
    }
    const CHANNEL_BG: Record<string, string> = {
        instagram: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600',
        youtube: 'bg-gradient-to-r from-red-600 to-red-700',
        tiktok: 'bg-gradient-to-r from-black to-slate-800',
        blog: 'bg-gradient-to-r from-green-500 to-green-600',
    }

    return (
        <>
            <Card
                className={`overflow-hidden transition-all border-border/60 bg-background flex flex-col h-full cursor-pointer relative group ${isPast
                    ? 'opacity-75 hover:opacity-100 hover:shadow-md'
                    : 'hover:shadow-lg'
                    }`}
                onClick={() => onClick(moment)}
            >
                {/* Top-right badges */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                    {isPast && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                            완료된 모먼트
                        </span>
                    )}
                    {moment.isPrivate && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-0.5">
                            <Lock className="h-2.5 w-2.5" /> 비공개
                        </span>
                    )}
                    {!isPast && offerCount > 0 && (
                        <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-white px-2.5 py-1 shadow-md"
                            style={{
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                clipPath: 'polygon(0 0, 100% 0, 100% 75%, 87% 100%, 0 100%)',
                                borderRadius: '4px 0 0 4px',
                                letterSpacing: '0.02em',
                            }}
                        >
                            📥 {offerCount}건
                        </span>
                    )}
                </div>

                <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <Badge variant="outline" className="text-muted-foreground bg-muted border-border shrink-0">
                                {moment.category || "카테고리"}
                            </Badge>
                            {isPast && onDelete && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> 기록 삭제
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                        {/* Tag next to category */}
                        {moment.tags && moment.tags.length > 0 && (
                            <span className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-muted-foreground">
                                {moment.tags.slice(0, 1).map((t: string) => (
                                    <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>
                                ))}
                            </span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-3 flex-1 relative">
                    <h3 className={`font-bold text-base line-clamp-2 h-14 mb-2 ${isPast ? 'text-muted-foreground' : ''}`}>
                        {moment.title}
                    </h3>

                    <div className={`flex flex-col gap-2 text-xs mb-3 bg-muted/30 p-3 rounded-lg border border-border/50 ${isPast ? 'opacity-80' : ''}`}>
                        <div className="pb-2 border-b border-border/50">
                            <span className="text-[10px] text-muted-foreground block mb-0.5">희망제품</span>
                            <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                <Gift className={`h-3.5 w-3.5 shrink-0 ${isPast ? 'text-muted-foreground' : 'text-purple-500'}`} />
                                <span className="truncate">{moment.targetProduct || "미정"}</span>
                            </div>
                        </div>
                        <div className="pb-2 border-b border-border/50">
                            <span className="text-[10px] text-muted-foreground block mb-0.5">예상단가</span>
                            <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                <Banknote className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                <span className="truncate">{formatPriceRange(moment.priceVideo)}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[10px] text-muted-foreground block mb-0.5">모먼트 일정</span>
                                <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="truncate">{formatDateToMonth(moment.momentStartDate) || "미정"}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground block mb-0.5">업로드 일정</span>
                                <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                    <Send className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    {moment.dateFlexible ? (
                                        <span className="text-emerald-600 truncate">협의 가능</span>
                                    ) : (
                                        <span className="truncate">{formatDateToMonth(moment.postingDateExact)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className={`text-sm text-foreground/70 line-clamp-2 h-12 leading-relaxed mb-3 ${isPast ? 'opacity-70' : ''}`}>
                        {moment.description || "상세 설명이 없습니다."}
                    </p>

                    {moment.guide && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-md p-2.5 mb-3">
                            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium mb-1">📝 제작 가이드</p>
                            <p className="text-xs text-amber-900/80 dark:text-amber-200/80 line-clamp-2 leading-relaxed h-8">
                                {moment.guide}
                            </p>
                        </div>
                    )}

                    {/* Preferred channels */}
                    {moment.channels && moment.channels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {moment.channels.map((ch: string) => {
                                const base = ch.split('_')[0]
                                return (
                                    <span key={ch} className={`text-[10px] font-medium text-white px-2 py-0.5 rounded-full shadow-sm ${CHANNEL_BG[base] || 'bg-slate-600'}`}>
                                        {CHANNEL_LABELS[ch] || ch}
                                    </span>
                                )
                            })}
                        </div>
                    )}

                    {/* Complete button for active moments */}
                    {!isPast && onComplete && (
                        <div className="flex justify-end pt-2 border-t border-border/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsCompleteDialogOpen(true)
                                }}
                            >
                                <span className="mr-1">🎉</span> 완료하기
                            </Button>
                        </div>
                    )}
                </CardContent>

            </Card>

            {/* DELETE ALERT DIALOG */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>정말로 이 기록을 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 삭제된 모먼트는 복구할 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.stopPropagation()
                                try {
                                    if (onDelete) await onDelete(moment.id)
                                    toast.success('모먼트가 삭제되었습니다.')
                                } catch (error: any) {
                                    toast.error(error?.message || '모먼트 삭제에 실패했습니다.')
                                }
                                setIsDeleteDialogOpen(false)
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            삭제하기
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* COMPLETE ALERT DIALOG */}
            <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>이 모먼트를 완료하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            완료된 모먼트는 '완료된 모먼트' 탭으로 이동하며, 더 이상 새로운 제안을 받을 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.stopPropagation()
                                if (onComplete) onComplete(moment.id)
                                setIsCompleteDialogOpen(false)
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            완료 처리
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
