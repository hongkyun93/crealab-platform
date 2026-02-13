import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, MoreHorizontal, Banknote } from "lucide-react"
import { formatPriceRange, formatDateToMonth } from "@/lib/utils"

interface MomentCompactRowProps {
    moment: any
    onClick: () => void
    onDelete?: (id: string) => void
    isPast?: boolean
}

export function MomentCompactRow({ moment: m, onClick, onDelete, isPast }: MomentCompactRowProps) {
    return (
        <div
            className="group flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer text-sm"
            onClick={onClick}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Status Badge (Fixed Width) */}
                <div className="w-20 shrink-0">
                    <Badge variant={isPast ? "secondary" : "default"} className={`w-full justify-center ${isPast ? 'bg-muted text-muted-foreground' : 'bg-primary'}`}>
                        {isPast ? "완료됨" : "진행중"}
                    </Badge>
                </div>

                {/* Date */}
                <div className="w-24 shrink-0 text-muted-foreground text-xs text-center">
                    {formatDateToMonth(m.eventDate)}
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <div className="font-bold truncate text-foreground group-hover:text-primary transition-colors">
                        {m.title || m.event}
                    </div>
                    <div className="text-muted-foreground truncate text-xs flex items-center gap-1">
                        <span className="font-medium text-foreground">{m.brand || "브랜드 미정"}</span>
                        <span>•</span>
                        <span>{m.product || "제품 미정"}</span>
                    </div>
                    <div className="text-blue-600 font-bold text-xs flex items-center gap-1 md:justify-end">
                        <Banknote className="h-3 w-3" />
                        {formatPriceRange(m.priceVideo || 0)}
                    </div>
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-2 ml-4 shrink-0">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                    상세보기 <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}
