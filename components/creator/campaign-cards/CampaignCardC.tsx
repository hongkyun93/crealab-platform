import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

import { Campaign } from "@/lib/types/campaign"



interface CampaignCardCProps {
    campaign: Campaign
    onClick: () => void
    onApply: (e: React.MouseEvent) => void
}

export function CampaignCardC({ campaign: c, onClick, onApply }: CampaignCardCProps) {
    return (
        <Card
            className="flex flex-col h-full hover:shadow-lg transition-all border-border/60 hover:border-primary/50 group cursor-pointer"
            onClick={onClick}
        >
            <CardHeader>
                <div className="flex justify-between items-start mb-2 gap-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 shrink-0">
                        {c.category?.split(',')[0] || '카테고리 없음'}
                    </Badge>
                    {c.recruitment_deadline ? (
                        <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50 shrink-0">
                            D-{Math.ceil((new Date(c.recruitment_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                        </Badge>
                    ) : (
                        <span className="text-xs text-muted-foreground shrink-0">상시 모집</span>
                    )}
                </div>
                <CardTitle className="text-lg font-bold line-clamp-1 break-all">{c.title || c.product}</CardTitle>
                <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2 max-w-full">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground overflow-hidden shrink-0">
                            {c.brandAvatar ? (
                                <img src={c.brandAvatar} alt={c.brand} className="h-full w-full object-cover" />
                            ) : (
                                c.brand?.[0] || 'B'
                            )}
                        </div>
                        <span className="text-sm text-muted-foreground font-medium truncate">{c.brand}</span>
                    </div>
                    {/* Selection Date & Category (Subtext) */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 pl-1 min-w-0">
                        <span className="truncate">{c.product}</span>
                        {c.selection_announcement_date && (
                            <>
                                <span className="text-border shrink-0">|</span>
                                <span className="truncate">선정: {c.selection_announcement_date}</span>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 min-w-0">
                <div className="bg-muted/30 p-3 rounded-lg text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">제공 혜택</span>
                        <span className="font-bold text-emerald-600">{c.budget || "협의"}</span>
                    </div>
                    {c.recruitment_count && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">모집 인원</span>
                            <span className="font-medium">{c.recruitment_count}명</span>
                        </div>
                    )}
                    {c.channels && c.channels.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-border/50 mt-1">
                            {c.channels.slice(0, 4).map((ch: string) => (
                                <span key={ch} className="text-[10px] bg-muted border px-1.5 py-0.5 rounded text-muted-foreground">
                                    {ch === 'instagram' && '📸'}
                                    {ch === 'youtube' && '▶️'}
                                    {ch === 'tiktok' && '🎵'}
                                    {ch === 'blog' && '📝'}
                                    {ch === 'shorts' && '⚡'}
                                    {ch === 'reels' && '🎞️'}
                                    {!['instagram', 'youtube', 'tiktok', 'blog', 'shorts', 'reels'].includes(ch) && ch}
                                </span>
                            ))}
                            {c.channels.length > 4 && <span className="text-[10px] text-muted-foreground flex items-center">+{c.channels.length - 4}</span>}
                        </div>
                    )}
                    {(c.min_followers || c.max_followers) && (
                        <div className="flex justify-between pt-1 border-t border-border/50 mt-1">
                            <span className="text-muted-foreground text-xs">지원 조건</span>
                            <span className="font-medium text-xs text-foreground/90">
                                {c.min_followers ? `${(c.min_followers / 10000 >= 1) ? (c.min_followers / 10000) + '만' : c.min_followers.toLocaleString()}↑` : ''}
                                {c.min_followers && c.max_followers ? ' ~ ' : ''}
                                {c.max_followers ? `${(c.max_followers / 10000 >= 1) ? (c.max_followers / 10000) + '만' : c.max_followers.toLocaleString()}↓` : ''}
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {c.description}
                </p>
            </CardContent>
            <CardFooter className="pt-0 mt-auto">
                <Button
                    className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={onApply}
                >
                    <Send className="h-4 w-4" /> 지원하기
                </Button>
            </CardFooter>
        </Card>
    )
}
