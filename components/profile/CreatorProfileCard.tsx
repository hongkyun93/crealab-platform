"use client"

import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCreatorProfile } from "@/lib/hooks/use-creator-profile"
import { ArrowUpRight, BookOpen, Calendar, Gift, Globe, Instagram, Loader2, MapPin, Music2, Sparkles, Star, Youtube } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

// ============================================================
// Platform Config
// ============================================================
const PLATFORM_CONFIG: Record<string, { icon: React.ReactNode; gradient: string }> = {
    instagram: { icon: <Instagram className="h-4 w-4" />, gradient: "from-purple-500 via-pink-500 to-orange-500" },
    youtube: { icon: <Youtube className="h-4 w-4" />, gradient: "from-red-500 to-red-600" },
    tiktok: { icon: <Music2 className="h-4 w-4" />, gradient: "from-black to-slate-700" },
    blog: { icon: <BookOpen className="h-4 w-4" />, gradient: "from-green-500 to-green-600" },
    other: { icon: <Globe className="h-4 w-4" />, gradient: "from-slate-600 to-slate-700" },
}

// ============================================================
// Helpers
// ============================================================
function fmtFollowers(n: number) {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}천`
    return n.toLocaleString()
}

function fmtPrice(n: number) {
    if (!n) return "-"
    if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}천원`
    return `${n.toLocaleString()}원`
}

function getPriceRange(priceVideo: number, priceFeed: number, priceStory: number) {
    const p = [priceVideo, priceFeed, priceStory].filter(v => v > 0)
    if (!p.length) return "미정"
    const min = Math.min(...p), max = Math.max(...p)
    return min === max ? fmtPrice(min) : `${fmtPrice(min)} ~ ${fmtPrice(max)}`
}

function getSnsUrl(platform: string, handle: string): string {
    const clean = handle.replace(/^@/, "")
    switch (platform) {
        case "instagram": return `https://instagram.com/${clean}`
        case "youtube": return `https://youtube.com/@${clean}`
        case "tiktok": return `https://tiktok.com/@${clean}`
        default: return handle.startsWith("http") ? handle : `https://${handle}`
    }
}

// ============================================================
// CreatorProfileCard Component
// ============================================================
interface CreatorProfileCardProps {
    creatorId: string
    trigger: React.ReactNode
}

export function CreatorProfileCard({ creatorId, trigger }: CreatorProfileCardProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            {open && (
                <CreatorProfileCardContent
                    creatorId={creatorId}
                    onClose={() => setOpen(false)}
                />
            )}
        </Dialog>
    )
}

