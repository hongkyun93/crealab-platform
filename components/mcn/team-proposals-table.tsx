"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useTeam } from "@/components/providers/team-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpDown, Calendar, Check, ChevronRight, FileText, Filter, Loader2, Megaphone, Package, Sparkles, X } from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { MagicLinkGeneratorModal } from "./magic-link-generator-modal"

interface TeamProposal {
    id: string
    proposal_type: 'product_application' | 'moment_proposal' | 'campaign_application'
    status: string
    product_name: string
    price_offer: number | null
    message: string | null
    created_at: string
    influencer_id: string
    creator_name: string
    creator_avatar: string | null
    brand_name: string
    brand_avatar: string | null
    content_type?: string | null
    brand_condition_confirmed?: boolean | null
    influencer_condition_confirmed?: boolean | null
    contract_status?: string | null
    delivery_status?: string | null
}

interface TeamProposalsTableProps {
    teamId: string
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
    offered: { label: '대기중', variant: 'outline', className: 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
    pending: { label: '대기중', variant: 'outline', className: 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
    accepted: { label: '수락', variant: 'outline', className: 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    active: { label: '진행중', variant: 'outline', className: 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    in_progress: { label: '진행중', variant: 'outline', className: 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    rejected: { label: '거절', variant: 'outline', className: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
    completed: { label: '완료', variant: 'outline', className: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
    cancelled: { label: '취소', variant: 'outline', className: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
}

const TYPE_MAP: Record<string, { label: string; color: string; icon: typeof FileText }> = {
    product_application: { label: '브랜드', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950', icon: Package },
    moment_proposal: { label: '모먼트', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950', icon: Calendar },
    campaign_application: { label: '캠페인', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950', icon: Megaphone },
}

// Progress bar computation
function getProgressStage(p: TeamProposal): { stage: number; label: string; paymentPending: boolean } {
    if (p.status === 'rejected' || p.status === 'cancelled') return { stage: 0, label: '취소/거절', paymentPending: false }
    if (p.status === 'completed') return { stage: 5, label: '완료', paymentPending: false }
    if (p.delivery_status === 'shipped' || p.delivery_status === 'delivered') return { stage: 4, label: '배송', paymentPending: false }
    if (p.contract_status === 'signed') {
        const paid = !!(p as any).payment_confirmed_at
        return { stage: 3, label: '계약서', paymentPending: !paid }
    }
    if (p.brand_condition_confirmed && p.influencer_condition_confirmed) return { stage: 2, label: '조건확정', paymentPending: false }
    if (p.status === 'accepted' || p.brand_condition_confirmed) return { stage: 1, label: '협의중', paymentPending: false }
    return { stage: 0, label: '제안', paymentPending: false }
}

const PROGRESS_STAGES = ['제안', '협의', '계약', '배송', '완료']

function ProgressBar({ stage, paymentPending }: { stage: number; paymentPending?: boolean }) {
    return (
        <div className="flex items-center gap-0.5 w-28">
            {PROGRESS_STAGES.map((_, i) => (
                <React.Fragment key={i}>
                    <div
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i < stage
                            ? 'bg-emerald-500'
                            : i === stage && stage > 0
                                ? 'bg-amber-400'
                                : 'bg-muted'
                            }`}
                    />
                    {/* 결제 도트: 계약(i=2)과 배송(i=3) 사이 */}
                    {i === 2 && paymentPending && (
                        <div className="relative flex items-center justify-center mx-0.5 shrink-0">
                            <span className="absolute w-2.5 h-2.5 rounded-full bg-orange-400/40 animate-ping" />
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 z-10" />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}

export function TeamProposalsTable({ teamId }: TeamProposalsTableProps) {
    const { supabase, user } = useAuth()
    const { switchToMember } = useTeam()
    const [proposals, setProposals] = useState<TeamProposal[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [creatorFilter, setCreatorFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'date' | 'price'>('date')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchProposals = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase.rpc('get_team_proposals', {
                target_team_id: teamId
            })

            if (error) {
                console.warn('[Team Proposals] RPC not available yet (deploy migration SQL). Fallback: empty list.')
                setProposals([])
            } else {
                setProposals(data || [])
            }
        } catch (err) {
            console.error('[Team Proposals] Error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!teamId) return
        fetchProposals()
    }, [teamId])

    // Get unique creators for filter
    const uniqueCreators = useMemo(() => Array.from(
        new Map(proposals.map(p => [p.influencer_id, { id: p.influencer_id, name: p.creator_name }])).values()
    ), [proposals])

    // Counts per type
    const typeCounts = useMemo(() => ({
        all: proposals.length,
        moment_proposal: proposals.filter(p => p.proposal_type === 'moment_proposal').length,
        product_application: proposals.filter(p => p.proposal_type === 'product_application').length,
        campaign_application: proposals.filter(p => p.proposal_type === 'campaign_application').length,
    }), [proposals])

    // Filter & sort
    const filteredProposals = useMemo(() => proposals
        .filter(p => typeFilter === 'all' || p.proposal_type === typeFilter)
        .filter(p => statusFilter === 'all' || p.status === statusFilter)
        .filter(p => creatorFilter === 'all' || p.influencer_id === creatorFilter)
        .sort((a, b) => {
            if (sortBy === 'price') {
                return (b.price_offer || 0) - (a.price_offer || 0)
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        , [proposals, typeFilter, statusFilter, creatorFilter, sortBy])

    const handleRowClick = (proposal: TeamProposal) => {
        switchToMember(proposal.influencer_id)
        window.location.href = '/creator?view=workspace'
    }

    // MCN Proxy Actions
    const handleAccept = async (proposal: TeamProposal, e: React.MouseEvent) => {
        e.stopPropagation()
        setActionLoading(proposal.id)
        try {
            const table = proposal.proposal_type === 'product_application' ? 'product_applications'
                : proposal.proposal_type === 'moment_proposal' ? 'moment_proposals'
                    : 'campaign_applications'

            const { error } = await supabase.from(table).update({ status: 'accepted' }).eq('id', proposal.id)
            if (error) throw error
            toast.success(`${proposal.creator_name}의 제안을 수락했습니다`)
            fetchProposals()
        } catch (err: any) {
            toast.error('수락 실패: ' + (err.message || '알 수 없는 오류'))
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (proposal: TeamProposal, e: React.MouseEvent) => {
        e.stopPropagation()
        setActionLoading(proposal.id)
        try {
            const table = proposal.proposal_type === 'product_application' ? 'product_applications'
                : proposal.proposal_type === 'moment_proposal' ? 'moment_proposals'
                    : 'campaign_applications'

            const { error } = await supabase.from(table).update({ status: 'rejected' }).eq('id', proposal.id)
            if (error) throw error
            toast.success(`${proposal.creator_name}의 제안을 거절했습니다`)
            fetchProposals()
        } catch (err: any) {
            toast.error('거절 실패: ' + (err.message || '알 수 없는 오류'))
        } finally {
            setActionLoading(null)
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">제안서 로딩 중...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Type Tabs & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full sm:w-auto">
                    <TabsList className="inline-flex w-full sm:w-auto h-auto flex-wrap">
                        <TabsTrigger value="all" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-4">
                            <Sparkles className="h-3.5 w-3.5" />
                            전체
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-[10px] px-1">
                                {typeCounts.all}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="moment_proposal" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-4">
                            <Calendar className="h-3.5 w-3.5" />
                            모먼트
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-[10px] px-1">
                                {typeCounts.moment_proposal}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="product_application" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-4">
                            <Package className="h-3.5 w-3.5" />
                            브랜드
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-[10px] px-1">
                                {typeCounts.product_application}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="campaign_application" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-4">
                            <Megaphone className="h-3.5 w-3.5" />
                            캠페인
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-[10px] px-1">
                                {typeCounts.campaign_application}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex-shrink-0">
                    <MagicLinkGeneratorModal />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                        <SelectTrigger className="w-[160px] h-9">
                            <SelectValue placeholder="크리에이터" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">전체 크리에이터</SelectItem>
                            {uniqueCreators.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] h-9">
                        <SelectValue placeholder="상태" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 상태</SelectItem>
                        <SelectItem value="offered">대기중</SelectItem>
                        <SelectItem value="pending">대기중 (캠페인)</SelectItem>
                        <SelectItem value="accepted">수락</SelectItem>
                        <SelectItem value="in_progress">진행중</SelectItem>
                        <SelectItem value="completed">완료</SelectItem>
                        <SelectItem value="rejected">거절</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortBy(s => s === 'date' ? 'price' : 'date')}
                    className="gap-1.5"
                >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    {sortBy === 'date' ? '최신순' : '금액순'}
                </Button>
                <span className="text-xs text-muted-foreground ml-auto">
                    {filteredProposals.length}건
                </span>
            </div>

            {/* Table */}
            {filteredProposals.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-muted-foreground">
                        {proposals.length === 0 ? '아직 제안서가 없습니다' : '조건에 맞는 제안서가 없습니다'}
                    </p>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="text-left text-xs font-medium text-muted-foreground p-3 w-24">유형</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground p-3">크리에이터</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground p-3">브랜드</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground p-3">상품</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground p-3">금액</th>
                                    <th className="text-center text-xs font-medium text-muted-foreground p-3">상태</th>
                                    <th className="text-center text-xs font-medium text-muted-foreground p-3">진행단계</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground p-3">날짜</th>
                                    <th className="text-center text-xs font-medium text-muted-foreground p-3 w-20">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProposals.map((p) => {
                                    const statusInfo = STATUS_MAP[p.status] || { label: p.status, variant: 'secondary' as const }
                                    const typeInfo = TYPE_MAP[p.proposal_type] || { label: p.proposal_type, color: '', icon: FileText }
                                    const TypeIcon = typeInfo.icon
                                    const progress = getProgressStage(p)
                                    const isPending = p.status === 'offered' || p.status === 'pending'

                                    return (
                                        <tr
                                            key={`${p.proposal_type}-${p.id}`}
                                            className="border-b hover:bg-muted/20 cursor-pointer transition-colors group"
                                            onClick={() => handleRowClick(p)}
                                        >
                                            {/* Type */}
                                            <td className="p-3">
                                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 gap-1 whitespace-nowrap ${typeInfo.color}`}>
                                                    <TypeIcon className="h-3 w-3" />
                                                    {typeInfo.label}
                                                </Badge>
                                            </td>
                                            {/* Creator */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarImage src={p.creator_avatar || ''} />
                                                        <AvatarFallback className="text-xs">{p.creator_name?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium truncate max-w-[120px]">{p.creator_name}</span>
                                                </div>
                                            </td>
                                            {/* Brand */}
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={p.brand_avatar || ''} />
                                                        <AvatarFallback className="text-[10px]">{p.brand_name?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm truncate max-w-[120px]">{p.brand_name}</span>
                                                </div>
                                            </td>
                                            {/* Product */}
                                            <td className="p-3">
                                                <span className="text-sm truncate max-w-[150px] block">{p.product_name}</span>
                                            </td>
                                            {/* Price */}
                                            <td className="p-3 text-right">
                                                <span className="text-sm font-semibold">
                                                    {p.price_offer ? `₩${Number(p.price_offer).toLocaleString()}` : '-'}
                                                </span>
                                            </td>
                                            {/* Status */}
                                            <td className="p-3 text-center">
                                                <Badge variant={statusInfo.variant} className={`text-[10px] ${statusInfo.className || ''}`}>
                                                    {statusInfo.label}
                                                </Badge>
                                            </td>
                                            {/* Progress */}
                                            <td className="p-3">
                                                <div className="flex flex-col items-center gap-1">
                                                    <ProgressBar stage={progress.stage} paymentPending={progress.paymentPending} />
                                                    <span className="text-[10px] text-muted-foreground">{progress.label}</span>
                                                </div>
                                            </td>
                                            {/* Date */}
                                            <td className="p-3 text-right text-xs text-muted-foreground">
                                                {new Date(p.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                            </td>
                                            {/* Actions */}
                                            <td className="p-3 text-center">
                                                {isPending ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                                            onClick={(e) => handleAccept(p, e)}
                                                            disabled={actionLoading === p.id}
                                                            title="수락"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                                            onClick={(e) => handleReject(p, e)}
                                                            disabled={actionLoading === p.id}
                                                            title="거절"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}
