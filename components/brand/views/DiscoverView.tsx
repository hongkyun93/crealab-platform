"use client"

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { MomentGridCard } from "@/components/shared/MomentGridCard"
import { MomentTableView } from "@/components/shared/MomentTableView"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Check, FileText, Filter, Instagram, LayoutGrid, Music, Star, Table as TableIcon, Youtube } from "lucide-react"
import React, { useState } from "react"
import { toast } from "sonner"

interface DiscoverViewProps {
    filteredEvents: any[]
    sortOrder: string
    setSortOrder: (order: string) => void
    followerFilter: string[]
    statusFilter: string
    setStatusFilter: (status: string) => void
    selectedTags: string[]
    setSelectedTags: (tags: string[] | ((prev: string[]) => string[])) => void
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
    sentMomentIds?: Set<string>
}



export const DiscoverView = React.memo(function DiscoverView({
    filteredEvents,
    sortOrder,
    setSortOrder,
    followerFilter,
    statusFilter,
    setStatusFilter,
    selectedTags,
    setSelectedTags,
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
    sentMomentIds,
}: DiscoverViewProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [pageSize, setPageSize] = useState<20 | 50 | 100>(50)

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
                <div className="flex gap-2 items-center">
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5">
                        {([20, 50, 100] as const).map(n => (
                            <button
                                key={n}
                                onClick={() => setPageSize(n)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${pageSize === n
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    {/* View Switcher */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
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
                                {{
                                    latest: "최신 등록순",
                                    followers_high: "팔로워 많은순",
                                    followers_low: "팔로워 적은순",
                                    verified: "인증 크리에이터",
                                    event_date_asc: "이벤트 임박순",
                                    posting_date_asc: "업로드 임박순",
                                    price_low: "단가 낮은순",
                                    price_high: "단가 높은순",
                                    proposal_low: "💌 제안 적은순",
                                    favorites_high: "⭐ 찜 많은순",
                                }[sortOrder] ?? "정렬"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>정렬 기준</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                                <DropdownMenuRadioItem value="latest">최신 등록순</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">팔로워</DropdownMenuLabel>
                                <DropdownMenuRadioItem value="followers_high">팔로워 많은순</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="followers_low">팔로워 적은순 (마이크로)</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">일정</DropdownMenuLabel>
                                <DropdownMenuRadioItem value="event_date_asc">📅 이벤트 임박순</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="posting_date_asc">📅 업로드 임박순</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">단가</DropdownMenuLabel>
                                <DropdownMenuRadioItem value="price_low">💰 단가 낮은순</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="price_high">💰 단가 높은순</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">경쟁도</DropdownMenuLabel>
                                <DropdownMenuRadioItem value="proposal_low">💌 제안 적게 받은순 (블루오션)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="favorites_high">⭐ 찜 많은순 (인기)</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioItem value="verified">인증된 크리에이터</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-background/50 backdrop-blur-sm">
                <CardContent className="p-4 space-y-1">
                    <div className="flex flex-col md:flex-row gap-2 md:items-center">
                        <span className="text-sm font-semibold w-24">팔로워 규모</span>
                        <div className="flex flex-nowrap overflow-x-auto gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                                    className={cn('gap-1.5 whitespace-nowrap', followerFilter.includes(opt.k) && 'bg-primary/10 text-primary font-medium')}
                                >
                                    {opt.l}
                                    {followerFilter.includes(opt.k) && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-1">모먼트 상태</span>
                        <div className="flex flex-nowrap overflow-x-auto gap-2 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter("all")}
                                className={cn('gap-1.5 whitespace-nowrap', statusFilter === "all" && 'bg-primary/10 text-primary font-medium')}
                            >
                                전체보기
                                {statusFilter === "all" && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter("upcoming")}
                                className={cn('gap-1.5 whitespace-nowrap', statusFilter === "upcoming" && 'bg-primary/10 text-primary font-medium')}
                            >
                                모집중인 모먼트
                                {statusFilter === "upcoming" && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter("past")}
                                className={cn('gap-1.5 whitespace-nowrap', statusFilter === "past" && 'bg-primary/10 text-primary font-medium')}
                            >
                                완료된 모먼트
                                {statusFilter === "past" && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter("favorites")}
                                className={cn("gap-1.5 whitespace-nowrap", statusFilter === "favorites" && 'bg-primary/10 text-primary font-medium')}
                            >
                                <Star className="h-3.5 w-3.5 text-yellow-500" fill={statusFilter === "favorites" ? "currentColor" : "none"} />
                                즐겨찾기만 보기
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-1">영상 단가</span>
                        <div className="flex flex-nowrap overflow-x-auto gap-2 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                    <div className="flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-1">희망 채널</span>
                        <div className="flex flex-nowrap overflow-x-auto gap-2 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                    {/* Instagram 인증 필터 */}
                    <div className="flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-1">Instagram</span>
                        <div className="flex flex-nowrap overflow-x-auto gap-2 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSortOrder('latest')}
                                className={cn('gap-1.5', sortOrder !== 'verified' && 'bg-primary/10 text-primary font-medium')}
                            >
                                전체
                                {sortOrder !== 'verified' && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSortOrder('verified')}
                                className={cn('gap-1.5', sortOrder === 'verified' && 'bg-primary/10 text-primary font-medium')}
                            >
                                <Instagram className="h-3.5 w-3.5 text-pink-500" />
                                API 인증됨
                                {sortOrder === 'verified' && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-1">전문 분야</span>
                        <div className="flex flex-nowrap overflow-x-auto gap-2 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTags([])}
                                className={cn('gap-1.5', selectedTags.length === 0 && 'bg-primary/10 text-primary font-medium')}
                            >
                                전체
                                {selectedTags.length === 0 && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            {POPULAR_TAGS.map(tag => (
                                <Button
                                    key={tag}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedTags((prev: string[]) => {
                                            if (prev.includes(tag)) {
                                                return prev.filter(t => t !== tag)
                                            } else {
                                                return [...prev, tag]
                                            }
                                        })
                                    }}
                                    className={cn('gap-1.5', selectedTags.includes(tag) && 'bg-primary/10 text-primary font-medium')}
                                >
                                    {tag}
                                    {selectedTags.includes(tag) && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredEvents.length > pageSize && (
                <p className="text-xs text-muted-foreground text-right -mb-2">
                    총 {filteredEvents.length}개 중 최신 {pageSize}개 표시
                </p>
            )}
            {viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredEvents.slice(0, pageSize).map((item) => {
                        const isFavorite = favorites.some(f => f.target_id === item.id && f.target_type === 'event')
                        return (
                            <MomentGridCard
                                key={item.id}
                                item={item}
                                creator={{
                                    id: item.influencerId || item.id,
                                    name: item.influencer,
                                    avatar: item.avatar,
                                    followers: item.followers,
                                    primaryChannel: (item as any).primaryChannel,
                                }}
                                href={`/event/${item.id}`}
                                isFavorite={isFavorite}
                                toggleFavorite={toggleFavorite}
                                showProfileCard={true}
                                onAdminDelete={(id) => setConfirmDeleteId(id)}
                                userRole={user?.role}
                                isPast={item.status === 'completed'}
                                hasSentProposal={sentMomentIds?.has(item.id)}
                            />
                        )
                    })}
                </div>
            ) : (
                <MomentTableView
                    items={filteredEvents.slice(0, pageSize)}
                    getCreator={(item) => ({
                        name: item.influencer,
                        avatar: item.avatar,
                        followers: item.followers,
                        primaryChannel: (item as any).primaryChannel,
                    })}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    linkToEvent={true}
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
