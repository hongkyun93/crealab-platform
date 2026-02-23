"use client"

import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Banknote, Calendar, CheckCircle2, ChevronRight, Clapperboard, ExternalLink, FileText, Gift, MessageCircle, Package, Repeat2, Send, Sparkles, Timer, TrendingUp, Tv, XCircle } from "lucide-react"
import { useState } from "react"

// ─── DUMMY DATA ──────────────────────────────────────────
const P = {
    brand_name: "아모레퍼시픽",
    created_at: "2026-02-18T09:30:00",
    status: "offered",
    product_name: "설화수 윤조에센스 7세대 + 자음생 크림",
    product_url: "https://www.sulwhasoo.com/kr/ko/product/first-care-activating-serum.html",
    product_type: "gift" as const,
    video_guide: "brand_provided" as const,
    compensation_amount: 400000,
    has_incentive: true,
    incentive_detail: "릴스 조회수 50만 달성 시 추가 30만원, 100만 달성 시 추가 50만원",
    channel_name: "instagram",
    channel_subtype: "instagram_reels",
    draft_submission_date: "2026-03-10",
    final_submission_date: "2026-03-15",
    upload_date: "2026-03-20",
    date_flexible: true,
    secondary_usage_period: "6개월",
    secondary_usage_fee: 200000,
    message: `안녕하세요, 아모레퍼시픽 마케팅팀입니다.\n\n하은님의 '봄맞이 메이크업 & 스킨케어 루틴 🌸' 모먼트를 보고 연락드립니다.\n\n설화수 윤조에센스 7세대와 자음생 크림을 활용한 스킨케어 루틴을 소개해주시면 좋겠습니다.\n\n[ 설화수 윤조에센스 7세대 + 자음생 크림 ] 제품을 제공해드리고 싶으며,\n[ 릴스 ] 형식으로 소개해주시면 좋을 것 같습니다.\n\n감사합니다.`,
}

const MOMENT_TITLE = "봄맞이 메이크업 & 스킨케어 루틴 🌸"

const fmt = (n: number) => `₩${n.toLocaleString()}`
const fmtD = (d: string) => { const dt = new Date(d); return `${dt.getMonth() + 1}/${dt.getDate()}` }
const fmtFull = (d: string) => { const dt = new Date(d); return `${dt.getFullYear()}.${dt.getMonth() + 1}.${dt.getDate()}` }

