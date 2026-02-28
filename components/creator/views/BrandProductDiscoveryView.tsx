"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { CHANNELS } from "@/components/shared/ChannelSelector"
import { ExternalLink, ShoppingBag } from "lucide-react"
import React from "react"

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

interface BrandProductDiscoveryViewProps {
    products: any[]
    handleViewGuide: (product: any) => void
    handlePropose: (product: any) => void
    hideProposeButton?: boolean
}

export const BrandProductDiscoveryView = React.memo(function BrandProductDiscoveryView({
    products,
    handleViewGuide,
    handlePropose,
    hideProposeButton = false,
}: BrandProductDiscoveryViewProps) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {products.length === 0 ? (
                <div className="p-20 text-center border border-dashed rounded-xl bg-muted/20">
                    <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-base font-medium text-muted-foreground">표시할 제품이 없습니다.</h3>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((p) => (
                        <Card
                            key={p.id}
                            className="group overflow-hidden flex flex-col h-full border-border/60 hover:shadow-md transition-all cursor-pointer bg-card"
                            onClick={() => handlePropose(p)}
                        >
                            {/* Image */}
                            <div className="w-full h-48 bg-muted/20 shrink-0 relative overflow-hidden flex items-center justify-center">
                                {p.image?.startsWith('http') ? (
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                    />
                                ) : (
                                    <span className="text-4xl transition-transform group-hover:scale-110">{p.image || '📦'}</span>
                                )}
                                {/* Category badge top-left */}
                                <div className="absolute top-2 left-2">
                                    <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm shadow-sm text-[10px]">
                                        {p.category}
                                    </Badge>
                                </div>
                                {/* Favorite top-right */}
                                <div className="absolute top-2 right-2 z-10">
                                    <FavoriteButton targetId={String(p.id)} targetType="product" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 px-4 py-2.5 flex flex-col justify-between min-w-0">
                                <div className="space-y-1.5">
                                    {/* Brand + Channels row */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">
                                                {p.brandName || 'Brand'}
                                            </span>
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

                                    {/* Description — fixed 2-line */}
                                    <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-4">
                                        {p.description || '등록된 상세 설명이 없습니다.'}
                                    </p>

                                    {/* Key Points + Required */}
                                    <div className="space-y-1 pt-0.5">
                                        {p.points && (
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground w-14 shrink-0 uppercase">Key Points</span>
                                                <span className="text-xs text-foreground line-clamp-1">{p.points}</span>
                                            </div>
                                        )}
                                        {p.shots && (
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground w-14 shrink-0 uppercase">Required</span>
                                                <span className="text-xs text-foreground line-clamp-1">{p.shots}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <CardFooter className="border-t pt-3 pb-3 bg-muted/10 flex gap-2 mt-auto">
                                {p.link && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-8 text-xs gap-1"
                                        asChild
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <a href={p.link} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3 w-3" /> 웹사이트
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    className={`flex-1 h-8 text-xs ${hideProposeButton ? 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border/60' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handlePropose(p)
                                    }}
                                >
                                    {hideProposeButton ? '상세보기' : '제안하기'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
})
