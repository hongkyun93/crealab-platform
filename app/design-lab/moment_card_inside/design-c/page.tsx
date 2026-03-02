"use client"

/**
 * Design C: "Single Column Storytelling"
 * - Centered single column, max-width 680px
 * - Creator card with glassmorphism
 * - Flowing narrative layout like a blog post
 * - Rate card as full-width blurred banner
 * - Premium, minimal, content-focused
 */

import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft, BadgeCheck, Calendar, ChevronRight, Clock, FileText,
    Globe, Instagram, Lock, MessageCircle, Music, Package, Share2, Sparkles, Tv, Youtube
} from "lucide-react"
import Link from "next/link"

const MOCK_EVENT = {
    influencer: "김소연",
    handle: "@soyeon_beauty",
    avatar: "",
    followers: 48200,
    verified: true,
    category: "💄 뷰티",
    title: "피부과 레이저 시술 후기 & 홈케어 루틴",
    description: `3월에 피부과에서 레이저 토닝 시술을 받을 예정입니다. 시술 전후 비교와 함께 홈케어 루틴을 소개하는 콘텐츠를 제작하려고 합니다.

평소 피부 관리에 관심이 많은 팔로워분들이 많아서, 시술 후기와 함께 추천 제품을 자연스럽게 소개할 수 있습니다.

특히 시술 직후부터 2주간의 회복 과정을 브이로그로 담아 리얼한 후기를 전달할 예정이며, 사용하는 스킨케어 제품들의 효과를 직접 보여드릴 수 있습니다.`,
    momentDate: "2026년 3월",
    postingDate: "2026년 4월",
    dateFlexible: false,
    targetProduct: "더마 화장품, 선크림, 시술 후 진정 크림, 재생 패치",
    tags: ["💄 뷰티", "💊 건강", "💉 시술/병원"],
    channels: ["instagram_reels", "youtube_shorts"],
    guide: `실제로 내가 먹고싶어서 사는것처럼 찍음

1. 시술 전 피부 상태 촬영 (자연광)
2. 시술 과정 간단 브이로그
3. 시술 후 2주간 피부 변화 타임랩스
4. 홈케어 루틴에서 제품 자연스럽게 노출`,
    priceVideo: 450000,
}

const CHANNEL_STYLES: Record<string, { bg: string; label: string; Icon: any }> = {
    instagram_reels: { bg: "from-purple-600 via-pink-600 to-orange-600", label: "🎞️ 릴스", Icon: Instagram },
    instagram_feed: { bg: "from-purple-600 via-pink-600 to-orange-600", label: "📷 피드", Icon: Instagram },
    instagram_story: { bg: "from-purple-600 via-pink-600 to-orange-600", label: "⭕ 스토리", Icon: Instagram },
    youtube_longform: { bg: "from-red-600 to-red-700", label: "▶️ 롱폼", Icon: Youtube },
    youtube_shorts: { bg: "from-red-600 to-red-700", label: "⚡ 숏츠", Icon: Youtube },
    tiktok: { bg: "from-black to-slate-800", label: "틱톡", Icon: Music },
    blog: { bg: "from-green-500 to-green-600", label: "블로그", Icon: FileText },
}

