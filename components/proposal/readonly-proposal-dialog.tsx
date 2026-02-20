"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Package, Banknote } from "lucide-react"
import { useMemo, useState } from "react"

interface ReadonlyProposalDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    proposal: any // Using any to support both MomentProposal and BrandProposal
    onAccept?: (proposalId: string) => void | Promise<void>
    onReject?: (proposalId: string) => void | Promise<void>
    onCancel?: (proposalId: string) => void | Promise<void> // [NEW] Cancel for sender
    currentUserId?: string // To determine if user can accept/reject
}

export function ReadonlyProposalDialog({ open, onOpenChange, proposal, onAccept, onReject, onCancel, currentUserId }: ReadonlyProposalDialogProps) {
    const [isAccepting, setIsAccepting] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    // Data Normalization (정규화)
    // MomentProposal has details in 'conditions' object
    // BrandProposal has details in top-level fields
    // We unify them into a single structure for rendering
    const data = useMemo(() => {
        if (!proposal) return null

        const c = proposal.conditions || {}

        return {
            // Meta
            brand_name: proposal.brand_name || proposal.brand?.name || 'Brand',
            brand_avatar: proposal.brand_avatar || proposal.brand?.avatar,
            created_at: proposal.created_at,
            status: proposal.status,
            message: proposal.message,

            // Product
            product_name: c.product_name || proposal.product_name || proposal.product?.name || '-',
            product_image: c.product_image || proposal.product?.image || proposal.product_url || null, // product_url might be an image in some contexts or link
            product_type: c.product_type || proposal.product_type || 'benefit',
            product_url: c.product_url || proposal.product?.link || proposal.product_url,

            // Compensation
            compensation_amount: c.compensation_amount || proposal.compensation_amount || proposal.price_offer || proposal.cost || 0,
            has_incentive: c.has_incentive !== undefined ? c.has_incentive : proposal.has_incentive,
            incentive_detail: c.incentive_detail || proposal.incentive_detail,

            // Channel
            channel_name: c.channel_name || proposal.channel_name || '협의',
            channel_subtype: c.channel_subtype || proposal.channel_subtype || '',
            draft_date: c.condition_draft_submission_date || proposal.condition_draft_submission_date || '미정',
            final_date: c.condition_final_submission_date || proposal.condition_final_submission_date || '미정',
            upload_date: c.condition_upload_date || proposal.condition_upload_date || '미정',
            secondary_usage: c.condition_secondary_usage_period || proposal.condition_secondary_usage_period,
            secondary_usage_fee: c.secondary_usage_fee || proposal.secondary_usage_fee || 0,
        }
    }, [proposal])

    if (!proposal || !data) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle>제안서 상세</DialogTitle>
                    <DialogDescription>
                        제안 내용을 확인하고 협업 여부를 결정하세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* 1. Brand & Status Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {data.brand_avatar ? (
                                    <img src={data.brand_avatar} alt="Brand" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold">{data.brand_name?.substring(0, 1) || 'B'}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold">{data.brand_name}</p>
                                <p className="text-xs text-muted-foreground">{new Date(data.created_at).toLocaleDateString()} 제안</p>
                            </div>
                        </div>
                        <Badge variant={data.status === 'accepted' ? 'default' : 'outline'}>
                            {data.status === 'offered' ? '대기중' :
                                data.status === 'accepted' ? '수락됨' :
                                    data.status === 'rejected' ? '거절됨' : data.status}
                        </Badge>
                    </div>

                    {/* 2. Message */}
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                        <p className="text-sm font-medium">제안 메시지</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {data.message || "메시지 없음"}
                        </p>
                    </div>

                    {/* 3. Product Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Package className="h-4 w-4" /> 제안 제품
                        </h4>
                        <div className="bg-card border rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="text-xs text-muted-foreground">제품명</span>
                                <span className="text-sm font-semibold text-right flex-1 ml-2">{data.product_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">제공 방식</span>
                                <Badge variant="secondary" className="text-[10px] h-5">
                                    {data.product_type === 'gift' ? '제품 증정' : '제품 대여'}
                                </Badge>
                            </div>
                            {(data.product_url) && (
                                <div className="pt-2 border-t border-border">
                                    <a
                                        href={data.product_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>🔗</span> 제품 링크 확인하기
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Compensation */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Banknote className="h-4 w-4" /> 제안 고료
                        </h4>
                        <div className="bg-card border rounded-lg p-3 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">고정 고료</span>
                                <span className="text-sm font-bold">
                                    {(() => {
                                        const amount = data.compensation_amount ? parseInt(data.compensation_amount.toString().replace(/[^0-9]/g, '')) : 0
                                        return amount > 0 ? `${amount.toLocaleString()}원` : '협의 필요'
                                    })()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">인센티브</span>
                                <span className="text-sm">
                                    {data.has_incentive ? (
                                        <span className="text-green-600 font-medium">있음</span>
                                    ) : (
                                        <span className="text-muted-foreground">없음</span>
                                    )}
                                </span>
                            </div>
                            {data.has_incentive && data.incentive_detail && (
                                <div className="mt-2 text-xs bg-muted p-2 rounded text-muted-foreground">
                                    {data.incentive_detail}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. Schedule & Conditions */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> 일정 및 조건
                        </h4>
                        <div className="bg-card border rounded-lg p-3 space-y-1">
                            {/* Channel */}
                            <div className="flex justify-between py-1 border-b border-border/50">
                                <span className="text-sm text-muted-foreground">진행 채널</span>
                                <span className="text-sm font-medium">{data.channel_name}{data.channel_subtype ? ` (${data.channel_subtype})` : ''}</span>
                            </div>

                            {/* Dates */}
                            <div className="flex justify-between py-1">
                                <span className="text-sm text-muted-foreground">초안 제출 희망일</span>
                                <span className="text-sm">{data.draft_date}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-sm text-muted-foreground">최종 제출 희망일</span>
                                <span className="text-sm">{data.final_date}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-sm text-muted-foreground">업로드 희망일</span>
                                <span className="text-sm">{data.upload_date}</span>
                            </div>
                            {data.secondary_usage && (
                                <div className="flex justify-between py-1 border-t border-border/50 mt-1 pt-2">
                                    <span className="text-sm text-muted-foreground">2차 활용 기간</span>
                                    <span className="text-sm font-medium">{data.secondary_usage}{data.secondary_usage_fee > 0 && ` · ${data.secondary_usage_fee.toLocaleString()}원`}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t flex gap-2">
                    {/* Sender Actions (Brand) - Cancel Proposal */}
                    {currentUserId && (proposal?.brand_id === currentUserId || proposal?.sender_id === currentUserId) && proposal?.status === 'offered' ? (
                        <div className="flex w-full gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                onClick={async () => {
                                    if (!onCancel) return
                                    if (!confirm("정말로 이 제안을 취소하시겠습니까? 안심하세요, 상대방에게는 삭제된 것으로 보입니다.")) return
                                    await onCancel(proposal.id)
                                    onOpenChange(false)
                                }}
                            >
                                제안 취소하기
                            </Button>
                            <Button onClick={() => onOpenChange(false)} className="flex-1">닫기</Button>
                        </div>
                    ) :

                        /* Receiver Actions (Creator/Influencer) */
                        (proposal?.status === 'offered' || proposal?.status === 'pending' || !proposal?.status) &&
                            currentUserId && proposal?.influencer_id === currentUserId ? (
                            <>
                                <Button
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
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {isAccepting ? '수락 중...' : '수락하기'}
                                </Button>
                                <Button
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
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    {isRejecting ? '거절 중...' : '거절하기'}
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => onOpenChange(false)} className="flex-1">닫기</Button>
                        )}
                </DialogFooter>
            </DialogContent >
        </Dialog >
    )
}