const CH: Record<string, string> = { instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', blog: 'Blog' }
const SUB: Record<string, string> = { instagram_reels: '릴스', instagram_feed: '피드', instagram_story: '스토리', youtube_longform: '롱폼', youtube_shorts: '숏츠' }
const CH_BG: Record<string, string> = { instagram: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600', youtube: 'bg-gradient-to-r from-red-600 to-red-700', tiktok: 'bg-gradient-to-r from-black to-slate-800', blog: 'bg-gradient-to-r from-green-500 to-green-600' }

// ═══════════════════════════════════════════════════════════
// DIALOG A: "Compact Sections" — 구역 분리형 (세로 스크롤)
// ═══════════════════════════════════════════════════════════
function DialogA({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden p-0 flex flex-col">
                <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                                {P.brand_name[0]}
                            </div>
                            <div>
                                <DialogTitle className="text-base">{P.brand_name}</DialogTitle>
                                <DialogDescription className="text-xs">{fmtFull(P.created_at)} · {MOMENT_TITLE}</DialogDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] gap-1">
                            <Timer className="h-3 w-3" /> 검토 대기
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* Compensation — 강조 */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5" /> 고정 광고비</span>
                            <span className="text-2xl font-black text-emerald-600">{fmt(P.compensation_amount)}</span>
                        </div>
                        {P.has_incentive && (
                            <div className="bg-emerald-100/50 dark:bg-emerald-800/20 rounded-lg p-2.5 mt-2">
                                <p className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mb-0.5"><TrendingUp className="h-3 w-3" /> 성과 인센티브</p>
                                <p className="text-xs text-emerald-800 dark:text-emerald-200">{P.incentive_detail}</p>
                            </div>
                        )}
                    </div>

                    {/* Product */}
                    <div className="rounded-xl border p-4 space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> 제안 제품</h4>
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-bold flex-1">{P.product_name}</span>
                            <Badge variant="secondary" className="text-[10px] gap-1 shrink-0 ml-2"><Gift className="h-3 w-3" />{P.product_type === 'gift' ? '증정' : '대여'}</Badge>
                        </div>
                        {P.product_url && (
                            <a href={P.product_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-500 hover:underline inline-flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" /> 제품 링크
                            </a>
                        )}
                    </div>

                    {/* Channel + Guide */}
                    <div className="rounded-xl border p-4 space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Tv className="h-3.5 w-3.5" /> 채널 및 가이드</h4>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`text-[10px] font-medium text-white px-2 py-0.5 rounded-full shrink-0 ${CH_BG[P.channel_name]}`}>{CH[P.channel_name]}</span>
                                {P.channel_subtype && P.channel_subtype.split(',').map((s: string) => s.trim()).filter(Boolean).map((sub: string, i: number) => (
                                    <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted border border-border">{SUB[sub] || sub}</span>
                                ))}
                            </div>
                            <Badge variant="outline" className="text-[10px] gap-1 shrink-0"><Clapperboard className="h-3 w-3" />{P.video_guide === 'brand_provided' ? '브랜드 제공' : '크리에이터 기획'}</Badge>
                        </div>

                        {/* Schedule */}
                        <div className="rounded-xl border p-4 space-y-1.5">
                            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2"><Calendar className="h-3.5 w-3.5" /> 일정</h4>
                            {[
                                { l: '초안 제출', d: P.draft_submission_date, I: FileText },
                                { l: '최종 제출', d: P.final_submission_date, I: Send },
                                { l: '업로드', d: P.upload_date, I: ArrowUpRight, flex: P.date_flexible },
                            ].map(({ l, d, I, flex }) => (
                                <div key={l} className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><I className="h-3 w-3" /> {l}</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium">{fmtFull(d)}</span>
                                        {flex && <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-primary border-primary/30">유동</Badge>}
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-1.5 border-t border-border/50">
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Repeat2 className="h-3 w-3" /> 2차 활용</span>
                                <span className="text-xs font-medium">{P.secondary_usage_period}{P.secondary_usage_fee > 0 && <span className="text-emerald-600"> · {fmt(P.secondary_usage_fee)}</span>}</span>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="rounded-xl border p-4">
                            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2"><MessageCircle className="h-3.5 w-3.5" /> 제안 메시지</h4>
                            <p className="text-xs leading-[1.8] whitespace-pre-wrap text-foreground/80">{P.message}</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t flex gap-2 shrink-0">
                    <Button variant="outline" className="flex-1 gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                        <XCircle className="h-4 w-4" /> 거절
                    </Button>
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> 수락
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ═══════════════════════════════════════════════════════════
// DIALOG B: "Summary + Expand" — 요약형 (상세는 페이지로)
// ═══════════════════════════════════════════════════════════
function DialogB({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-0 flex flex-col">
                {/* Header with big price */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center text-lg font-black text-violet-600 shrink-0">
                            {P.brand_name[0]}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold">{P.brand_name}</h3>
                            <p className="text-xs text-muted-foreground">{fmtFull(P.created_at)} · <span className="text-primary">{MOMENT_TITLE}</span></p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] gap-1 shrink-0">
                            <Timer className="h-3 w-3" /> 대기
                        </Badge>
                    </div>

                    {/* Big Price Hero */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-5 text-center border border-emerald-100 dark:border-emerald-900/20">
                        <p className="text-[10px] text-muted-foreground mb-1">제안 광고비</p>
                        <p className="text-3xl font-black text-emerald-600">{fmt(P.compensation_amount)}</p>
                        {P.has_incentive && (
                            <p className="text-xs text-emerald-600 mt-1.5 flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3" /> 인센티브 있음</p>
                        )}
                    </div>
                </div>

                {/* Quick Info Grid */}
                <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                            <p className="text-[10px] text-muted-foreground mb-1">📦 제안 제품</p>
                            <p className="text-xs font-bold line-clamp-2">{P.product_name}</p>
                            <Badge variant="secondary" className="text-[9px] mt-1.5 gap-1"><Gift className="h-2.5 w-2.5" />{P.product_type === 'gift' ? '증정' : '대여'}</Badge>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                            <p className="text-[10px] text-muted-foreground mb-1">📺 진행 채널</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] font-medium text-white px-1.5 py-0.5 rounded-full shrink-0 ${CH_BG[P.channel_name]}`}>{CH[P.channel_name]}</span>
                                {P.channel_subtype && P.channel_subtype.split(',').map((s: string) => s.trim()).filter(Boolean).map((sub: string, i: number) => (
                                    <span key={i} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-muted border border-border">{SUB[sub] || sub}</span>
                                ))}
                            </div>
                            <Badge variant="outline" className="text-[9px] mt-1.5 gap-1"><Clapperboard className="h-2.5 w-2.5" />{P.video_guide === 'brand_provided' ? '브랜드 가이드' : '크리에이터 기획'}</Badge>
                        </div>
                    </div>

                    {/* Schedule Row */}
                    <div className="flex items-center gap-2 mt-3 bg-muted/30 rounded-lg px-3 py-2.5 border border-border/50">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 flex items-center gap-3 text-xs">
                            <span>초안 <b>{fmtD(P.draft_submission_date)}</b></span>
                            <span className="text-border">→</span>
                            <span>최종 <b>{fmtD(P.final_submission_date)}</b></span>
                            <span className="text-border">→</span>
                            <span>업로드 <b>{fmtD(P.upload_date)}</b>
                                {P.date_flexible && <span className="text-primary ml-1">(유동)</span>}
                            </span>
                        </div>
                    </div>

                    {/* 2nd Usage */}
                    <div className="flex items-center justify-between mt-2 px-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Repeat2 className="h-3 w-3" /> 2차 활용</span>
                        <span className="text-xs font-medium">{P.secondary_usage_period} · {fmt(P.secondary_usage_fee)}</span>
                    </div>

                    {/* Message Preview */}
                    <div className="mt-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100/50 dark:border-blue-900/20">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 메시지</p>
                        <p className="text-xs text-foreground/80 line-clamp-4 whitespace-pre-wrap">{P.message}</p>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t flex gap-2">
                    <Button variant="ghost" className="gap-1.5 text-xs text-muted-foreground">
                        상세 보기 <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" size="sm">
                        <XCircle className="h-4 w-4" /> 거절
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5" size="sm">
                        <CheckCircle2 className="h-4 w-4" /> 수락
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ═══════════════════════════════════════════════════════════
// DIALOG C: "Two-Column Dialog" — 좌우 분리형
// ═══════════════════════════════════════════════════════════
function DialogC({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[840px] max-h-[85vh] overflow-hidden p-0 flex flex-col">
                <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 ring-1 ring-violet-200/40 flex items-center justify-center text-sm font-black text-violet-600 shrink-0">
                                {P.brand_name[0]}
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold tracking-tight">{P.brand_name}</DialogTitle>
                                <DialogDescription className="text-xs mt-0.5">{fmtFull(P.created_at)} · {MOMENT_TITLE}</DialogDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] font-semibold gap-1 px-2.5 py-1">
                            <Timer className="h-3 w-3" /> 검토 대기
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-[280px_1fr] min-h-0">
                        {/* Left: Conditions Summary */}
                        <div className="border-r bg-muted/15 px-5 py-5 space-y-3.5">
                            {/* Price */}
                            <div className="text-center py-4 bg-gradient-to-b from-emerald-50 to-emerald-50/30 dark:from-emerald-900/15 dark:to-emerald-900/5 rounded-xl border border-emerald-100/80 dark:border-emerald-900/20">
                                <p className="text-[11px] uppercase tracking-wider text-emerald-600/60 font-semibold mb-1">광고비</p>
                                <p className="text-[26px] font-black text-emerald-600 leading-none tracking-tight">{fmt(P.compensation_amount)}</p>
                                {P.has_incentive && (
                                    <p className="text-[10px] text-emerald-600/80 mt-1.5 flex items-center justify-center gap-1 font-medium"><TrendingUp className="h-3 w-3" /> 인센티브 있음</p>
                                )}
                            </div>

                            {P.has_incentive && P.incentive_detail && (
                                <div className="bg-emerald-50/60 dark:bg-emerald-800/15 rounded-lg px-3 py-2.5 text-[13px] text-emerald-800/90 dark:text-emerald-200 leading-relaxed border border-emerald-100/50 dark:border-emerald-900/15">
                                    💡 {P.incentive_detail}
                                </div>
                            )}

                            <div className="border-t border-border/40 pt-3.5 space-y-3.5">
                                {/* Product */}
                                <div className="space-y-2">
                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60 flex items-center gap-1.5">
                                        <Package className="h-3.5 w-3.5 text-purple-400" /> 제안 제품
                                    </p>
                                    <p className="text-sm font-bold leading-snug">{P.product_name}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[11px] gap-1 font-medium">
                                            <Gift className="h-3.5 w-3.5" />{P.product_type === 'gift' ? '증정' : '대여'}
                                        </Badge>
                                        {P.product_url && (
                                            <a href={P.product_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-0.5 transition-colors">
                                                <ExternalLink className="h-3 w-3" /> 제품 링크
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Channel */}
                                <div className="space-y-2">
                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60 flex items-center gap-1.5">
                                        <Tv className="h-3.5 w-3.5 text-pink-400" /> 진행 채널
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-[11px] font-semibold text-white px-2.5 py-1 rounded-full shadow-sm shrink-0 ${CH_BG[P.channel_name]}`}>
                                            {CH[P.channel_name]}
                                        </span>
                                        {P.channel_subtype && P.channel_subtype.split(',').map((s: string) => s.trim()).filter(Boolean).map((sub: string, i: number) => (
                                            <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted border border-border">{SUB[sub] || sub}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="border-t border-border/40 pt-3.5 space-y-2">
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-amber-400" /> 일정
                                </p>
                                <div className="space-y-0 text-[13px]">
                                    {[
                                        { label: '초안 제출', value: fmtFull(P.draft_submission_date) },
                                        { label: '최종 제출', value: fmtFull(P.final_submission_date) },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between py-1.5 border-b border-border/25">
                                            <span className="text-muted-foreground">{label}</span>
                                            <span className="font-semibold tabular-nums">{value}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between py-1.5 border-b border-border/25">
                                        <span className="text-muted-foreground">업로드</span>
                                        <span className="font-semibold tabular-nums">
                                            {fmtFull(P.upload_date)}
                                            {P.date_flexible && <span className="text-primary/80 font-medium ml-1 text-[10px]">(유동)</span>}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-1.5 mt-1 border-t border-border/40">
                                        <span className="text-muted-foreground flex items-center gap-1"><Repeat2 className="h-3 w-3" /> 2차 활용</span>
                                        <span className="font-semibold">{P.secondary_usage_period}</span>
                                    </div>
                                    {P.secondary_usage_fee > 0 && (
                                        <div className="flex justify-between py-1">
                                            <span className="text-muted-foreground">2차 비용</span>
                                            <span className="font-semibold text-emerald-600">{fmt(P.secondary_usage_fee)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Message + Guide */}
                        <div className="p-6 space-y-5">
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-4">
                                    <MessageCircle className="h-3.5 w-3.5 text-blue-400" /> 제안 메시지
                                </h4>
                                <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-xl p-5 border border-blue-100/40 dark:border-blue-900/20">
                                    <p className="text-sm leading-[1.9] whitespace-pre-wrap text-foreground/85">{P.message}</p>
                                </div>
                            </div>

                            {/* Video Guide */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-3">
                                    <Clapperboard className="h-3.5 w-3.5 text-amber-400" /> 영상 가이드
                                </h4>
                                {P.video_guide === 'brand_provided' ? (
                                    <div className="bg-amber-50/40 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100/50 dark:border-amber-900/20">
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">📋 브랜드 가이드 제공</p>
                                        <p className="text-xs text-amber-700/70 dark:text-amber-300/60">브랜드에서 제공하는 가이드라인에 따라 제작해주세요.</p>
                                    </div>
                                ) : (
                                    <div className="bg-muted/30 rounded-xl p-4 border border-border/40">
                                        <p className="text-sm font-medium text-foreground/80 mb-1">🎨 크리에이터 재량</p>
                                        <p className="text-xs text-muted-foreground">별도 가이드 없이 크리에이터님의 스타일대로 자유롭게 제작해주세요.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t flex gap-2 shrink-0">
                    <Button variant="ghost" className="gap-1.5 text-xs text-muted-foreground">
                        상세 보기 <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                        <XCircle className="h-4 w-4" /> 거절
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> 수락
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE — Tab Switcher + Dialog Triggers
// ═══════════════════════════════════════════════════════════
export default function MomentProposalDialogDesignLab() {
    const [openA, setOpenA] = useState(false)
    const [openB, setOpenB] = useState(false)
    const [openC, setOpenC] = useState(false)

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container max-w-4xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">제안서 다이얼로그 디자인 비교</h1>
                    <p className="text-sm text-muted-foreground">3가지 다이얼로그 디자인. 버튼을 클릭해서 각각 열어보세요. 모든 16개 필드 포함.</p>
                </div>

                {/* Location Guide */}
                <div className="rounded-xl border bg-card p-5 mb-6 space-y-4">
                    <h3 className="text-sm font-bold">📍 다이얼로그 vs 상세 페이지 배치 가이드</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-blue-600">🔲 다이얼로그 (빠른 확인)</p>
                            <ul className="text-xs text-muted-foreground space-y-1.5">
                                <li className="flex items-center gap-1.5">✅ 크리에이터 대시보드 — 받은 제안 리스트 클릭</li>
                                <li className="flex items-center gap-1.5">✅ 브랜드 대시보드 — 보낸 제안 리스트 클릭</li>
                                <li className="flex items-center gap-1.5">🆕 MCN 대시보드 — 소속 크리에이터 제안 관리</li>
                                <li className="flex items-center gap-1.5">🆕 알림 클릭 — "새 제안 도착" 클릭 시</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-emerald-600">📄 상세 페이지 (최종 의사결정)</p>
                            <ul className="text-xs text-muted-foreground space-y-1.5">
                                <li className="flex items-center gap-1.5">✅ 모먼트 상세 /event/[id] — 제안 확인</li>
                                <li className="flex items-center gap-1.5">🆕 크리에이터 아카이브 상세뷰 — 3컬럼 내</li>
                                <li className="flex items-center gap-1.5">🆕 협업 워크스페이스 — 원래 조건 확인</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="A" className="w-full">
                    <TabsList className="w-full md:w-auto grid grid-cols-3 mb-6">
                        <TabsTrigger value="A">A · 구역 분리형</TabsTrigger>
                        <TabsTrigger value="B">B · 요약 카드형</TabsTrigger>
                        <TabsTrigger value="C">C · 좌우 분리형</TabsTrigger>
                    </TabsList>

                    <TabsContent value="A">
                        <div className="rounded-xl border bg-card p-8 text-center space-y-4">
                            <h3 className="text-lg font-bold">디자인 A: 구역 분리형</h3>
                            <p className="text-sm text-muted-foreground">세로 스크롤, 각 섹션이 카드로 구분. 정보가 계층적으로 표현됨.</p>
                            <p className="text-xs text-muted-foreground">max-width: 560px · 5개 섹션 (보상→제품→채널→일정→메시지)</p>
                            <Button onClick={() => setOpenA(true)} size="lg" className="gap-2">
                                <Sparkles className="h-4 w-4" /> 다이얼로그 열기
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="B">
                        <div className="rounded-xl border bg-card p-8 text-center space-y-4">
                            <h3 className="text-lg font-bold">디자인 B: 요약 카드형</h3>
                            <p className="text-sm text-muted-foreground">가격 대형 표시 + 2칸 그리드 요약. "상세보기" 버튼으로 풀 페이지 연결.</p>
                            <p className="text-xs text-muted-foreground">max-width: 480px · 콤팩트 · 메시지 4줄 미리보기</p>
                            <Button onClick={() => setOpenB(true)} size="lg" className="gap-2">
                                <Sparkles className="h-4 w-4" /> 다이얼로그 열기
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="C">
                        <div className="rounded-xl border bg-card p-8 text-center space-y-4">
                            <h3 className="text-lg font-bold">디자인 C: 좌우 분리형</h3>
                            <p className="text-sm text-muted-foreground">왼쪽: 조건 요약 패널, 오른쪽: 전체 메시지. 넓은 다이얼로그.</p>
                            <p className="text-xs text-muted-foreground">max-width: 768px · 2-column · 메시지 전문 표시</p>
                            <Button onClick={() => setOpenC(true)} size="lg" className="gap-2">
                                <Sparkles className="h-4 w-4" /> 다이얼로그 열기
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            <DialogA open={openA} onOpenChange={setOpenA} />
            <DialogB open={openB} onOpenChange={setOpenB} />
            <DialogC open={openC} onOpenChange={setOpenC} />
        </div>
    )
}
