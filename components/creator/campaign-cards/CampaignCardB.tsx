import { Card, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Send, Heart } from "lucide-react"

import { Campaign } from "@/lib/types/campaign"



interface CampaignCardBProps {
    campaign: Campaign
    onClick: () => void
    onApply: (e: React.MouseEvent) => void
}

export function CampaignCardB({ campaign: c, onClick, onApply }: CampaignCardBProps) {
    return (
        <Card
            className="group relative cursor-pointer overflow-hidden border-0 shadow-lg h-[400px] hover:shadow-xl transition-all"
            onClick={onClick}
        >
            {/* Full Background Image */}
            <div className="absolute inset-0 z-0">
                {(c.image && c.image !== "📦") || c.product_image_url ? (
                    <img
                        src={c.image && c.image !== "📦" ? c.image : c.product_image_url}
                        alt={c.product}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <span className="text-6xl opacity-20">📦</span>
                    </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>

            {/* Top Badges */}
            <div className="relative z-10 p-4 flex justify-between items-start">
                <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0">
                    {c.category}
                </Badge>
                {c.recruitment_deadline && (
                    <Badge variant="outline" className="border-white/40 text-white bg-black/20 backdrop-blur-md">
                        D-{Math.ceil((new Date(c.recruitment_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </Badge>
                )}
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-5 space-y-3 text-white">
                <div>
                    <div className="text-xs font-semibold text-white/80 mb-1 flex items-center gap-2 min-w-0">
                        <span className="truncate">{c.brand}</span>
                        {c.channels && c.channels.length > 0 && (
                            <div className="flex gap-1 text-[10px] shrink-0">
                                {c.channels.slice(0, 3).map(ch => (
                                    <span key={ch} className="bg-white/20 px-1 py-0.5 rounded">
                                        {ch === 'instagram' ? 'INSTA' : ch.toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <h3 className="text-2xl font-bold leading-tight line-clamp-2 mb-1">
                        {c.title || c.product}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-emerald-400 font-bold">
                        <span>{c.budget || "협의"}</span>
                    </div>
                </div>

                <div className="pt-3 flex gap-2">
                    <Button
                        className="flex-1 bg-white text-black hover:bg-slate-100 font-bold hover:scale-[1.02] transition-transform"
                        onClick={onApply}
                    >
                        <Send className="h-4 w-4 mr-2" /> 바로 지원
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                        <Heart className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
