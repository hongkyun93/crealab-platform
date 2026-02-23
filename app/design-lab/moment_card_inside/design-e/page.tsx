"use client"

/**
 * Design E (v2): "3-Column All-in-One"
 * - CTA buttons moved to right column below rate card
 * - Channel handles + followers merged into 콘텐츠 형태 section
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
    handle: "@soyeon_beauty",
    avatar: "https://i.pravatar.cc/150?u=soyeon",
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
    socialChannels: [
        { platform: "instagram", handle: "@soyeon_beauty", followersCount: 48200 },
        { platform: "youtube", handle: "@SoyeonBeautyTV", followersCount: 12400 },
    ],
    guide: `1. 시술 전 피부 상태 촬영 (자연광)
2. 시술 과정 간단 브이로그
3. 시술 후 2주간 피부 변화 타임랩스
4. 홈케어 루틴에서 제품 자연스럽게 노출`,
}

const CHANNEL_ICONS: Record<string, { Icon: any; color: string; bg: string; label: string }> = {
    instagram: { Icon: Instagram, color: "text-pink-600", bg: "from-purple-600 via-pink-600 to-orange-600", label: "Instagram" },
    youtube: { Icon: Youtube, color: "text-red-600", bg: "from-red-600 to-red-700", label: "YouTube" },
    tiktok: { Icon: Music, color: "text-slate-900", bg: "from-black to-slate-800", label: "TikTok" },
    blog: { Icon: FileText, color: "text-green-600", bg: "from-green-500 to-green-600", label: "Blog" },
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
    instagram_reels: "🎞️ 릴스",
    instagram_feed: "📷 피드",
    instagram_story: "⭕ 스토리",
    youtube_longform: "▶️ 롱폼",
    youtube_shorts: "⚡ 숏츠",
}

const RATES = [
    { label: "숏폼 영상", price: "₩450,000" },
    { label: "이미지 피드", price: "₩200,000" },
    { label: "스토리", price: "₩80,000" },
    { label: "유튜브 숏츠", price: "₩350,000" },
    { label: "2차 활용", price: "₩150,000" },
]

function formatFollowers(n: number) {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return String(n)
}

export default function DesignERefinedPage() {
    // Group channels by platform to merge socialChannels info with content types
    const channelsByPlatform = MOCK.channels.reduce<Record<string, string[]>>((acc, ch) => {
        const base = ch.split("_")[0]
        if (!acc[base]) acc[base] = []
        acc[base].push(ch)
        return acc
    }, {})

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container max-w-7xl mx-auto px-4 py-4">
                <Button variant="ghost" size="sm" asChild className="gap-2 mb-3">
                    <Link href="/design-lab/moment_card_inside"><ArrowLeft className="h-4 w-4" /> 목록으로</Link>
                </Button>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-[300px_1fr_320px] gap-5">

                    {/* COL 1: Profile + Meta */}
                    <div className="space-y-4">
                        {/* Profile Card */}
                        <div className="rounded-xl border bg-card p-5 text-center">
                            <img
                                src={MOCK.avatar}
                                alt=""
                                className="h-24 w-24 rounded-full object-cover border-3 border-primary/20 mx-auto mb-3 shadow-lg"
                            />
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <span className="font-bold text-xl">{MOCK.handle}</span>
                                {MOCK.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-primary" /> 모먼트 일정
                                </div>
                                <span className="text-base font-bold text-primary">{MOCK.eventDate}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 text-emerald-600" /> 업로드 시기
                                </div>
                                <span className="text-base font-bold text-emerald-600">{MOCK.dateFlexible ? "협의 가능" : MOCK.postingDate}</span>
                            </div>
                        </div>

                        {/* Content Types + Channel Handles + Followers */}
                        <div className="rounded-xl border bg-card p-4">
                            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                <Tv className="h-4 w-4" /> 희망 채널 · 형태
                            </p>
                            <div className="space-y-3">
                                {Object.entries(channelsByPlatform).map(([platform, subtypes]) => {
                                    const chInfo = CHANNEL_ICONS[platform] || { Icon: Globe, bg: "from-slate-600 to-slate-700", label: platform, color: "text-slate-500" }
                                    const Icon = chInfo.Icon
                                    const social = MOCK.socialChannels.find(sc => sc.platform === platform)

                                    return (
                                        <div key={platform} className="p-3 rounded-lg bg-muted/50">
                                            {/* Channel header: logo + handle + followers */}
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${chInfo.bg} flex items-center justify-center shrink-0`}>
                                                    <Icon className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">{social?.handle || chInfo.label}</p>
                                                    {social && (
                                                        <p className="text-xs text-muted-foreground">팔로워 {formatFollowers(social.followersCount)}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Subtypes */}
                                            <div className="flex flex-wrap gap-1.5 pl-10">
                                                {subtypes.map(st => (
                                                    <span key={st} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-white bg-gradient-to-r ${chInfo.bg} shadow-sm`}>
                                                        {CONTENT_TYPE_LABELS[st] || st}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Product */}
                        <div className="rounded-xl border bg-card p-4">
                            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                <Package className="h-4 w-4" /> 광고 가능 아이템
                            </p>
                            <p className="text-base font-medium leading-snug">{MOCK.targetProduct}</p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                            {MOCK.tags.map(t => <Badge key={t} variant="outline" className="text-sm px-3 py-1">{t}</Badge>)}
                        </div>
                    </div>

                    {/* COL 2: Title + Description + Guide */}
                    <div className="space-y-5">
                        <h1 className="text-3xl font-bold tracking-tight leading-tight">{MOCK.title}</h1>

                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">상세 설명</h3>
                            <p className="text-base leading-[1.85] whitespace-pre-wrap">{MOCK.description}</p>
                        </div>

                        <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/5 border-amber-200/50 p-6">
                            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" /> 제작 가이드
                            </h3>
                            <p className="text-base leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">{MOCK.guide}</p>
                            <p className="text-xs text-amber-600/60 mt-3 pt-3 border-t border-amber-200/40">💡 크리에이터 제안 가이드입니다. 언제든지 협의 가능합니다.</p>
                        </div>
                    </div>

                    {/* COL 3: Rate Card + CTA */}
                    <div>
                        <div className="sticky top-20 space-y-4">
                            {/* Rate Card */}
                            <div className="rounded-xl border overflow-hidden">
                                <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b">
                                    <h3 className="text-base font-bold flex items-center gap-2">
                                        <BadgeCheck className="h-5 w-5 text-emerald-600" />
                                        예상 단가표
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Rate Card</p>
                                </div>
                                <div className="p-5 space-y-0">
                                    {RATES.map((r, i) => (
                                        <div key={r.label} className={`flex justify-between items-center py-3 ${i < RATES.length - 1 ? 'border-b border-dashed' : ''}`}>
                                            <span className="text-sm text-muted-foreground">{r.label}</span>
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-3 w-3 text-muted-foreground/50" />
                                                <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">{r.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-5 py-4 bg-muted/40 border-t">
                                    <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                                        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                        <span>정확한 단가는 협업 제안 수락 후 워크스페이스에서 공개됩니다.</span>
                                    </p>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-2">
                                <Button className="w-full gap-2" size="lg">
                                    <MessageCircle className="h-5 w-5" /> 협업 제안하기
                                </Button>
                                <Button variant="outline" className="w-full gap-2" size="default">
                                    <Share2 className="h-4 w-4" /> 공유하기
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
