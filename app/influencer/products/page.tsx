"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { usePlatform } from "@/components/providers/platform-provider"

export default function ProductListPage() {
    const { products } = usePlatform()

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
                            <Input placeholder="브랜드, 제품명 검색" />
                            <Button size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {products.map((product) => (
                            <Link href={`/influencer/products/${product.id}`} key={product.id}>
                                <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div className="aspect-square bg-muted flex items-center justify-center text-6xl">
                                        {product.image}
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-medium text-muted-foreground">{product.brandName}</span>
                                            <Badge variant="secondary" className="text-[10px]">{product.category}</Badge>
                                        </div>
                                        <CardTitle className="text-base line-clamp-2 leading-tight">
                                            {product.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1">
                                        <p className="font-bold text-lg">
                                            {product.price.toLocaleString()}원
                                        </p>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                                        클릭해서 제안하기 <ShoppingBag className="ml-auto h-3 w-3" />
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
