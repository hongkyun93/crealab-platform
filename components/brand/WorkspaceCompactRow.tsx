import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface WorkspaceCompactRowProps {
    item: any
    onClick: () => void
}

export function WorkspaceCompactRow({ item, onClick }: WorkspaceCompactRowProps) {
    const statusColors: Record<string, string> = {
        accepted: "bg-green-100 text-green-700 border-green-200",
        signed: "bg-blue-100 text-blue-700 border-blue-200",
        completed: "bg-gray-100 text-gray-700 border-gray-200",
        rejected: "bg-red-100 text-red-700 border-red-200",
        applied: "bg-amber-100 text-amber-700 border-amber-200",
        offered: "bg-purple-100 text-purple-700 border-purple-200",
    }

    const statusLabels: Record<string, string> = {
        accepted: "진행중",
        signed: "계약완료",
        completed: "완료됨",
        rejected: "거절됨",
        applied: "지원함",
        offered: "제안함",
        pending: "대기중"
    }

    return (
        <div
            className="group flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={onClick}
        >
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0 overflow-hidden border border-border/50">
                {item.influencerAvatar || item.influencer_avatar ? (
                    <img src={item.influencerAvatar || item.influencer_avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                    (item.influencer_name?.[0] || "C")
                )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="col-span-1">
                    <h4 className="font-semibold truncate text-sm">{item.influencer_name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</p>
                </div>

                <div className="col-span-2">
                    <p className="text-sm font-medium truncate">{item.product_name || "제품 협찬"}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">{item.message}</p>
                </div>

                <div className="col-span-1 flex justify-end md:justify-start">
                    <Badge variant="outline" className={cn("text-xs font-normal border", statusColors[item.status] || "bg-secondary text-secondary-foreground")}>
                        {statusLabels[item.status] || item.status}
                    </Badge>
                </div>
            </div>

            {/* Action */}
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}
