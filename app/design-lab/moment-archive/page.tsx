"use client"

import React, { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Calendar, ArrowLeft,
    Package, Clock, Tv, Sparkles, BadgeCheck, MessageCircle,
    ChevronRight
} from "lucide-react"
import { MomentGridCard } from "@/components/shared/MomentGridCard"

// ─── DUMMY DATA ──────────────────────────────────
const CREATOR = {
    name: "김하은",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    handle: "@haeun.daily",
    followers: 45200,
    verified: true,
    socialChannels: [
        { platform: "instagram", handle: "@haeun.daily", followersCount: 45200 },
        { platform: "youtube", handle: "하은 Daily", followersCount: 12300 },
    ]
}

const MOMENTS = [
    {
        id: "m1",
        title: "새 아파트 입주! 🏠 신혼집 인테리어 모먼트",
        event: "새 아파트 입주! 🏠 신혼집 인테리어 모먼트",
        description: "올 3월 새 아파트에 입주합니다. 거실, 침실, 주방 인테리어를 하나씩 꾸며가는 과정을 콘텐츠로 담으려 합니다. 미니멀한 무드의 가구와 소품을 선호합니다.",
        guide: "가구 배치와 인테리어 소품 자연스럽게 노출. 장단점 솔직 리뷰 포함.",
        category: "🏠 리빙/인테리어",
        tags: ["신혼집", "인테리어", "입주"],
        targetProduct: "가구, 조명, 소품, 패브릭",
        priceVideo: 350000,
        eventDate: "2026-03-15",
        postingDate: "2026-03-20",
        dateFlexible: false,
        channels: ["instagram_reels", "youtube_longform"],
        status: "upcoming",
        proposalCount: 3,
    },
    {
        id: "m2",
        title: "봄맞이 메이크업 & 스킨케어 루틴 🌸",
        event: "봄맞이 메이크업 & 스킨케어 루틴 🌸",
        description: "봄 시즌 메이크업 트렌드와 제 피부 타입에 맞는 스킨케어 루틴을 공유하려 합니다.",
        guide: "자연광 촬영, GRWM 포맷, 진솔한 리뷰 포함",
        category: "💄 뷰티",
        tags: ["뷰티", "스킨케어", "봄"],
        targetProduct: "스킨케어, 쿠션 팩트, 립",
        priceVideo: 250000,
        eventDate: "2026-03-01",
        postingDate: "2026-03-05",
        dateFlexible: true,
        channels: ["instagram_reels", "instagram_feed"],
        status: "upcoming",
        proposalCount: 5,
    },
    {
        id: "m3",
        title: "제주도 3박4일 힐링 여행기 ✈️",
        event: "제주도 3박4일 힐링 여행기 ✈️",
        description: "3월 말 제주도 여행을 계획하고 있습니다. 호텔, 카페, 맛집 등을 포함한 브이로그를 제작할 예정입니다.",
        guide: "호텔, 카페 분위기 중심. B-roll 포함.",
        category: "✈️ 여행",
        tags: ["제주도", "여행", "브이로그"],
        targetProduct: "호텔, 항공, 캐리어, 카메라",
        priceVideo: 500000,
        eventDate: "2026-03-25",
        postingDate: "2026-04-01",
        dateFlexible: false,
        channels: ["youtube_longform", "instagram_reels"],
        status: "upcoming",
        proposalCount: 0,
    },
]

const PROPOSALS = [
    {
        id: "p1", momentId: "m1",
        brand_name: "이케아 코리아", brand_avatar: null,
        product_name: "MALM 서랍장 + KALLAX 선반",
        price_offer: 400000,
        message: "입주 인테리어에 MALM 서랍장과 KALLAX 선반을 제안드립니다. 제품 협찬 + 광고비로 진행하고 싶습니다.",
        status: "offered", created_at: "2026-02-18",
    },
    {
        id: "p2", momentId: "m1",
        brand_name: "삼성 조명", brand_avatar: null,
        product_name: "LED 무드등 세트",
        price_offer: 300000,
        message: "신혼집 분위기에 맞는 LED 무드등 세트를 제안합니다.",
        status: "offered", created_at: "2026-02-19",
    },
    {
        id: "p3", momentId: "m1",
        brand_name: "데코뷰", brand_avatar: null,
        product_name: "커튼 + 러그 세트",
        price_offer: 250000,
        message: "미니멀 인테리어에 맞는 커튼과 러그 세트를 협찬하고 싶습니다.",
        status: "negotiating", created_at: "2026-02-20",
    },
    {
        id: "p4", momentId: "m2",
        brand_name: "아모레퍼시픽", brand_avatar: null,
        product_name: "설화수 윤조에센스 + 쿠션",
        price_offer: 350000,
        message: "봄 시즌 스킨케어 루틴에 설화수 라인을 소개해주시면 좋겠습니다.",
        status: "offered", created_at: "2026-02-17",
    },
    {
        id: "p5", momentId: "m2",
        brand_name: "라네즈", brand_avatar: null,
        product_name: "네오 쿠션 + 립 글로시",
        price_offer: 280000,
        message: "봄 메이크업에 라네즈 신제품 라인을 포함해주시면 합니다.",
        status: "offered", created_at: "2026-02-18",
    },
    {
        id: "p6", momentId: "m2",
        brand_name: "클리오", brand_avatar: null,
        product_name: "킬커버 파운데이션",
        price_offer: 200000,
        message: "GRWM 영상에 킬커버 파운데이션 사용 장면을 넣어주세요.",
        status: "offered", created_at: "2026-02-19",
    },
    {
        id: "p7", momentId: "m2",
        brand_name: "이니스프리", brand_avatar: null,
        product_name: "그린티 세럼",
        price_offer: 180000,
        message: "스킨케어 루틴에 그린티 세럼을 자연스럽게 노출해주세요.",
        status: "accepted", created_at: "2026-02-16",
    },
    {
        id: "p8", momentId: "m2",
        brand_name: "에뛰드", brand_avatar: null,
        product_name: "벚꽃 에디션 팔레트",
        price_offer: 220000,
        message: "봄 한정 벚꽃 에디션 팔레트를 활용한 메이크업 룩을 보여주세요.",
        status: "offered", created_at: "2026-02-20",
    },
]