// ============================================================
// Card Content (fetches data when mounted)
// ============================================================
function CreatorProfileCardContent({
    creatorId,
    onClose,
}: {
    creatorId: string
    onClose: () => void
}) {
    const { profile, isLoading } = useCreatorProfile(creatorId)
    const { toggleFavorite, favorites } = useUnifiedProvider()
    const router = useRouter()

    const isFavorited = favorites.some(
        (f: any) => f.target_id === creatorId && f.target_type === "profile"
    )

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await toggleFavorite(creatorId, "profile")
        } catch (err) {
            console.error("[CreatorProfileCard] Favorite toggle error:", err)
        }
    }

    const handleMomentClick = (momentId: string) => {
        onClose()
        router.push(`/event/${momentId}`)
    }

    const handleChannelClick = (platform: string, handle: string) => {
        window.open(getSnsUrl(platform, handle), "_blank", "noopener,noreferrer")
    }

    // Loading state
    if (isLoading || !profile) {
        return (
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(139,92,246,0.3)] text-white [&>button]:text-white">
                <DialogTitle className="sr-only">크리에이터 프로필</DialogTitle>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                    <p className="text-sm text-white/50">프로필을 불러오는 중...</p>
                </div>
            </DialogContent>
        )
    }

    const totalFollowers = profile.channels.reduce((s, ch) => s + ch.followersCount, 0)
    const displayHandle = profile.handle ? (profile.handle.startsWith("@") ? profile.handle : `@${profile.handle}`) : profile.displayName

    return (
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(139,92,246,0.3)] text-white [&>button]:text-white">
            <DialogTitle className="sr-only">크리에이터 프로필</DialogTitle>

            {/* Purple glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/30 blur-[80px] pointer-events-none" />

            {/* Avatar + Name + Region + Tags + Bio */}
            <div className="relative px-6 pt-8 pb-4 text-center">
                <div className="mx-auto h-20 w-20 rounded-full ring-2 ring-purple-400/50 ring-offset-2 ring-offset-slate-900 overflow-hidden">
                    {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center text-2xl font-bold text-white">
                            {profile.displayName[0]?.toUpperCase() || "C"}
                        </div>
                    )}
                </div>

                {/* Name + Star */}
                <div className="flex items-center justify-center gap-2 mt-3">
                    <h2 className="text-lg font-bold">{displayHandle}</h2>
                    <button
                        onClick={handleToggleFavorite}
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${isFavorited
                            ? "bg-amber-500/30 text-amber-400 hover:bg-amber-500/40"
                            : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/80"
                            }`}
                    >
                        <Star className={`h-3.5 w-3.5 ${isFavorited ? "fill-current" : ""}`} />
                    </button>
                </div>

                {/* Region */}
                {profile.primaryRegion && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-white/50 mt-1">
                        <MapPin className="h-3 w-3" /><span>{profile.primaryRegion}</span>
                    </div>
                )}

                {/* Tags */}
                {profile.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                        {profile.tags.map(tag => (
                            <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/80 font-medium">{tag}</span>
                        ))}
                    </div>
                )}

                {/* Bio */}
                {profile.description && (
                    <p className="text-xs text-white/50 mt-3 leading-relaxed line-clamp-2">{profile.description}</p>
                )}
            </div>

            {/* Stats: Followers / Moments / Price Range */}
            <div className="mx-6 p-3 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-3 gap-2 text-center">
                <div>
                    <div className="text-lg font-bold text-purple-300">{fmtFollowers(totalFollowers)}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">총 팔로워</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-fuchsia-300">{profile.moments.length}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">모먼트</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-pink-300">
                        {getPriceRange(profile.priceVideo, profile.priceFeed, profile.priceStory)}
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5">예상 단가</div>
                </div>
            </div>

            {/* Channels */}
            {profile.channels.length > 0 && (
                <div className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                        {profile.channels.map((ch) => {
                            const cfg = PLATFORM_CONFIG[ch.platform] || PLATFORM_CONFIG.other
                            return (
                                <div
                                    key={ch.id}
                                    className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                                    onClick={() => handleChannelClick(ch.platform, ch.handle)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${cfg.gradient} text-white`}>
                                            {cfg.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-medium truncate">{ch.handle}</div>
                                            <div className="text-[10px] text-white/40">{fmtFollowers(ch.followersCount)}</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Moments */}
            {profile.moments.length > 0 && (
                <div className="px-6 py-3">
                    <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />모먼트 모아보기
                    </h3>
                    <div className="space-y-1.5">
                        {profile.moments.map(m => (
                            <div
                                key={m.id}
                                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all cursor-pointer group"
                                onClick={() => handleMomentClick(m.id)}
                            >
                                <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-sm ${m.status === "recruiting" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                                    }`}>
                                    {m.status === "recruiting" ? "🟢" : "✓"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{m.title}</div>
                                    <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5">
                                        <Calendar className="h-2.5 w-2.5" /><span>{m.eventDate || "미정"}</span>
                                        <span className="text-white/20">·</span>
                                        <Gift className="h-2.5 w-2.5" /><span className="truncate">{m.targetProduct || "미정"}</span>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-3.5 w-3.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DialogContent>
    )
}
