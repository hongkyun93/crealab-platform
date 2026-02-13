"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingBag, LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import { usePlatform } from "@/components/providers/legacy-platform-hook"

import { useState } from "react"
import { BrandProductDiscoveryView } from "@/components/creator/views/BrandProductDiscoveryView"
import { BrandProductListView } from "@/components/creator/views/BrandProductListView"

export default function ProductListPage() {
    const { products } = usePlatform()
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brandName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )



    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">브랜드 제품 둘러보기</h1>
                            <p className="text-muted-foreground mt-1">
                                마음에 들면 광고나 공구를 먼저 제안해보세요.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="flex w-full max-w-sm items-center space-x-2">
                                <Input
                                    placeholder="브랜드, 제품명 검색"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-background"
                                />
                                <Button size="icon">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* View Switcher */}
                            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg shrink-0">
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => setViewMode('list')}
                                    title="리스트형"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => setViewMode('grid')}
                                    title="그리드형"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Product List/Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="py-20 text-center">
                            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground">검색 결과가 없습니다.</h3>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {viewMode === 'grid' ? (
                                <BrandProductDiscoveryView
                                    products={filteredProducts}
                                    handleViewGuide={(p: any) => {
                                        // Handle view guide if necessary, or keep empty if no action needed yet
                                        if (p.link) window.open(p.link, '_blank');
                                    }}
                                    handlePropose={(p: any) => {
                                        window.location.href = `/creator/products/${p.id}`;
                                    }}
                                />
                            ) : (
                                <div className="grid gap-4 grid-cols-1">
                                    <BrandProductListView
                                        products={filteredProducts}
                                        handleViewGuide={(p: any) => {
                                            if (p.link) window.open(p.link, '_blank');
                                        }}
                                        handlePropose={(p: any) => {
                                            window.location.href = `/creator/products/${p.id}`;
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