// ─── HELPERS ─────────────────────────────────────
const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString()
const fmtPrice = (n: number) => `₩${n.toLocaleString()}`
const fmtDate = (d: string) => {
    const date = new Date(d)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

const CHANNEL_LABELS: Record<string, string> = {
    instagram_reels: '🎞️ 릴스', instagram_feed: '📷 피드', instagram_story: '⭕ 스토리',
    youtube_longform: '▶️ 롱폼', youtube_shorts: '⚡ 숏츠',
}
const CHANNEL_BG: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600',
    youtube: 'bg-gradient-to-r from-red-600 to-red-700',
    tiktok: 'bg-gradient-to-r from-black to-slate-800',
    blog: 'bg-gradient-to-r from-green-500 to-green-600',
}
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    offered: { label: '대기', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    negotiating: { label: '협상중', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    accepted: { label: '수락됨', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: '거절됨', color: 'bg-red-100 text-red-700 border-red-200' },
}

export default function MomentArchiveDesignLab() {
    const [selectedMoment, setSelectedMoment] = useState<typeof MOMENTS[0] | null>(null)

    if (selectedMoment) {
        const proposals = PROPOSALS.filter(p => p.momentId === selectedMoment.id)
        return (
            <div className="min-h-screen bg-muted/30">
                <SiteHeader />
                <main className="container max-w-7xl mx-auto px-4 py-4">
                    <Button variant="ghost" size="sm" className="gap-2 mb-3" onClick={() => setSelectedMoment(null)}>
                        <ArrowLeft className="h-4 w-4" /> 아카이브로 돌아가기
                    </Button>

                    {/* ===== 3-Column Layout (same as brand event detail) ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_340px] gap-5">

                        {/* ─── COL 1: Profile + Meta ─── */}
                        <div className="space-y-4">
                            {/* Profile Card */}
                            <div className="rounded-xl border bg-card p-5 text-center">
                                <img src={CREATOR.avatar} alt="" className="h-24 w-24 rounded-full object-cover border-3 border-primary/20 mx-auto mb-3 shadow-lg" />
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <span className="font-bold text-xl">{CREATOR.handle}</span>
                                    {CREATOR.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                                </div>
                                <p className="text-sm text-muted-foreground">{fmt(CREATOR.followers)} 팔로워</p>
                            </div>

                            {/* Schedule */}
                            <div className="rounded-xl border bg-card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 text-primary" /> 모먼트 일정
                                    </div>
                                    <span className="text-base font-bold text-primary">{fmtDate(selectedMoment.eventDate)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 text-emerald-600" /> 업로드 시기
                                    </div>
                                    <span className="text-base font-bold text-emerald-600">
                                        {selectedMoment.dateFlexible ? "협의 가능" : fmtDate(selectedMoment.postingDate)}
                                    </span>
                                </div>
                            </div>

                            {/* Channels */}
                            <div className="rounded-xl border bg-card p-4">
                                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                    <Tv className="h-4 w-4" /> 희망 채널 · 형태
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedMoment.channels.map(ch => {
                                        const base = ch.split('_')[0]
                                        return (
                                            <span key={ch} className={`text-[11px] font-medium text-white px-2.5 py-1 rounded-full shadow-sm ${CHANNEL_BG[base] || 'bg-slate-600'}`}>
                                                {CHANNEL_LABELS[ch] || ch}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Target Product */}
                            <div className="rounded-xl border bg-card p-4">
                                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                    <Package className="h-4 w-4" /> 광고 가능 아이템
                                </p>
                                <p className="text-base font-medium leading-snug">{selectedMoment.targetProduct}</p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                                {selectedMoment.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-sm px-3 py-1">{tag}</Badge>
                                ))}
                            </div>
                        </div>

                        {/* ─── COL 2: Title + Description + Guide ─── */}
                        <div className="space-y-5">
                            <h1 className="text-3xl font-bold tracking-tight leading-tight">{selectedMoment.title}</h1>

                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">상세 설명</h3>
                                <p className="text-base leading-[1.85] whitespace-pre-wrap">{selectedMoment.description}</p>
                            </div>

                            {selectedMoment.guide && (
                                <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/5 border-amber-200/50 p-6">
                                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" /> 제작 가이드
                                    </h3>
                                    <p className="text-base leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">{selectedMoment.guide}</p>
                                    <p className="text-xs text-amber-600/60 mt-3 pt-3 border-t border-amber-200/40">💡 크리에이터 제안 가이드입니다. 언제든지 협의 가능합니다.</p>
                                </div>
                            )}

                            {/* Price info */}
                            <div className="rounded-xl border bg-card p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">내가 설정한 예상 단가</span>
                                    <span className="text-lg font-bold text-primary">{fmtPrice(selectedMoment.priceVideo)}</span>
                                </div>
                            </div>
                        </div>

                        {/* ─── COL 3: Received Proposals (instead of Rate Card) ─── */}
                        <div>
                            <div className="sticky top-20 space-y-4">
                                {/* Proposals header */}
                                <div className="rounded-xl border overflow-hidden">
                                    <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-b">
                                        <h3 className="text-base font-bold flex items-center gap-2">
                                            <MessageCircle className="h-5 w-5 text-indigo-600" />
                                            받은 제안
                                            <Badge className="bg-indigo-600 border-0 text-white text-xs ml-1">{proposals.length}</Badge>
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">브랜드에서 보낸 협업 제안</p>
                                    </div>

                                    <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                                        {proposals.length > 0 ? (
                                            proposals.map(prop => {
                                                const status = STATUS_LABELS[prop.status] || STATUS_LABELS.offered
                                                return (
                                                    <div key={prop.id} className="bg-background border rounded-lg p-4 space-y-3 hover:border-primary/30 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                                                                {prop.brand_name.substring(0, 1)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold truncate">{prop.brand_name}</p>
                                                                <p className="text-[11px] text-muted-foreground">{fmtDate(prop.created_at)}</p>
                                                            </div>
                                                            <Badge variant="outline" className={`text-[10px] shrink-0 ${status.color}`}>
                                                                {status.label}
                                                            </Badge>
                                                        </div>

                                                        <div className="bg-muted/40 rounded-md p-3 space-y-2">
                                                            <div>
                                                                <p className="text-[10px] text-muted-foreground mb-0.5">제안 제품</p>
                                                                <p className="text-sm font-medium">{prop.product_name}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-muted-foreground mb-0.5">제안 금액</p>
                                                                <p className="text-sm font-bold text-emerald-600">{fmtPrice(prop.price_offer)}</p>
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{prop.message}</p>

                                                        <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                                            제안 상세 보기
                                                        </Button>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-center py-8 bg-muted/20 rounded-lg text-sm text-muted-foreground border border-dashed">
                                                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                                아직 도착한 제안이 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // ─── ARCHIVE VIEW (Grid of cards with proposal count) ──────
    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold">내 모먼트 아카이브</h1>
                    <Badge variant="outline" className="text-sm">{MOMENTS.length}개 모먼트</Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {MOMENTS.map(moment => {
                        const proposals = PROPOSALS.filter(p => p.momentId === moment.id)
                        return (
                            <MomentGridCard
                                key={moment.id}
                                item={moment}
                                creator={{
                                    name: CREATOR.name,
                                    avatar: CREATOR.avatar,
                                    followers: CREATOR.followers,
                                    socialChannels: CREATOR.socialChannels,
                                }}
                                onClick={() => setSelectedMoment(moment)}
                                offerCount={proposals.length}
                                renderFooter={() => (
                                    <div className="px-6 pb-0 pt-2 border-t border-border/50">
                                        {proposals.length > 0 ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-1.5">
                                                        {proposals.slice(0, 3).map((p) => (
                                                            <div key={p.id} className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[9px] font-bold text-primary">
                                                                {p.brand_name[0]}
                                                            </div>
                                                        ))}
                                                        {proposals.length > 3 && (
                                                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                                                                +{proposals.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-medium text-foreground">
                                                        💌 제안 {proposals.length}건
                                                    </span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground text-center">아직 받은 제안이 없습니다</p>
                                        )}
                                    </div>
                                )}
                            />
                        )
                    })}
                </div>
            </main>
        </div>
    )
}
