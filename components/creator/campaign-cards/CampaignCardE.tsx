"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { CHANNELS } from "@/components/shared/ChannelSelector"
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

interface CampaignCardEProps {
    campaign: Campaign
    applicantCount?: number
    onClick: () => void
    onApply: (e: React.MouseEvent) => void
}

export function CampaignCardE({ campaign: c, applicantCount = 0, onClick, onApply }: CampaignCardEProps) {

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
            <div className="w-20 sm:w-24 self-stretch min-h-[80px] sm:min-h-[96px] rounded-lg bg-muted shrink-0 overflow-hidden relative border border-border/50">
                {(c.image && c.image !== "📦") || c.product_image_url ? (
                    <img src={c.image && c.image !== "📦" ? c.image : c.product_image_url} alt={c.product} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-3 w-full">

                {/* Main Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Brand + Status badges */}
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
                        <span className="font-bold text-primary">{c.brand}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${c.status === 'active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-muted-foreground bg-muted border-border'}`}>
                            {c.status === 'active' ? '모집중' : '마감'}
                        </span>
                        {c.product_type && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border text-muted-foreground bg-muted border-border">
                                {c.product_type === 'loan' ? '🔄 대여' : '🎁 증정'}
                            </span>
                        )}
                        {c.recruitment_deadline && (() => {
                            const dDay = Math.ceil((new Date(c.recruitment_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${dDay < 0
                                    ? 'text-muted-foreground bg-muted border-border'
                                    : dDay <= 10
                                        ? 'text-orange-600 bg-orange-50 border-orange-200'
                                        : 'text-muted-foreground bg-muted border-border'
                                    }`}>
                                    {dDay < 0 ? '마감' : `D-${dDay}`}
                                </span>
                            );
                        })()}
                        {/* 희망 체널 (D-day 오른쪽) */}
                        {c.channels?.slice(0, 4).map((channel: string) => (
                            <ChannelIcon key={channel} channelId={channel} />
                        ))}
                    </div>

                    {/* Title + Category */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold truncate group-hover:text-primary transition-colors leading-tight">
                            {c.title || c.product}
                        </h3>
                        {c.category && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border shrink-0">
                                {c.category}
                            </span>
                        )}
                    </div>
                    {c.title && c.product && (
                        <p className="text-xs text-muted-foreground truncate">{c.product}</p>
                    )}

                    {/* Description preview */}
                    {c.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{c.description}</p>
                    )}

                    {/* Target creator style */}
                    {c.target && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            <span className="font-bold">스타일:</span> {c.target}
                        </p>
                    )}

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1 mt-0.5">
                        {c.hashtags?.slice(0, 4).map((tag: string) => (
                            <span key={tag} className="text-[10px] text-primary/80 bg-primary/8 border border-primary/20 px-1.5 py-0.5 rounded-full font-medium">
                                {tag}
                            </span>
                        ))}
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

                    {/* Mobile details */}
                    <div className="flex flex-row gap-3 text-sm border-t border-border/50 pt-3 sm:hidden">
                        <div className="flex items-center justify-between gap-2 flex-1">
                            <span className="text-muted-foreground text-xs w-12 shrink-0">제공 혜택</span>
                            <span className="font-bold text-emerald-600 truncate">{c.budget || "협의"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-1">
                            <span className="text-muted-foreground text-xs w-12 shrink-0">모집 인원</span>
                            <span className="font-medium">{c.recruitment_count ? `${c.recruitment_count}명` : '-'}</span>
                        </div>
                    </div>

                    {/* Mobile Action Button */}
                    <Button size="sm" className="w-full sm:hidden mt-2 font-bold" onClick={onApply}>
                        지원하기 <Send className="ml-1.5 h-3 w-3" />
                    </Button>
                </div>

                {/* Details Column (Desktop) */}
                <div className="hidden sm:flex flex-col gap-1 text-sm min-w-[140px]">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-xs w-14 shrink-0">제공 혜택</span>
                        <span className="font-bold text-emerald-600 truncate text-xs">{c.budget || "협의"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-xs w-14 shrink-0">지원 / 모집</span>
                        <span className="text-xs">
                            <span className="text-primary font-bold">{applicantCount}명</span>
                            <span className="text-muted-foreground"> / {c.recruitment_count ? `${c.recruitment_count}명` : '제한없음'}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground text-xs w-14 shrink-0">지원 조건</span>
                        <span className="text-xs text-foreground">
                            {c.min_followers
                                ? `${(c.min_followers / 10000 >= 1) ? (c.min_followers / 10000) + '만' : c.min_followers.toLocaleString()}↑`
                                : '제한없음'}
                        </span>
                    </div>
                    {c.recruitment_deadline && (
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground text-xs w-14 shrink-0">마감일</span>
                            <span className="text-xs text-foreground">{new Date(c.recruitment_deadline).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}
                    {c.selection_announcement_date && (
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground text-xs w-14 shrink-0">선정 발표</span>
                            <span className="text-xs text-foreground">{c.selection_announcement_date}</span>
                        </div>
                    )}
                    {(c.postingDate || c.posting_date) && (
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground text-xs w-14 shrink-0">업로드</span>
                            <span className="text-xs text-foreground">{c.postingDate || c.posting_date}</span>
                        </div>
                    )}
                </div>

                {/* Action Column (Desktop) */}
                <div className="hidden sm:flex flex-col items-end gap-2 pl-4 border-l border-border/50">
                    <FavoriteButton targetId={String(c.id)} targetType="campaign" />

                    <Button size="sm" className="w-full text-xs font-bold shadow-sm" onClick={onApply}>
                        지원하기 <Send className="ml-1.5 h-3 w-3" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
