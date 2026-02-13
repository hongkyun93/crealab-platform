import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    MoreVertical,
    Calendar,
    Clock,
    MapPin,
    Gift,
    Trash2,
    Send,
    Lock,
    Banknote
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"

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
                ? 'opacity-75 hover:opacity-100 border-l-slate-300 dark:border-l-slate-600'
                : 'hover:shadow-lg border-l-emerald-500'
                }`}
            onClick={() => onClick(moment)}
        >
            <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            {/* Category Badge */}
                            <Badge variant="outline" className="text-muted-foreground bg-muted border-border">
                                {moment.category || "카테고리"}
                            </Badge>

                            {isPast && <Badge variant="secondary" className="text-muted-foreground">종료됨</Badge>}

                            {moment.isPrivate && (
                                <Badge variant="secondary" className="gap-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    <Lock className="h-3 w-3" /> 비공개
                                </Badge>
                            )}

                            {!isPast && offerCount > 0 && (
                                <Badge className="bg-indigo-600 hover:bg-indigo-700 animate-pulse border-0">
                                    📥 {offerCount}개의 제안
                                </Badge>
                            )}
                        </div>
                        <h3 className={`font-bold text-lg line-clamp-2 h-[3.5rem] leading-tight flex items-center ${isPast
                            ? 'text-muted-foreground line-through decoration-slate-300 dark:decoration-slate-600'
                            : 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-foreground'
                            }`}>
                            {moment.title || moment.event}
                        </h3>

                        {/* Tags */}
                        {moment.tags && moment.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
                                {moment.tags.slice(0, 3).map((tag: string, idx: number) => (
                                    <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground ${isPast ? 'opacity-60' : ''}`}>
                                        #{tag}
                                    </span>
                                ))}
                                {moment.tags.length > 3 && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground/70 ${isPast ? 'opacity-60' : ''}`}>
                                        +{moment.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {isPast && onDelete && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
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

                <div className={`grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border border-border/50 ${isPast ? 'grayscale opacity-80' : ''}`}>
                    <div className="col-span-2 pb-2 border-b border-border/50 mb-1">
                        <span className="text-[10px] text-muted-foreground block mb-0.5">희망 제품</span>
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Gift className={`h-3.5 w-3.5 ${isPast ? 'text-muted-foreground' : 'text-purple-500'}`} />
                            <span className="truncate">{moment.targetProduct || "미정"}</span>
                        </div>
                    </div>
                    <div className="col-span-2 pb-2 border-b border-border/50 mb-1">
                        <span className="text-[10px] text-muted-foreground block mb-0.5">예상 단가</span>
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Banknote className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-bold text-blue-600">{formatPriceRange(moment.priceVideo || 0)}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-muted-foreground block mb-0.5">일정</span>
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDateToMonth(moment.eventDate) || "미정"}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-muted-foreground block mb-0.5">업로드</span>
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Send className="h-3.5 w-3.5 text-muted-foreground" />
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

                <div className="min-h-[3rem]">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {moment.description || "상세 설명이 없습니다."}
                    </p>
                </div>

                {!isPast && onComplete && (
                    <div className="flex justify-end pt-2 border-t border-border/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400"
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
