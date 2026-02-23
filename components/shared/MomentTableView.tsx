"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"
import { ExternalLink, Pencil, Star, Trash2 } from "lucide-react"
import Link from "next/link"

// 플랫폼별 그라데이션 아이콘 (SVG inline)
function PlatformIcon({ platform, size = 22 }: { platform: string; size?: number }) {
    const s = size
    if (platform === 'instagram') {
        return (
            <svg width={s} height={s} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="ig-grad" cx="30%" cy="107%" r="120%">
                        <stop offset="0%" stopColor="#fdf497" />
                        <stop offset="15%" stopColor="#fd5949" />
                        <stop offset="44%" stopColor="#d6249f" />
                        <stop offset="100%" stopColor="#285AEB" />
                    </radialGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="url(#ig-grad)" />
                <rect x="11" y="11" width="18" height="18" rx="5" stroke="white" strokeWidth="2.2" fill="none" />
                <circle cx="20" cy="20" r="4.5" stroke="white" strokeWidth="2.2" fill="none" />
                <circle cx="27" cy="13" r="1.2" fill="white" />
            </svg>
        )
    }
    if (platform === 'youtube') {
        return (
            <svg width={s} height={s} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="#FF0000" />
                <path d="M30.5 14.8C30.2 13.7 29.3 12.8 28.2 12.5C26.2 12 20 12 20 12C20 12 13.8 12 11.8 12.5C10.7 12.8 9.8 13.7 9.5 14.8C9 16.8 9 21 9 21C9 21 9 25.2 9.5 27.2C9.8 28.3 10.7 29.2 11.8 29.5C13.8 30 20 30 20 30C20 30 26.2 30 28.2 29.5C29.3 29.2 30.2 28.3 30.5 27.2C31 25.2 31 21 31 21C31 21 31 16.8 30.5 14.8Z" fill="white" />
                <polygon points="17,17 17,25 24,21" fill="#FF0000" />
            </svg>
        )
    }
    if (platform === 'tiktok') {
        return (
            <svg width={s} height={s} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="#010101" />
                <path d="M27 14.5C25.9 13.4 25.2 11.8 25.1 10H21.8V25.4C21.8 26.9 20.6 28.1 19.1 28.1C17.6 28.1 16.4 26.9 16.4 25.4C16.4 23.9 17.6 22.7 19.1 22.7C19.4 22.7 19.6 22.8 19.9 22.8V19.4C19.6 19.4 19.3 19.3 19.1 19.3C15.8 19.3 13.1 22 13.1 25.3C13.1 28.6 15.8 31.3 19.1 31.3C22.4 31.3 25.1 28.6 25.1 25.3V17.7C26.5 18.7 28.2 19.3 30 19.3V16C28.9 16 27.8 15.4 27 14.5Z" fill="white" />
                <path d="M28.5 16.5C27.2 15.6 26.2 14.1 26 12.5H25.1C25.3 14.3 26.2 15.9 27.6 17C28.2 17.4 28.8 17.7 29.5 17.9V17C29 16.9 28.7 16.7 28.5 16.5Z" fill="#69C9D0" />
                <path d="M19.1 21.7C17.1 21.7 15.4 23.3 15.4 25.4C15.4 26.9 16.2 28.2 17.5 28.7C17 28.1 16.7 27.3 16.7 25.4C16.7 23.3 18.3 21.7 20.3 21.7C20.6 21.7 20.9 21.8 21.1 21.8V20.4C20.8 20.4 20.5 20.3 20.3 20.3C19.9 20.3 19.5 20.4 19.1 20.5V21.7Z" fill="#EE1D52" />
            </svg>
        )
    }
    if (platform === 'blog') {
        return (
            <svg width={s} height={s} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="blog-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#03C75A" />
                        <stop offset="100%" stopColor="#00A94F" />
                    </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="url(#blog-grad)" />
                <text x="8" y="27" fontFamily="Arial" fontWeight="bold" fontSize="17" fill="white">N</text>
                <text x="20" y="27" fontFamily="Arial" fontSize="10" fill="white" fontWeight="bold">blog</text>
            </svg>
        )
    }
    // 기타 플랫폼 fallback
    return (
        <div
            style={{ width: s, height: s, borderRadius: 6, background: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>
                {platform.slice(0, 2).toUpperCase()}
            </span>
        </div>
    )
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
    /** Edit handler (navigates to edit page) */
    onEdit?: (id: string) => void
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
    onEdit,
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
                        {hasFavorites && <TableHead className="w-[44px]">찜</TableHead>}
                        <TableHead className="min-w-[130px]">크리에이터</TableHead>
                        <TableHead className="min-w-[220px]">모먼트 제목</TableHead>
                        <TableHead className="min-w-[160px]">희망 제품</TableHead>
                        <TableHead className="w-[90px]">예상 단가</TableHead>
                        <TableHead className="w-[70px]">채널</TableHead>
                        <TableHead className="w-[80px]">팔로워</TableHead>
                        <TableHead className="w-[110px]">일정</TableHead>
                        {hasOfferCount && <TableHead className="w-[50px]">제안</TableHead>}
                        {(onDelete || onEdit) && <TableHead className="w-[80px]"></TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length > 0 ? (
                        items.map((item) => {
                            const creator = getCreator(item)
                            const isFavorite = favorites?.some(f => f.target_id === item.id && f.target_type === 'event')

                            // 채널 목록: 모먼트의 channels 배열 또는 크리에이터 채널 사용
                            // [FIX] instagram_reels → instagram, youtube_shorts → youtube 등 base channel로 normalize
                            const normalizeChannel = (ch: string): string => {
                                if (ch.startsWith('other:') || ch === 'other') return 'other'
                                return ch.split('_')[0] // instagram_reels → instagram
                            }
                            const channels: string[] = (() => {
                                // 모먼트 자체에 channels 필드가 있으면 우선 사용
                                if (Array.isArray(item.channels) && item.channels.length > 0) {
                                    // 중복 제거 후 base channel로 normalize
                                    const raw = item.channels.map(normalizeChannel)
                                    return [...new Set(raw)].filter(c => c !== 'other')
                                }
                                if (Array.isArray(item.channel_types) && item.channel_types.length > 0) {
                                    const raw = item.channel_types.map(normalizeChannel)
                                    return [...new Set(raw)].filter(c => c !== 'other')
                                }
                                // 크리에이터 채널에서 추출
                                const allChannels = creator.socialChannels || (creator.primaryChannel ? [creator.primaryChannel] : [])
                                const platforms = allChannels.map((c: any) => c.platform).filter(Boolean)
                                return platforms.length > 0 ? platforms : []
                            })()

                            const offerCount = brandProposals.filter((p: any) => p.event_id === item.id && (p.status === 'offered' || p.status === 'negotiating' || p.status === 'pending')).length

                            return (
                                <TableRow
                                    key={item.id}
                                    className="group hover:bg-muted/50 cursor-pointer"
                                    onClick={onClick ? () => onClick(item) : undefined}
                                >
                                    {hasFavorites && (
                                        <TableCell className="text-center py-2">
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
                                    <TableCell className="py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-primary">
                                                {creator.avatar && creator.avatar.startsWith('http') ? (
                                                    <img src={creator.avatar} alt={creator.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    creator.avatar || creator.name?.[0] || 'C'
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm leading-tight">{creator.name || item.influencer}</div>
                                                <span className="text-[10px] text-primary/80 font-medium">{item.category || '기타'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        {linkToEvent ? (
                                            <Link href={`/event/${item.id}`} className="hover:underline flex items-center gap-1.5 group-hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                                                <span className="font-medium truncate max-w-[260px] block">{item.title || item.event}</span>
                                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 shrink-0" />
                                            </Link>
                                        ) : (
                                            <span className="font-medium truncate max-w-[260px] block">{item.title || item.event}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <span className="truncate max-w-[180px] text-sm block">{item.targetProduct || "-"}</span>
                                    </TableCell>
                                    <TableCell className="py-2 text-right pr-4">
                                        <span className="text-sm font-medium whitespace-nowrap">
                                            {formatPriceRange(item.priceVideo)}
                                        </span>
                                    </TableCell>
                                    {/* 채널: 아이콘만, 여러 개 나란히 */}
                                    <TableCell className="py-2">
                                        <div className="flex items-center gap-1 justify-center">
                                            {channels.length > 0 ? (
                                                channels.map((platform, idx) => (
                                                    <PlatformIcon key={`${platform}-${idx}`} platform={platform} size={22} />
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2 text-right pr-3">
                                        <Badge variant="secondary" className="font-normal text-xs bg-muted">
                                            {(creator.followers || 0).toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <div className="text-xs text-muted-foreground leading-relaxed">
                                            <div>{formatDateToMonth(item.eventDate)} (이벤트)</div>
                                            <div>{item.dateFlexible ? '협의가능' : formatDateToMonth(item.postingDate)} (업로드)</div>
                                        </div>
                                    </TableCell>
                                    {hasOfferCount && (
                                        <TableCell className="py-2 text-center">
                                            {offerCount > 0 ? (
                                                <Badge className="bg-indigo-600 hover:bg-indigo-700 border-0 animate-pulse">📥 {offerCount}</Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    )}
                                    {(onDelete || onEdit) && (
                                        <TableCell className="py-2">
                                            <div className="flex gap-1">
                                                {onEdit && (
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                                                        onClick={(e) => { e.stopPropagation(); onEdit(item.id); }}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                                                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
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
