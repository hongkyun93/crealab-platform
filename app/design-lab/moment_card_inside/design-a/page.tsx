"use client"

/**
 * Design A: "Magazine Layout"
 * - Full-width hero with gradient overlay
 * - Creator info as floating card on top
 * - Wide content area with clear sections
 * - Rate card as glass card on the right
 */

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft, Calendar, BadgeCheck, MessageCircle, Share2,
    Package, Lock, Tv, Instagram, Youtube, Music, FileText, Globe
} from "lucide-react"
import Link from "next/link"

// Mock data representing all fields from MomentForm
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
    eventDate: "2026년 3월",
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

export default function DesignAPage() {
    const event = MOCK_EVENT

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-violet-500/10 border-b">
                <div className="container max-w-5xl mx-auto px-4 py-10">
                    <Button variant="ghost" size="sm" asChild className="gap-2 mb-6">
                        <Link href="/design-lab/moment_card_inside">
                            <ArrowLeft className="h-4 w-4" /> 목록으로
                        </Link>
                    </Button>

                    {/* Creator Info */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-16 w-16 bg-gradient-to-br from-primary to-violet-600 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-lg">
                            {event.influencer[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">{event.influencer}</h2>
                                {event.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                            </div>
                            <p className="text-muted-foreground">{event.handle}</p>
                        </div>
                        <div className="ml-auto text-right">
                            <span className="text-xs text-muted-foreground">팔로워</span>
                            <p className="text-lg font-bold">{event.followers.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Category + Title */}
                    <Badge variant="secondary" className="mb-3 text-sm px-3 py-1">{event.category}</Badge>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">{event.title}</h1>
                </div>
            </div>

            {/* Content */}
            <main className="container max-w-5xl mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Description */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">상세 설명</h3>
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90">{event.description}</p>
                        </section>

                        <Separator />

                        {/* Schedule Grid */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">일정</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-muted/50 border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span className="text-xs text-muted-foreground">모먼트 일정</span>
                                    </div>
                                    <p className="text-lg font-bold">{event.eventDate}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-muted/50 border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-emerald-500" />
                                        <span className="text-xs text-muted-foreground">콘텐츠 업로드</span>
                                    </div>
                                    <p className="text-lg font-bold">
                                        {event.dateFlexible ? (
                                            <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 border-emerald-100">협의 가능</Badge>
                                        ) : event.postingDate}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Target Product */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                <Package className="h-4 w-4" /> 광고 가능 아이템
                            </h3>
                            <p className="text-[15px] text-foreground/90">{event.targetProduct}</p>
                        </section>

                        <Separator />

                        {/* Channels */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                <Tv className="h-4 w-4" /> 희망 채널 · 형태
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {event.channels.map(ch => {
                                    const style = CHANNEL_STYLES[ch] || { bg: "from-slate-600 to-slate-700", label: ch, Icon: Globe }
                                    const Icon = style.Icon
                                    return (
                                        <span key={ch} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${style.bg} shadow-sm`}>
                                            <Icon className="h-4 w-4" /> {style.label}
                                        </span>
                                    )
                                })}
                            </div>
                        </section>

                        <Separator />

                        {/* Production Guide */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">제작 가이드</h3>
                            <div className="p-5 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">{event.guide}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                💡 크리에이터가 예시로 제시한 제작가이드입니다. 언제든지 협의 가능합니다.
                            </p>
                        </section>

                        <Separator />

                        {/* Tags */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">카테고리</h3>
                            <div className="flex flex-wrap gap-2">
                                {event.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1.5 border rounded-full text-sm text-muted-foreground bg-background">{tag}</span>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Sticky Sidebar) */}
                    <div className="space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {/* Action Buttons */}
                            <Card className="shadow-lg border-primary/20">
                                <CardContent className="p-5 space-y-3">
                                    <Button className="w-full gap-2" size="lg">
                                        <MessageCircle className="h-5 w-5" /> 협업 제안하기
                                    </Button>
                                    <Button variant="outline" className="w-full gap-2">
                                        <Share2 className="h-4 w-4" /> 공유하기
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Rate Card */}
                            <Card className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <BadgeCheck className="h-5 w-5 text-emerald-600" />
                                        예상 단가표
                                        <span className="text-xs font-normal text-muted-foreground">(Rate Card)</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        {[
                                            { label: "숏폼 영상 (Reels)", price: "₩450,000" },
                                            { label: "이미지 (Feed)", price: "₩200,000" },
                                            { label: "스토리 (24h)", price: "₩80,000" },
                                            { label: "2차 활용 권한", price: "3개월 / ₩150,000" },
                                        ].map(item => (
                                            <div key={item.label} className="flex justify-between items-center pb-2 border-b border-dashed last:border-0 last:pb-0">
                                                <span className="text-sm text-muted-foreground">{item.label}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Lock className="h-3 w-3 text-muted-foreground/70" />
                                                    <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">{item.price}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg border border-dashed flex items-start gap-2">
                                        <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                        <p className="text-xs text-muted-foreground">
                                            <strong>단가표 비공개 보호</strong><br />
                                            정확한 단가는 협업 제안이 수락되어 <strong>워크스페이스가 생성된 후</strong> 공개됩니다.
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
