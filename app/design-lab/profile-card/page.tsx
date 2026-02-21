"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Send, ExternalLink, Calendar, Gift, Instagram, Youtube, Music2, BookOpen, ChevronRight, ArrowUpRight, Sparkles, Film, Camera, CircleDot } from "lucide-react"

// ============================================================
// Shared Data & Utilities
// ============================================================

const MOCK_CREATOR = {
    id: "creator-1",
    username: "kimbeauty_official",
    avatar: "",
    bio: "뷰티/스킨케어 전문 크리에이터입니다. 진솔한 리뷰와 꼼꼼한 성분 분석으로 2만 팔로워와 소통하고 있어요. 브랜드 협업 문의 환영합니다 💄",
    tags: ["💄 뷰티", "💊 건강", "🥗 다이어트"],
    primaryRegion: "서울",
    channels: [
        { platform: "instagram", handle: "@kimbeauty_official", followersCount: 24500, isPrimary: true },
        { platform: "youtube", handle: "김뷰티TV", followersCount: 8200, isPrimary: false },
    ],
    priceVideo: 350000,
    priceFeed: 200000,
    priceStory: 80000,
    moments: [
        { id: "m1", event: "여름 선크림 비교 리뷰 🌞", eventDate: "2026-07", targetProduct: "선크림/자외선차단제", status: "upcoming", description: "국내외 선크림 10종을 직접 비교해봅니다" },
        { id: "m2", event: "다이어트 보조제 체험 후기", eventDate: "2026-08", targetProduct: "건강보조식품", status: "upcoming", description: "2주간 직접 먹어보고 후기를 남깁니다" },
        { id: "m3", event: "봄 신상 립스틱 컬러 추천", eventDate: "2026-03", targetProduct: "립스틱", status: "completed", description: "2026 S/S 신상 립스틱 TOP 5" },
        { id: "m4", event: "피부 고민별 스킨케어 루틴 🧴", eventDate: "2026-09", targetProduct: "스킨케어 세트", status: "upcoming", description: "건성/지성/복합성 피부별 맞춤 루틴" },
        { id: "m5", event: "겨울 보습 파운데이션 리뷰", eventDate: "2026-12", targetProduct: "파운데이션", status: "upcoming", description: "건조한 겨울에도 촉촉한 파운데이션 TOP 7" },
    ],
}

const PLATFORM_CONFIG: Record<string, { icon: React.ReactNode; gradient: string; color: string; label: string }> = {
    instagram: { icon: <Instagram className="h-4 w-4" />, gradient: "from-purple-500 via-pink-500 to-orange-500", color: "text-pink-500", label: "Instagram" },
    youtube: { icon: <Youtube className="h-4 w-4" />, gradient: "from-red-500 to-red-600", color: "text-red-500", label: "YouTube" },
    tiktok: { icon: <Music2 className="h-4 w-4" />, gradient: "from-black to-slate-700", color: "text-slate-500", label: "TikTok" },
    blog: { icon: <BookOpen className="h-4 w-4" />, gradient: "from-green-500 to-green-600", color: "text-green-500", label: "Blog" },
}

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
function getPriceRange(c: typeof MOCK_CREATOR) {
    const p = [c.priceVideo, c.priceFeed, c.priceStory].filter(v => v > 0)
    if (!p.length) return "미정"
    const min = Math.min(...p), max = Math.max(...p)
    return min === max ? fmtPrice(min) : `${fmtPrice(min)} ~ ${fmtPrice(max)}`
}

