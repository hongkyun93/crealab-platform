"use client"

import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Banknote, Calendar, CheckCircle2, Clapperboard, ExternalLink, FileText, Gift, MessageCircle, Package, Repeat2, Send, Sparkles, Timer, TrendingUp, Tv, XCircle } from "lucide-react"

// ─── DUMMY PROPOSAL DATA (all 16 fields) ─────────────────
const PROPOSAL = {
    id: "prop-1",
    brand_name: "아모레퍼시픽",
    brand_avatar: null,
    created_at: "2026-02-18T09:30:00",
    status: "offered",

    // Product
    product_name: "설화수 윤조에센스 7세대 + 자음생 크림",
    product_url: "https://www.sulwhasoo.com/kr/ko/product/first-care-activating-serum.html",
    product_type: "gift" as const,

    // Video Guide
    video_guide: "brand_provided" as const,

    // Compensation
    compensation_amount: 400000,
    has_incentive: true,
    incentive_detail: "릴스 조회수 50만 달성 시 추가 30만원, 100만 달성 시 추가 50만원",

    // Channel
    channel_name: "instagram",
    channel_subtype: "instagram_reels",

    // Schedule
    draft_submission_date: "2026-03-10",
    final_submission_date: "2026-03-15",
    upload_date: "2026-03-20",
    date_flexible: true,

    // Secondary Usage
    secondary_usage_period: "6개월",
    secondary_usage_fee: 200000,

    // Message
    message: `안녕하세요, 아모레퍼시픽 마케팅팀입니다.

하은님의 '봄맞이 메이크업 & 스킨케어 루틴 🌸' 모먼트를 보고 연락드립니다.

설화수 윤조에센스 7세대와 자음생 크림을 활용한 스킨케어 루틴을 소개해주시면 좋겠습니다.

[ 설화수 윤조에센스 7세대 + 자음생 크림 ] 제품을 제공해드리고 싶으며,
[ 릴스 ] 형식으로 소개해주시면 좋을 것 같습니다.

자연광 촬영을 권장드리며, 제품의 텍스처와 발림성이 잘 보이도록 촬영해주시면 감사하겠습니다.
궁금한 점이 있으시면 언제든 연락 부탁드립니다.

감사합니다.`,
}

// ─── MOMENT INFO (context) ───────────────────────────────
const MOMENT = {
    title: "봄맞이 메이크업 & 스킨케어 루틴 🌸",
    creator: "김하은",
    momentDate: "2026-03-01",
}

// ─── HELPERS ─────────────────────────────────────────────
const fmtPrice = (n: number) => `₩${n.toLocaleString()}`
const fmtDate = (d: string) => {
    const date = new Date(d)
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}
const fmtShortDate = (d: string) => {
    const date = new Date(d)
    return `${date.getMonth() + 1}/${date.getDate()}`
}

