"use client"

import { CampaignCardA } from "@/components/creator/campaign-cards/CampaignCardA"
import { CampaignCardE } from "@/components/creator/campaign-cards/CampaignCardE"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { POPULAR_TAGS } from "@/lib/constants/categories"
import {
    LayoutGrid,
    List,
    Megaphone,
    Search,
    Star,
} from "lucide-react"
import React, { useState, useEffect } from "react"

interface CampaignBrowseViewProps {
    /** 전체 캠페인 배열 */
    campaigns: any[]
    /** 지원자 수 맵 (campaign_id → count) */
    applicantCounts: Record<string, number>
    /** 즐겨찾기 목록 (toggleFavorite 지원 시 전달) */
    favorites?: any[]
    /** 카드 클릭 핸들러 */
    onCampaignClick: (campaign: any) => void
    /** 지원하기 버튼 핸들러 (브랜드는 null/undefined 가능) */
    onApply?: (e: React.MouseEvent, campaign: any) => void
    /** 헤더 제목 (기본: 브랜드 캠페인 둘러보기) */
    title?: string
    /** 헤더 부제목 */
    description?: string
}

export function CampaignBrowseView({
    campaigns,
    applicantCounts,
    favorites,
    onCampaignClick,
    onApply,
    title = "브랜드 캠페인 둘러보기",
    description = "브랜드가 등록한 캠페인을 확인하세요.",
}: CampaignBrowseViewProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [tagFilter, setTagFilter] = useState<string[]>([])
    const [pageSize, setPageSize] = useState<20 | 50 | 100>(20)
    const [favoritesOnly, setFavoritesOnly] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all")

    const filteredCampaigns = campaigns.filter((c) => {
        if (statusFilter === "active" && c.status !== "active") return false
        if (statusFilter === "closed" && c.status !== "closed") return false
        const q = searchQuery.toLowerCase()
        const matchesSearch =
            !q ||
            (c.title || "").toLowerCase().includes(q) ||
            (c.brand || "").toLowerCase().includes(q) ||
            (c.category || "").toLowerCase().includes(q) ||
            (c.description || "").toLowerCase().includes(q)
        const matchesTag =
            tagFilter.length === 0 ||
            tagFilter.some((tag) => {
                const tagWord = tag.replace(/^.{1,2} /, "").toLowerCase()
                return (
                    (c.category || "").toLowerCase().includes(tagWord) ||
                    (c.tags || []).some((t: string) =>
                        t.toLowerCase().includes(tagWord)
                    )
                )
            })
        const matchesFav =
            !favoritesOnly ||
            favorites?.some(
                (f: any) => f.target_id === c.id && f.target_type === "campaign"
            )
        return matchesSearch && matchesTag && matchesFav
    })

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* 헤더 */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="shrink-0">
                    <div className="flex items-center justify-between gap-2 md:block">
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        {/* 모바일 전용 뷰 토글 */}
                        <div className="flex md:hidden items-center gap-1 bg-muted p-1 rounded-lg shrink-0">
                            <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("list")} title="리스트형">
                                <List className="h-4 w-4" />
                            </Button>
                            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("grid")} title="그리드형">
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">{description}</p>
                </div>
                <div className="flex w-full max-w-4xl items-center gap-2">
                    {/* 상태 탭 */}
                    <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5 shrink-0 h-10">
                        {(
                            [
                                ["all", "전체"],
                                ["active", "모집중"],
                                ["closed", "마감"],
                            ] as const
                        ).map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => setStatusFilter(val)}
                                className={`px-2.5 h-full rounded-md text-sm font-medium transition-colors ${statusFilter === val
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* 즐겨찾기 버튼 (favorites prop 있을 때만) */}
                    {favorites !== undefined && (
                        <Button
                            variant={favoritesOnly ? "secondary" : "outline"}
                            size="icon"
                            onClick={() => setFavoritesOnly(!favoritesOnly)}
                            className={
                                favoritesOnly
                                    ? "bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200"
                                    : "text-muted-foreground"
                            }
                            title="즐겨찾기만 보기"
                        >
                            <Star
                                className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`}
                            />
                        </Button>
                    )}

                    {/* 검색 */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="캠페인 검색"
                            className="pl-9 sm:hidden"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Input
                            placeholder="캠페인명, 브랜드, 카테고리 검색"
                            className="pl-9 hidden sm:block"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* 페이지 사이즈 */}
                    <div className="hidden md:flex items-center gap-0.5 border border-border rounded-lg p-0.5 shrink-0 h-10">
                        {([20, 50, 100] as const).map((n) => (
                            <button
                                key={n}
                                onClick={() => setPageSize(n)}
                                className={`px-2.5 h-full rounded-md text-sm font-medium transition-colors ${pageSize === n
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>

                    {/* 뷰 모드 */}
                    <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg shrink-0">
                        <Button
                            variant={viewMode === "list" ? "default" : "ghost"}
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => setViewMode("list")}
                            title="리스트형"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "grid" ? "default" : "ghost"}
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => setViewMode("grid")}
                            title="그리드형"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 태그 필터 */}
            <div className="grid grid-cols-4 gap-1.5 md:flex md:flex-wrap md:gap-2">
                <button
                    onClick={() => setTagFilter([])}
                    className={`w-full md:w-auto text-center px-1 md:px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${tagFilter.length === 0
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                >
                    전체
                </button>
                {POPULAR_TAGS.map((tag) => (
                    <button
                        key={tag}
                        onClick={() =>
                            setTagFilter((prev) =>
                                prev.includes(tag)
                                    ? prev.filter((t) => t !== tag)
                                    : [...prev, tag]
                            )
                        }
                        className={`w-full md:w-auto text-center px-1 md:px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${tagFilter.includes(tag)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                    >
                        <span className="md:hidden">
                            {tag === "🏡 리빙/인테리어"
                                ? "🏡 인테리어"
                                : tag === "📚 도서/자기계발"
                                    ? "📚 자기계발"
                                    : tag}
                        </span>
                        <span className="hidden md:inline">{tag}</span>
                    </button>
                ))}
            </div>

            {/* 카드 목록 */}
            {filteredCampaigns.length === 0 ? (
                <Card className="p-20 text-center border-dashed bg-muted/20">
                    <Megaphone className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                        검색 결과가 없습니다.
                    </h3>
                </Card>
            ) : (
                <div
                    className={`grid gap-6 ${viewMode === "list"
                        ? "grid-cols-1"
                        : "md:grid-cols-3 xl:grid-cols-4"
                        }`}
                >
                    {filteredCampaigns.slice(0, pageSize).map((camp) => (
                        <div
                            key={camp.id}
                            className={viewMode === "list" ? "w-full" : ""}
                        >
                            {viewMode === "grid" && (
                                <CampaignCardA
                                    campaign={camp}
                                    applicantCount={applicantCounts[camp.id] ?? 0}
                                    onClick={() => onCampaignClick(camp)}
                                    onApply={(e: React.MouseEvent) => {
                                        if (onApply) { e.stopPropagation(); onApply(e, camp) }
                                    }}
                                />
                            )}
                            {viewMode === "list" && (
                                <CampaignCardE
                                    campaign={camp}
                                    applicantCount={applicantCounts[camp.id] ?? 0}
                                    onClick={() => onCampaignClick(camp)}
                                    onApply={(e: React.MouseEvent) => {
                                        if (onApply) { e.stopPropagation(); onApply(e, camp) }
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
