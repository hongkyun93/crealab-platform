"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { CHANNELS } from "@/components/shared/ChannelSelector"
import { formatDateToMonth } from "@/lib/utils"
import { ExternalLink, Send } from "lucide-react"
import { Campaign } from "@/lib/types/campaign"

const CHANNEL_STYLE: Record<string, string> = {
    instagram: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500',
    youtube: 'bg-gradient-to-br from-red-600 to-red-700',
    tiktok: 'bg-gradient-to-br from-black via-slate-900 to-slate-800',
    blog: 'bg-gradient-to-br from-green-500 to-green-600',
    other: 'bg-gradient-to-br from-slate-600 to-slate-700',
}

function ChannelIcon({ channelId }: { channelId: string }) {
    const baseId = channelId.split('_')[0]
    const channel = CHANNELS.find(c => c.id === baseId)
    if (!channel) return null
    const Icon = channel.Icon
    return (
        <div className={`h-6 w-6 rounded-full ${CHANNEL_STYLE[baseId] ?? CHANNEL_STYLE.other} flex items-center justify-center shrink-0`} title={channel.label}>
            <Icon className="h-3 w-3 text-white" />
        </div>
    )
}

interface CampaignCardAProps {
    campaign: Campaign
    applicantCount?: number
    onClick: () => void
    onApply: (e: React.MouseEvent) => void
}

export function CampaignCardA({ campaign: c, applicantCount = 0, onClick, onApply }: CampaignCardAProps) {
    return (
        <Card
            className={`group hover:shadow-md transition-all cursor-pointer border-border/60 overflow-hidden bg-card`}
            onClick={onClick}
        >
            <div className="flex flex-col h-full">
                {/* Image Section */}
                {(c.image && c.image !== "📦") || c.product_image_url ? (
                    <div className="w-full h-48 bg-muted/20 shrink-0 relative flex items-center justify-center overflow-hidden">
                        <img src={c.image && c.image !== "📦" ? c.image : c.product_image_url} alt={c.product} className={`w-full h-full object-cover transition-transform hover:scale-105 duration-500`} />
                        <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm shadow-sm">
                                {c.category}
                            </Badge>
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                            <FavoriteButton targetId={String(c.id)} targetType="campaign" />
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center shrink-0 relative">
                        <span className="text-4xl">📦</span>
                        <div className="absolute top-2 right-2 z-10">
                            <FavoriteButton targetId={String(c.id)} targetType="campaign" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 px-4 py-2 flex flex-col justify-between min-w-0">
                    <div className="space-y-1.5">
                        {/* Header Row */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${c.status === 'active' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30' : 'text-muted-foreground bg-muted border-border'}`}>
                                    {c.status === 'active' ? '모집중' : '마감'}
                                </span>
                                {c.product_type && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-muted-foreground bg-muted border-border shrink-0">
                                        {c.product_type === 'loan' ? '🔄 대여' : '🎁 증정'}
                                    </span>
                                )}
                                {(() => {
                                    if (!c.recruitment_deadline) return null;
                                    const today = new Date();
                                    const dDay = Math.ceil((new Date(c.recruitment_deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${dDay < 0
                                            ? 'bg-muted text-muted-foreground border border-border'
                                            : dDay <= 10
                                                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                                : 'bg-muted text-muted-foreground border border-border'
                                            }`}>
                                            {dDay < 0 ? '마감' : `D-${dDay}`}
                                        </span>
                                    );
                                })()}
                            </div>
                            {/* Channels */}
                            <div className="flex gap-1 shrink-0">
                                {c.channels?.slice(0, 4).map((channel: string) => (
                                    <ChannelIcon key={channel} channelId={channel} />
                                ))}
                            </div>
                        </div>

                        {/* Title & Brand */}
                        <div>
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1 break-all">{c.title || c.product}</h3>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground min-w-0">
                                <div className="font-medium truncate max-w-[120px]">{c.brand}</div>
                            </div>
                        </div>

                        {/* Description Preview - fixed 2-line height */}
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-[2.6rem] overflow-hidden">
                            {c.description || '캠페인 상세 내용이 등록되지 않았습니다.'}
                        </p>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm text-muted-foreground bg-muted/30 p-1.5 rounded-lg">
                            <div className="space-y-0.5 min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground/70 truncate">제공 혜택</div>
                                <div className="text-emerald-600 font-bold text-xs truncate">{c.budget || '협의'}</div>
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground/70 truncate">지원 / 모집 인원</div>
                                <div className="font-medium text-xs text-foreground truncate">
                                    <span className="text-primary font-bold">{applicantCount}명</span>
                                    <span className="text-muted-foreground"> / {c.recruitment_count ? `${c.recruitment_count}명` : '제한없음'}</span>
                                </div>
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground/70 truncate">지원 조건</div>
                                <div className="truncate text-xs text-foreground">
                                    {c.min_followers
                                        ? `${(c.min_followers / 10000 >= 1) ? (c.min_followers / 10000) + '만' : c.min_followers.toLocaleString()}↑`
                                        : '제한없음'}
                                    {c.max_followers
                                        ? ` ~ ${(c.max_followers / 10000 >= 1) ? (c.max_followers / 10000) + '만' : c.max_followers.toLocaleString()}↓`
                                        : ''}
                                </div>
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground/70 truncate">예상 업로드</div>
                                <div className="text-xs text-foreground truncate">{formatDateToMonth(c.postingDate) || formatDateToMonth(c.posting_date) || '기한없음'}</div>
                            </div>
                            {/* 선정 발표 | 필수 해시태그 */}
                            <div className="space-y-0.5 min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground/70 truncate">선정 발표</div>
                                <div className="text-xs text-foreground truncate">{c.selection_announcement_date || '미정'}</div>
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground/70 truncate">필수 해시태그</div>
                                {c.hashtags && c.hashtags.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {c.hashtags.slice(0, 3).map((tag: string) => (
                                            <span key={tag} className="text-[10px] text-primary/80 bg-primary/8 border border-primary/20 px-1 py-0.5 rounded-full font-medium leading-tight">
                                                {tag}
                                            </span>
                                        ))}
                                        {c.hashtags.length > 3 && (
                                            <span className="text-[10px] text-muted-foreground">+{c.hashtags.length - 3}</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground">없음</div>
                                )}
                            </div>
                        </div>

                        {/* Target Creator Style */}
                        <div className="text-xs bg-muted/20 rounded-lg p-1.5 border border-border/50">
                            <div className="text-[10px] font-bold text-muted-foreground/70 mb-0.5">원하는 크리에이터 스타일</div>
                            <p className="text-foreground line-clamp-2 leading-relaxed">{c.target || '조건 없음'}</p>
                        </div>

                        {/* Reference Link */}
                        {c.reference_link && (
                            <a
                                href={c.reference_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600 truncate"
                            >
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <span className="truncate">{c.reference_link}</span>
                            </a>
                        )}
                    </div>
                </div>

                <CardFooter className="px-4 py-2 pt-0 mt-auto">
                    <Button
                        className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={onApply}
                    >
                        <Send className="h-4 w-4" /> 지원하기
                    </Button>
                </CardFooter>
            </div>
        </Card>
    )
}
