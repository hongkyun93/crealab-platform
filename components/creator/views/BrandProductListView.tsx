"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
            className={`h-5 w-5 rounded-full ${CHANNEL_STYLE[baseId] ?? CHANNEL_STYLE.other} flex items-center justify-center shrink-0`}
            title={channel.label}
        >
            <Icon className="h-2.5 w-2.5 text-white" />
        </div>
    )
}

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
        <div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
            {products.length === 0 ? (
                <div className="p-20 text-center border border-dashed rounded-xl bg-muted/20">
                    <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-base font-medium text-muted-foreground">표시할 제품이 없습니다.</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {products.map((p) => (
                        <Card
                            key={p.id}
                            className="overflow-hidden flex flex-row items-stretch border-border/60 hover:shadow-md transition-all group cursor-pointer"
                            onClick={() => handlePropose(p)}
                        >
                            {/* Thumbnail — self-stretch */}
                            <div className="w-24 shrink-0 bg-muted relative overflow-hidden self-stretch">
                                {p.image?.startsWith('http') ? (
                                    <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                        {p.image || '📦'}
                                    </div>
                                )}
                            </div>

                            {/* Center: Details */}
                            <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-center gap-1">
                                {/* Brand + Channels */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">
                                        {p.brandName || 'Brand'}
                                    </span>
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

                                {/* Name */}
                                <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                    {p.name}
                                </h3>

                                {/* Description */}
                                {p.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                        {p.description}
                                    </p>
                                )}

                                {/* Key Points */}
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
                                <div className="flex items-center gap-1.5">
                                    <FavoriteButton targetId={String(p.id)} targetType="product" />
                                    {p.link && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            asChild
                                            onClick={(e) => e.stopPropagation()}
                                            title="웹사이트"
                                        >
                                            <a href={p.link} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </Button>
                                    )}
                                    <Button
                                        className="h-7 text-xs px-2.5 bg-primary text-primary-foreground hover:bg-primary/90"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handlePropose(p)
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
