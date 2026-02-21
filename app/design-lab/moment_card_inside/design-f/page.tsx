"use client"

/**
 * Design F: "Horizontal Panels"
 * - Full-width top banner with creator + title + channels + CTA
 * - Below: 3-panel split — Description | Guide+Product | Rate Card
 * - Everything visible at once
 */

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft, Calendar, BadgeCheck, MessageCircle, Share2,
    Package, Lock, Tv, Instagram, Youtube, Music, FileText,
    Globe, Sparkles, Clock, ChevronRight
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
    youtube_shorts: { bg: "from-red-600 to-red-700", label: "⚡ 숏츠", Icon: Youtube },
    tiktok: { bg: "from-black to-slate-800", label: "틱톡", Icon: Music },
    blog: { bg: "from-green-500 to-green-600", label: "블로그", Icon: FileText },
}

const RATES = [
    { label: "숏폼 영상", price: "₩450,000" },
    { label: "이미지 피드", price: "₩200,000" },
    { label: "스토리", price: "₩80,000" },
    { label: "유튜브 숏츠", price: "₩350,000" },
    { label: "2차 활용", price: "₩150,000" },
]

export default function DesignFPage() {
    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container max-w-7xl mx-auto px-4 py-3">
                <Button variant="ghost" size="sm" asChild className="gap-2 mb-2">
                    <Link href="/design-lab/moment_card_inside"><ArrowLeft className="h-4 w-4" /> 목록으로</Link>
                </Button>

                {/* TOP BANNER: Creator + Title + Meta + CTA */}
                <div className="rounded-2xl border bg-card p-5 mb-4">
                    <div className="flex items-start gap-5">
                        {/* Avatar + info */}
                        <img src={MOCK.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover border-2 border-primary/20 shrink-0" />

                        {/* Title area */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold">{MOCK.influencer}</span>
                                {MOCK.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                                <span className="text-sm text-muted-foreground">{MOCK.handle}</span>
                                <span className="text-sm text-muted-foreground">·</span>
                                <span className="text-sm font-semibold">{MOCK.followers.toLocaleString()} 팔로워</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight leading-tight mb-2">{MOCK.title}</h1>

                            {/* Inline meta strip */}
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Tags */}
                                {MOCK.tags.map(t => <Badge key={t} variant="secondary" className="text-[11px]">{t}</Badge>)}

                                <span className="text-muted-foreground">|</span>

                                {/* Dates */}
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Calendar className="h-3 w-3 text-primary" />
                                    <span className="font-semibold text-primary">{MOCK.eventDate}</span>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                    <Clock className="h-3 w-3 text-emerald-600" />
                                    <span className="font-semibold text-emerald-600">{MOCK.dateFlexible ? "협의 가능" : MOCK.postingDate}</span>
                                </div>

                                <span className="text-muted-foreground">|</span>

                                {/* Channels */}
                                {MOCK.channels.map(ch => {
                                    const s = CH[ch] || { bg: "from-slate-600 to-slate-700", label: ch, Icon: Globe }
                                    return (
                                        <span key={ch} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-white bg-gradient-to-r ${s.bg}`}>
                                            <s.Icon className="h-3 w-3" /> {s.label}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col gap-2 shrink-0">
                            <Button className="gap-2" size="default">
                                <MessageCircle className="h-4 w-4" /> 협업 제안하기
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Share2 className="h-3.5 w-3.5" /> 공유
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 3-PANEL CONTENT */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Panel 1: Description */}
                    <div className="rounded-xl border bg-card p-5">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">상세 설명</h3>
                        <p className="text-sm leading-[1.8] whitespace-pre-wrap">{MOCK.description}</p>
                    </div>

                    {/* Panel 2: Guide + Product */}
                    <div className="space-y-4">
                        <div className="rounded-xl border bg-card p-5">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5" /> 광고 가능 아이템
                            </h3>
                            <p className="text-sm font-medium leading-snug">{MOCK.targetProduct}</p>
                        </div>

                        <div className="rounded-xl border bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 p-5">
                            <h3 className="text-xs font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5" /> 제작 가이드
                            </h3>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">{MOCK.guide}</p>
                            <p className="text-[10px] text-amber-600/60 mt-2">💡 예시 가이드입니다. 협의 가능합니다.</p>
                        </div>
                    </div>

                    {/* Panel 3: Rate Card */}
                    <div className="rounded-xl border overflow-hidden">
                        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                예상 단가표
                            </h3>
                            <p className="text-[10px] text-muted-foreground">Rate Card</p>
                        </div>
                        <div className="p-4 space-y-0">
                            {RATES.map((r, i) => (
                                <div key={r.label} className={`flex justify-between items-center py-3 ${i < RATES.length - 1 ? 'border-b border-dashed' : ''}`}>
                                    <span className="text-sm text-muted-foreground">{r.label}</span>
                                    <div className="flex items-center gap-1.5">
                                        <Lock className="h-3 w-3 text-muted-foreground/50" />
                                        <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">{r.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-4 py-3 bg-muted/40 border-t">
                            <p className="text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                                <Lock className="h-3 w-3 shrink-0 mt-0.5" />
                                <span>정확한 단가는 협업 제안 수락 후 워크스페이스에서 공개됩니다.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
