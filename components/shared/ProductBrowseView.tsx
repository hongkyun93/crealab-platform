"use client"

import { BrandProductDiscoveryView } from "@/components/creator/views/BrandProductDiscoveryView"
import { BrandProductListView } from "@/components/creator/views/BrandProductListView"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { POPULAR_TAGS } from "@/lib/constants/categories"
import {
    LayoutGrid,
    List,
    Search,
    ShoppingBag,
    Star,
} from "lucide-react"
import React, { useState } from "react"

interface ProductBrowseViewProps {
    /** 전체 제품 배열 */
    products: any[]
    /** 즐겨찾기 목록 (favorites prop 있을 때만 즐겨찾기 버튼 표시) */
    favorites?: any[]
    /** 제품 상세 or 제안 이동 핸들러 */
    onViewDetail: (product: any) => void
    /** 브랜드 몰 링크 열기 */
    onViewGuide?: (product: any) => void
    /** 헤더 제목 */
    title?: string
    /** 헤더 부제목 */
    description?: string
}

export function ProductBrowseView({
    products,
    favorites,
    onViewDetail,
    onViewGuide,
    title = "브랜드 제품 둘러보기",
    description = "마음에 들면 광고나 공구를 먼저 제안해보세요.",
}: ProductBrowseViewProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [tagFilter, setTagFilter] = useState<string[]>([])
    const [pageSize, setPageSize] = useState<20 | 50 | 100>(20)
    const [favoritesOnly, setFavoritesOnly] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    const tagFilteredProducts = products.filter((p) => {
        const matchesFav =
            !favoritesOnly ||
            favorites?.some(
                (f: any) => f.target_id === p.id && f.target_type === "product"
            )

        const matchesSearch =
            !searchQuery ||
            (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.brandName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())

        const matchesTag =
            tagFilter.length === 0 ||
            tagFilter.some((tag) => {
                const tagWord = tag.replace(/^.{1,2} /, "").toLowerCase()
                return (
                    (p.category || "").toLowerCase().includes(tagWord) ||
                    (p.tags || []).some((t: string) =>
                        t.toLowerCase().includes(tagWord)
                    )
                )
            })

        return matchesFav && matchesSearch && matchesTag
    })

    const displayedProducts = tagFilteredProducts.slice(0, pageSize)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* 헤더 */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* 왼쪽: 제목 + 모바일 토글 + 소제목 */}
                <div className="shrink-0">
                    <div className="flex items-center justify-between gap-2 md:block">
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        {/* 모바일 전용 토글 */}
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
                {/* 오른쪽: 즐겨찾기 + 검색 + 페이지사이즈 + 데스크탑 토글 */}
                <div className="flex w-full md:max-w-lg items-center gap-2">
                    {favorites !== undefined && (
                        <Button
                            variant={favoritesOnly ? "secondary" : "outline"} size="icon"
                            onClick={() => setFavoritesOnly(!favoritesOnly)}
                            className={favoritesOnly ? "bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200" : "text-muted-foreground"}
                            title="즐겨찾기만 보기"
                        >
                            <Star className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`} />
                        </Button>
                    )}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="브랜드, 제품명 검색" className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    {/* 페이지사이즈 — 데스크탑만 */}
                    <div className="hidden md:flex items-center gap-0.5 border border-border rounded-lg p-0.5 shrink-0 h-10">
                        {([20, 50, 100] as const).map((n) => (
                            <button key={n} onClick={() => setPageSize(n)}
                                className={`px-2.5 h-full rounded-md text-sm font-medium transition-colors ${pageSize === n ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >{n}</button>
                        ))}
                    </div>
                    {/* 뷰 토글 — 데스크탑만 */}
                    <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg shrink-0">
                        <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")} title="리스트형">
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")} title="그리드형">
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 카테고리 태그 필터 */}
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

            {/* 제품 목록 */}
            {tagFilteredProducts.length === 0 ? (
                <Card className="p-20 text-center border-dashed bg-muted/20">
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                        검색 결과가 없습니다.
                    </h3>
                </Card>
            ) : (
                <div className="space-y-6">
                    {viewMode === "grid" ? (
                        <BrandProductDiscoveryView
                            products={displayedProducts}
                            handleViewGuide={(p) => {
                                if (onViewGuide) onViewGuide(p)
                                else if (p.link) window.open(p.link, "_blank")
                            }}
                            handlePropose={(p) => onViewDetail(p)}
                        />
                    ) : (
                        <BrandProductListView
                            products={displayedProducts}
                            handleViewGuide={(p) => {
                                if (onViewGuide) onViewGuide(p)
                                else if (p.link) window.open(p.link, "_blank")
                            }}
                            handlePropose={(p) => onViewDetail(p)}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
