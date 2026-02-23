"use client"

/**
 * Design D: "Dense Split View"
 * - Everything above the fold on a large screen
 * - Left: Creator + Description + Guide
 * - Right: Meta info grid + Channels + Rate Card + CTA
 * - Extremely compact spacing
 */

import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft, BadgeCheck, Calendar, Clock, FileText,
    Globe, Instagram, Lock, MessageCircle, Music, Package, Share2, Sparkles, Tv, Youtube
} from "lucide-react"
import Link from "next/link"

const MOCK = {
    influencer: "김소연",
    handle: "@soyeon_beauty",
    avatar: "https://i.pravatar.cc/150?u=soyeon",
    followers: 48200,
    verified: true,
    category: "💄 뷰티",
    title: "피부과 레이저 시술 후기 & 홈케어 루틴",
    description: `3월에 피부과에서 레이저 토닝 시술을 받을 예정입니다. 시술 전후 비교와 함께 홈케어 루틴을 소개하는 콘텐츠를 제작하려고 합니다.\n\n평소 피부 관리에 관심이 많은 팔로워분들이 많아서, 시술 후기와 함께 추천 제품을 자연스럽게 소개할 수 있습니다.\n\n특히 시술 직후부터 2주간의 회복 과정을 브이로그로 담아 리얼한 후기를 전달할 예정이며, 사용하는 스킨케어 제품들의 효과를 직접 보여드릴 수 있습니다.`,
    eventDate: "2026년 3월",
    postingDate: "2026년 4월",
    dateFlexible: false,
    targetProduct: "더마 화장품, 선크림, 시술 후 진정 크림, 재생 패치",
    tags: ["💄 뷰티", "💊 건강", "💉 시술/병원"],
    channels: ["instagram_reels", "youtube_shorts"],
    guide: `1. 시술 전 피부 상태 촬영 (자연광)\n2. 시술 과정 간단 브이로그\n3. 시술 후 2주간 피부 변화 타임랩스\n4. 홈케어 루틴에서 제품 자연스럽게 노출`,
}

const CH: Record<string, { bg: string; label: string; Icon: any }> = {
    instagram_reels: { bg: "from-purple-600 via-pink-600 to-orange-600", label: "🎞️ 릴스", Icon: Instagram },
    instagram_feed: { bg: "from-purple-600 via-pink-600 to-orange-600", label: "📷 피드", Icon: Instagram },
    instagram_story: { bg: "from-purple-600 via-pink-600 to-orange-600", label: "⭕ 스토리", Icon: Instagram },
    youtube_longform: { bg: "from-red-600 to-red-700", label: "▶️ 롱폼", Icon: Youtube },
    youtube_shorts: { bg: "from-red-600 to-red-700", label: "⚡ 숏츠", Icon: Youtube },
    tiktok: { bg: "from-black to-slate-800", label: "틱톡", Icon: Music },
    blog: { bg: "from-green-500 to-green-600", label: "블로그", Icon: FileText },
}

const RATES = [
    { label: "숏폼 영상 (Reels)", price: "₩450,000" },
    { label: "이미지 (Feed)", price: "₩200,000" },
    { label: "스토리 (24h)", price: "₩80,000" },
    { label: "유튜브 숏츠", price: "₩350,000" },
    { label: "2차 활용 권한", price: "3개월 / ₩150,000" },
]

export default function DesignDPage() {
    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container max-w-6xl mx-auto px-4 py-4">
                <Button variant="ghost" size="sm" asChild className="gap-2 mb-3">
                    <Link href="/design-lab/moment_card_inside"><ArrowLeft className="h-4 w-4" /> 목록으로</Link>
                </Button>

                {/* Top Bar: Creator + Title + CTA */}
                <div className="flex items-start gap-4 mb-4">
                    <img src={MOCK.avatar} alt="" className="h-14 w-14 rounded-full object-cover border-2 border-primary/20 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-lg">{MOCK.influencer}</span>
                            {MOCK.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                            <span className="text-sm text-muted-foreground">{MOCK.handle} · 팔로워 {MOCK.followers.toLocaleString()}</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight leading-tight">{MOCK.title}</h1>
                    </div>
                    <div className="flex gap-2 shrink-0 pt-1">
                        <Button className="gap-2" size="default"><MessageCircle className="h-4 w-4" /> 협업 제안하기</Button>
                        <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
                    </div>
                </div>

                {/* Category Tags inline */}
                <div className="flex gap-1.5 mb-4">
                    {MOCK.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>

                {/* Two Column Dense Layout */}
                <div className="grid grid-cols-[1fr_380px] gap-5">
                    {/* LEFT: Description + Guide */}
                    <div className="space-y-4">
                        <div className="rounded-lg border bg-card p-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">상세 설명</h3>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{MOCK.description}</p>
                        </div>

                        <div className="rounded-lg border bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 p-4">
                            <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5" /> 제작 가이드
                            </h3>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">{MOCK.guide}</p>
                            <p className="text-[11px] text-amber-600/70 mt-2">💡 예시 가이드입니다. 협의 가능합니다.</p>
                        </div>
                    </div>

                    {/* RIGHT: Meta + Channels + Rate Card */}
                    <div className="space-y-4">
                        {/* Schedule + Product */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg border p-3 bg-primary/5">
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                                    <Calendar className="h-3 w-3 text-primary" /> 모먼트 일정
                                </div>
                                <p className="font-bold text-primary">{MOCK.eventDate}</p>
                            </div>
                            <div className="rounded-lg border p-3 bg-emerald-500/5">
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                                    <Clock className="h-3 w-3 text-emerald-600" /> 업로드
                                </div>
                                <p className="font-bold text-emerald-600">{MOCK.dateFlexible ? "협의 가능" : MOCK.postingDate}</p>
                            </div>
                        </div>

                        <div className="rounded-lg border p-3">
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
                                <Package className="h-3 w-3" /> 광고 가능 아이템
                            </div>
                            <p className="text-sm font-medium">{MOCK.targetProduct}</p>
                        </div>

                        {/* Channels */}
                        <div className="rounded-lg border p-3">
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
                                <Tv className="h-3 w-3" /> 희망 채널 · 형태
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {MOCK.channels.map(ch => {
                                    const s = CH[ch] || { bg: "from-slate-600 to-slate-700", label: ch, Icon: Globe }
                                    return (
                                        <span key={ch} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${s.bg}`}>
                                            <s.Icon className="h-3.5 w-3.5" /> {s.label}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Rate Card */}
                        <div className="rounded-lg border overflow-hidden">
                            <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-b flex items-center gap-1.5">
                                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm font-bold">예상 단가표</span>
                                <span className="text-[10px] text-muted-foreground">(Rate Card)</span>
                            </div>
                            <div className="p-3 space-y-0">
                                {RATES.map((r, i) => (
                                    <div key={r.label} className={`flex justify-between items-center py-2 ${i < RATES.length - 1 ? 'border-b border-dashed' : ''}`}>
                                        <span className="text-xs text-muted-foreground">{r.label}</span>
                                        <div className="flex items-center gap-1">
                                            <Lock className="h-2.5 w-2.5 text-muted-foreground/50" />
                                            <span className="font-bold text-emerald-700 text-xs blur-[5px] select-none">{r.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-3 py-2 bg-muted/40 border-t">
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Lock className="h-3 w-3 shrink-0" /> 협업 제안 수락 후 워크스페이스에서 공개됩니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
