"use client"

import React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Filter, Star, Calendar, Gift, Send, Trash2, Banknote, Instagram, Youtube, Music, FileText, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { formatDateToMonth, formatPriceRange } from "@/lib/utils"
import { DiscoverTableView } from "@/components/brand/DiscoverTableView"
import { LayoutGrid, Table as TableIcon } from "lucide-react"
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { CreatorProfileCard } from "@/components/profile/CreatorProfileCard"
import { toast } from "sonner"
import { useState } from "react"

interface DiscoverViewProps {
    filteredEvents: any[]
    sortOrder: string
    setSortOrder: (order: string) => void
    followerFilter: string[]
    statusFilter: string
    setStatusFilter: (status: string) => void
    selectedTag: string | null
    setSelectedTag: (tag: string | null) => void
    handlePresetClick: (key: string) => void
    favorites: any[]
    toggleFavorite: (id: string, type: string) => void
    priceFilter: string[]
    setPriceFilter: (filter: string[] | ((prev: string[]) => string[])) => void
    POPULAR_TAGS: readonly string[]
    PRICE_FILTER_RANGES: any[]
    user: any
    deleteEvent: (id: string) => Promise<void>
    channelFilter?: string[]
    setChannelFilter?: (filter: string[] | ((prev: string[]) => string[])) => void
}



