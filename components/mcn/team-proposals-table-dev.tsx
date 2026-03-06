"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useTeam } from "@/components/providers/team-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
    AlertTriangle, ArrowUpDown, Calendar, Check,
    ChevronRight, Download, FileText, Filter,
    Loader2, Megaphone, Package, Sparkles, X, LayoutList, Table2
} from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { MagicLinkGeneratorModal } from "./magic-link-generator-modal"
import type { TeamProposal } from "./types/mcn"

// ─── Types ────────────────────────────────────────────────────────────────────
interface TeamProposalsTableDevProps {
    teamId: string
}

// ─── 7-Stage V2 Logic (SSOT sync with compute-workspace-stage.ts) ─────────────
type V2Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

const V2_STAGES = ['협의', '계약', '결제', '배송', '콘텐츠', '정산', '완료']

function computeV2Stage(p: TeamProposal & Record<string, any>): V2Stage {
    const status = p.status ?? ''
    if (status === 'final_complete') return 7
    if (status === 'settlement') return 6
    const contentStatus = p.content_submission_status ?? ''
    if (contentStatus === 'submitted' || contentStatus === 'approved') return 5
    if (p.delivery_status === 'delivered') return 5
    if (p.delivery_status === 'shipped') return 4
    if (p.payment_confirmed_at) return 3
    if (p.contract_status === 'signed' || (p.brand_signature && p.creator_signature)) return 2
    if (p.brand_condition_confirmed && p.creator_condition_confirmed) return 2
    if (['signed', 'confirmed', 'started', 'completed', 'contract'].includes(status)) return 2
    if (['accepted', 'negotiating', 'offered', 'pending', 'applied', 'active', 'in_progress', 'selected'].includes(status)) return 1
    return 0
}

function getOverdueTag(p: TeamProposal & Record<string, any>): string | null {
    // Use updated_at as last action; flag as overdue if stuck in same non-final stage for >14 days
    const lastAction = p.updated_at || p.created_at
    if (!lastAction) return null
    const stage = computeV2Stage(p)
    if (stage === 7 || stage === 0) return null
    const daysStuck = Math.floor((Date.now() - new Date(lastAction).getTime()) / (1000 * 60 * 60 * 24))
    if (daysStuck >= 14) return `지연 D+${daysStuck}`
    return null
}

// ─── Progress Bar (7-stage, w-64 scaling) ─────────────────────────────────────
function ProgressBar7({ stage, compact }: { stage: V2Stage; compact?: boolean }) {
    return (
        <div className={cn("flex items-center gap-1", compact ? "w-44" : "w-64")}>
            {V2_STAGES.map((label, i) => {
                const dotIndex = i + 1
                const isActive = stage === dotIndex
                const isPast = stage > dotIndex
                return (
                    <React.Fragment key={i}>
                        <div
                            className={cn(
                                "h-2 flex-1 rounded-full transition-all duration-300",
                                isPast ? "bg-emerald-500" :
                                    isActive ? "bg-amber-400" :
                                        "bg-muted"
                            )}
                        />
                    </React.Fragment>
                )
            })}
        </div>
    )
}

