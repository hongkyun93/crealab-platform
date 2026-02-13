import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Campaign } from "@/lib/types/campaign"
import { formatDateToMonth } from "@/lib/utils"

interface CampaignListRowProps {
    campaign: Campaign
    onClick: () => void
    onApply: (e: React.MouseEvent) => void
}

export function CampaignListRow({ campaign: c, onClick, onApply }: CampaignListRowProps) {
    const today = new Date()
    const dDay = c.recruitment_deadline ? Math.ceil((new Date(c.recruitment_deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null

    return (
        <div
            className="group flex items-center p-3 gap-4 border rounded-lg bg-card hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer relative"
            onClick={onClick}
        >
            {/* Thumbnail */}
            <div className="h-16 w-16 rounded-md bg-muted shrink-0 overflow-hidden relative border border-border/50">
                {(c.image && c.image !== "📦") || c.product_image_url ? (
                    <img src={c.image && c.image !== "📦" ? c.image : c.product_image_url} alt={c.product} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                )}
                <div className="absolute top-0 left-0 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded-br">
                    {c.category?.split(',')[0]}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center">

                {/* 1. Title & Brand */}
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${c.status === 'active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-muted-foreground bg-muted border-border'}`}>
                            {c.status === 'active' ? '모집중' : '마감'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">{c.brand}</span>
                    </div>
                    <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                        {c.title || c.product}
                    </h3>
                </div>

                {/* 2. Budget & Recruitment (Hidden on mobile) */}
                <div className="hidden md:block min-w-0 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs w-10 shrink-0">제공혜택</span>
                        <span className="font-bold text-emerald-600 truncate">{c.budget || "협의"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-muted-foreground text-xs w-10 shrink-0">모집인원</span>
                        <span className="truncate">{c.recruitment_count ? `${c.recruitment_count}명` : '-'}</span>
                    </div>
                </div>

                {/* 3. Date & Channel (Hidden on mobile) */}
                <div className="hidden md:block min-w-0 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-10 shrink-0">선정발표</span>
                        <span className="truncate">{c.selection_announcement_date || '-'}</span>
                    </div>
                    <div className="flex gap-1">
                        {c.channels?.slice(0, 3).map((ch) => (
                            <span key={ch} className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase">{ch}</span>
                        ))}
                    </div>
                </div>

                {/* 4. Action & D-Day */}
                <div className="flex items-center justify-end gap-3 md:pl-4 md:border-l shrink-0">
                    {dDay !== null && (
                        <Badge variant="outline" className={`whitespace-nowrap ${dDay < 0 ? 'bg-muted text-muted-foreground border-transparent' : dDay <= 3 ? 'text-red-600 bg-red-50 border-red-100' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                            {dDay < 0 ? '마감' : `D-${dDay}`}
                        </Badge>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground group-hover:text-primary" onClick={onApply}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
