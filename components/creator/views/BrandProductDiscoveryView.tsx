"use client"

import React from "react"
import { ShoppingBag, ExternalLink, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BrandProductDiscoveryViewProps {
    products: any[]
    handleViewGuide: (product: any) => void
    handlePropose: (product: any) => void
}

export const BrandProductDiscoveryView = React.memo(function BrandProductDiscoveryView({
    products,
    handleViewGuide,
    handlePropose
}: BrandProductDiscoveryViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">


            {products.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold">표시할 제품이 없습니다.</h3>
                    <p className="text-muted-foreground mb-6">검색 조건을 변경하거나 나중에 다시 확인해주세요.</p>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((p) => (
                        <Card key={p.id} className="overflow-hidden flex flex-col h-full border-border/60 hover:shadow-md transition-all group cursor-pointer" onClick={() => handlePropose(p)}>
                            <div className="aspect-square bg-muted flex items-center justify-center text-4xl relative">
                                {p.image.startsWith('http') ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <span>{p.image}</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                                        <ImageIcon className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex gap-1 mb-1">
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                                제안가능
                                            </Badge>
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider border border-primary/20 px-1 rounded h-4 flex items-center">{p.category}</span>
                                        </div>
                                        <CardTitle className="text-lg font-bold mt-1 line-clamp-1">{p.name}</CardTitle>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-[10px] text-muted-foreground block leading-tight">소비자가</span>
                                        <span className="text-sm font-bold text-foreground">{p.price > 0 ? `${p.price.toLocaleString()}원` : "가격 미정"}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 pb-4">
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                    {p.description || "등록된 상세 설명이 없습니다."}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground w-16 shrink-0 uppercase">Key Points</span>
                                        <span className="text-xs text-foreground line-clamp-1">{p.points || "-"}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground w-16 shrink-0 uppercase">Required</span>
                                        <span className="text-xs text-foreground line-clamp-1">{p.shots || "-"}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 bg-muted/10 flex gap-2 mt-auto">
                                {p.link && (
                                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs gap-1" asChild onClick={(e) => e.stopPropagation()}>
                                        <a href={p.link} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3 w-3" /> 웹사이트
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    className="flex-1 h-8 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePropose(p);
                                    }}
                                >
                                    제안하기
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
})
