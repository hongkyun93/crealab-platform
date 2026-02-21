"use client"

import React from "react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ExternalLink, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
    instagram: { label: 'Instagram', color: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white' },
    youtube: { label: 'YouTube', color: 'bg-red-600 text-white' },
    tiktok: { label: 'TikTok', color: 'bg-black text-white' },
    blog: { label: 'Blog', color: 'bg-green-600 text-white' },
}

export interface MomentTableViewProps {
    items: any[]
    /** Per-item creator mapper — returns creator info for each row */
    getCreator: (item: any) => {
        name?: string
        avatar?: string
        followers?: number
        primaryChannel?: { platform: string; followersCount?: number }
        socialChannels?: { platform: string; followersCount?: number }[]
    }
    /** Favorites state & toggle (brand side) */
    favorites?: any[]
    toggleFavorite?: (id: string, type: string) => void
    /** Link to event detail page (brand side) */
    linkToEvent?: boolean
    /** Click handler (creator side) */
    onClick?: (item: any) => void
    /** Delete handler */
    onDelete?: (id: string) => void
    /** Is past tab? */
    isPast?: boolean
    /** Brand proposals for offer count */
    brandProposals?: any[]
    /** Empty message */
    emptyMessage?: string
}

export function MomentTableView({
    items, getCreator,
    favorites, toggleFavorite,
    linkToEvent = false,
    onClick,
    onDelete,
    isPast = false,
    brandProposals = [],
    emptyMessage = "모먼트가 없습니다."
}: MomentTableViewProps) {
    const hasFavorites = !!favorites && !!toggleFavorite
    const hasOfferCount = !isPast && brandProposals.length > 0

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        {hasFavorites && <TableHead className="w-[50px] text-center">찜</TableHead>}
                        <TableHead>크리에이터</TableHead>
                        <TableHead>모먼트 제목</TableHead>
                        <TableHead>희망 제품</TableHead>
                        <TableHead>예상 단가</TableHead>
                        <TableHead>채널</TableHead>
                        <TableHead>팔로워</TableHead>
                        <TableHead>일정</TableHead>
                        {hasOfferCount && <TableHead className="text-center">제안</TableHead>}
                        {isPast && onDelete && <TableHead className="w-[50px]"></TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length > 0 ? (
                        items.map((item) => {
                            const creator = getCreator(item)
                            const isFavorite = favorites?.some(f => f.target_id === item.id && f.target_type === 'event')
                            const pc = creator.socialChannels?.[0] || creator.primaryChannel
                            const platform = pc?.platform || ''
                            const offerCount = brandProposals.filter((p: any) => p.event_id === item.id && (p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending')).length

                            return (
                                <TableRow
                                    key={item.id}
                                    className="group hover:bg-muted/50 cursor-pointer"
                                    onClick={onClick ? () => onClick(item) : undefined}
                                >
                                    {hasFavorites && (
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-yellow-500"
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite!(item.id, 'event'); }}
                                            >
                                                <Star
                                                    className={`h-4 w-4 transition-colors ${isFavorite ? 'text-yellow-500' : ''}`}
                                                    fill={isFavorite ? 'currentColor' : 'none'}
                                                />
                                            </Button>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-primary">
                                                {creator.avatar && creator.avatar.startsWith('http') ? (
                                                    <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    creator.avatar || creator.name?.[0] || 'C'
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{creator.name || item.influencer}</div>
                                                {item.category && (
                                                    <span className="text-[10px] text-primary/80 font-medium">{item.category}</span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {linkToEvent ? (
                                            <Link href={`/event/${item.id}`} className="hover:underline flex items-center gap-2 group-hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                                                <span className="font-medium truncate max-w-[200px]">{item.title || item.event}</span>
                                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                                            </Link>
                                        ) : (
                                            <span className="font-medium truncate max-w-[200px] block">{item.title || item.event}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="truncate max-w-[120px] text-sm block">{item.targetProduct || "-"}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium whitespace-nowrap">
                                            {formatPriceRange(item.priceVideo)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {platform ? (
                                            <Badge className={`text-[10px] font-medium border-0 ${PLATFORM_LABELS[platform]?.color || 'bg-slate-600 text-white'}`}>
                                                {PLATFORM_LABELS[platform]?.label || platform}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal text-xs bg-muted">
                                            {(creator.followers || 0).toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground">
                                            <div>{formatDateToMonth(item.eventDate)} (이벤트)</div>
                                            <div>{item.dateFlexible ? '협의가능' : formatDateToMonth(item.postingDate)} (업로드)</div>
                                        </div>
                                    </TableCell>
                                    {hasOfferCount && (
                                        <TableCell className="text-center">
                                            {offerCount > 0 ? (
                                                <Badge className="bg-indigo-600 hover:bg-indigo-700 border-0 animate-pulse">📥 {offerCount}</Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    )}
                                    {isPast && onDelete && (
                                        <TableCell>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-red-500"
                                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
