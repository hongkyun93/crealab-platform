"use client"

import React from "react"
import { ShoppingBag, ExternalLink, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BrandProductListViewProps {
    products: any[]
    handleViewGuide: (product: any) => void
    handlePropose: (product: any) => void
}

export const BrandProductListView = React.memo(function BrandProductListView({
    products,
    handleViewGuide,
    handlePropose
}: BrandProductListViewProps) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {products.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold">표시할 제품이 없습니다.</h3>
                    <p className="text-muted-foreground mb-6">검색 조건을 변경하거나 나중에 다시 확인해주세요.</p>
                </Card>
            ) : (
                <div className="flex flex-col gap-3">
                    {products.map((p) => (
                        <Card key={p.id} className="overflow-hidden flex flex-row items-center border-border/60 hover:shadow-md transition-all group cursor-pointer p-3 gap-4" onClick={() => handlePropose(p)}>
                            {/* Left: Compact Image */}
                            <div className="h-20 w-20 shrink-0 bg-muted rounded-md overflow-hidden relative border border-border/50">
                                {p.image.startsWith('http') ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                        <ImageIcon className="h-8 w-8 opacity-20" />
                                    </div>
                                )}
                            </div>

                            {/* Center: Essential Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                        상시 제안 가능
                                    </Badge>
                                    <span className="text-xs text-muted-foreground truncate opacity-70">|</span>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground border-border/50">
                                        {p.category}
                                    </Badge>
                                </div>
                                <h3 className="text-base font-bold truncate group-hover:text-primary transition-colors mt-0.5">
                                    <span className="text-muted-foreground font-normal mr-1.5 text-sm">{p.brandName || "Brand"}</span>
                                    {p.name}
                                </h3>
                            </div>

                            {/* Right: Price & Actions */}
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="text-right hidden sm:block">
                                    <span className="text-[10px] text-muted-foreground block mb-0.5">소비자가</span>
                                    <span className="text-sm font-bold text-foreground whitespace-nowrap">
                                        {p.price > 0 ? `${p.price.toLocaleString()}원` : "가격 미정"}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    {p.link && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild onClick={(e) => e.stopPropagation()} title="웹사이트 방문">
                                            <a href={p.link} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                    <Button
                                        className="h-8 text-xs px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePropose(p);
                                        }}
                                    >
                                        제안하기
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
})
