"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingBag, ExternalLink } from "lucide-react"
import Link from "next/link"
import { usePlatform } from "@/components/providers/platform-provider"
import { useState } from "react"

export default function ProductListPage() {
    const { products } = usePlatform()
    const [searchQuery, setSearchQuery] = useState("")

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
                        <div className="flex w-full max-w-sm items-center space-x-2">
                            <Input
                                placeholder="브랜드, 제품명 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Product Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="py-20 text-center">
                            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground">검색 결과가 없습니다.</h3>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {filteredProducts.map((product) => (
                                <Link href={`/creator/products/${product.id}`} key={product.id}>
                                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 bg-background border-border/60">
                                        <div className="aspect-square bg-muted flex items-center justify-center text-6xl overflow-hidden relative group">
                                            {product.image.startsWith('http') ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            ) : (
                                                <span className="transition-transform group-hover:scale-125">{product.image}</span>
                                            )}
                                        </div>
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-primary uppercase tracking-tight truncate max-w-[100px]">{product.brandName}</span>
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium">{product.category}</Badge>
                                            </div>
                                            <CardTitle className="text-sm font-bold line-clamp-2 leading-tight h-10">
                                                {product.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-1">
                                            <p className="font-extrabold text-lg text-foreground">
                                                {product.price > 0 ? `${product.price.toLocaleString()}원` : "가격 미정"}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 text-[10px] font-bold text-muted-foreground uppercase flex items-center">
                                            <span className="text-primary group-hover:underline">협업 제안하기</span>
                                            <ShoppingBag className="ml-auto h-3 w-3 text-primary" />
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
