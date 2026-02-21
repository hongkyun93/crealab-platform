"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Instagram, Calendar, FileText, TrendingUp } from "lucide-react"

interface CreatorSummary {
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
    total_brand_proposals: number
    pending_brand_proposals: number
    active_brand_proposals: number
    brand_revenue: number
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
    onViewDashboard: () => void
}

export function CreatorSummaryCard({ creator, onViewDashboard }: CreatorSummaryCardProps) {
    const totalPending = creator.pending_brand_proposals + creator.pending_moment_proposals
    const totalActive = creator.active_brand_proposals + creator.active_moment_proposals + creator.active_campaign_applications
    const totalRevenue = creator.brand_revenue + creator.moment_revenue

    const formatFollowers = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
        return count.toString()
    }

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onViewDashboard}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-14 w-14 border-2 border-primary/10">
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

                        {/* Stats Row */}
                        <div className="flex items-center gap-3 text-xs">
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
                                    대기 {totalPending}건
                                </Badge>
                            )}
                            {totalRevenue > 0 && (
                                <span className="text-primary font-semibold">
                                    ₩{totalRevenue.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-4" />
                </div>
            </CardContent>
        </Card>
    )
}
