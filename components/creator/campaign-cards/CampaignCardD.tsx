import { Card, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link as LinkIcon, Send } from "lucide-react"
import { formatDateToMonth } from "@/lib/utils"

import { Campaign } from "@/lib/types/campaign"

interface CampaignCardDProps {
    campaign: Campaign
    onClick: () => void
    onApply: (e: React.MouseEvent) => void
}

export function CampaignCardD({ campaign: c, onClick, onApply }: CampaignCardDProps) {
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
            className={`group hover:shadow-md transition-all cursor-pointer border-border/60 overflow-hidden bg-card md:col-span-2 xl:col-span-3`}
            onClick={onClick}
        >
            <div className="flex flex-col md:flex-row h-full">
                {/* Image Section */}
                {(c.image && c.image !== "📦") || c.product_image_url ? (
                    <div className="w-full md:w-64 h-48 md:h-auto bg-muted/20 shrink-0 relative flex items-center justify-center overflow-hidden">
                        <img src={c.image && c.image !== "📦" ? c.image : c.product_image_url} alt={c.product} className={`w-full h-full object-cover transition-transform hover:scale-105 duration-500`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
                        <div className="absolute bottom-2 left-2 md:hidden">
                            <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm shadow-sm">
                                {c.category}
                            </Badge>
                        </div>
                    </div>
                ) : (
                    <div className="w-full md:w-64 h-48 md:h-auto bg-muted flex items-center justify-center shrink-0">
                        <span className="text-4xl">📦</span>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 p-4 md:p-5 flex flex-col justify-between min-w-0">
                    <div>
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <Badge variant="outline" className="hidden md:inline-flex text-xs font-normal bg-muted/50 shrink-0">{c.category}</Badge>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${c.status === 'active' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30' : 'text-muted-foreground bg-muted border-border'}`}>
                                    {c.status === 'active' ? '모집중' : '마감'}
                                </span>
                                {(() => {
                                    if (!c.recruitment_deadline) return null;
                                    const today = new Date();
                                    const dDay = Math.ceil((new Date(c.recruitment_deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${dDay < 0 ? 'bg-muted text-muted-foreground' : dDay <= 3 ? 'bg-red-100 text-red-600 animate-pulse dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                            {dDay < 0 ? '마감' : `D-${dDay}`}
                                        </span>
                                    );
                                })()}
                            </div>
                            {/* Channels */}
                            <div className="flex gap-1 shrink-0">
                                {c.channels?.slice(0, 5).map((channel: string) => (
                                    <div key={channel} className="text-sm bg-muted p-1 rounded-md" title={channel}>
                                        {renderChannelIcon(channel)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Title & Hashtags */}
                        <div className="mb-4">
                            <h3 className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors line-clamp-1 break-all">{c.title || c.product}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground min-w-0">
                                <span className="font-medium text-foreground truncate max-w-[120px]">{c.brand}</span>
                                <span className="text-border shrink-0">|</span>
                                <span className="truncate">{c.product}</span>
                                {c.selection_announcement_date && (
                                    <>
                                        <span className="text-border shrink-0">|</span>
                                        <span className="truncate">선정: {c.selection_announcement_date}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                            <div className="space-y-0.5 min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground/70 truncate">제공 혜택</div>
                                <div className="text-emerald-600 font-bold text-xs truncate">{c.budget || "협의"}</div>
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground/70 truncate">모집 인원</div>
                                <div className="font-medium text-xs text-foreground truncate">{c.recruitment_count ? `${c.recruitment_count}명` : '-'}</div>
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground/70 truncate">지원 조건</div>
                                <div className="truncate text-xs text-foreground">
                                    {c.min_followers ? `${(c.min_followers / 10000 >= 1) ? (c.min_followers / 10000) + '만' : c.min_followers.toLocaleString()}↑` : '제한없음'}
                                </div>
                            </div>
                            <div className="space-y-0.5 hidden md:block min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground/70 truncate">예상 업로드</div>
                                <div className="text-xs text-foreground truncate">{formatDateToMonth(c.postingDate) || '협의'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Action Area */}
                <div className="border-t md:border-t-0 md:border-l p-4 md:w-32 bg-muted/10 flex flex-col items-center justify-center gap-2 shrink-0">
                    <Button
                        size="sm"
                        className="w-full gap-2 text-xs"
                        onClick={onApply}
                    >
                        <Send className="h-3 w-3" /> 지원
                    </Button>
                </div>
            </div>
        </Card>
    )
}
