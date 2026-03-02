"use client"

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { CHANNELS } from "@/components/shared/ChannelSelector"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { EyeOff, ExternalLink, FileText, LayoutGrid, List, Pencil, Plus, ShoppingBag, Trash2, Eye } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const CHANNEL_STYLE: Record<string, string> = {
    instagram: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500',
    youtube: 'bg-gradient-to-br from-red-600 to-red-700',
    tiktok: 'bg-gradient-to-br from-black via-slate-900 to-slate-800',
    blog: 'bg-gradient-to-br from-green-500 to-green-600',
    other: 'bg-gradient-to-br from-slate-600 to-slate-700',
}

function ChannelIcon({ channelId }: { channelId: string }) {
    const baseId = channelId.split('_')[0]
    const channel = CHANNELS.find(c => c.id === baseId)
    if (!channel) return null
    const Icon = channel.Icon
    return (
        <div
            className={`h-6 w-6 rounded-full ${CHANNEL_STYLE[baseId] ?? CHANNEL_STYLE.other} flex items-center justify-center shrink-0`}
            title={channel.label}
        >
            <Icon className="h-3 w-3 text-white" />
        </div>
    )
}

interface MyProductsViewProps {
    products: any[]
    hiddenProducts: any[]
    setProductModalOpen: (open: boolean) => void
    handleViewGuide: (product: any) => void
    handleEditProduct: (product: any) => void
    deleteProduct: (id: string) => Promise<void>
    hideProduct: (id: string) => Promise<void>
    activateProduct: (id: string) => Promise<void>
    onViewDetail?: (productId: string) => void
}

