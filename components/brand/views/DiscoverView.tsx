"use client"

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { MomentGridCard } from "@/components/shared/MomentGridCard"
import { MomentTableView } from "@/components/shared/MomentTableView"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Check, FileText, Filter, Instagram, LayoutGrid, Music, Search, Star, Table as TableIcon, Youtube } from "lucide-react"
import React, { useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { useUnifiedProvider } from "@/components/providers/unified-provider"

interface DiscoverViewProps {
    // Component relies on useUnifiedProvider for state now.
}

const POPULAR_TAGS = [
    "🏡 리빙/인테리어", "푸드", "패션", "육아", "뷰티", "여행", "일상",
    "💻 테크/IT", "반려동물", "건강", "캠핑", "자기계발/도서"
]

const PRICE_FILTER_RANGES = [
    { k: 'all', l: '전체', min: 0, max: Infinity },
    { k: 'free', l: '제품협찬', s: '제품협찬', min: 0, max: 0 },
    { k: 'under10', l: '10만원 미만', s: '~10만', min: 1, max: 99999 },
    { k: '10to30', l: '10만원~30만원', s: '10~30만', min: 100000, max: 300000 },
    { k: 'over30', l: '30만원 이상', s: '30만+', min: 300000, max: Infinity },
]

const FOLLOWER_RANGES: Record<string, [number, number]> = {
    starter: [0, 1000], nano: [1000, 10000], micro: [10000, 100000],
    growing: [100000, 300000], mid: [300000, 500000], macro: [500000, 1000000], mega: [1000000, Infinity]
}

export const DiscoverView = React.memo(function DiscoverView({ }: DiscoverViewProps) {
    const { user, allMoments, favorites, toggleFavorite, deleteMoment, momentProposals } = useUnifiedProvider()

    // Filter Query States
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [followerFilter, setFollowerFilter] = useState<string[]>(["all"])
    const [scheduleFilter, setScheduleFilter] = useState<string[]>(["all"])
    const [scheduleMonthFilter, setScheduleMonthFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [minFollowers, setMinFollowers] = useState<string>("")
    const [maxFollowers, setMaxFollowers] = useState<string>("")
    const [sortOrder, setSortOrder] = useState("latest")
    const [priceFilter, setPriceFilter] = useState<string[]>(["all"])
    const [channelFilter, setChannelFilter] = useState<string[]>(["all"])

    const sentMomentIds = useMemo(() => {
        const ids = new Set<string>()
        if (momentProposals) {
            momentProposals.forEach((p: any) => {
                if (p.moment_id && p.status !== 'cancelled' && p.status !== 'rejected') {
                    ids.add(p.moment_id)
                }
            })
        }
        return ids
    }, [momentProposals])

    const handlePresetClick = useCallback((key: string) => {
        if (key === 'all') {
            setFollowerFilter(['all'])
            setMinFollowers('')
            setMaxFollowers('')
            return
        }
        setFollowerFilter(prev => {
            const withoutAll = prev.filter(k => k !== 'all')
            if (withoutAll.includes(key)) {
                const next = withoutAll.filter(k => k !== key)
                if (next.length === 0) return ['all']
                return next
            } else {
                return [...withoutAll, key]
            }
        })
        setMinFollowers('')
        setMaxFollowers('')
    }, [])

    const getFilteredAndSortedEvents = () => {
        let result = [...(allMoments || [])]
        if (selectedTags.length > 0) {
            result = result.filter(e =>
                selectedTags.some(tag =>
                    e.category === tag ||
                    e.tags?.some((t: string) => t.includes(tag) || tag.includes(t))
                )
            )
        }
        if (statusFilter === "upcoming") {
            result = result.filter(e => e.status !== 'completed')
        } else if (statusFilter === "past") {
            result = result.filter(e => e.status === 'completed')
        } else if (statusFilter === "favorites") {
            result = result.filter(e => favorites?.some(f => f.target_id === e.id && f.target_type === 'moment'))
        }
        if (!followerFilter.includes('all') && followerFilter.length > 0) {
            result = result.filter(e => {
                const count = e.followers || 0
                return followerFilter.some(key => {
                    const range = FOLLOWER_RANGES[key]
                    if (!range) return false
                    return count >= range[0] && count <= range[1]
                })
            })
        } else if (minFollowers !== '' || maxFollowers !== '') {
            const min = minFollowers === '' ? 0 : parseInt(minFollowers)
            const max = maxFollowers === '' ? Infinity : parseInt(maxFollowers)
            result = result.filter(e => {
                const count = e.followers || 0
                return count >= min && count <= max
            })
        }
        if (!priceFilter.includes('all') && priceFilter.length > 0) {
            result = result.filter(e => {
                const price = e.priceVideo || 0
                return priceFilter.some(key => {
                    const range = PRICE_FILTER_RANGES.find(r => r.k === key)
                    if (!range) return false
                    return price >= range.min && price <= range.max
                })
            })
        }
        if (scheduleMonthFilter !== 'all') {
            result = result.filter(e => {
                if (!e.momentStartDate) return false;
                return e.momentStartDate.startsWith(scheduleMonthFilter);
            });
        }
        if (!scheduleFilter.includes('all') && scheduleFilter.length > 0) {
            result = result.filter(e => {
                const getDay = (dateStr: string | null | undefined) => {
                    if (!dateStr) return null;
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return null;
                    return d.getDate();
                };
                const startDay = getDay(e.momentStartDate);
                return scheduleFilter.some((key: string) => {
                    if (!startDay) return false;
                    if (key === 'early' && startDay <= 10) return true;
                    if (key === 'mid' && startDay > 10 && startDay <= 20) return true;
                    if (key === 'late' && startDay > 20) return true;
                    return false;
                });
            });
        }
        if (!channelFilter.includes('all') && channelFilter.length > 0) {
            result = result.filter(e => {
                const channels: string[] = e.channels || []
                return channelFilter.some(cf => channels.some(ch => ch.startsWith(cf)))
            })
        }
        if (sortOrder === "deadline") result.reverse()
        else if (sortOrder === "match") result.sort(() => Math.random() - 0.5)
        else if (sortOrder === "verified") result = result.filter(e => (e as any).verified)
        else if (sortOrder === "followers_high") result.sort((a, b) => (b.followers || 0) - (a.followers || 0))
        else if (sortOrder === "followers_low") result.sort((a, b) => (a.followers || 0) - (b.followers || 0))
        else if (sortOrder === "moment_date_asc") result.sort((a, b) => {
            const da = new Date(a.momentDate || a.date || 0).getTime()
            const db = new Date(b.momentDate || b.date || 0).getTime()
            return da - db
        })
        else if (sortOrder === "posting_date_asc") result.sort((a, b) => {
            const da = new Date(a.postingDate || a.momentDate || a.date || 0).getTime()
            const db = new Date(b.postingDate || b.momentDate || b.date || 0).getTime()
            return da - db
        })
        else if (sortOrder === "price_low") result.sort((a, b) => (a.priceVideo || 0) - (b.priceVideo || 0))
        else if (sortOrder === "price_high") result.sort((a, b) => (b.priceVideo || 0) - (a.priceVideo || 0))
        else if (sortOrder === "proposal_low") result.sort((a, b) => {
            const aCount = (momentProposals || []).filter((p: any) => p.moment_id === a.id || p.moment_id === a.id).length
            const bCount = (momentProposals || []).filter((p: any) => p.moment_id === b.id || p.moment_id === b.id).length
            return aCount - bCount
        })
        else if (sortOrder === "favorites_high") result.sort((a, b) => {
            const aCount = (favorites || []).filter((f: any) => f.target_id === a.id && f.target_type === 'moment').length
            const bCount = (favorites || []).filter((f: any) => f.target_id === b.id && f.target_type === 'moment').length
            return bCount - aCount
        })
        if (sortOrder === "latest") result.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
        return result
    }

    const filteredEvents = getFilteredAndSortedEvents()
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [pageSize, setPageSize] = useState<20 | 50 | 100>(50)
    const [searchQuery, setSearchQuery] = useState("")
    const [favoritesOnly, setFavoritesOnly] = useState(false)

    // Apply local search + favorites on top of parent-filtered list
    const displayedEvents = filteredEvents.filter((item) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = !q ||
            (item.influencer || "").toLowerCase().includes(q) ||
            (item.category || "").toLowerCase().includes(q) ||
            (item.tags || []).some((t: string) => t.toLowerCase().includes(q))
        const matchesFav = !favoritesOnly ||
            (favorites || []).some((f: any) => f.target_id === item.id && f.target_type === 'moment')
        return matchesSearch && matchesFav
    })

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
            {/* 헤더 */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* 왼쪽: 제목 + 모바일 뷰토글 */}
                <div className="shrink-0">
                    <div className="flex items-center justify-between gap-2 md:block">
                        <h1 className="text-3xl font-bold tracking-tight">모먼트 검색</h1>
                        {/* 모바일 전용: 상태 토글 + 빷트그룹 */}
                        <div className="flex md:hidden items-center gap-1.5 shrink-0">
                            <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-lg">
                                {([
                                    { v: 'upcoming', l: '모집중' },
                                    { v: 'past', l: '완료' },
                                ] as { v: string; l: string }[]).map(({ v, l }) => (
                                    <button
                                        key={v}
                                        onClick={() => setStatusFilter(statusFilter === v ? 'all' : v as 'all' | 'upcoming' | 'past')}
                                        className={`px-2 h-7 rounded-md text-xs font-medium transition-colors ${statusFilter === v
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >{l}</button>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                                <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('table')} title="테이블형">
                                    <TableIcon className="h-4 w-4" />
                                </Button>
                                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('grid')} title="그리드형">
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">우리 브랜드와 딱 맞는 모먼트를 가진 크리에이터를 찾아보세요.</p>
                </div>
                {/* 오른쪽: 즐겨찾기 + 검색 + 20/50/100 + 뷰토글 + 정렬 */}
                <div className="flex w-full md:max-w-2xl items-center gap-2">
                    {/* 즐겨찾기 */}
                    <Button
                        variant={favoritesOnly ? "secondary" : "outline"}
                        size="icon"
                        onClick={() => setFavoritesOnly(!favoritesOnly)}
                        className={favoritesOnly ? "bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200 h-10 w-10" : "text-muted-foreground h-10 w-10"}
                        title="즐겨찾기만 보기"
                    >
                        <Star className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`} />
                    </Button>
                    {/* 인스타 API 인증 필터 */}
                    <Button
                        variant={sortOrder === 'verified' ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'verified' ? 'latest' : 'verified')}
                        className={sortOrder === 'verified' ? "bg-pink-100 text-pink-600 border-pink-200 hover:bg-pink-200 shrink-0 gap-1.5 h-10" : "text-muted-foreground shrink-0 gap-1.5 h-10"}
                        title="Instagram API 인증됨만 보기"
                    >
                        <Instagram className="h-4 w-4" />
                        <span className="text-xs font-medium">연결</span>
                    </Button>
                    {/* 검색 */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="모먼트 검색"
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* 페이지사이즈 — 데스크탑만 */}
                    <div className="hidden md:flex items-center gap-0.5 border border-border rounded-lg p-0.5 shrink-0 h-10">
                        {([20, 50, 100] as const).map(n => (
                            <button key={n} onClick={() => setPageSize(n)}
                                className={`px-2.5 h-full rounded-md text-sm font-medium transition-colors ${pageSize === n ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >{n}</button>
                        ))}
                    </div>
                    {/* 뷰 토글 — 데스크탑만 */}
                    <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg shrink-0">
                        <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('table')} title="테이블형">
                            <TableIcon className="h-4 w-4" />
                        </Button>
                        <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')} title="그리드형">
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    {/* 정렬 드롭다운 */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 shrink-0">
                                <Filter className="h-4 w-4" />
                                <span className="hidden md:inline">{{
                                    latest: "최신 등록순",
                                    followers_high: "팔로워 많은순",
                                    followers_low: "팔로워 적은순",
                                    verified: "인증 크리에이터",
                                    moment_date_asc: "이벤트 임박순",
                                    posting_date_asc: "업로드 임박순",
                                    price_low: "단가 낮은순",
                                    price_high: "단가 높은순",
                                    proposal_low: "💌 제안 적은순",
                                    favorites_high: "⭐ 찜 많은순",
                                }[sortOrder] ?? "정렬"}</span>
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
                                <DropdownMenuRadioItem value="moment_date_asc">📅 이벤트 임박순</DropdownMenuRadioItem>
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
                        <span className="text-sm font-semibold md:w-24">팔로워 규모</span>
                        <div className="grid grid-cols-4 gap-1 md:flex md:flex-wrap md:gap-2">
                            {[
                                { k: "all", l: "전체", s: "전체" },
                                { k: "starter", l: "스타터 (0~1천)", s: "0~1천" },
                                { k: "nano", l: "나노 (1천~1만)", s: "1천~1만" },
                                { k: "micro", l: "마이크로 (1~10만)", s: "1~10만" },
                                { k: "growing", l: "그로잉 (10~30만)", s: "10~30만" },
                                { k: "mid", l: "미드 (30~50만)", s: "30~50만" },
                                { k: "macro", l: "매크로 (50~100만)", s: "50~100만" },
                                { k: "mega", l: "메가 (>100만)", s: "100만+" }
                            ].map(opt => (
                                <Button
                                    key={opt.k}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePresetClick(opt.k)}
                                    className={cn('gap-1.5 w-full md:w-auto justify-start', followerFilter.includes(opt.k) && 'bg-primary/10 text-primary font-medium')}
                                >
                                    <span className="md:hidden">{opt.s}</span>
                                    <span className="hidden md:inline">{opt.l}</span>
                                    {followerFilter.includes(opt.k) && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {/* 모먼트 상태 필터 — 데스크탑만 */}
                    <div className="hidden md:flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold md:w-24 pt-1">모먼트 상태</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            <Button variant="ghost" size="sm" onClick={() => setStatusFilter("all")}
                                className={cn('gap-1.5', statusFilter === "all" && 'bg-primary/10 text-primary font-medium')}>
                                전체보기
                                {statusFilter === "all" && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setStatusFilter("upcoming")}
                                className={cn('gap-1.5', statusFilter === "upcoming" && 'bg-primary/10 text-primary font-medium')}>
                                모집중인 모먼트
                                {statusFilter === "upcoming" && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setStatusFilter("past")}
                                className={cn('gap-1.5', statusFilter === "past" && 'bg-primary/10 text-primary font-medium')}>
                                완료된 모먼트
                                {statusFilter === "past" && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold md:w-24 pt-1">영상 단가</span>
                        <div className="grid grid-cols-4 gap-1 md:flex md:flex-wrap md:gap-2 flex-1">
                            {PRICE_FILTER_RANGES.map(range => (
                                <Button key={range.k} variant="ghost" size="sm"
                                    onClick={() => toggleMulti(setPriceFilter as any, range.k, PRICE_FILTER_RANGES.filter(r => r.k !== 'all').map(r => r.k))}
                                    className={cn('gap-1.5 w-full md:w-auto justify-start', priceFilter.includes(range.k) && 'bg-primary/10 text-primary font-medium')}>
                                    <span className="md:hidden">{(range as any).s ?? range.l}</span>
                                    <span className="hidden md:inline">{range.l}</span>
                                    {priceFilter.includes(range.k) && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {/* [Item 4-1] Schedule Filter (Moment Date Only & Year/Month) */}
                    <div className="flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold md:w-24 mt-1">모먼트 일정</span>
                        <div className="grid grid-cols-4 gap-1 md:flex md:flex-wrap md:gap-2 flex-1 items-center">
                            <Input
                                type="month"
                                className="h-8 md:w-auto text-xs w-[130px] font-medium col-span-4 md:col-span-1"
                                value={scheduleMonthFilter === 'all' ? '' : scheduleMonthFilter}
                                onChange={(e) => setScheduleMonthFilter?.(e.target.value || 'all')}
                            />
                            {[
                                { k: 'all', l: '시기 전체', s: '전체' },
                                { k: 'early', l: '초순', s: '초순' },
                                { k: 'mid', l: '중순', s: '중순' },
                                { k: 'late', l: '하순', s: '하순' },
                            ].map(opt => (
                                <Button key={opt.k} variant="ghost" size="sm"
                                    onClick={() => setScheduleFilter && toggleMulti(setScheduleFilter as any, opt.k, ['early', 'mid', 'late'])}
                                    className={cn('gap-1.5 w-full md:w-auto justify-start', scheduleFilter?.includes(opt.k) && 'bg-primary/10 text-primary font-medium')}>
                                    <span className="md:hidden">{opt.s}</span>
                                    <span className="hidden md:inline">{opt.l}</span>
                                    {scheduleFilter?.includes(opt.k) && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold md:w-24 pt-1">희망 채널</span>
                        <div className="grid grid-cols-4 gap-1 md:flex md:flex-wrap md:gap-2 flex-1">
                            {[
                                { k: 'all', l: '전체', s: '전체', icon: null },
                                { k: 'instagram', l: 'Instagram', s: 'Insta', icon: <Instagram className="h-3 w-3" /> },
                                { k: 'youtube', l: 'YouTube', s: 'Youtube', icon: <Youtube className="h-3 w-3" /> },
                                { k: 'tiktok', l: 'TikTok', s: 'Tiktok', icon: <Music className="h-3 w-3" /> },
                                { k: 'blog', l: 'Blog', s: 'Blog', icon: <FileText className="h-3 w-3" /> },
                            ].map(opt => (
                                <Button key={opt.k} variant="ghost" size="sm"
                                    onClick={() => setChannelFilter && toggleMulti(setChannelFilter as any, opt.k, ['instagram', 'youtube', 'tiktok', 'blog'])}
                                    className={cn("gap-1.5 w-full md:w-auto justify-start", channelFilter?.includes(opt.k) && 'bg-primary/10 text-primary font-medium')}>
                                    {opt.icon}
                                    <span className="md:hidden">{opt.s}</span>
                                    <span className="hidden md:inline">{opt.l}</span>
                                    {channelFilter?.includes(opt.k) && <Check className="h-3 w-3 text-red-500" strokeWidth={3} />}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {/* Instagram 인증 필터 — 데스크탑만 */}
                    <div className="hidden md:flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold md:w-24 pt-1">Instagram</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            <Button variant="ghost" size="sm" onClick={() => setSortOrder('latest')}
                                className={cn('gap-1.5', sortOrder !== 'verified' && 'bg-primary/10 text-primary font-medium')}>
                                전체
                                {sortOrder !== 'verified' && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setSortOrder('verified')}
                                className={cn('gap-1.5', sortOrder === 'verified' && 'bg-primary/10 text-primary font-medium')}>
                                <Instagram className="h-3.5 w-3.5 text-pink-500" />
                                API 인증됨
                                {sortOrder === 'verified' && <Check className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />}
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 md:items-start pt-1 border-t border-border/40">
                        <span className="text-sm font-semibold md:w-24 pt-1">전문 분야</span>
                        <div className="grid grid-cols-4 gap-1 md:flex md:flex-wrap md:gap-2 flex-1">
                            {/* 모바일 축약 레이블 매핑 */}
                            {(() => {
                                const SHORT: Record<string, string> = {
                                    '🏡 리빙/인테리어': '🏡 인테리어',
                                    '📚 도서/자기계발': '📚 자기계발',
                                    '💉 시술/병원': '💉 시술',
                                    '💍 웨딩/결혼': '💍 웨딩',
                                    '🏋️ 헬스/운동': '🏋️ 헬스',
                                    '💻 테크/IT': '💻 테크',
                                    '🎓 교육/강의': '🎓 교육',
                                    '🎬 영화/문화': '🎬 문화',
                                    '🎨 취미/DIY': '🎨 취미',
                                }
                                return (
                                    <>
                                        <Button
                                            variant="ghost" size="sm"
                                            onClick={() => setSelectedTags([])}
                                            className={cn('gap-1.5 w-full md:w-auto justify-start', selectedTags.length === 0 && 'bg-primary/10 text-primary font-medium')}
                                        >
                                            전체
                                            {selectedTags.length === 0 && <Check className="h-3 w-3 text-red-500" strokeWidth={3} />}
                                        </Button>
                                        {POPULAR_TAGS.map(tag => (
                                            <Button
                                                key={tag}
                                                variant="ghost" size="sm"
                                                onClick={() => {
                                                    setSelectedTags((prev: string[]) => {
                                                        if (prev.includes(tag)) return prev.filter(t => t !== tag)
                                                        return [...prev, tag]
                                                    })
                                                }}
                                                className={cn('gap-1.5 w-full md:w-auto justify-start', selectedTags.includes(tag) && 'bg-primary/10 text-primary font-medium')}
                                            >
                                                <span className="md:hidden">{SHORT[tag] ?? tag}</span>
                                                <span className="hidden md:inline">{tag}</span>
                                                {selectedTags.includes(tag) && <Check className="h-3 w-3 text-red-500" strokeWidth={3} />}
                                            </Button>
                                        ))}
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {displayedEvents.length > pageSize && (
                <p className="text-xs text-muted-foreground text-right -mb-2">
                    총 {displayedEvents.length}개 중 최신 {pageSize}개 표시
                </p>
            )}
            {viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayedEvents.slice(0, pageSize).map((item) => {
                        const isFavorite = (favorites || []).some((f: any) => f.target_id === item.id && f.target_type === 'moment')
                        return (
                            <MomentGridCard
                                key={item.id}
                                item={item}
                                creator={{
                                    id: item.creatorId || item.id,
                                    name: item.influencer,
                                    avatar: item.avatar,
                                    followers: item.followers,
                                    primaryChannel: (item as any).primaryChannel,
                                }}
                                href={`/moment/${item.id}`}
                                isFavorite={isFavorite}
                                toggleFavorite={toggleFavorite as any}
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
                    items={displayedEvents.slice(0, pageSize)}
                    getCreator={(item) => ({
                        name: item.influencer,
                        avatar: item.avatar,
                        followers: item.followers,
                        primaryChannel: (item as any).primaryChannel,
                    })}
                    favorites={favorites || []}
                    toggleFavorite={toggleFavorite as any}
                    linkToMoment={true}
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
                            await deleteMoment(confirmDeleteId)
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
