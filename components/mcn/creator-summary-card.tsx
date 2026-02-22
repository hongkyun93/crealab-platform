"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Instagram, Calendar, FileText, TrendingUp } from "lucide-react"

export type CreatorStatus = 'urgent' | 'active' | 'idle' | 'normal'

export interface CreatorSummary {
    user_id: string
    display_name: string
    avatar_url: string | null
    instagram_handle: string | null
    followers_count: number
    tier: string | null
    tags: string[] | null
    price_video: number
    price_feed: number
    total_moments: number
    active_moments: number
    total_product_applications: number
    pending_product_applications: number
    active_product_applications: number
    product_revenue: number
    total_moment_proposals: number
    pending_moment_proposals: number
    active_moment_proposals: number
    moment_revenue: number
    total_campaign_applications: number
    pending_campaign_applications: number
    active_campaign_applications: number
}

interface CreatorSummaryCardProps {
    creator: CreatorSummary
    status: CreatorStatus
    onViewDashboard: () => void
}

const STATUS_CONFIG: Record<CreatorStatus, { label: string; dotClass: string; badgeClass: string }> = {
    urgent: { label: '긴급', dotClass: 'bg-red-500 animate-pulse', badgeClass: 'bg-red-100 text-red-700 border-red-200' },
    active: { label: '협업 중', dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    idle: { label: '비활성', dotClass: 'bg-slate-400', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' },
    normal: { label: '정상', dotClass: 'bg-blue-400', badgeClass: 'bg-blue-50 text-blue-600 border-blue-200' },
}

export function CreatorSummaryCard({ creator, status, onViewDashboard }: CreatorSummaryCardProps) {
    const totalPending = creator.pending_product_applications + creator.pending_moment_proposals
    const totalActive = creator.active_product_applications + creator.active_moment_proposals + creator.active_campaign_applications
    const totalRevenue = creator.product_revenue + creator.moment_revenue

    const statusCfg = STATUS_CONFIG[status]

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
        return count.toString()
    }

    return (
        <Card
            className={`hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden border ${status === 'urgent' ? 'border-red-300 ring-1 ring-red-200' :
                    status === 'idle' ? 'border-border/40 opacity-75 hover:opacity-100' :
                        'border-border/60'
                }`}
            onClick={onViewDashboard}
        >
            {/* Status dot top-left */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusCfg.badgeClass}`}>
                    {statusCfg.label}
                </span>
            </div>

            <CardContent className="p-4 pt-8">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-14 w-14 border-2 border-primary/10 shrink-0">
                        <AvatarImage src={creator.avatar_url || ''} />
                        <AvatarFallback className="text-lg font-bold">
                            {creator.display_name?.[0] || '?'}
                        </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm truncate">{creator.display_name}</h3>
                            {creator.tier && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {creator.tier}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            {creator.instagram_handle && (
                                <span className="flex items-center gap-1">
                                    <Instagram className="h-3 w-3" />
                                    @{creator.instagram_handle}
                                </span>
                            )}
                            <span>{formatFollowers(creator.followers_count)} 팔로워</span>
                        </div>

                        {/* Tags */}
                        {creator.tags && creator.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                                {creator.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Stats Row */}
                        <div className="flex items-center gap-3 text-xs flex-wrap">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                                <span>모먼트 {creator.total_moments}건</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                                <span>진행중 {totalActive}건</span>
                            </div>
                            {totalPending > 0 && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                                    <FileText className="h-2.5 w-2.5 mr-0.5" />
                                    대기 {totalPending}건
                                </Badge>
                            )}
                            {totalRevenue > 0 && (
                                <span className="text-primary font-semibold">
                                    ₩{totalRevenue.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Price */}
                        {creator.price_video > 0 && (
                            <div className="mt-2 text-[10px] text-muted-foreground">
                                영상 단가: <span className="font-medium text-foreground">₩{creator.price_video.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-4 shrink-0" />
                </div>
            </CardContent>
        </Card>
    )
}
