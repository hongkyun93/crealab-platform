"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Calendar, CheckCircle2, Clapperboard, ExternalLink, Gift, MessageCircle, Package, Repeat2, Timer, TrendingUp, Tv, XCircle
} from "lucide-react"
import { useMemo, useState } from "react"

interface ReadonlyProposalDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    proposal: any
    onAccept?: (proposalId: string) => void | Promise<void>
    onReject?: (proposalId: string) => void | Promise<void>
    onCancel?: (proposalId: string) => void | Promise<void>
    currentUserId?: string
}

const CH: Record<string, string> = { instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', blog: 'Blog', '협의': '협의' }
const SUB: Record<string, string> = { instagram_reels: '릴스', instagram_feed: '피드', instagram_story: '스토리', youtube_longform: '롱폼', youtube_shorts: '숏츠' }
const CH_BG: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600',
    youtube: 'bg-gradient-to-r from-red-600 to-red-700',
    tiktok: 'bg-gradient-to-r from-black to-slate-800',
    blog: 'bg-gradient-to-r from-green-500 to-green-600',
    '협의': 'bg-gradient-to-r from-gray-500 to-gray-600'
}

const fmt = (n: number) => n > 0 ? `₩${n.toLocaleString()}` : '협의 필요'
const fmtDate = (d: string | undefined | null) => {
    if (!d || d === '미정') return '미정'
    try {
        const dt = new Date(d)
        if (isNaN(dt.getTime())) return d
        return `${dt.getFullYear()}.${dt.getMonth() + 1}.${dt.getDate()}`
    } catch { return d }
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive'; bg: string }> = {
    offered: { label: '검토 대기', variant: 'outline', bg: 'bg-blue-50 text-blue-600 border-blue-200' },
    pending: { label: '검토 대기', variant: 'outline', bg: 'bg-blue-50 text-blue-600 border-blue-200' },
    applied: { label: '지원 완료', variant: 'outline', bg: 'bg-blue-50 text-blue-600 border-blue-200' },
    accepted: { label: '수락됨', variant: 'default', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    rejected: { label: '거절됨', variant: 'destructive', bg: 'bg-red-50 text-red-600 border-red-200' },
    cancelled: { label: '취소됨', variant: 'secondary', bg: 'bg-gray-50 text-gray-600 border-gray-200' },
    completed: { label: '완료', variant: 'default', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
}

export function ReadonlyProposalDialog({ open, onOpenChange, proposal, onAccept, onReject, onCancel, currentUserId }: ReadonlyProposalDialogProps) {
    const [isAccepting, setIsAccepting] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    // Data Normalization — supports MomentProposal, BrandProposal, CampaignApplication
    const data = useMemo(() => {
        if (!proposal) return null

        const c = proposal.conditions || {}

        const rawAmount = c.compensation_amount || proposal.compensation_amount || proposal.price_offer || proposal.cost || 0
        const amount = typeof rawAmount === 'string' ? parseInt(rawAmount.replace(/[^0-9]/g, '')) || 0 : rawAmount

        const isBrandView = currentUserId && (currentUserId === proposal.brand_id || currentUserId === proposal.sender_id)

        const display_name = isBrandView
            ? (proposal.creator_name || proposal.creatorName || proposal.creator?.name || '크리에이터')
            : (proposal.brand_name || proposal.brand?.display_name || proposal.brand?.name || 'Brand')

        const display_avatar = isBrandView
            ? (proposal.creator_avatar || proposal.creatorAvatar || proposal.creator?.avatar_url)
            : (proposal.brand_avatar || proposal.brandAvatar || proposal.brand?.avatar_url)

        return {
            // Meta
            display_name,
            display_avatar,
            created_at: proposal.created_at,
            status: proposal.status,
            message: proposal.message,

            // Product
            product_name: c.product_name || proposal.product_name || proposal.product?.name || '-',
            product_type: c.product_type || proposal.product_type || 'gift',
            product_url: c.product_url || proposal.product?.link || proposal.product_url,

            // Compensation
            compensation_amount: amount,
            has_incentive: c.has_incentive !== undefined ? c.has_incentive : proposal.has_incentive,
            incentive_detail: c.incentive_detail || proposal.incentive_detail,

            // Channel
            channel_name: c.channel_name || proposal.channel_name || '협의',
            channel_subtype: c.channel_subtype || proposal.channel_subtype || '',

            // Schedule
            draft_date: c.condition_draft_submission_date || proposal.condition_draft_submission_date || '미정',
            final_date: c.condition_final_submission_date || proposal.condition_final_submission_date || '미정',
            upload_date: c.condition_upload_date || proposal.condition_upload_date || '미정',
            date_flexible: c.date_flexible || proposal.date_flexible || false,
            secondary_usage: c.condition_secondary_usage_period || proposal.condition_secondary_usage_period,
            secondary_usage_fee: c.secondary_usage_fee || proposal.secondary_usage_fee || 0,

            // Video Guide
            video_guide: c.video_guide || proposal.video_guide || null,

            // Context
            moment_title: proposal.moment_title || proposal.moment?.title || proposal.campaignName || proposal.product?.name,
        }
    }, [proposal])

    // 채널 아이디 → 풀 URL 자동 생성
    const channelHandle: string = proposal?.instagram_handle || ''
    const buildChannelUrl = (channel: string, handle: string): string | null => {
        if (!handle) return null
        const h = handle.replace(/^@/, '')
        switch (channel) {
            case 'instagram': return `https://www.instagram.com/${h}`
            case 'youtube': return `https://www.youtube.com/@${h}`
            case 'tiktok': return `https://www.tiktok.com/@${h}`
            case 'blog': return h.startsWith('http') ? h : `https://blog.naver.com/${h}`
            default: return h.startsWith('http') ? h : null
        }
    }
    const channelUrl = buildChannelUrl(data?.channel_name || '', channelHandle)

    if (!proposal || !data) return null

    const statusInfo = STATUS_MAP[data.status] || STATUS_MAP.offered

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[840px] max-h-[85vh] overflow-hidden p-0 flex flex-col">
                {/* Header */}
                <DialogHeader className="px-6 pt-5 pb-3 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 ring-1 ring-violet-200/40 flex items-center justify-center text-sm font-black text-violet-600 shrink-0 overflow-hidden">
                                {data.display_avatar ? (
                                    <img src={data.display_avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    data.display_name?.substring(0, 1) || 'U'
                                )}
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold tracking-tight">{data.display_name}</DialogTitle>
                                <DialogDescription className="text-xs mt-0.5">
                                    {fmtDate(data.created_at)}
                                    {data.moment_title && ` · ${data.moment_title}`}
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge variant={statusInfo.variant} className={`${statusInfo.bg} text-[10px] font-semibold gap-1 px-2.5 py-1`}>
                            <Timer className="h-3 w-3" /> {statusInfo.label}
                        </Badge>
                    </div>
                </DialogHeader>

                {/* Two-Column Body */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-[280px_1fr] min-h-0">
                        {/* ── Left: Conditions Summary ── */}
                        <div className="border-r bg-muted/15 px-5 py-5 space-y-3.5">
                            {/* Price */}
                            <div className="text-center py-4 bg-gradient-to-b from-emerald-50 to-emerald-50/30 dark:from-emerald-900/15 dark:to-emerald-900/5 rounded-xl border border-emerald-100/80 dark:border-emerald-900/20">
                                <p className="text-[11px] uppercase tracking-wider text-emerald-600/60 font-semibold mb-1">광고비</p>
                                <p className="text-[26px] font-black text-emerald-600 leading-none tracking-tight">{fmt(data.compensation_amount)}</p>
                                {data.has_incentive && (
                                    <p className="text-[10px] text-emerald-600/80 mt-1.5 flex items-center justify-center gap-1 font-medium"><TrendingUp className="h-3 w-3" /> 인센티브 있음</p>
                                )}
                            </div>

                            {data.has_incentive && data.incentive_detail && (
                                <div className="bg-emerald-50/60 dark:bg-emerald-800/15 rounded-lg px-3 py-2.5 text-[13px] text-emerald-800/90 dark:text-emerald-200 leading-relaxed border border-emerald-100/50 dark:border-emerald-900/15">
                                    💡 {data.incentive_detail}
                                </div>
                            )}

                            <div className="border-t border-border/40 pt-3.5 space-y-3.5">
                                {/* Product */}
                                <div className="space-y-2">
                                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60 flex items-center gap-1.5">
                                        <Package className="h-3.5 w-3.5 text-purple-400" /> 제안 제품
                                    </p>
                                    <p className="text-sm font-bold leading-snug">{data.product_name}</p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[11px] gap-1 font-medium">
                                            <Gift className="h-3.5 w-3.5" />{data.product_type === 'gift' ? '증정' : data.product_type === 'loan' ? '대여' : '제공'}
                                        </Badge>
                                        {data.product_url && (
                                            <a href={data.product_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-0.5 transition-colors">
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
                                        <span className={`text-[11px] font-semibold text-white px-2.5 py-1 rounded-full shadow-sm shrink-0 ${CH_BG[data.channel_name] || CH_BG['협의']}`}>
                                            {CH[data.channel_name] || data.channel_name}
                                        </span>
                                        {data.channel_subtype && data.channel_subtype.split(',').map((s: string) => s.trim()).filter(Boolean).map((sub: string, i: number) => (
                                            <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted border border-border">
                                                {SUB[sub] || (sub.startsWith('other:') ? `기타: ${sub.slice(6)}` : sub)}
                                            </span>
                                        ))}
                                    </div>
                                    {channelUrl && (
                                        <a
                                            href={channelUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-600 hover:underline transition-colors mt-1"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            {channelHandle.replace(/^@/, '')} 채널 바로가기
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="border-t border-border/40 pt-3.5 space-y-2">
                                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-amber-400" /> 일정
                                </p>
                                <div className="space-y-0 text-[13px]">
                                    {[
                                        { label: '초안 제출', value: fmtDate(data.draft_date) },
                                        { label: '최종 제출', value: fmtDate(data.final_date) },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between py-1.5 border-b border-border/25">
                                            <span className="text-muted-foreground">{label}</span>
                                            <span className="font-semibold tabular-nums">{value}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between py-1.5 border-b border-border/25">
                                        <span className="text-muted-foreground">업로드</span>
                                        <span className="font-semibold tabular-nums">
                                            {fmtDate(data.upload_date)}
                                            {data.date_flexible && <span className="text-primary/80 font-medium ml-1 text-[10px]">(유동)</span>}
                                        </span>
                                    </div>
                                    {data.secondary_usage && (
                                        <div className="flex justify-between py-1.5 mt-1 border-t border-border/40">
                                            <span className="text-muted-foreground flex items-center gap-1"><Repeat2 className="h-3 w-3" /> 2차 활용</span>
                                            <span className="font-semibold">{data.secondary_usage}</span>
                                        </div>
                                    )}
                                    {data.secondary_usage_fee > 0 && (
                                        <div className="flex justify-between py-1">
                                            <span className="text-muted-foreground">2차 비용</span>
                                            <span className="font-semibold text-emerald-600">{fmt(data.secondary_usage_fee)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Right: 지원서 내용 ── */}
                        <div className="p-6 space-y-5">
                            {/* 지원 동기 */}
                            {proposal?.motivation && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-3">
                                        <MessageCircle className="h-3.5 w-3.5 text-blue-400" /> 지원 동기
                                    </h4>
                                    <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100/40 dark:border-blue-900/20">
                                        <p className="text-sm leading-[1.9] whitespace-pre-wrap text-foreground/85">{proposal.motivation}</p>
                                    </div>
                                </div>
                            )}

                            {/* 콘텐츠 제작 계획 */}
                            {proposal?.content_plan && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-3">
                                        <Clapperboard className="h-3.5 w-3.5 text-violet-400" /> 콘텐츠 제작 계획
                                    </h4>
                                    <div className="bg-violet-50/30 dark:bg-violet-900/10 rounded-xl p-4 border border-violet-100/40 dark:border-violet-900/20">
                                        <p className="text-sm leading-[1.9] whitespace-pre-wrap text-foreground/85">{proposal.content_plan}</p>
                                    </div>
                                </div>
                            )}

                            {/* 포트폴리오 링크 */}
                            {proposal?.portfolio_links && (Array.isArray(proposal.portfolio_links) ? proposal.portfolio_links.length > 0 : !!proposal.portfolio_links) && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-3">
                                        <ExternalLink className="h-3.5 w-3.5 text-emerald-400" /> 포트폴리오
                                    </h4>
                                    <div className="space-y-1.5">
                                        {(Array.isArray(proposal.portfolio_links) ? proposal.portfolio_links : [proposal.portfolio_links])
                                            .filter(Boolean)
                                            .map((link: string, i: number) => (
                                                <a key={i} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-1.5 text-[12px] text-blue-500 hover:text-blue-600 hover:underline transition-colors truncate">
                                                    <ExternalLink className="h-3 w-3 shrink-0" />{link}
                                                </a>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* 인사이트 스크린샷 */}
                            {proposal?.insight_screenshot && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-3">
                                        <TrendingUp className="h-3.5 w-3.5 text-pink-400" /> 인사이트 캡처
                                    </h4>
                                    <a href={proposal.insight_screenshot} target="_blank" rel="noreferrer">
                                        <img src={proposal.insight_screenshot} alt="인사이트" className="rounded-xl border border-border/50 w-full object-cover max-h-48 hover:opacity-90 transition-opacity cursor-zoom-in" />
                                    </a>
                                </div>
                            )}

                            {/* 제안 메시지 (기존, appeal_message 포함) */}
                            {data.message && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-3">
                                        <MessageCircle className="h-3.5 w-3.5 text-blue-400" /> 추가 메시지
                                    </h4>
                                    <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100/40 dark:border-blue-900/20">
                                        <p className="text-sm leading-[1.9] whitespace-pre-wrap text-foreground/85">{data.message}</p>
                                    </div>
                                </div>
                            )}

                            {/* Video Guide */}
                            {data.video_guide && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-3">
                                        <Clapperboard className="h-3.5 w-3.5 text-amber-400" /> 영상 가이드
                                    </h4>
                                    {data.video_guide === 'brand_provided' ? (
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer — status-based actions */}
                <DialogFooter className="px-6 py-4 border-t flex gap-2 shrink-0">
                    {/* Sender (Brand) — Cancel */}
                    {currentUserId && (proposal?.brand_id === currentUserId || proposal?.sender_id === currentUserId) && proposal?.status === 'offered' ? (
                        <div className="flex w-full gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                onClick={async () => {
                                    if (!onCancel) return
                                    if (!confirm("정말로 이 제안을 취소하시겠습니까? 안심하세요, 상대방에게는 삭제된 것으로 보입니다.")) return
                                    await onCancel(proposal.id)
                                    onOpenChange(false)
                                }}
                            >
                                <XCircle className="h-4 w-4" /> 제안 취소하기
                            </Button>
                            <Button onClick={() => onOpenChange(false)} className="flex-1">닫기</Button>
                        </div>
                    ) :
                        /* Receiver (Creator) — Accept / Reject */
                        (proposal?.status === 'offered' || proposal?.status === 'pending' || !proposal?.status) &&
                            currentUserId && proposal?.creator_id === currentUserId ? (
                            <div className="flex w-full gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 dark:hover:bg-red-950/20"
                                    onClick={async () => {
                                        if (!onReject) return
                                        setIsRejecting(true)
                                        try {
                                            await onReject(proposal.id)
                                            onOpenChange(false)
                                        } catch (e) {
                                            console.error('Reject error:', e)
                                        } finally {
                                            setIsRejecting(false)
                                        }
                                    }}
                                    disabled={isAccepting || isRejecting}
                                >
                                    <XCircle className="h-4 w-4" /> {isRejecting ? '거절 중...' : '거절'}
                                </Button>
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                                    onClick={async () => {
                                        if (!onAccept) return
                                        setIsAccepting(true)
                                        try {
                                            await onAccept(proposal.id)
                                            onOpenChange(false)
                                        } catch (e) {
                                            console.error('Accept error:', e)
                                        } finally {
                                            setIsAccepting(false)
                                        }
                                    }}
                                    disabled={isAccepting || isRejecting}
                                >
                                    <CheckCircle2 className="h-4 w-4" /> {isAccepting ? '수락 중...' : '수락'}
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => onOpenChange(false)} className="flex-1">닫기</Button>
                        )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