// ─── Status & Type Maps ────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; className: string }> = {
    offered: { label: '대기중', className: 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
    pending: { label: '대기중', className: 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
    accepted: { label: '수락', className: 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
    active: { label: '진행중', className: 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    in_progress: { label: '진행중', className: 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
    rejected: { label: '거절', className: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
    completed: { label: '완료', className: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
    final_complete: { label: '최종완료', className: 'border-emerald-400 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
    settlement: { label: '정산중', className: 'border-violet-300 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
    cancelled: { label: '취소', className: 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
}

const TYPE_MAP: Record<string, { label: string; color: string; icon: typeof FileText }> = {
    product_application: { label: '브랜드', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950', icon: Package },
    moment_proposal: { label: '모먼트', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950', icon: Calendar },
    campaign_application: { label: '캠페인', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950', icon: Megaphone },
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportToCSV(proposals: (TeamProposal & Record<string, any>)[]) {
    const header = ['유형', '크리에이터', '브랜드', '상품', '금액', '상태', '진행단계', '생성일', '최근업데이트']
    const rows = proposals.map(p => {
        const stage = computeV2Stage(p)
        const stageLabel = stage === 0 ? '–' : V2_STAGES[stage - 1] || '–'
        return [
            TYPE_MAP[p.proposal_type]?.label || p.proposal_type,
            p.creator_name,
            p.brand_name || '',
            p.product_name || '',
            p.price_offer ? `₩${Number(p.price_offer).toLocaleString()}` : '–',
            STATUS_MAP[p.status]?.label || p.status,
            stageLabel,
            new Date(p.created_at).toLocaleDateString('ko-KR'),
            p.updated_at ? new Date(p.updated_at).toLocaleDateString('ko-KR') : '',
        ]
    })
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `마스터트래커_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function TeamProposalsTableDev({ teamId }: TeamProposalsTableDevProps) {
    const { supabase, user } = useAuth()
    const { switchToMember } = useTeam()
    const [proposals, setProposals] = useState<(TeamProposal & Record<string, any>)[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [compact, setCompact] = useState(false)
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [creatorFilter, setCreatorFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'date' | 'price' | 'stage'>('date')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchProposals = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase.rpc('get_team_proposals', {
                target_team_id: teamId
            })
            if (error) {
                console.warn('[Master Tracker V2] RPC error:', error.message)
                setProposals([])
            } else {
                setProposals(data || [])
            }
        } catch (err) {
            console.error('[Master Tracker V2] Error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!teamId) return
        fetchProposals()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamId])

    const uniqueCreators = useMemo(() => Array.from(
        new Map(proposals.map(p => [p.creator_id, { id: p.creator_id, name: p.creator_name }])).values()
    ), [proposals])

    const typeCounts = useMemo(() => ({
        all: proposals.length,
        moment_proposal: proposals.filter(p => p.proposal_type === 'moment_proposal').length,
        product_application: proposals.filter(p => p.proposal_type === 'product_application').length,
        campaign_application: proposals.filter(p => p.proposal_type === 'campaign_application').length,
    }), [proposals])

    const filteredProposals = useMemo(() => {
        let list = proposals
            .filter(p => typeFilter === 'all' || p.proposal_type === typeFilter)
            .filter(p => statusFilter === 'all' || p.status === statusFilter)
            .filter(p => creatorFilter === 'all' || p.creator_id === creatorFilter)

        list = [...list].sort((a, b) => {
            if (sortBy === 'price') return (b.price_offer || 0) - (a.price_offer || 0)
            if (sortBy === 'stage') return computeV2Stage(b) - computeV2Stage(a)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        return list
    }, [proposals, typeFilter, statusFilter, creatorFilter, sortBy])

    const overdueCount = useMemo(() => filteredProposals.filter(p => getOverdueTag(p) !== null).length, [filteredProposals])

    const handleRowClick = (proposal: TeamProposal) => {
        switchToMember(proposal.creator_id)
        window.location.href = '/creator?view=workspace'
    }

    const handleAccept = async (proposal: TeamProposal, e: React.MouseEvent) => {
        e.stopPropagation()
        setActionLoading(proposal.id)
        try {
            const table = proposal.proposal_type === 'product_application' ? 'product_applications'
                : proposal.proposal_type === 'moment_proposal' ? 'moment_proposals'
                    : 'campaign_applications'
            const { error } = await supabase.from(table).update({
                status: 'accepted',
                accepted_by_mcn_admin: user?.id
            }).eq('id', proposal.id)
            if (error) throw error
            await supabase.from('notifications').insert({
                user_id: proposal.creator_id,
                title: '소속 MCN 대리 수락 안내',
                content: `소속 MCN에서 브랜드 제안(${proposal.product_name})을 대리 수락했습니다. 워크스페이스를 확인해보세요.`,
                type: 'proposal_status_change',
                link: '/creator?view=workspace'
            })
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
            await supabase.from('notifications').insert({
                user_id: proposal.creator_id,
                title: '소속 MCN 대리 거절 안내',
                content: `소속 MCN에서 브랜드 제안(${proposal.product_name})을 정리(거절)했습니다.`,
                type: 'proposal_status_change',
                link: '/creator?view=workspace'
            })
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
                    <p className="text-sm text-muted-foreground">마스터 트래커 로딩 중...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full sm:w-auto">
                    <TabsList className="inline-flex w-full sm:w-auto h-auto flex-wrap">
                        <TabsTrigger value="all" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-3">
                            <Sparkles className="h-3.5 w-3.5" />전체
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-[10px] px-1">{typeCounts.all}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="moment_proposal" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-3">
                            <Calendar className="h-3.5 w-3.5" />모먼트
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-[10px] px-1">{typeCounts.moment_proposal}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="product_application" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-3">
                            <Package className="h-3.5 w-3.5" />브랜드
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-[10px] px-1">{typeCounts.product_application}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="campaign_application" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-3">
                            <Megaphone className="h-3.5 w-3.5" />캠페인
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-[10px] px-1">{typeCounts.campaign_application}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {overdueCount > 0 && (
                        <Badge variant="destructive" className="gap-1 text-xs">
                            <AlertTriangle className="h-3 w-3" />지연 {overdueCount}건
                        </Badge>
                    )}
                    <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setCompact(c => !c)}>
                        {compact ? <LayoutList className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
                        {compact ? '상세뷰' : '컴팩트'}
                    </Button>
                    <Button
                        variant="outline" size="sm" className="gap-1.5 h-8"
                        onClick={() => exportToCSV(filteredProposals)}
                        disabled={filteredProposals.length === 0}
                    >
                        <Download className="h-3.5 w-3.5" />CSV
                    </Button>
                    <MagicLinkGeneratorModal />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                    <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="크리에이터" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 크리에이터</SelectItem>
                        {uniqueCreators.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="상태" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">전체 상태</SelectItem>
                        <SelectItem value="offered">대기중</SelectItem>
                        <SelectItem value="accepted">수락</SelectItem>
                        <SelectItem value="in_progress">진행중</SelectItem>
                        <SelectItem value="settlement">정산중</SelectItem>
                        <SelectItem value="final_complete">최종완료</SelectItem>
                        <SelectItem value="rejected">거절</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs"
                    onClick={() => setSortBy(s => s === 'date' ? 'price' : s === 'price' ? 'stage' : 'date')}>
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    {sortBy === 'date' ? '최신순' : sortBy === 'price' ? '금액순' : '단계순'}
                </Button>
                <span className="text-xs text-muted-foreground ml-auto">{filteredProposals.length}건</span>
            </div>

            {/* Stage Legend */}
            {!compact && (
                <div className="flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
                    <span className="w-64 flex justify-between">
                        {V2_STAGES.map((s, i) => <span key={i} className="flex-1 text-center">{s}</span>)}
                    </span>
                </div>
            )}

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
                                    <th className="text-left text-[11px] font-medium text-muted-foreground p-2.5 w-20">유형</th>
                                    <th className="text-left text-[11px] font-medium text-muted-foreground p-2.5">크리에이터</th>
                                    {!compact && <th className="text-left text-[11px] font-medium text-muted-foreground p-2.5">브랜드</th>}
                                    <th className="text-left text-[11px] font-medium text-muted-foreground p-2.5">상품</th>
                                    <th className="text-right text-[11px] font-medium text-muted-foreground p-2.5">금액</th>
                                    <th className="text-center text-[11px] font-medium text-muted-foreground p-2.5">상태</th>
                                    <th className="text-center text-[11px] font-medium text-muted-foreground p-2.5">
                                        진행단계 (7단계)
                                    </th>
                                    <th className="text-right text-[11px] font-medium text-muted-foreground p-2.5">최근활동</th>
                                    <th className="text-center text-[11px] font-medium text-muted-foreground p-2.5 w-20">액션</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProposals.map((p) => {
                                    const statusInfo = STATUS_MAP[p.status] || { label: p.status, className: '' }
                                    const typeInfo = TYPE_MAP[p.proposal_type] || { label: p.proposal_type, color: '', icon: FileText }
                                    const TypeIcon = typeInfo.icon
                                    const stage = computeV2Stage(p)
                                    const stageLabel = stage === 0 ? '–' : V2_STAGES[stage - 1]
                                    const isPending = p.status === 'offered' || p.status === 'pending'
                                    const overdueTag = getOverdueTag(p)
                                    const lastAction = p.updated_at || p.created_at

                                    return (
                                        <tr
                                            key={`${p.proposal_type}-${p.id}`}
                                            className={cn(
                                                "border-b transition-colors cursor-pointer group",
                                                overdueTag ? "bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50/60" : "hover:bg-muted/20"
                                            )}
                                            onClick={() => handleRowClick(p)}
                                        >
                                            {/* Type */}
                                            <td className="p-2.5">
                                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5 gap-1 whitespace-nowrap", typeInfo.color)}>
                                                    <TypeIcon className="h-3 w-3" />
                                                    {typeInfo.label}
                                                </Badge>
                                            </td>
                                            {/* Creator */}
                                            <td className="p-2.5">
                                                <div className="flex items-center gap-2">
                                                    {!compact && (
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={p.creator_avatar || ''} />
                                                            <AvatarFallback className="text-[10px]">{p.creator_name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <span className={cn("font-medium truncate", compact ? "text-xs max-w-[90px]" : "text-sm max-w-[110px]")}>{p.creator_name}</span>
                                                </div>
                                            </td>
                                            {/* Brand (hidden in compact) */}
                                            {!compact && (
                                                <td className="p-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-5 w-5">
                                                            <AvatarImage src={p.brand_avatar || ''} />
                                                            <AvatarFallback className="text-[8px]">{p.brand_name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm truncate max-w-[110px]">{p.brand_name}</span>
                                                    </div>
                                                </td>
                                            )}
                                            {/* Product */}
                                            <td className="p-2.5">
                                                <span className={cn("truncate block", compact ? "text-xs max-w-[100px]" : "text-sm max-w-[140px]")}>{p.product_name}</span>
                                            </td>
                                            {/* Price */}
                                            <td className="p-2.5 text-right">
                                                <span className={cn("font-semibold", compact ? "text-xs" : "text-sm")}>
                                                    {p.price_offer ? `₩${Number(p.price_offer).toLocaleString()}` : '–'}
                                                </span>
                                            </td>
                                            {/* Status */}
                                            <td className="p-2.5 text-center">
                                                <Badge variant="outline" className={cn("text-[10px]", statusInfo.className)}>
                                                    {statusInfo.label}
                                                </Badge>
                                            </td>
                                            {/* Progress 7-stage */}
                                            <td className="p-2.5">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <ProgressBar7 stage={stage} compact={compact} />
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] text-muted-foreground">{stageLabel}</span>
                                                        {overdueTag && (
                                                            <Badge variant="destructive" className="text-[9px] h-4 px-1 py-0">
                                                                {overdueTag}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Last Action Date */}
                                            <td className="p-2.5 text-right">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span className="text-xs text-foreground">
                                                        {lastAction ? new Date(lastAction).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '–'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        생성 {new Date(p.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Actions */}
                                            <td className="p-2.5 text-center">
                                                {isPending ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                                            onClick={(e) => handleAccept(p, e)}
                                                            disabled={actionLoading === p.id}
                                                            title="수락"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost" size="icon"
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