const CHANNEL_LABELS: Record<string, string> = {
    instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', blog: 'Blog', other: '기타',
}
const SUBTYPE_LABELS: Record<string, string> = {
    instagram_reels: '릴스', instagram_feed: '피드', instagram_story: '스토리',
    youtube_longform: '롱폼', youtube_shorts: '숏츠',
}
const CHANNEL_BG: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600',
    youtube: 'bg-gradient-to-r from-red-600 to-red-700',
    tiktok: 'bg-gradient-to-r from-black to-slate-800',
    blog: 'bg-gradient-to-r from-green-500 to-green-600',
}
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    offered: { label: '검토 대기', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Timer },
    negotiating: { label: '협상중', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: MessageCircle },
    accepted: { label: '수락됨', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    rejected: { label: '거절됨', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
}

// ═══════════════════════════════════════════════════════════
// DESIGN A: "Clean Sections" — 구분된 카드 레이아웃
// ═══════════════════════════════════════════════════════════
function DesignA() {
    const p = PROPOSAL
    const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.offered
    const StatusIcon = status.icon

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Header: Brand + Status */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center text-lg font-bold text-primary shrink-0 border-2 border-primary/10">
                            {p.brand_name[0]}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{p.brand_name}</h3>
                            <p className="text-sm text-muted-foreground">{fmtDate(p.created_at)} 제안</p>
                        </div>
                    </div>
                    <Badge variant="outline" className={`px-3 py-1.5 text-xs font-semibold gap-1.5 ${status.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                    </Badge>
                </div>
                <div className="px-6 py-3 bg-muted/30 border-t text-xs text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>모먼트: <b className="text-foreground">{MOMENT.title}</b></span>
                </div>
            </div>

            {/* Message */}
            <div className="rounded-xl border bg-card p-6">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> 제안 메시지
                </h4>
                <p className="text-sm leading-[1.85] whitespace-pre-wrap text-foreground/80">{p.message}</p>
            </div>

            {/* Product Info */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Package className="h-4 w-4" /> 제안 제품
                </h4>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <span className="text-xs text-muted-foreground">제품명</span>
                        <span className="text-sm font-bold text-right max-w-[70%]">{p.product_name}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border/50 pt-3">
                        <span className="text-xs text-muted-foreground">제공 방식</span>
                        <Badge variant="secondary" className="text-xs gap-1">
                            <Gift className="h-3 w-3" />
                            {p.product_type === 'gift' ? '제품 증정' : '제품 대여 (반납)'}
                        </Badge>
                    </div>
                    {p.product_url && (
                        <div className="border-t border-border/50 pt-3">
                            <a href={p.product_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" /> 제품 링크 확인하기
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Compensation */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Banknote className="h-4 w-4" /> 제안 고료
                </h4>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">고정 광고비</span>
                        <span className="text-xl font-black text-emerald-600">{fmtPrice(p.compensation_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border/50 pt-3">
                        <span className="text-xs text-muted-foreground">성과 인센티브</span>
                        {p.has_incentive ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1">
                                <TrendingUp className="h-3 w-3" /> 있음
                            </Badge>
                        ) : (
                            <span className="text-xs text-muted-foreground">없음</span>
                        )}
                    </div>
                    {p.has_incentive && p.incentive_detail && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-md p-3 text-xs text-emerald-800 dark:text-emerald-200">
                            💡 {p.incentive_detail}
                        </div>
                    )}
                </div>
            </div>

            {/* Channel + Video Guide */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Tv className="h-4 w-4" /> 진행 채널 및 가이드
                </h4>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">진행 채널</span>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[11px] font-medium text-white px-2.5 py-1 rounded-full shadow-sm shrink-0 ${CHANNEL_BG[p.channel_name] || 'bg-slate-600'}`}>
                                {CHANNEL_LABELS[p.channel_name]}
                            </span>
                            {p.channel_subtype && p.channel_subtype.split(',').map((s: string) => s.trim()).filter(Boolean).map((sub: string, i: number) => (
                                <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted border border-border">
                                    ({SUBTYPE_LABELS[sub] || sub})
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-border/50 pt-3">
                        <span className="text-xs text-muted-foreground">영상 가이드</span>
                        <Badge variant="outline" className="text-xs gap-1">
                            <Clapperboard className="h-3 w-3" />
                            {p.video_guide === 'brand_provided' ? '브랜드 제공' : '크리에이터 기획'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Schedule */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> 일정 및 조건
                </h4>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                        <span className="text-xs text-muted-foreground">초안 제출 희망일</span>
                        <span className="text-sm font-medium">{fmtDate(p.draft_submission_date)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                        <span className="text-xs text-muted-foreground">최종본 제출 희망일</span>
                        <span className="text-sm font-medium">{fmtDate(p.final_submission_date)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                        <span className="text-xs text-muted-foreground">콘텐츠 업로드일</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{fmtDate(p.upload_date)}</span>
                            {p.date_flexible && (
                                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">협의 가능</Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between py-1.5">
                        <span className="text-xs text-muted-foreground">2차 활용</span>
                        <span className="text-sm font-medium">
                            {p.secondary_usage_period}
                            {p.secondary_usage_fee > 0 && (
                                <span className="text-emerald-600 ml-1">· {fmtPrice(p.secondary_usage_fee)}</span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2 h-12 text-base">
                    <CheckCircle2 className="h-5 w-5" /> 수락하기
                </Button>
                <Button variant="destructive" className="flex-1 gap-2 h-12 text-base">
                    <XCircle className="h-5 w-5" /> 거절하기
                </Button>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════
// DESIGN B: "Two-Column" — 좌우 분리 레이아웃
// ═══════════════════════════════════════════════════════════
function DesignB() {
    const p = PROPOSAL
    const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.offered
    const StatusIcon = status.icon

    return (
        <div className="max-w-4xl mx-auto space-y-5">
            {/* Top: Brand Header + Moment Context */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="p-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center text-xl font-black text-primary shrink-0 border-2 border-violet-200/50">
                            {p.brand_name[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-black">{p.brand_name}</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">{fmtDate(p.created_at)} 제안</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`px-3 py-1 text-xs font-semibold gap-1.5 ${status.color}`}>
                                    <StatusIcon className="h-3 w-3" /> {status.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs gap-1">
                                    <Sparkles className="h-3 w-3" /> {MOMENT.title}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two-Column Layout — Summary Left, Content Right */}
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
                {/* Left: Sticky Summary Panel */}
                <div>
                    <div className="sticky top-20 space-y-4">
                        {/* Compensation Card */}
                        <div className="rounded-xl border overflow-hidden">
                            <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <Banknote className="h-4 w-4 text-emerald-600" /> 보상 조건
                                </h4>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="text-center py-3">
                                    <p className="text-[10px] text-muted-foreground mb-1">고정 광고비</p>
                                    <p className="text-3xl font-black text-emerald-600">{fmtPrice(p.compensation_amount)}</p>
                                </div>
                                {p.has_incentive && (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900/20">
                                        <p className="text-[10px] font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" /> 성과 인센티브
                                        </p>
                                        <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">{p.incentive_detail}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Channel + Guide */}
                        <div className="rounded-xl border bg-card p-5 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">진행 채널</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={`text-[10px] font-medium text-white px-2 py-0.5 rounded-full shrink-0 ${CHANNEL_BG[p.channel_name]}`}>
                                        {CHANNEL_LABELS[p.channel_name]}
                                    </span>
                                    {p.channel_subtype && p.channel_subtype.split(',').map((s: string) => s.trim()).filter(Boolean).map((sub: string, i: number) => (
                                        <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted border border-border">{SUBTYPE_LABELS[sub] || sub}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-t border-border/50 pt-3">
                                <span className="text-xs text-muted-foreground">영상 가이드</span>
                                <Badge variant="outline" className="text-[10px] gap-1">
                                    <Clapperboard className="h-3 w-3" />
                                    {p.video_guide === 'brand_provided' ? '브랜드 제공' : '크리에이터 기획'}
                                </Badge>
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="rounded-xl border bg-card p-5 space-y-2">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" /> 일정
                            </h4>
                            {[
                                { label: '초안 제출', date: p.draft_submission_date, icon: FileText },
                                { label: '최종 제출', date: p.final_submission_date, icon: Send },
                                { label: '업로드', date: p.upload_date, icon: ArrowUpRight },
                            ].map(({ label, date, icon: Icon }) => (
                                <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Icon className="h-3 w-3" /> {label}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-medium">{fmtDate(date)}</span>
                                        {label === '업로드' && p.date_flexible && (
                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-primary border-primary/30">유동적</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-2 border-t border-border/50">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Repeat2 className="h-3 w-3" /> 2차 활용
                                </span>
                                <span className="text-xs font-medium">
                                    {p.secondary_usage_period}
                                    {p.secondary_usage_fee > 0 && <span className="text-emerald-600"> · {fmtPrice(p.secondary_usage_fee)}</span>}
                                </span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="space-y-2">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 h-11">
                                <CheckCircle2 className="h-4 w-4" /> 수락하기
                            </Button>
                            <Button variant="outline" className="w-full gap-2 h-11 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                                <XCircle className="h-4 w-4" /> 거절하기
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right: Message + Product */}
                <div className="space-y-5">
                    {/* Message */}
                    <div className="rounded-xl border bg-card p-6">
                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-500" /> 제안 메시지
                        </h4>
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-5 border border-blue-100/50 dark:border-blue-900/20">
                            <p className="text-sm leading-[1.9] whitespace-pre-wrap">{p.message}</p>
                        </div>
                    </div>

                    {/* Product Row */}
                    <div className="rounded-xl border bg-card p-6">
                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Package className="h-4 w-4 text-purple-500" /> 제안 제품 정보
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                                <p className="text-[10px] text-muted-foreground mb-1">제품명</p>
                                <p className="text-sm font-bold">{p.product_name}</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                                <p className="text-[10px] text-muted-foreground mb-1">제공 방식</p>
                                <div className="flex items-center gap-1.5">
                                    <Gift className="h-3.5 w-3.5 text-pink-500" />
                                    <span className="text-sm font-medium">{p.product_type === 'gift' ? '제품 증정' : '제품 대여'}</span>
                                </div>
                            </div>
                        </div>
                        {p.product_url && (
                            <a href={p.product_url} target="_blank" rel="noreferrer" className="mt-3 text-xs text-blue-500 hover:underline inline-flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" /> 제품 링크 확인
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════
// DESIGN C: "Contract Document" — 계약서 스타일
// ═══════════════════════════════════════════════════════════
function DesignC() {
    const p = PROPOSAL
    const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.offered
    const StatusIcon = status.icon

    return (
        <div className="max-w-3xl mx-auto space-y-0">
            {/* Document Header */}
            <div className="rounded-t-2xl border border-b-0 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                    <Badge variant="outline" className={`px-3 py-1.5 text-xs font-semibold gap-1.5 border-white/20 text-white/90 bg-white/10`}>
                        <StatusIcon className="h-3.5 w-3.5" /> {status.label}
                    </Badge>
                    <span className="text-xs text-white/50">{fmtDate(p.created_at)}</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight mb-2">협업 제안서</h1>
                <p className="text-sm text-white/60">{p.brand_name} → {MOMENT.creator}님</p>
                <div className="mt-4 px-4 py-2.5 bg-white/5 rounded-lg border border-white/10 inline-flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs text-white/80">{MOMENT.title}</span>
                </div>
            </div>

            {/* Document Body */}
            <div className="border border-t-0 bg-card">
                {/* Section 1: Brand Info */}
                <div className="p-6 border-b flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center text-xl font-black text-violet-600 shrink-0">
                        {p.brand_name[0]}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">제안 브랜드</p>
                        <p className="text-lg font-bold">{p.brand_name}</p>
                    </div>
                </div>

                {/* Section 2: Message */}
                <div className="p-6 border-b">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-1 bg-blue-500 rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-wider">제안 메시지</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                        <p className="text-sm leading-[1.9] whitespace-pre-wrap">{p.message}</p>
                    </div>
                </div>

                {/* Section 3: Product */}
                <div className="p-6 border-b">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-1 bg-purple-500 rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-wider">제안 제품</h3>
                    </div>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-border/40">
                                <td className="py-3 text-muted-foreground w-32">제품명</td>
                                <td className="py-3 font-bold">{p.product_name}</td>
                            </tr>
                            <tr className="border-b border-border/40">
                                <td className="py-3 text-muted-foreground">제공 방식</td>
                                <td className="py-3">
                                    <Badge variant="secondary" className="gap-1 text-xs">
                                        <Gift className="h-3 w-3" />
                                        {p.product_type === 'gift' ? '제품 증정' : '제품 대여'}
                                    </Badge>
                                </td>
                            </tr>
                            {p.product_url && (
                                <tr>
                                    <td className="py-3 text-muted-foreground">제품 링크</td>
                                    <td className="py-3">
                                        <a href={p.product_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1 text-xs">
                                            <ExternalLink className="h-3 w-3" /> 링크 확인
                                        </a>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Section 4: Compensation */}
                <div className="p-6 border-b">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-wider">보상 조건</h3>
                    </div>
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-5 border border-emerald-100 dark:border-emerald-900/20 mb-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">고정 광고비</span>
                            <span className="text-2xl font-black text-emerald-600">{fmtPrice(p.compensation_amount)}</span>
                        </div>
                    </div>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-border/40">
                                <td className="py-3 text-muted-foreground w-32">성과 인센티브</td>
                                <td className="py-3">
                                    {p.has_incentive ? (
                                        <span className="text-emerald-600 font-medium">있음</span>
                                    ) : (
                                        <span className="text-muted-foreground">없음</span>
                                    )}
                                </td>
                            </tr>
                            {p.has_incentive && p.incentive_detail && (
                                <tr>
                                    <td className="py-3 text-muted-foreground">인센티브 상세</td>
                                    <td className="py-3 text-xs leading-relaxed">{p.incentive_detail}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Section 5: Channel + Guide */}
                <div className="p-6 border-b">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-1 bg-pink-500 rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-wider">채널 및 가이드</h3>
                    </div>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-border/40">
                                <td className="py-3 text-muted-foreground w-32">진행 채널</td>
                                <td className="py-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-[10px] font-medium text-white px-2 py-0.5 rounded-full shrink-0 ${CHANNEL_BG[p.channel_name]}`}>
                                            {CHANNEL_LABELS[p.channel_name]}
                                        </span>
                                        {p.channel_subtype && p.channel_subtype.split(',').map((s: string) => s.trim()).filter(Boolean).map((sub: string, i: number) => (
                                            <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted border border-border">{SUBTYPE_LABELS[sub] || sub}</span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-3 text-muted-foreground">영상 가이드</td>
                                <td className="py-3">
                                    <Badge variant="outline" className="text-xs gap-1">
                                        <Clapperboard className="h-3 w-3" />
                                        {p.video_guide === 'brand_provided' ? '브랜드 제공' : '크리에이터 기획'}
                                    </Badge>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section 6: Schedule */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-1 bg-amber-500 rounded-full" />
                        <h3 className="text-sm font-bold uppercase tracking-wider">일정 및 조건</h3>
                    </div>
                    {/* Timeline */}
                    <div className="relative pl-6 space-y-5 mb-4">
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-300 via-amber-300 to-emerald-300" />
                        {[
                            { label: '초안 제출', date: p.draft_submission_date, color: 'bg-blue-500', emoji: '📝' },
                            { label: '최종 제출', date: p.final_submission_date, color: 'bg-amber-500', emoji: '✅' },
                            { label: '콘텐츠 업로드', date: p.upload_date, color: 'bg-emerald-500', emoji: '🚀', flexible: p.date_flexible },
                        ].map((item) => (
                            <div key={item.label} className="relative flex items-center gap-4">
                                <div className={`absolute -left-6 w-6 h-6 rounded-full ${item.color} flex items-center justify-center text-[10px] z-10`}>
                                    {item.emoji}
                                </div>
                                <div className="flex-1 flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3 border border-border/40 ml-2">
                                    <span className="text-sm font-medium">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold">{fmtDate(item.date)}</span>
                                        {item.flexible && (
                                            <Badge variant="outline" className="text-[9px] h-4 text-primary border-primary/30">유동적</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <table className="w-full text-sm">
                        <tbody>
                            <tr>
                                <td className="py-3 text-muted-foreground w-32 flex items-center gap-1.5">
                                    <Repeat2 className="h-3.5 w-3.5" /> 2차 활용
                                </td>
                                <td className="py-3 font-medium">
                                    {p.secondary_usage_period}
                                    {p.secondary_usage_fee > 0 && (
                                        <span className="text-emerald-600 ml-2">· {fmtPrice(p.secondary_usage_fee)}</span>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Document Footer — CTA */}
            <div className="rounded-b-2xl border border-t-0 bg-muted/20 p-6 flex gap-3">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2 h-12 text-base rounded-xl">
                    <CheckCircle2 className="h-5 w-5" /> 수락하기
                </Button>
                <Button variant="outline" className="flex-1 gap-2 h-12 text-base rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                    <XCircle className="h-5 w-5" /> 거절하기
                </Button>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE — Tab Switcher
// ═══════════════════════════════════════════════════════════
export default function MomentProposalDesignLab() {
    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container max-w-7xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">제안서 디자인 비교</h1>
                    <p className="text-sm text-muted-foreground">3가지 디자인을 탭으로 비교해보세요. 모든 16개 필드가 포함되어 있습니다.</p>
                </div>

                <Tabs defaultValue="A" className="w-full">
                    <TabsList className="w-full md:w-auto grid grid-cols-3 mb-6">
                        <TabsTrigger value="A" className="gap-2">
                            <span className="hidden md:inline">디자인</span> A · 섹션형
                        </TabsTrigger>
                        <TabsTrigger value="B" className="gap-2">
                            <span className="hidden md:inline">디자인</span> B · 2단형
                        </TabsTrigger>
                        <TabsTrigger value="C" className="gap-2">
                            <span className="hidden md:inline">디자인</span> C · 계약서형
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="A"><DesignA /></TabsContent>
                    <TabsContent value="B"><DesignB /></TabsContent>
                    <TabsContent value="C"><DesignC /></TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
