import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Send, ChevronRight } from "lucide-react"

import { Campaign } from "@/lib/types/campaign"



interface CampaignCardEProps {
    campaign: Campaign
    onClick: () => void
    onApply: (e: React.MouseEvent) => void
}

export function CampaignCardE({ campaign: c, onClick, onApply }: CampaignCardEProps) {
    // Helper for channels
    const renderChannelIcon = (ch: string) => {
        switch (ch) {
            case 'instagram': return '📸'
            case 'youtube': return '▶️'
            case 'tiktok': return '🎵'
            case 'blog': return '📝'
            case 'shorts': return '⚡'
            case 'reels': return '🎞️'
            default: return ch
        }
    }

    return (
        <Card
            className="group flex items-center p-3 gap-4 hover:shadow-md transition-all cursor-pointer border-border/60 hover:border-primary/50 md:col-span-2 xl:col-span-3"
            onClick={onClick}
        >
            {/* Thumbnail */}
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-md bg-muted shrink-0 overflow-hidden relative">
                {(c.image && c.image !== "📦") || c.product_image_url ? (
                    <img src={c.image && c.image !== "📦" ? c.image : c.product_image_url} alt={c.product} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 grid md:grid-cols-[2fr_1fr_1fr] gap-4 items-center">

                {/* Main Info */}
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] h-5 px-1 bg-muted/50 border-0 shrink-0">{c.category}</Badge>
                        <div className="flex gap-1 min-w-0">
                            {c.channels?.slice(0, 3).map((channel: string) => (
                                <span key={channel} className="text-xs shrink-0" title={channel}>{renderChannelIcon(channel)}</span>
                            ))}
                        </div>
                    </div>
                    <h3 className="text-sm md:text-base font-bold truncate group-hover:text-primary transition-colors">
                        {c.title || c.product}
                    </h3>
                    <div className="text-xs text-muted-foreground truncate">{c.brand} | {c.product}</div>
                </div>

                {/* Details (Hidden on small mobile) */}
                <div className="hidden md:flex flex-col gap-1 text-xs">
                    <div className="flex justify-between w-full max-w-[150px]">
                        <span className="text-muted-foreground">제공</span>
                        <span className="font-bold text-emerald-600">{c.budget || "협의"}</span>
                    </div>
                    <div className="flex justify-between w-full max-w-[150px]">
                        <span className="text-muted-foreground">모집</span>
                        <span className="font-medium">{c.recruitment_count ? `${c.recruitment_count}명` : '-'}</span>
                    </div>
                </div>

                {/* Action & D-Day */}
                <div className="flex items-center justify-end gap-3">
                    {c.recruitment_deadline && (
                        <div className="text-right">
                            <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400">
                                D-{Math.ceil((new Date(c.recruitment_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                            </Badge>
                        </div>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary" onClick={onApply}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