export function MyProductsView({
    products,
    hiddenProducts,
    setProductModalOpen,
    handleViewGuide,
    handleEditProduct,
    deleteProduct,
    hideProduct,
    activateProduct,
    onViewDetail
}: MyProductsViewProps) {
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [confirmHideId, setConfirmHideId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [activeTab, setActiveTab] = useState<'active' | 'hidden'>('active')

    const handleDeleteAttempt = async (id: string) => {
        try {
            await deleteProduct(id)
            toast.success("제품이 삭제되었습니다.")
        } catch (err: any) {
            if (err?.message?.includes('이력')) {
                // 지원 이력이 있는 경우 → 비공개 유도
                setConfirmHideId(id)
            } else {
                toast.error(err?.message || "삭제에 실패했습니다.")
            }
        }
    }

    const ProductCard = ({ p, isHidden = false }: { p: any, isHidden?: boolean }) => (
        <Card
            key={p.id}
            className={`group overflow-hidden flex flex-col h-full border-border/60 hover:shadow-md transition-all bg-card ${onViewDetail ? 'cursor-pointer' : ''} ${isHidden ? 'opacity-60' : ''}`}
            onClick={() => !isHidden && onViewDetail && onViewDetail(String(p.id))}
        >
            <div className="w-full h-48 bg-muted/20 shrink-0 relative overflow-hidden flex items-center justify-center">
                {p.image?.startsWith('http') ? (
                    <img src={p.image} alt={p.name} className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 ${isHidden ? 'grayscale' : ''}`} />
                ) : (
                    <span className="text-4xl transition-transform group-hover:scale-110">{p.image || '📦'}</span>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm shadow-sm text-[10px]">
                        {p.category}
                    </Badge>
                    {isHidden && (
                        <Badge variant="secondary" className="bg-slate-800/90 text-white text-[10px] gap-0.5">
                            <EyeOff className="h-2.5 w-2.5" /> 비공개
                        </Badge>
                    )}
                    {p.is_draft && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 backdrop-blur-sm shadow-sm text-[10px]">
                            임시저장
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex-1 px-4 py-2.5 flex flex-col min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2 h-5">
                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                        {p.brandName && (
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">{p.brandName}</span>
                        )}
                        {p.accountTag && (
                            <span className="text-[10px] text-muted-foreground font-medium truncate">
                                {p.accountTag.startsWith('@') ? p.accountTag : `@${p.accountTag}`}
                            </span>
                        )}
                    </div>
                    {p.channels && p.channels.length > 0 && (
                        <div className="flex gap-1 shrink-0">
                            {p.channels.slice(0, 4).map((ch: string) => (
                                <ChannelIcon key={ch} channelId={ch} />
                            ))}
                        </div>
                    )}
                </div>
                <h3 className="text-base font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors">{p.name}</h3>
                <p className="text-base font-black text-foreground">
                    {p.price > 0 ? `${p.price.toLocaleString()}원` : '가격 미정'}
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">소비자가</span>
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-4">
                    {p.description || '등록된 상세 설명이 없습니다.'}
                </p>
                <div className="space-y-1 pt-1 border-t border-border/40 mt-1">
                    {[
                        { label: '소구포인트', value: p.points },
                        { label: '필수촬영컷', value: p.shots },
                        { label: '필수내용', value: p.contentGuide },
                        { label: '필수형식', value: p.formatGuide },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground w-16 shrink-0">{label}</span>
                            <span className={`text-xs line-clamp-1 ${value ? 'text-foreground' : 'text-muted-foreground/50 italic'}`}>
                                {value || '내용 없음'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <CardFooter className="border-t pt-2 pb-2 bg-muted/10" onClick={(e) => e.stopPropagation()}>
                {isHidden ? (
                    <div className="flex w-full items-center gap-1">
                        <Button
                            variant="ghost" size="sm"
                            className="h-7 flex-1 text-[10px] sm:text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={async () => {
                                await activateProduct(p.id)
                                toast.success("상품이 공개로 전환되었습니다.")
                            }}
                        >
                            <Eye className="h-3 w-3" /> 공개로 전환
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-nowrap items-center justify-between gap-0.5 w-full overflow-hidden">
                        {p.link && (
                            <Button variant="ghost" size="sm" className="h-7 px-1 flex-1 min-w-0 text-[10px] sm:text-xs gap-1" asChild onClick={(e) => e.stopPropagation()}>
                                <a href={p.link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                    <span className="truncate">웹사이트</span>
                                </a>
                            </Button>
                        )}
                        <Button
                            variant="ghost" size="sm"
                            className="h-7 px-1 flex-1 min-w-0 text-[10px] sm:text-xs gap-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            onClick={(e) => { e.stopPropagation(); handleViewGuide(p) }}
                        >
                            <FileText className="h-3 w-3 shrink-0" />
                            <span className="truncate">가이드</span>
                        </Button>
                        <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 shrink-0 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => { e.stopPropagation(); handleEditProduct(p) }}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 shrink-0 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id) }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )

    const displayProducts = activeTab === 'active' ? products : hiddenProducts

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">내 브랜드 제품</h1>
                    <div className="flex border border-border rounded-md overflow-hidden shrink-0">
                        <Button
                            variant="ghost" size="sm"
                            className={`h-8 px-2.5 rounded-none ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost" size="sm"
                            className={`h-8 px-2.5 rounded-none ${viewMode === 'list' ? 'bg-muted' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">크리에이터들이 제안하거나 살펴볼 수 있는 우리 브랜드의 제품군입니다.</p>
                <div className="flex items-center justify-between">
                    {/* 공개/비공개 탭 */}
                    <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-3 h-7 rounded-md text-xs font-medium transition-colors ${activeTab === 'active' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            공개 ({products.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('hidden')}
                            className={`px-3 h-7 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${activeTab === 'hidden' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <EyeOff className="h-3 w-3" /> 비공개 ({hiddenProducts.length})
                        </button>
                    </div>
                    <Button className="gap-2 h-8 text-sm" onClick={() => setProductModalOpen(true)}>
                        <Plus className="h-4 w-4" /> 제품 등록하기
                    </Button>
                </div>
            </div>

            {/* Empty State */}
            {displayProducts.length === 0 ? (
                <div className="p-20 text-center border border-dashed rounded-xl bg-muted/20">
                    {activeTab === 'active' ? (
                        <>
                            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-4" />
                            <h3 className="text-base font-medium text-muted-foreground mb-4">등록된 제품이 없습니다.</h3>
                            <Button onClick={() => setProductModalOpen(true)}>제품 등록하기</Button>
                        </>
                    ) : (
                        <>
                            <EyeOff className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-4" />
                            <h3 className="text-base font-medium text-muted-foreground">비공개 처리된 제품이 없습니다.</h3>
                        </>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayProducts.map((p) => (
                        <ProductCard key={p.id} p={p} isHidden={activeTab === 'hidden'} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {displayProducts.map((p) => (
                        <Card
                            key={p.id}
                            className={`overflow-hidden flex flex-row items-stretch border-border/60 hover:shadow-md transition-all group bg-card ${onViewDetail && activeTab === 'active' ? 'cursor-pointer' : ''} ${activeTab === 'hidden' ? 'opacity-60' : ''}`}
                            onClick={() => activeTab === 'active' && onViewDetail && onViewDetail(String(p.id))}
                        >
                            <div className="w-24 shrink-0 bg-muted relative overflow-hidden self-stretch">
                                {p.image?.startsWith('http') ? (
                                    <img src={p.image} alt={p.name} className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 ${activeTab === 'hidden' ? 'grayscale' : ''}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">{p.image || '📦'}</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-center gap-1">
                                <div className="flex items-center gap-2">
                                    {p.accountTag && (
                                        <span className="text-[10px] text-muted-foreground font-medium truncate">
                                            {p.accountTag.startsWith('@') ? p.accountTag : `@${p.accountTag}`}
                                        </span>
                                    )}
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-border/50 shrink-0">{p.category}</Badge>
                                    {activeTab === 'hidden' && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 shrink-0">
                                            <EyeOff className="h-2.5 w-2.5" /> 비공개
                                        </Badge>
                                    )}
                                    {p.is_draft && (
                                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] px-1.5 py-0 h-4 shrink-0">
                                            임시저장
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{p.name}</h3>
                                {p.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                                )}
                            </div>
                            <div className="flex flex-col items-end justify-center gap-2 px-3 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <div className="text-right">
                                    <span className="text-[10px] text-muted-foreground block mb-0.5">소비자가</span>
                                    <span className="text-sm font-bold text-foreground whitespace-nowrap">
                                        {p.price > 0 ? `${p.price.toLocaleString()}원` : '가격 미정'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {activeTab === 'hidden' ? (
                                        <Button
                                            variant="ghost" size="sm"
                                            className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
                                            onClick={async () => {
                                                await activateProduct(p.id)
                                                toast.success("상품이 공개로 전환되었습니다.")
                                            }}
                                        >
                                            <Eye className="h-3.5 w-3.5" /> 공개로
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-700" onClick={() => handleViewGuide(p)} title="가이드">
                                                <FileText className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEditProduct(p)} title="수정">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setConfirmDeleteId(p.id)} title="삭제">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* 삭제 확인 다이얼로그 */}
            <ConfirmDialog
                open={!!confirmDeleteId}
                onOpenChange={(open) => !open && setConfirmDeleteId(null)}
                title="제품 삭제"
                description="정말로 이 제품을 삭제하시겠습니까?"
                onConfirm={async () => {
                    if (confirmDeleteId) {
                        await handleDeleteAttempt(confirmDeleteId)
                        setConfirmDeleteId(null)
                    }
                }}
                confirmText="삭제"
                variant="destructive"
            />

            {/* 비공개 처리 유도 다이얼로그 (지원 이력 있을 때) */}
            <ConfirmDialog
                open={!!confirmHideId}
                onOpenChange={(open) => !open && setConfirmHideId(null)}
                title="지원 이력이 있는 상품"
                description="이 상품에 크리에이터 지원 이력이 있어 삭제할 수 없습니다. 삭제 대신 비공개 처리하면 목록에서 숨기고 언제든지 다시 공개할 수 있습니다."
                onConfirm={async () => {
                    if (confirmHideId) {
                        try {
                            await hideProduct(confirmHideId)
                            toast.success("상품이 비공개 처리되었습니다. '비공개' 탭에서 확인하세요.")
                        } catch {
                            toast.error("비공개 처리에 실패했습니다.")
                        }
                        setConfirmHideId(null)
                    }
                }}
                confirmText="비공개 처리"
                variant="destructive"
            />
        </div>
    )
}
