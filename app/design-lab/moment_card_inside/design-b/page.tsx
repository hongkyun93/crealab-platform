"use client"

/**
 * Design B: "Compact Dashboard"
 * - Creator profile card pinned at top
 * - All info in organized grid cards
 * - Rate card integrated into the grid
 * - More compact, data-dense layout
 */

import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ArrowLeft, BadgeCheck, Calendar, Clock, FileText,
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

export default function DesignBPage() {
    const event = MOCK_EVENT

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container max-w-5xl mx-auto px-4 py-8">
                <Button variant="ghost" size="sm" asChild className="gap-2 mb-6">
                    <Link href="/design-lab/moment_card_inside">
                        <ArrowLeft className="h-4 w-4" /> 목록으로
                    </Link>
                </Button>

                {/* Creator Profile Bar */}
                <Card className="mb-6 overflow-hidden">
                    <div className="flex items-center p-5 gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-primary to-violet-600 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg shrink-0">
                            {event.influencer[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h2 className="text-lg font-bold truncate">{event.influencer}</h2>
                                {event.verified && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
                                <Badge variant="secondary" className="text-xs shrink-0">{event.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.handle} · 팔로워 {event.followers.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button className="gap-2" size="default">
                                <MessageCircle className="h-4 w-4" /> 협업 제안하기
                            </Button>
                            <Button variant="outline" size="icon">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Title */}
                <h1 className="text-3xl font-bold tracking-tight mb-6">{event.title}</h1>

                {/* Info Grid - Top Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                모먼트 일정
                            </div>
                            <p className="text-lg font-bold text-primary">{event.momentDate}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                                콘텐츠 업로드
                            </div>
                            <p className="text-lg font-bold text-emerald-600">
                                {event.dateFlexible ? "협의 가능" : event.postingDate}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="col-span-2">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Tv className="h-3.5 w-3.5" />
                                희망 채널 · 형태
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {event.channels.map(ch => {
                                    const style = CHANNEL_STYLES[ch] || { bg: "from-slate-600 to-slate-700", label: ch, Icon: Globe }
                                    const Icon = style.Icon
                                    return (
                                        <span key={ch} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${style.bg}`}>
                                            <Icon className="h-3.5 w-3.5" /> {style.label}
                                        </span>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    {/* Left: Description + Guide */}
                    <div className="space-y-6">
                        {/* Description */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-muted-foreground font-medium">상세 설명</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{event.description}</p>
                            </CardContent>
                        </Card>

                        {/* Target Product */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                    <Package className="h-4 w-4" /> 광고 가능 아이템
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[15px]">{event.targetProduct}</p>
                            </CardContent>
                        </Card>

                        {/* Production Guide */}
                        <Card className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> 제작 가이드
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">{event.guide}</p>
                                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-amber-200/50">
                                    💡 크리에이터가 예시로 제시한 제작가이드입니다. 언제든지 협의 가능합니다.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            {event.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-sm px-3 py-1.5">{tag}</Badge>
                            ))}
                        </div>
                    </div>

                    {/* Right: Rate Card */}
                    <div className="space-y-6">
                        <div className="sticky top-24">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <BadgeCheck className="h-5 w-5 text-emerald-600" />
                                        예상 단가표
                                        <span className="text-xs font-normal text-muted-foreground">(Rate Card)</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { label: "숏폼 영상 (Reels)", price: "₩450,000" },
                                        { label: "이미지 (Feed)", price: "₩200,000" },
                                        { label: "스토리 (24h)", price: "₩80,000" },
                                        { label: "유튜브 숏츠", price: "₩350,000" },
                                        { label: "2차 활용 권한", price: "3개월 / ₩150,000" },
                                    ].map(item => (
                                        <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-dashed last:border-0">
                                            <span className="text-sm text-muted-foreground">{item.label}</span>
                                            <div className="flex items-center gap-1.5">
                                                <Lock className="h-3 w-3 text-muted-foreground/60" />
                                                <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">{item.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-3 bg-muted/50 rounded-lg border border-dashed flex items-start gap-2 mt-2">
                                        <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            <strong>단가표 비공개 보호</strong><br />
                                            정확한 단가는 협업 제안이 수락되어 워크스페이스가 생성된 후 공개됩니다.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