// ============================================================
// Design A: Clean & Minimal
// ============================================================
function DesignA() {
    const c = MOCK_CREATOR
    const [starred, setStarred] = useState(false)
    return (
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
            <DialogTitle className="sr-only">크리에이터 프로필</DialogTitle>
            <div className="relative">
                <div className="h-28 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                <div className="absolute -bottom-12 left-6">
                    <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg">
                        <div className="h-full w-full rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-3xl font-bold text-purple-600">
                            {c.avatar ? <img src={c.avatar} alt={c.username} className="h-full w-full object-cover rounded-xl" /> : c.username[0].toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-6 pt-14 pb-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">@{c.username}</h2>
                    <button
                        onClick={() => setStarred(!starred)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${starred
                            ? 'bg-amber-100 text-amber-500 hover:bg-amber-200'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }`}
                    >
                        <Star className={`h-4 w-4 ${starred ? 'fill-current' : ''}`} />
                    </button>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{c.primaryRegion}</span>
                    <span className="text-border">·</span>
                    <span className="text-primary font-semibold">{getPriceRange(c)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-2">{c.bio}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {c.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs font-medium rounded-full px-2.5 py-0.5">{tag}</Badge>
                    ))}
                </div>
            </div>
            <div className="px-6 py-3">
                <div className="flex gap-2">
                    {c.channels.map((ch, i) => {
                        const cfg = PLATFORM_CONFIG[ch.platform]
                        return (
                            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${cfg?.gradient} text-white text-xs font-medium shadow-sm`}>
                                {cfg?.icon}
                                <span>{ch.handle}</span>
                                <span className="opacity-80">· {fmtFollowers(ch.followersCount)}</span>
                                {ch.isPrimary && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">메인</span>}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="px-6 py-3 border-t border-border/40">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    📋 모먼트 모아보기
                    <Badge variant="outline" className="text-[10px] font-normal">{c.moments.length}건</Badge>
                </h3>
                <div className="space-y-2">
                    {c.moments.slice(0, 3).map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                            <div className={`h-2 w-2 rounded-full shrink-0 ${m.status === 'upcoming' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{m.event}</div>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                    <Calendar className="h-3 w-3" /><span>{m.eventDate}</span>
                                    <span className="text-border">·</span>
                                    <Gift className="h-3 w-3" /><span>{m.targetProduct}</span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>
        </DialogContent>
    )
}

// ============================================================
// Design B: Dark Glassmorphism
// ============================================================
function DesignB() {
    const c = MOCK_CREATOR
    const [starred, setStarred] = useState(false)
    return (
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(139,92,246,0.3)] text-white [&>button]:text-white">
            <DialogTitle className="sr-only">크리에이터 프로필</DialogTitle>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/30 blur-[80px] pointer-events-none" />
            <div className="relative px-6 pt-8 pb-4 text-center">
                <div className="mx-auto h-20 w-20 rounded-full ring-2 ring-purple-400/50 ring-offset-2 ring-offset-slate-900 overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center text-2xl font-bold text-white">
                        {c.avatar ? <img src={c.avatar} alt={c.username} className="h-full w-full object-cover" /> : c.username[0].toUpperCase()}
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                    <h2 className="text-lg font-bold">@{c.username}</h2>
                    <button
                        onClick={() => setStarred(!starred)}
                        className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${starred
                            ? 'bg-amber-500/30 text-amber-400 hover:bg-amber-500/40'
                            : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/80'
                            }`}
                    >
                        <Star className={`h-3.5 w-3.5 ${starred ? 'fill-current' : ''}`} />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-white/50 mt-1">
                    <MapPin className="h-3 w-3" /><span>{c.primaryRegion}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                    {c.tags.map(tag => (
                        <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/80 font-medium">{tag}</span>
                    ))}
                </div>
                <p className="text-xs text-white/50 mt-3 leading-relaxed line-clamp-2">{c.bio}</p>
            </div>
            <div className="mx-6 p-3 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-3 gap-2 text-center">
                <div>
                    <div className="text-lg font-bold text-purple-300">{fmtFollowers(c.channels.reduce((s, ch) => s + ch.followersCount, 0))}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">총 팔로워</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-fuchsia-300">{c.moments.length}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">모먼트</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-pink-300">{getPriceRange(c)}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">예상 단가</div>
                </div>
            </div>
            <div className="px-6 py-3">
                <div className="flex gap-2">
                    {c.channels.map((ch, i) => {
                        const cfg = PLATFORM_CONFIG[ch.platform]
                        return (
                            <div key={i} className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${cfg?.gradient} text-white`}>{cfg?.icon}</div>
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
            <div className="px-6 py-3">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />모먼트 모아보기
                </h3>
                <div className="space-y-1.5">
                    {c.moments.slice(0, 3).map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/10 transition-all cursor-pointer group">
                            <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-sm ${m.status === 'upcoming' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {m.status === 'upcoming' ? '🟢' : '✓'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{m.event}</div>
                                <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5">
                                    <Calendar className="h-2.5 w-2.5" /><span>{m.eventDate}</span>
                                    <span className="text-white/20">·</span>
                                    <Gift className="h-2.5 w-2.5" /><span className="truncate">{m.targetProduct}</span>
                                </div>
                            </div>
                            <ArrowUpRight className="h-3.5 w-3.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        </DialogContent>
    )
}

// ============================================================
// Design C: Split-Panel
// ============================================================
const RATE_ITEMS = [
    { icon: <Film className="h-3.5 w-3.5" />, label: "영상", key: "priceVideo" as const },
    { icon: <Camera className="h-3.5 w-3.5" />, label: "피드", key: "priceFeed" as const },
    { icon: <CircleDot className="h-3.5 w-3.5" />, label: "스토리", key: "priceStory" as const },
]

function DesignC() {
    const c = MOCK_CREATOR
    return (
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl border shadow-2xl h-[560px]">
            <DialogTitle className="sr-only">크리에이터 프로필</DialogTitle>
            <div className="flex h-full">
                {/* LEFT */}
                <div className="w-[280px] shrink-0 bg-gradient-to-b from-violet-50 to-white border-r flex flex-col">
                    <div className="p-6 text-center border-b border-border/40">
                        <div className="mx-auto h-20 w-20 rounded-2xl overflow-hidden shadow-md">
                            <div className="h-full w-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                                {c.avatar ? <img src={c.avatar} alt={c.username} className="h-full w-full object-cover" /> : c.username[0].toUpperCase()}
                            </div>
                        </div>
                        <h2 className="text-lg font-bold mt-3">@{c.username}</h2>
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" /><span>{c.primaryRegion}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-center mt-2.5">
                            {c.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-[10px] rounded-full px-2 py-0.5">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="px-5 py-3 border-b border-border/40">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{c.bio}</p>
                    </div>
                    <div className="px-5 py-3 border-b border-border/40 space-y-2">
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">채널</h4>
                        {c.channels.map((ch, i) => {
                            const cfg = PLATFORM_CONFIG[ch.platform]
                            return (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <span className={cfg?.color}>{cfg?.icon}</span>
                                    <span className="font-medium truncate flex-1">{ch.handle}</span>
                                    <span className="text-muted-foreground text-[10px]">{fmtFollowers(ch.followersCount)}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="px-5 py-3 border-b border-border/40">
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">예상 단가</h4>
                        <div className="text-lg font-bold text-primary">{getPriceRange(c)}</div>
                        <div className="grid grid-cols-3 gap-1 mt-2">
                            {RATE_ITEMS.map(r => (
                                <div key={r.key} className="text-center p-1.5 rounded-lg bg-muted/50">
                                    <div className="flex items-center justify-center text-muted-foreground">{r.icon}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">{r.label}</div>
                                    <div className="text-xs font-semibold">{fmtPrice(c[r.key])}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-5 mt-auto space-y-2">
                        <Button className="w-full gap-2 rounded-xl" size="sm"><Send className="h-3.5 w-3.5" />제안 보내기</Button>
                        <Button variant="outline" className="w-full gap-2 rounded-xl" size="sm"><Star className="h-3.5 w-3.5" />즐겨찾기 추가</Button>
                    </div>
                </div>
                {/* RIGHT */}
                <div className="flex-1 flex flex-col bg-white min-w-0">
                    <div className="px-6 py-4 border-b border-border/40 shrink-0 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold">모먼트 모아보기</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {c.moments.filter(m => m.status === 'upcoming').length}건 모집중 · 총 {c.moments.length}건
                            </p>
                        </div>
                        <div className="flex gap-1.5">
                            <Badge variant="secondary" className="text-[10px] rounded-full">전체</Badge>
                            <Badge variant="outline" className="text-[10px] rounded-full cursor-pointer hover:bg-emerald-50">🟢 모집중</Badge>
                            <Badge variant="outline" className="text-[10px] rounded-full cursor-pointer hover:bg-amber-50">✓ 완료</Badge>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {c.moments.map(m => (
                            <div key={m.id} className="p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group bg-white">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full shrink-0 ${m.status === 'upcoming' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                            <h4 className="text-sm font-bold truncate">{m.event}</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{m.description}</p>
                                        <div className="flex items-center gap-3 mt-2.5">
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                                                <Calendar className="h-3 w-3" /><span>{m.eventDate}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                                                <Gift className="h-3 w-3" /><span>{m.targetProduct}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                                {m.status === 'upcoming' && (
                                    <div className="mt-3 pt-3 border-t border-border/40">
                                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 rounded-lg">
                                            <Send className="h-3 w-3" />이 모먼트에 제안
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DialogContent>
    )
}

// ============================================================
// Main Page with Tabs
// ============================================================
const DESIGNS = [
    { key: "a", label: "A · Clean & Minimal", desc: "밝고 깔끔한 세로형", component: DesignA },
    { key: "b", label: "B · Dark Glass", desc: "프리미엄 다크 유리", component: DesignB },
    { key: "c", label: "C · Split-Panel", desc: "좌: 프로필 / 우: 모먼트", component: DesignC },
]

export default function ProfileCardDesignLab() {
    const [tab, setTab] = useState("a")
    const [open, setOpen] = useState(true)
    const current = DESIGNS.find(d => d.key === tab)!
    const CurrentDesign = current.component

    return (
        <div className={`min-h-screen transition-colors duration-500 ${tab === 'b' ? 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-violet-50'}`}>
            {/* Top Tab Bar */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b">
                <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-6">
                    <h1 className={`text-lg font-bold shrink-0 ${tab === 'b' ? 'text-white' : ''}`}>
                        🎨 프로필 카드 디자인
                    </h1>
                    <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
                        {DESIGNS.map(d => (
                            <button
                                key={d.key}
                                onClick={() => { setTab(d.key); setOpen(true) }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === d.key
                                    ? 'bg-white shadow-sm text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <span className="block">{d.label}</span>
                                <span className="block text-[10px] font-normal mt-0.5">{d.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dialog Preview */}
            <div className="flex items-center justify-center p-12">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="lg"
                            className={tab === 'b' ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : ''}
                        >
                            프로필 카드 열기
                        </Button>
                    </DialogTrigger>
                    <CurrentDesign />
                </Dialog>
            </div>
        </div>
    )
}