export default function DesignCPage() {
    const event = MOCK_EVENT

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />
            <main className="mx-auto max-w-[680px] px-4 py-8">
                <Button variant="ghost" size="sm" asChild className="gap-2 mb-8">
                    <Link href="/design-lab/moment_card_inside">
                        <ArrowLeft className="h-4 w-4" /> 목록으로
                    </Link>
                </Button>

                {/* Creator Card */}
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mb-8 overflow-hidden">
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div className="relative flex items-center gap-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-primary to-violet-500 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-2xl ring-2 ring-white/20">
                            {event.influencer[0]}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold">{event.influencer}</h2>
                                {event.verified && <BadgeCheck className="h-4 w-4 text-blue-400" />}
                            </div>
                            <p className="text-sm text-white/60">{event.handle} · 팔로워 {event.followers.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="relative flex gap-2 mt-5">
                        <Button className="flex-1 gap-2 bg-white text-slate-900 hover:bg-white/90" size="lg">
                            <MessageCircle className="h-4 w-4" /> 협업 제안하기
                        </Button>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
                            <Share2 className="h-4 w-4" /> 공유
                        </Button>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">{tag}</Badge>
                    ))}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold tracking-tight leading-tight mb-8">{event.title}</h1>

                {/* Timeline Section */}
                <div className="flex gap-3 mb-8">
                    <div className="flex-1 p-4 rounded-xl bg-primary/5 border border-primary/15">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            모먼트 일정
                        </div>
                        <p className="text-xl font-bold text-primary">{event.momentDate}</p>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <ChevronRight className="h-5 w-5" />
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                            <Clock className="h-3.5 w-3.5 text-emerald-600" />
                            콘텐츠 업로드
                        </div>
                        <p className="text-xl font-bold text-emerald-600">
                            {event.dateFlexible ? "협의 가능" : event.postingDate}
                        </p>
                    </div>
                </div>

                {/* Channels */}
                <div className="mb-8">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Tv className="h-3.5 w-3.5" /> 희망 채널 · 형태
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {event.channels.map(ch => {
                            const style = CHANNEL_STYLES[ch] || { bg: "from-slate-600 to-slate-700", label: ch, Icon: Globe }
                            const Icon = style.Icon
                            return (
                                <span key={ch} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r ${style.bg} shadow-md`}>
                                    <Icon className="h-4 w-4" /> {style.label}
                                </span>
                            )
                        })}
                    </div>
                </div>

                <Separator className="mb-8" />

                {/* Description */}
                <article className="mb-8">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">상세 설명</h3>
                    <p className="text-[15px] leading-[1.85] whitespace-pre-wrap text-foreground/85">{event.description}</p>
                </article>

                {/* Target Product */}
                <div className="p-5 rounded-xl bg-muted/50 border mb-8">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Package className="h-3.5 w-3.5" /> 광고 가능 아이템
                    </p>
                    <p className="text-[15px] font-medium">{event.targetProduct}</p>
                </div>

                {/* Production Guide */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-800/30 mb-8">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5" /> 제작 가이드
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">{event.guide}</p>
                    <p className="text-xs text-amber-700/60 dark:text-amber-300/60 mt-4 pt-3 border-t border-amber-200/50">
                        💡 크리에이터가 예시로 제시한 제작가이드입니다. 언제든지 협의 가능합니다.
                    </p>
                </div>

                {/* Rate Card — Full Width Blurred Banner */}
                <div className="rounded-2xl overflow-hidden border shadow-lg mb-8">
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b">
                        <h3 className="text-base font-bold flex items-center gap-2">
                            <BadgeCheck className="h-5 w-5 text-emerald-600" />
                            예상 단가표
                            <span className="text-xs font-normal text-muted-foreground">(Rate Card)</span>
                        </h3>
                    </div>
                    <div className="p-5 space-y-0 bg-background">
                        {[
                            { label: "숏폼 영상 (Reels)", price: "₩450,000" },
                            { label: "이미지 (Feed)", price: "₩200,000" },
                            { label: "스토리 (24h)", price: "₩80,000" },
                            { label: "유튜브 숏츠", price: "₩350,000" },
                            { label: "2차 활용 권한", price: "3개월 / ₩150,000" },
                        ].map((item, i) => (
                            <div key={item.label} className={`flex justify-between items-center py-3.5 ${i < 4 ? 'border-b border-dashed' : ''}`}>
                                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                                <div className="flex items-center gap-2">
                                    <Lock className="h-3 w-3 text-muted-foreground/50" />
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400 blur-[6px] select-none text-sm">{item.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-4 bg-muted/40 border-t flex items-start gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <strong>단가표 비공개 보호</strong> — 정확한 단가는 협업 제안이 수락되어 워크스페이스가 생성된 후 공개됩니다.
                        </p>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="sticky bottom-6 z-10">
                    <div className="p-4 rounded-2xl bg-background/80 backdrop-blur-xl border shadow-2xl flex gap-3">
                        <Button className="flex-1 gap-2" size="lg">
                            <MessageCircle className="h-5 w-5" /> 협업 제안하기
                        </Button>
                        <Button variant="outline" size="lg" className="gap-2">
                            <Share2 className="h-4 w-4" /> 공유
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
