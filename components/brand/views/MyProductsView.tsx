"use client"

import { ExternalLink, FileText, Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useState } from "react"

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface MyProductsViewProps {
    products: any[]
    setProductModalOpen: (open: boolean) => void
    handleViewGuide: (product: any) => void
    handleEditProduct: (product: any) => void
    deleteProduct: (id: string) => Promise<void>
    onViewDetail?: (productId: string) => void
}

export function MyProductsView({
    products,
    setProductModalOpen,
    handleViewGuide,
    handleEditProduct,
    deleteProduct,
    onViewDetail
}: MyProductsViewProps) {
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">내 브랜드 제품</h1>
                    <p className="text-muted-foreground mt-1">크리에이터들이 제안하거나 살펴볼 수 있는 우리 브랜드의 제품군입니다.</p>
                </div>
                <Button className="gap-2" onClick={() => setProductModalOpen(true)}>
                    <Plus className="h-4 w-4" /> 제품 등록하기
                </Button>
            </div>

            {(!products || products.length === 0) ? (
                <Card className="p-12 text-center border-dashed">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold">등록된 제품이 없습니다.</h3>
                    <p className="text-muted-foreground mb-6">제품을 등록하면 크리에이터들이 협업 제안 시 참고할 수 있습니다.</p>
                    <Button onClick={() => setProductModalOpen(true)}>제품 등록하기</Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((p) => (
                        <Card key={p.id} className="overflow-hidden flex flex-col h-full border-border/60 hover:shadow-md transition-all group">
                            <div
                                className={`aspect-square bg-muted flex items-center justify-center text-4xl relative ${onViewDetail ? 'cursor-pointer' : ''}`}
                                onClick={() => onViewDetail && onViewDetail(String(p.id))}
                            >
                                {p.image.startsWith('http') ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                ) : (
                                    <span className="transition-transform group-hover:scale-125">{p.image}</span>
                                )}
                                {onViewDetail && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-white text-sm font-bold">자세히 보기</span>
                                    </div>
                                )}
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{p.category}</span>
                                        <CardTitle className="text-lg font-bold mt-0.5 line-clamp-1">{p.name}</CardTitle>
                                    </div>
                                    <span className="text-sm font-bold text-foreground shrink-0">{p.price > 0 ? `${p.price.toLocaleString()}원` : "가격 미정"}</span>
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
                            <CardFooter className="border-t pt-4 bg-muted/10 flex flex-wrap gap-2">
                                {onViewDetail && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-8 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                        onClick={() => onViewDetail(String(p.id))}
                                    >
                                        <ExternalLink className="h-3 w-3" /> 상세보기
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs gap-1" asChild>
                                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-3 w-3" /> 웹사이트
                                    </a>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs gap-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                    onClick={() => handleViewGuide(p)}
                                >
                                    <FileText className="h-3 w-3" /> 가이드
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleEditProduct(p)}
                                >
                                    <Pencil className="h-3 w-3" /> 수정
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => setConfirmDeleteId(p.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    <ConfirmDialog
                        open={!!confirmDeleteId}
                        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
                        title="제품 삭제"
                        description="정말로 이 제품을 삭제하시겠습니까?"
                        onConfirm={async () => {
                            if (confirmDeleteId) {
                                try {
                                    await deleteProduct(confirmDeleteId)
                                    toast.success("제품이 삭제되었습니다.")
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
            )}
        </div>
    )
}
