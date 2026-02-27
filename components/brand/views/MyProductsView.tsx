"use client"

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { CHANNELS } from "@/components/shared/ChannelSelector"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { ExternalLink, FileText, LayoutGrid, List, Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react"
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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const ActionButtons = ({ p }: { p: any }) => (
        <div className="flex items-center gap-0.5 sm:gap-1">
            {onViewDetail && (
                <Button
                    variant="ghost" size="sm"
                    className="h-7 px-1.5 text-[10px] gap-0.5 sm:h-8 sm:px-2 sm:text-xs sm:gap-1 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={(e) => { e.stopPropagation(); onViewDetail(String(p.id)) }}
                >
                    <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> 상세보기
                </Button>
            )}
            {p.link && (
                <Button variant="ghost" size="sm" className="h-7 px-1.5 text-[10px] gap-0.5 sm:h-8 sm:px-2 sm:text-xs sm:gap-1" asChild onClick={(e) => e.stopPropagation()}>
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> 웹사이트
                    </a>
                </Button>
            )}
            <Button
                variant="ghost" size="sm"
                className="h-7 px-1.5 text-[10px] gap-0.5 sm:h-8 sm:px-2 sm:text-xs sm:gap-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                onClick={(e) => { e.stopPropagation(); handleViewGuide(p) }}
            >
                <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> 가이드
            </Button>
            <Button
                variant="ghost" size="sm"
                className="h-7 px-1.5 text-[10px] gap-0.5 sm:h-8 sm:px-2 sm:text-xs sm:gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={(e) => { e.stopPropagation(); handleEditProduct(p) }}
            >
                <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> 수정
            </Button>
            <Button
                variant="ghost" size="sm"
                className="h-7 px-1.5 text-[10px] gap-0.5 sm:h-8 sm:px-2 sm:text-xs sm:gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id) }}
            >
                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
        </div>
    )

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="space-y-2">
                {/* Row 1: 제목 + 토글 */}
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
                {/* Row 2: 설명 */}
                <p className="text-muted-foreground text-sm sm:text-base">크리에이터들이 제안하거나 살펴볼 수 있는 우리 브랜드의 제품군입니다.</p>
                {/* Row 3: 등록버튼 오른쪽 정렬 */}
                <div className="flex justify-end">
                    <Button className="gap-2 h-8 text-sm" onClick={() => setProductModalOpen(true)}>
                        <Plus className="h-4 w-4" /> 제품 등록하기
                    </Button>
                </div>
            </div>

            {/* Empty State */}
            {(!products || products.length === 0) ? (
                <div className="p-20 text-center border border-dashed rounded-xl bg-muted/20">
                    <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-base font-medium text-muted-foreground mb-4">등록된 제품이 없습니다.</h3>
                    <Button onClick={() => setProductModalOpen(true)}>제품 등록하기</Button>
                </div>
            ) : viewMode === 'grid' ? (
                /* ─── Grid View ─── */
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((p) => (
                        <Card
                            key={p.id}
                            className={`group overflow-hidden flex flex-col h-full border-border/60 hover:shadow-md transition-all bg-card ${onViewDetail ? 'cursor-pointer' : ''}`}
                            onClick={() => onViewDetail && onViewDetail(String(p.id))}
                        >
                            {/* Image */}
                            <div className="w-full h-48 bg-muted/20 shrink-0 relative overflow-hidden flex items-center justify-center">
                                {p.image?.startsWith('http') ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                ) : (
                                    <span className="text-4xl transition-transform group-hover:scale-110">{p.image || '📦'}</span>
                                )}
                                {/* Category badge */}
                                <div className="absolute top-2 left-2">
                                    <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm shadow-sm text-[10px]">
                                        {p.category}
                                    </Badge>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 px-4 py-2.5 flex flex-col min-w-0 space-y-1.5">
                                {/* Account + Channels row — fixed h-5 for alignment */}
                                <div className="flex items-center justify-between gap-2 h-5">
                                    <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                        {p.brandName && (
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">
                                                {p.brandName}
                                            </span>
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

                                {/* Name */}
                                <h3 className="text-base font-bold line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                                    {p.name}
                                </h3>

                                {/* Price */}
                                <p className="text-base font-black text-foreground">
                                    {p.price > 0 ? `${p.price.toLocaleString()}원` : '가격 미정'}
                                    <span className="text-[10px] font-normal text-muted-foreground ml-1">소비자가</span>
                                </p>

                                {/* Description */}
                                <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-4">
                                    {p.description || '등록된 상세 설명이 없습니다.'}
                                </p>

                                {/* 4 Required Fields — always visible */}
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

                            {/* Footer Actions */}
                            <CardFooter className="border-t pt-2 pb-2 bg-muted/10 flex flex-wrap gap-1">
                                <ActionButtons p={p} />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                /* ─── List View ─── */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {products.map((p) => (
                        <Card
                            key={p.id}
                            className={`overflow-hidden flex flex-row items-stretch border-border/60 hover:shadow-md transition-all group bg-card ${onViewDetail ? 'cursor-pointer' : ''}`}
                            onClick={() => onViewDetail && onViewDetail(String(p.id))}
                        >
                            {/* Thumbnail */}
                            <div className="w-24 shrink-0 bg-muted relative overflow-hidden self-stretch">
                                {p.image?.startsWith('http') ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                        {p.image || '📦'}
                                    </div>
                                )}
                            </div>

                            {/* Center */}
                            <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-center gap-1">
                                <div className="flex items-center gap-2">
                                    {p.accountTag && (
                                        <span className="text-[10px] text-muted-foreground font-medium truncate">
                                            {p.accountTag.startsWith('@') ? p.accountTag : `@${p.accountTag}`}
                                        </span>
                                    )}
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-border/50 shrink-0">
                                        {p.category}
                                    </Badge>
                                    {p.channels && p.channels.length > 0 && (
                                        <div className="flex gap-1 ml-auto shrink-0">
                                            {p.channels.slice(0, 4).map((ch: string) => (
                                                <ChannelIcon key={ch} channelId={ch} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{p.name}</h3>
                                {p.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                                )}
                                {p.points && (
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase">Key Points</span>
                                        <span className="text-xs text-foreground line-clamp-1">{p.points}</span>
                                    </div>
                                )}
                            </div>

                            {/* Right: Price + Actions */}
                            <div className="flex flex-col items-end justify-center gap-2 px-3 py-3 shrink-0">
                                <div className="text-right">
                                    <span className="text-[10px] text-muted-foreground block mb-0.5">소비자가</span>
                                    <span className="text-sm font-bold text-foreground whitespace-nowrap">
                                        {p.price > 0 ? `${p.price.toLocaleString()}원` : '가격 미정'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-7 w-7 text-slate-500 hover:text-slate-700"
                                        onClick={() => handleViewGuide(p)}
                                        title="가이드"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-7 w-7 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => handleEditProduct(p)}
                                        title="수정"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => setConfirmDeleteId(p.id)}
                                        title="삭제"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

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
                        } catch {
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
}
