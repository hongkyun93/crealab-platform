import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Megaphone, Search, ChevronRight } from "lucide-react"

interface ApplicationListRowProps {
    app: any
    onClick: () => void
}

export function ApplicationListRow({ app, onClick }: ApplicationListRowProps) {
    return (
        <div
            className="group flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 hover:border-blue-500 transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Icon */}
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                    <Megaphone className="h-5 w-5" />
                </div>

                {/* Main Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-center">
                    <div className="min-w-0">
                        <div className="font-bold truncate">{app.campaignName || app.brand_name || "캠페인"}</div>
                        <div className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()} 지원</div>
                    </div>

                    <div className="hidden md:block min-w-0">
                        <div className="text-sm font-medium truncate">{app.productName || "제품 정보 없음"}</div>
                        <div className="text-xs text-muted-foreground">{app.cost ? `${app.cost.toLocaleString()}원` : '희망비용 미입력'}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">지원완료</Badge>
                    </div>
                </div>
            </div>

            {/* Action */}
            <div className="ml-4 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-blue-600">
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