export const DiscoverView = React.memo(function DiscoverView({
    filteredEvents,
    sortOrder,
    setSortOrder,
    followerFilter,
    statusFilter,
    setStatusFilter,
    selectedTag,
    setSelectedTag,
    handlePresetClick,
    favorites,
    toggleFavorite,
    priceFilter,
    setPriceFilter,
    POPULAR_TAGS,
    PRICE_FILTER_RANGES,
    user,
    deleteEvent,
    channelFilter,
    setChannelFilter,
}: DiscoverViewProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    // Multi-select toggle helper (min 1 selection)
    const toggleMulti = (setter: (fn: (prev: string[]) => string[]) => void, key: string, allOptions?: string[]) => {
        if (key === 'all') {
            setter(() => ['all'])
            return
        }
        setter((prev: string[]) => {
            const withoutAll = prev.filter(k => k !== 'all')
            if (withoutAll.includes(key)) {
                const next = withoutAll.filter(k => k !== key)
                if (next.length === 0) return ['all']
                // If all non-all options are selected, auto-switch to 'all'
                if (allOptions && next.length === allOptions.length) return ['all']
                return next
            } else {
                const next = [...withoutAll, key]
                // If all non-all options are selected, auto-switch to 'all'
                if (allOptions && next.length === allOptions.length) return ['all']
                return next
            }
        })
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">모먼트 검색</h1>
                    <p className="text-muted-foreground mt-1">우리 브랜드와 딱 맞는 모먼트를 가진 크리에이터를 찾아보세요.</p>
                </div>
                <div className="flex gap-2">
                    {/* View Switcher */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg mr-2">
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('table')}
                            title="테이블형"
                        >
                            <TableIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('grid')}
                            title="그리드형"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                {sortOrder === "latest" ? "최신 등록순" : sortOrder === "followers_high" ? "팔로워 많은순" : "정렬"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>정렬 기준</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                                <DropdownMenuRadioItem value="latest">최신 등록순</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="followers_high">팔로워 많은순</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="verified">인증된 크리에이터</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-background/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-3">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                        <span className="text-sm font-semibold w-24">팔로워 규모</span>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { k: "all", l: "전체" },
                                { k: "starter", l: "스타터 (0~1천)" },
                                { k: "nano", l: "나노 (1천~1만)" },
                                { k: "micro", l: "마이크로 (1~10만)" },
                                { k: "growing", l: "그로잉 (10~30만)" },
                                { k: "mid", l: "미드 (30~50만)" },
                                { k: "macro", l: "매크로 (50~100만)" },
                                { k: "mega", l: "메가 (>100만)" }
                            ].map(opt => (
                                <Button
                                    key={opt.k}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePresetClick(opt.k)}
                                    className={cn('gap-1.5', followerFilter.includes(opt.k) && 'bg-primary/10 text-primary font-medium')}
                                >
                                    {opt.l}
                                    {followerFilter.includes(opt.k) && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:items-start pt-3 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-2">모먼트 상태</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter("all")}
                                className={cn('gap-1.5', statusFilter === "all" && 'bg-primary/10 text-primary font-medium')}
                            >
                                전체보기
                                {statusFilter === "all" && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter("upcoming")}
                                className={cn('gap-1.5', statusFilter === "upcoming" && 'bg-primary/10 text-primary font-medium')}
                            >
                                모집중인 모먼트
                                {statusFilter === "upcoming" && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter("past")}
                                className={cn('gap-1.5', statusFilter === "past" && 'bg-primary/10 text-primary font-medium')}
                            >
                                완료된 모먼트
                                {statusFilter === "past" && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter("favorites")}
                                className={cn("gap-1.5", statusFilter === "favorites" && 'bg-primary/10 text-primary font-medium')}
                            >
                                <Star className="h-3.5 w-3.5 text-yellow-500" fill={statusFilter === "favorites" ? "currentColor" : "none"} />
                                즐겨찾기만 보기
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:items-start pt-3 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-2">영상 단가</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            {PRICE_FILTER_RANGES.map(range => (
                                <Button
                                    key={range.k}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleMulti(setPriceFilter as any, range.k, PRICE_FILTER_RANGES.filter(r => r.k !== 'all').map(r => r.k))}
                                    className={cn('gap-1.5', priceFilter.includes(range.k) && 'bg-primary/10 text-primary font-medium')}
                                >
                                    {range.l}
                                    {priceFilter.includes(range.k) && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:items-start pt-3 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-2">희망 채널</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            {[
                                { k: 'all', l: '전체', icon: null },
                                { k: 'instagram', l: 'Instagram', icon: <Instagram className="h-3.5 w-3.5" /> },
                                { k: 'youtube', l: 'YouTube', icon: <Youtube className="h-3.5 w-3.5" /> },
                                { k: 'tiktok', l: 'TikTok', icon: <Music className="h-3.5 w-3.5" /> },
                                { k: 'blog', l: 'Blog', icon: <FileText className="h-3.5 w-3.5" /> },
                            ].map(opt => (
                                <Button
                                    key={opt.k}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setChannelFilter && toggleMulti(setChannelFilter as any, opt.k, ['instagram', 'youtube', 'tiktok', 'blog'])}
                                    className={cn("gap-1.5", channelFilter?.includes(opt.k) && 'bg-primary/10 text-primary font-medium')}
                                >
                                    {opt.icon}
                                    {opt.l}
                                    {channelFilter?.includes(opt.k) && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:items-start pt-3 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-2">전문 분야</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTag(null)}
                                className={cn('gap-1.5', selectedTag === null && 'bg-primary/10 text-primary font-medium')}
                            >
                                전체
                                {selectedTag === null && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            {POPULAR_TAGS.map(tag => (
                                <Button
                                    key={tag}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    className={cn('gap-1.5', selectedTag === tag && 'bg-primary/10 text-primary font-medium')}
                                >
                                    {tag}
                                    {selectedTag === tag && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredEvents.map((item) => {
                        const isFavorite = favorites.some(f => f.target_id === item.id && f.target_type === 'event')
                        return (
                            <Link key={item.id} href={`/event/${item.id}`} className="block group">
                                <Card className="overflow-hidden transition-all hover:shadow-lg border-border/60 bg-background flex flex-col h-full cursor-pointer relative">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleFavorite(item.id, 'event');
                                        }}
                                    >
                                        <Star
                                            className={`h-4 w-4 transition-colors ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                                            fill={isFavorite ? 'currentColor' : 'none'}
                                        />
                                    </Button>
                                    <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                        <CreatorProfileCard
                                            creatorId={item.influencerId || item.id}
                                            trigger={
                                                <div
                                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                >
                                                    {item.avatar && item.avatar.startsWith('http') ? (
                                                        <img src={item.avatar} alt={item.influencer} className="h-full w-full object-cover" />
                                                    ) : (
                                                        item.avatar
                                                    )}
                                                </div>
                                            }
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <CreatorProfileCard
                                                    creatorId={item.influencerId || item.id}
                                                    trigger={
                                                        <h4
                                                            className="font-bold truncate cursor-pointer hover:text-primary transition-colors"
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                        >
                                                            {item.influencer}
                                                        </h4>
                                                    }
                                                />
                                                {user?.role === 'admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-red-500 rounded-full shrink-0"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setConfirmDeleteId(item.id)
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                            {/* Primary channel: 이름 아래 */}
                                            {(() => {
                                                const pc = (item as any).primaryChannel
                                                const platform = pc?.platform || ''
                                                const followers = pc?.followersCount ?? item.followers ?? 0
                                                const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString()
                                                const PLATFORM_ICONS: Record<string, React.ReactNode> = {
                                                    instagram: (
                                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                                                            <defs>
                                                                <linearGradient id="ig-grad2" x1="0%" y1="100%" x2="100%" y2="0%">
                                                                    <stop offset="0%" stopColor="#f09433" />
                                                                    <stop offset="25%" stopColor="#e6683c" />
                                                                    <stop offset="50%" stopColor="#dc2743" />
                                                                    <stop offset="75%" stopColor="#cc2366" />
                                                                    <stop offset="100%" stopColor="#bc1888" />
                                                                </linearGradient>
                                                            </defs>
                                                            <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad2)" />
                                                            <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" />
                                                            <circle cx="17.5" cy="6.5" r="1" fill="white" />
                                                        </svg>
                                                    ),
                                                    youtube: (
                                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                                                            <rect x="2" y="4" width="20" height="16" rx="5" fill="#FF0000" />
                                                            <polygon points="10,8.5 10,15.5 16,12" fill="white" />
                                                        </svg>
                                                    ),
                                                    tiktok: (
                                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                                                            <rect width="24" height="24" rx="5" fill="#010101" />
                                                            <path d="M16 7.5c1 .7 2.1 1 3 1v2.2c-.9 0-1.8-.2-2.6-.6v5.4A4.1 4.1 0 1 1 12.3 11v2.3a1.9 1.9 0 1 0 1.9 1.9V5h2z" fill="white" />
                                                        </svg>
                                                    ),
                                                    blog: (
                                                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
                                                            <rect width="24" height="24" rx="5" fill="#03C75A" />
                                                            <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">N</text>
                                                        </svg>
                                                    ),
                                                }
                                                const icon = PLATFORM_ICONS[platform] || (
                                                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                                    </svg>
                                                )
                                                return (
                                                    <span className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-muted-foreground flex-wrap">
                                                        {icon}
                                                        <span>{fmt(followers)} 팔로워</span>
                                                        {item.tags && item.tags.length > 0 && (
                                                            <>
                                                                <span className="text-border">·</span>
                                                                {item.tags.slice(0, 1).map((t: string) => (
                                                                    <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>
                                                                ))}
                                                            </>
                                                        )}
                                                    </span>
                                                )
                                            })()}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 flex-1 relative">
                                        {item.status === 'completed' && (
                                            <div className="absolute top-[-26px] right-4 z-10">
                                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                                    완료된 모먼트
                                                </span>
                                            </div>
                                        )}
                                        <h3 className="font-bold text-base line-clamp-2 h-14 mb-2">{item.event}</h3>

                                        <div className="flex flex-col gap-2 text-xs mb-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                                            <div className="pb-2 border-b border-border/50">
                                                <span className="text-[10px] text-muted-foreground block mb-0.5">희망제품</span>
                                                <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                                    <Gift className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                                    <span className="truncate">{item.targetProduct || "미정"}</span>
                                                </div>
                                            </div>
                                            <div className="pb-2 border-b border-border/50">
                                                <span className="text-[10px] text-muted-foreground block mb-0.5">예상단가</span>
                                                <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                                    <Banknote className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                    <span className="truncate">{formatPriceRange(item.priceVideo)}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground block mb-0.5">모먼트 일정</span>
                                                    <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                        <span className="truncate">{formatDateToMonth(item.eventDate) || "미정"}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground block mb-0.5">업로드 일정</span>
                                                    <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                                                        <Send className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                        {item.dateFlexible ? (
                                                            <span className="text-emerald-600 truncate">협의 가능</span>
                                                        ) : (
                                                            <span className="truncate">{formatDateToMonth(item.postingDate)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/70 line-clamp-2 h-12 leading-relaxed mb-3">{item.description}</p>

                                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-md p-2.5 mb-3">
                                            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium mb-1">📝 제작 가이드</p>
                                            <p className="text-xs text-amber-900/80 dark:text-amber-200/80 line-clamp-2 leading-relaxed h-8">
                                                {item.guide || "브랜드 가이드를 따르겠습니다."}
                                            </p>
                                        </div>

                                        {/* Preferred content types */}
                                        {item.channels && item.channels.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item.channels.map((ch: string) => {
                                                    const base = ch.split('_')[0]
                                                    const LABELS: Record<string, string> = {
                                                        instagram_reels: '🎞️ 릴스', instagram_feed: '📷 피드', instagram_story: '⭕ 스토리',
                                                        youtube_longform: '▶️ 롱폼', youtube_shorts: '⚡ 숏츠',
                                                    }
                                                    const BG: Record<string, string> = {
                                                        instagram: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600',
                                                        youtube: 'bg-gradient-to-r from-red-600 to-red-700',
                                                        tiktok: 'bg-gradient-to-r from-black to-slate-800',
                                                        blog: 'bg-gradient-to-r from-green-500 to-green-600',
                                                    }
                                                    return (
                                                        <span key={ch} className={`text-[10px] font-medium text-white px-2 py-0.5 rounded-full shadow-sm ${BG[base] || 'bg-slate-600'}`}>
                                                            {LABELS[ch] || ch}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="pb-4"></div>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <DiscoverTableView
                    filteredEvents={filteredEvents}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    deleteEvent={deleteEvent}
                    user={user}
                />
            )}

            <ConfirmDialog
                open={!!confirmDeleteId}
                onOpenChange={(open) => !open && setConfirmDeleteId(null)}
                title="모먼트 삭제"
                description="정말로 이 모먼트를 삭제하시겠습니까?"
                onConfirm={async () => {
                    if (confirmDeleteId) {
                        try {
                            await deleteEvent(confirmDeleteId)
                        } catch (error) {
                            toast.error("삭제에 실패했습니다.")
                        }
                        setConfirmDeleteId(null)
                    }
                }}
                confirmText="삭제"
                variant="destructive"
            />
        </div>
    )
})
