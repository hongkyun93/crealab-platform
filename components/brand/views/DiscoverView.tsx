"use client"

import React from "react"
import Link from "next/link"
import { Filter, Star, Calendar, Gift, Send, Trash2 } from "lucide-react"
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
import { formatDateToMonth } from "@/lib/utils"

interface DiscoverViewProps {
    filteredEvents: any[]
    sortOrder: string
    setSortOrder: (order: string) => void
    followerFilter: string
    statusFilter: string
    setStatusFilter: (status: string) => void
    selectedTag: string | null
    setSelectedTag: (tag: string | null) => void
    handlePresetClick: (key: string) => void
    favorites: any[]
    toggleFavorite: (id: string, type: string) => void
    priceFilter: string
    setPriceFilter: (filter: string) => void
    POPULAR_TAGS: string[]
    PRICE_FILTER_RANGES: any[]
    user: any
    deleteEvent: (id: string) => Promise<void>
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
    deleteEvent
}: DiscoverViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">모먼트 검색</h1>
                    <p className="text-muted-foreground mt-1">우리 브랜드와 딱 맞는 모먼트를 가진 크리에이터를 찾아보세요.</p>
                </div>
                <div className="flex gap-2">
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
                <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                        <span className="text-sm font-semibold w-24">팔로워 규모</span>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { k: "all", l: "전체" },
                                { k: "nano", l: "나노 (<1만)" },
                                { k: "micro", l: "마이크로 (1~10만)" },
                                { k: "growing", l: "그로잉 (10~30만)" },
                                { k: "mid", l: "미드 (30~50만)" },
                                { k: "macro", l: "매크로 (50~100만)" },
                                { k: "mega", l: "메가 (>100만)" }
                            ].map(opt => (
                                <Button
                                    key={opt.k}
                                    variant={followerFilter === opt.k ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePresetClick(opt.k)}
                                    className="rounded-full"
                                >
                                    {opt.l}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:items-start">
                        <span className="text-sm font-semibold w-24 pt-2">모먼트 상태</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            <Button
                                variant={statusFilter === "all" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setStatusFilter("all")}
                            >
                                전체보기
                            </Button>
                            <Button
                                variant={statusFilter === "upcoming" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setStatusFilter("upcoming")}
                            >
                                나의 모먼트
                            </Button>
                            <Button
                                variant={statusFilter === "past" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setStatusFilter("past")}
                            >
                                지나간 모먼트
                            </Button>
                            <Button
                                variant={statusFilter === "favorites" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setStatusFilter("favorites")}
                                className="gap-1.5"
                            >
                                <Star className="h-3.5 w-3.5 text-yellow-500" fill={statusFilter === "favorites" ? "currentColor" : "none"} />
                                즐겨찾기만 보기
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:items-start pt-2 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-2">영상 단가</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            {PRICE_FILTER_RANGES.map(range => (
                                <Button
                                    key={range.k}
                                    variant={priceFilter === range.k ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setPriceFilter(range.k)}
                                >
                                    {range.l}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 md:items-start pt-2 border-t border-border/40">
                        <span className="text-sm font-semibold w-24 pt-2">전문 분야</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            <Button
                                variant={selectedTag === null ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setSelectedTag(null)}
                            >
                                전체
                            </Button>
                            {POPULAR_TAGS.map(tag => (
                                <Button
                                    key={tag}
                                    variant={selectedTag === tag ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    className={selectedTag === tag ? 'bg-primary/10 text-primary' : ''}
                                >
                                    {tag}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg overflow-hidden">
                                        {item.avatar && item.avatar.startsWith('http') ? (
                                            <img src={item.avatar} alt={item.influencer} className="h-full w-full object-cover" />
                                        ) : (
                                            item.avatar
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold truncate">{item.influencer}</h4>
                                            {user?.type === 'admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-red-500 rounded-full"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (confirm("정말로 이 모먼트를 삭제하시겠습니까?")) {
                                                            deleteEvent(item.id).catch(() => alert("삭제에 실패했습니다."));
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{item.handle}</p>
                                        <span className="text-[10px] font-medium bg-secondary/50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                            {(item.followers || 0).toLocaleString()} 팔로워
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 flex-1 relative">
                                    {item.status === 'completed' && (
                                        <div className="absolute top-[-26px] right-4 z-10">
                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                                지나간 모먼트
                                            </span>
                                        </div>
                                    )}
                                    <h3 className="font-bold text-base line-clamp-2 mb-2">{item.event}</h3>

                                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-3 bg-muted/30 p-2 rounded-lg">
                                        {item.targetProduct && (
                                            <div className="flex items-center gap-2">
                                                <Gift className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                <span className="font-medium">희망제품:</span>
                                                <span className="truncate flex-1">{item.targetProduct}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                            <span className="font-medium">모먼트일:</span>
                                            {formatDateToMonth(item.eventDate) || "미정"}
                                        </div>
                                        {item.postingDate && (
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Send className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="font-medium">예상업로드:</span>
                                                {item.dateFlexible ? (
                                                    <Badge variant="secondary" className="text-[10px] px-1 py-0 mr-1 h-5 text-emerald-600 bg-emerald-50 border-emerald-100">협의가능</Badge>
                                                ) : (
                                                    formatDateToMonth(item.postingDate)
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-foreground/70 line-clamp-3">{item.description}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {item.tags.slice(0, 3).map(t => (
                                            <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>
                                        ))}
                                    </div>
                                </CardContent>
                                <div className="pb-4"></div>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
})
