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
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"
import { MoreVertical, Trash2 } from "lucide-react"
import { useState } from "react"

interface MomentGalleryCardProps {
    moment: any
    brandProposals?: any[]
    onClick: (moment: any) => void
    onDelete?: (id: string) => void
    onComplete?: (id: string) => void
    isPast?: boolean
}

export function MomentGalleryCard({
    moment,
    brandProposals = [],
    onClick,
    onDelete,
    onComplete,
    isPast = false
}: MomentGalleryCardProps) {
    const offerCount = brandProposals.filter((p: any) => p.moment_id === moment.id && (p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending')).length;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)

    // Determine background pattern/color based on category
    const getBgClass = (cat: string) => {
        if (cat === '뷰티') return 'bg-pink-50 dark:bg-pink-900/10'
        if (cat === '맛집') return 'bg-orange-50 dark:bg-orange-900/10'
        if (cat === '여행') return 'bg-sky-50 dark:bg-sky-900/10'
        return 'bg-slate-50 dark:bg-slate-900/10'
    }

    return (
        <>
            <Card
                className={`group cursor-pointer hover:shadow-xl transition-all border-none shadow-md overflow-hidden flex flex-col h-full bg-card ${isPast ? 'opacity-80' : ''}`}
                onClick={() => onClick(moment)}
            >
                {/* Visual Header */}
                <div className={`h-32 ${getBgClass(moment.category)} relative flex flex-col justify-between p-4`}>
                    <div className="flex justify-between items-start">
                        <Badge className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background">
                            {moment.category}
                        </Badge>
                        {onDelete && (
                            <div onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 hover:bg-background rounded-full">
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
                    <div>
                        <h3 className={`text-xl font-bold line-clamp-2 ${isPast ? 'line-through opacity-60' : 'group-hover:underline'}`}>
                            {moment.title}
                        </h3>
                    </div>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col gap-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] border-b pb-4">
                        <div className="space-y-1">
                            <div className="text-muted-foreground">희망제품</div>
                            <div className="font-bold truncate text-[11px]">{moment.targetProduct}</div>
                        </div>
                        <div className="space-y-1 border-l">
                            <div className="text-muted-foreground">일정</div>
                            <div className="font-bold text-[11px]">{formatDateToMonth(moment.momentStartDate)}</div>
                        </div>
                        <div className="space-y-1 pt-2 border-t flex flex-col items-center">
                            <div className="text-muted-foreground">예상단가</div>
                            <div className="font-extrabold text-blue-600 text-[11px]">{formatPriceRange(moment.priceVideo || 0)}</div>
                        </div>
                        <div className="space-y-1 pt-2 border-t border-l flex flex-col items-center">
                            <div className="text-muted-foreground">제안 대기</div>
                            <div className="font-bold text-indigo-600 text-[11px]">{offerCount}건</div>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground flex-1 line-clamp-4 leading-relaxed">
                        {moment.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                        {moment.tags?.slice(0, 5).map((t: string) => (
                            <span key={t} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">#{t}</span>
                        ))}
                    </div>

                    {/* Footer Action */}
                    {!isPast && onComplete && (
                        <Button
                            variant="outline"
                            className="w-full mt-2 hover:bg-emerald-50 hover:text-emerald-600 border-dashed"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsCompleteDialogOpen(true)
                            }}
                        >
                            완료하기
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* DELETE ALERT DIALOG */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 삭제된 모먼트는 영구적으로 제거됩니다.
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
                        <AlertDialogTitle>모먼트를 완료하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            완료 처리된 모먼트는 '완료됨' 상태로 변경되며, 리스트에서 숨겨질 수 있습니다.
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
                            완료
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
