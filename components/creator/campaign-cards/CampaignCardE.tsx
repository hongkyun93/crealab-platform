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
            case 'instagram': return <span className="text-pink-600 bg-pink-50 p-1 rounded-full text-xs">📸</span>
            case 'youtube': return <span className="text-red-600 bg-red-50 p-1 rounded-full text-xs">▶️</span>
            case 'tiktok': return <span className="text-black bg-gray-100 p-1 rounded-full text-xs">🎵</span>
            case 'blog': return <span className="text-green-600 bg-green-50 p-1 rounded-full text-xs">📝</span>
            case 'shorts': return <span className="text-red-600 bg-red-50 p-1 rounded-full text-xs">⚡</span>
            case 'reels': return <span className="text-pink-600 bg-pink-50 p-1 rounded-full text-xs">🎞️</span>
            default: return <span className="bg-muted p-1 rounded-full text-xs">{ch}</span>
        }
    }

    return (
        <Card
            className="group flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 hover:shadow-lg transition-all cursor-pointer border-border/60 hover:border-primary/50 relative overflow-hidden"
            onClick={onClick}
        >
            {/* D-Day Badge (Mobile Overlay) */}
            {c.recruitment_deadline && (
                <div className="absolute top-0 right-0 sm:hidden">
                    <Badge variant="secondary" className="rounded-none rounded-bl-lg bg-red-50 text-red-600 border-0 dark:bg-red-900/20 dark:text-red-400 font-bold">
                        D-{Math.ceil((new Date(c.recruitment_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </Badge>
                </div>
            )}

            {/* Thumbnail */}
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg bg-muted shrink-0 overflow-hidden relative border border-border/50">
                {(c.image && c.image !== "📦") || c.product_image_url ? (
                    <img src={c.image && c.image !== "📦" ? c.image : c.product_image_url} alt={c.product} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 grid sm:grid-cols-[2fr_1.2fr_auto] gap-4 w-full">

                {/* Main Info */}
                <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-bold text-primary">{c.brand}</span>
                        <span>|</span>
                        <span>{c.category}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold truncate group-hover:text-primary transition-colors leading-tight">
                        {c.title || c.product}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {c.tags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Details (Visible on all screens now) */}
                <div className="flex flex-row sm:flex-col gap-3 sm:gap-1 text-sm border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-muted-foreground text-xs w-12 shrink-0">제공 혜택</span>
                        <span className="font-bold text-emerald-600 truncate">{c.budget || "협의"}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-muted-foreground text-xs w-12 shrink-0">모집 인원</span>
                        <span className="font-medium">{c.recruitment_count ? `${c.recruitment_count}명` : '-'}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-2 sm:hidden">
                        <span className="text-muted-foreground text-xs w-12 shrink-0">채널</span>
                        <div className="flex -space-x-1">
                            {c.channels?.map((channel: string) => (
                                <span key={channel} title={channel}>{renderChannelIcon(channel)}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action & Meta (Desktop) */}
                <div className="hidden sm:flex flex-col items-end gap-2 pl-4 border-l border-border/50">
                    {c.recruitment_deadline && (
                        <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 font-bold whitespace-nowrap">
                            D-{Math.ceil((new Date(c.recruitment_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                        </Badge>
                    )}
                    <div className="flex gap-1 mb-2">
                        {c.channels?.slice(0, 3).map((channel: string) => (
                            <div key={channel} title={channel}>{renderChannelIcon(channel)}</div>
                        ))}
                    </div>
                    <Button size="sm" className="w-full text-xs font-bold shadow-sm" onClick={onApply}>
                        지원하기 <Send className="ml-1.5 h-3 w-3" />
                    </Button>
                </div>

                {/* Mobile Action Button */}
                <Button size="sm" className="w-full sm:hidden mt-2 font-bold" onClick={onApply}>
                    지원하기 <Send className="ml-1.5 h-3 w-3" />
                </Button>
            </div>
        </Card>
    )
}
