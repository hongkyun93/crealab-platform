import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Trash2, Calendar, Gift, Lock, Send, Banknote } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"
import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MomentListRowProps {
    moment: any
    brandProposals?: any[]
    onClick: (moment: any) => void
    onDelete?: (id: string) => void
    onComplete?: (id: string) => void
    isPast?: boolean
}

export function MomentListRow({
    moment,
    brandProposals = [],
    onClick,
    onDelete,
    onComplete,
    isPast = false
}: MomentListRowProps) {
    const offerCount = brandProposals.filter((p: any) => p.event_id === moment.id && (p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending')).length;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)

    return (
        <>
            <div
                className={`flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer group ${isPast ? 'opacity-75 grayscale' : 'hover:border-emerald-500'}`}
                onClick={() => onClick(moment)}
            >
                {/* Status / Icon */}
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isPast ? 'bg-muted text-muted-foreground' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
                    {moment.category === '뷰티' ? '💄' :
                        moment.category === '맛집' ? '🍽️' :
                            moment.category === '여행' ? '✈️' :
                                '📅'}
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Title & Tags - Spans 5 cols */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">{moment.category}</Badge>
                            {moment.isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
                            {offerCount > 0 && !isPast && (
                                <Badge className="h-5 px-1.5 bg-indigo-600 hover:bg-indigo-700 text-[10px]">
                                    📥 {offerCount}
                                </Badge>
                            )}
                        </div>
                        <h3 className={`font-bold truncate ${isPast ? 'line-through text-muted-foreground' : 'group-hover:text-emerald-600'}`}>
                            {moment.title || moment.event}
                        </h3>
                    </div>

                    {/* Target Product - Spans 3 cols */}
                    <div className="hidden md:block md:col-span-3">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-foreground/80">
                                <Gift className="h-4 w-4 text-purple-500 shrink-0" />
                                <span className="truncate">{moment.targetProduct || "-"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600">
                                <Banknote className="h-3.5 w-3.5 shrink-0" />
                                <span>{formatPriceRange(moment.priceVideo || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Dates - Spans 4 cols */}
                    <div className="hidden md:flex md:col-span-4 gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDateToMonth(moment.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Send className="h-3.5 w-3.5" />
                            <span>
                                {moment.dateFlexible ? <span className="text-emerald-600">협의</span> :
                                    (moment.postingDate ? formatDateToMonth(moment.postingDate) : "-")}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {!isPast && onComplete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsCompleteDialogOpen(true)
                            }}
                        >
                            <span className="text-lg">🎉</span>
                        </Button>
                    )}
                    {onDelete && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setIsDeleteDialogOpen(true)
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> 삭제
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>

            {/* DELETE ALERT DIALOG */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.stopPropagation()
                                if (onDelete) onDelete(moment.id)
                                setIsDeleteDialogOpen(false)
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            삭제
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* COMPLETE ALERT DIALOG */}
            <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>완료 체크하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            모먼트를 완료 상태로 변경합니다.
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
                            확인
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
