"use client"

import React, { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle2, X, LayoutGrid, Table2, List, Ban, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"
import { toast } from "sonner"
import { usePlatform } from "@/components/providers/legacy-platform-hook"
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"

interface WorkspaceViewProps {
    campaignProposals: any[]
    brandProposals: any[]
    workspaceTab: string
    setWorkspaceTab: (tab: string) => void
    setChatProposal: (proposal: any) => void
    setIsChatOpen: (open: boolean) => void
    handleStatusUpdate: (id: string, status: string) => void
    onViewProposal?: (proposal: any) => void
}

interface ConfirmDialogState {
    open: boolean
    title: string
    description: string
    variant?: 'default' | 'destructive'
    onConfirm: () => void
}

export const WorkspaceView = React.memo(function WorkspaceView({
    campaignProposals,
    brandProposals,
    workspaceTab,
    setWorkspaceTab,
    setChatProposal,
    setIsChatOpen,
    handleStatusUpdate,
    onViewProposal
}: WorkspaceViewProps) {
    const { supabase, refreshData } = usePlatform()
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('list')
    const [workspaceSubTab, setWorkspaceSubTab] = useState<'all' | 'moment' | 'campaign' | 'brand'>('all')
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ open: false, title: '', description: '', onConfirm: () => { } })

    // Reset sub-tab when main workspace tab changes
    useEffect(() => {
        setWorkspaceSubTab('all')
    }, [workspaceTab])

    // ACTION HANDLERS

    // Brand accepts inbound proposals (campaign_applications or brand_proposals)
    const handleAcceptProposal = (e: React.MouseEvent, proposalId: string) => {
        e.stopPropagation()

        setConfirmDialog({
            open: true,
            title: '제안 수락',
            description: '이 제안을 수락하시겠습니까?',
            onConfirm: async () => {
                try {
                    // Find proposal to determine table
                    const proposal = [...campaignProposals, ...brandProposals].find((p: any) => p.id === proposalId)

                    if (!proposal) {
                        toast.error('제안을 찾을 수 없습니다.')
                        return
                    }

                    let error = null

                    // Inbound for brand = campaign_applications or brand_proposals
                    if (proposal.campaign_id) {
                        const result = await supabase
                            .from('campaign_applications')
                            .update({ status: 'accepted' })
                            .eq('id', proposalId)
                        error = result.error
                    } else {
                        const result = await supabase
                            .from('brand_proposals')
                            .update({ status: 'accepted' })
                            .eq('id', proposalId)
                        error = result.error
                    }

                    if (error) {
                        toast.error('수락 실패: ' + error.message)
                        throw error
                    }

                    await refreshData()
                    toast.success('제안을 수락했습니다!')
                } catch (error: any) {
                    console.error('Accept error:', error)
                }
            }
        })
    }

    const handleRejectProposal = (e: React.MouseEvent, proposalId: string) => {
        e.stopPropagation()

        setConfirmDialog({
            open: true,
            title: '제안 거절',
            description: '이 제안을 거절하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            variant: 'destructive',
            onConfirm: async () => {
                try {
                    const proposal = [...campaignProposals, ...brandProposals].find((p: any) => p.id === proposalId)

                    if (!proposal) {
                        toast.error('제안을 찾을 수 없습니다.')
                        return
                    }

                    let error = null

                    if (proposal.campaign_id) {
                        const result = await supabase
                            .from('campaign_applications')
                            .update({ status: 'rejected' })
                            .eq('id', proposalId)
                        error = result.error
                    } else {
                        const result = await supabase
                            .from('brand_proposals')
                            .update({ status: 'rejected' })
                            .eq('id', proposalId)
                        error = result.error
                    }

                    if (error) {
                        toast.error('거절 실패: ' + error.message)
                        throw error
                    }

                    await refreshData()
                    toast.success('제안을 거절했습니다.')
                } catch (error: any) {
                    console.error('Reject error:', error)
                }
            }
        })
    }

    // Brand cancels outbound proposals (moment_proposals)
    const handleCancelProposal = (e: React.MouseEvent, proposalId: string) => {
        e.stopPropagation()

        setConfirmDialog({
            open: true,
            title: '제안 취소',
            description: '이 제안을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            variant: 'destructive',
            onConfirm: async () => {
                try {
                    // Outbound for brand = moment_proposals (in brandProposals array)
                    const { error } = await supabase
                        .from('moment_proposals')
                        .update({ status: 'cancelled' })
                        .eq('id', proposalId)

                    if (error) {
                        toast.error('취소 실패: ' + error.message)
                        throw error
                    }

                    await refreshData()
                    toast.success('제안을 취소했습니다.')
                } catch (error: any) {
                    console.error('Cancel error:', error)
                }
            }
        })
    }

    // MEMOIZED DATA FILTERING

    // 1. Inbound (Received Applications from Creators) - brand_proposals + campaign_applications
    const inboundApplications = useMemo(
        () => campaignProposals?.filter((p: any) => p.status === 'applied' || p.status === 'pending' || p.status === 'viewed') || [],
        [campaignProposals]
    )

    // 2. Outbound (Sent Offers to Creators) - moment_proposals (from brandProposals)
    const outboundOffers = useMemo(
        () => brandProposals?.filter(p => (!p.status || p.status === 'offered' || p.status === 'negotiating') && p.moment_id) || [],
        [brandProposals]
    )

    // 3. Active (In Progress)
    const activeInbound = useMemo(
        () => campaignProposals?.filter((p: any) => p.status === 'accepted' || p.status === 'signed' || p.status === 'confirmed') || [],
        [campaignProposals]
    )

    const activeOutbound = useMemo(
        () => brandProposals?.filter((p: any) => (p.status === 'accepted' || p.status === 'signed' || p.status === 'confirmed') && p.moment_id) || [],
        [brandProposals]
    )

    const allActive = useMemo(
        () => [...activeInbound, ...activeOutbound].sort((a: any, b: any) =>
            new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
        ),
        [activeInbound, activeOutbound]
    )

    // 4. Completed
    const completedInbound = useMemo(
        () => campaignProposals?.filter((p: any) => p.status === 'completed') || [],
        [campaignProposals]
    )

    const completedOutbound = useMemo(
        () => brandProposals?.filter((p: any) => p.status === 'completed' && p.moment_id) || [],
        [brandProposals]
    )

    const allCompleted = useMemo(
        () => [...completedInbound, ...completedOutbound].sort((a: any, b: any) =>
            new Date(b.completed_at || b.created_at || b.date).getTime() - new Date(a.completed_at || a.created_at || a.date).getTime()
        ),
        [completedInbound, completedOutbound]
    )

    // 5. Rejected
    const rejectedInbound = useMemo(
        () => campaignProposals?.filter((p: any) => p.status === 'rejected') || [],
        [campaignProposals]
    )

    const rejectedOutbound = useMemo(
        () => brandProposals?.filter((p: any) => p.status === 'rejected' && p.moment_id) || [],
        [brandProposals]
    )

    const allRejected = useMemo(
        () => [...rejectedInbound, ...rejectedOutbound].sort((a: any, b: any) =>
            new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
        ),
        [rejectedInbound, rejectedOutbound]
    )

    // 6. All Items
    const allWorkspaceItems = useMemo(
        () => [
            ...inboundApplications,
            ...outboundOffers,
            ...activeInbound,
            ...activeOutbound,
            ...completedInbound,
            ...completedOutbound,
            ...rejectedInbound,
            ...rejectedOutbound
        ].sort((a: any, b: any) =>
            new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
        ),
        [inboundApplications, outboundOffers, activeInbound, activeOutbound, completedInbound, completedOutbound, rejectedInbound, rejectedOutbound]
    )

    // Filter items by type (moment/campaign/brand)
    const filterByType = (items: any[], type: 'all' | 'moment' | 'campaign' | 'brand') => {
        if (type === 'all') return items

        return items.filter(item => {
            if (type === 'moment') {
                return item.moment_id || item.event_id
            }
            if (type === 'campaign') {
                return item.campaign_id && !item.moment_id && !item.event_id
            }
            if (type === 'brand') {
                return !item.moment_id && !item.event_id && !item.campaign_id
            }
            return false
        })
    }

    // Render sub-tabs for type filtering
    const renderSubTabs = (items: any[]) => {
        const momentCount = filterByType(items, 'moment').length
        const campaignCount = filterByType(items, 'campaign').length
        const brandCount = filterByType(items, 'brand').length

        return (
            <div className="flex gap-2 mb-4 flex-wrap">
                <button
                    onClick={() => setWorkspaceSubTab('all')}
                    className={`min-w-[90px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    전체 <span className="ml-1.5 text-xs opacity-70">{items.length}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('moment')}
                    className={`min-w-[100px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'moment'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    모먼트 <span className="ml-1.5 text-xs opacity-70">{momentCount}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('campaign')}
                    className={`min-w-[100px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'campaign'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    캠페인 <span className="ml-1.5 text-xs opacity-70">{campaignCount}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('brand')}
                    className={`min-w-[100px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'brand'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    브랜드 <span className="ml-1.5 text-xs opacity-70">{brandCount}</span>
                </button>
            </div>
        )
    }

    // RENDER ITEMS BASED ON VIEW MODE
    const renderItems = (items: any[], tabType: string) => {
        if (items.length === 0) {
            return (
                <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                    {tabType === 'all' && '내역이 없습니다.'}
                    {tabType === 'active' && '진행 중인 협업이 없습니다.'}
                    {tabType === 'inbound' && '도착한 지원서가 없습니다.'}
                    {tabType === 'outbound' && '보낸 제안이 없습니다.'}
                    {tabType === 'rejected' && '거절된 내역이 없습니다.'}
                    {tabType === 'completed' && '완료된 협업이 없습니다.'}
                </div>
            )
        }

        // TABLE VIEW
        if (viewMode === 'table') {
            return (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[200px]">크리에이터</TableHead>
                                <TableHead>제품/서비스</TableHead>
                                <TableHead className="w-[120px]">등록일</TableHead>
                                <TableHead className="w-[120px] text-right">상태</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item: any) => (
                                <TableRow
                                    key={item.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => { setChatProposal(item); setIsChatOpen(true); }}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] overflow-hidden">
                                                {item.influencerName?.[0] || item.influencer_name?.[0] || "C"}
                                            </div>
                                            {item.influencerName || item.influencer_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.product_name || item.productName}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className={`text-[10px] h-5 px-2 font-medium border-2 rounded-full transition-all bg-background
                                            ${item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                                item.status === 'completed' ? 'text-slate-700 dark:text-slate-300 border-slate-400/50 shadow-[0_0_10px_rgba(148,163,184,0.3)]' :
                                                    item.status === 'rejected' ? 'text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                                                        'text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]'}
                                        `}>
                                            {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' : item.status === 'completed' ? '완료' : item.status === 'rejected' ? '거절' : '수락 대기중'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )
        }

        // GRID VIEW
        if (viewMode === 'grid') {
            return (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item: any) => (
                        <Card key={item.id} className={`cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 bg-card border-l-4 overflow-hidden group
                            ${tabType === 'active' ? 'border-l-emerald-500' :
                                tabType === 'inbound' ? 'border-l-blue-500' :
                                    tabType === 'outbound' ? 'border-l-purple-500' :
                                        tabType === 'rejected' ? 'border-l-red-500' :
                                            tabType === 'completed' ? 'border-l-slate-400' :
                                                item.status === 'accepted' || item.status === 'signed' ? 'border-l-emerald-500' :
                                                    item.status === 'completed' ? 'border-l-slate-400' :
                                                        item.status === 'rejected' ? 'border-l-red-500' :
                                                            item.campaign_id ? 'border-l-blue-500' : 'border-l-purple-500'}
                        `} onClick={() => { setChatProposal(item); setIsChatOpen(true); }}>
                            <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border overflow-hidden
                                    ${item.status === 'accepted' || item.status === 'signed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800' :
                                        item.status === 'completed' ? 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700' :
                                            'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800'}
                                `}>
                                    {item.influencerName?.[0] || item.influencer_name?.[0] || "C"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold truncate text-sm">{item.influencerName || item.influencer_name}</h4>
                                    <p className="text-xs text-muted-foreground truncate">{item.product_name || item.productName}</p>
                                </div>
                                <Badge variant="outline" className={`text-[10px] h-5 px-2 font-medium shrink-0 border-2 rounded-full transition-all bg-background
                                    ${item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                        item.status === 'completed' ? 'text-slate-700 dark:text-slate-300 border-slate-400/50 shadow-[0_0_10px_rgba(148,163,184,0.3)]' :
                                            item.status === 'rejected' ? 'text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                                                'text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]'}
                                `}>
                                    {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' : item.status === 'completed' ? '완료' : item.status === 'rejected' ? '거절' : '수락 대기중'}
                                </Badge>
                            </CardHeader>
                            <CardContent className="pb-3 text-xs space-y-2">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>계약상태</span>
                                    <span className={item.contract_status === 'signed' ? 'text-primary font-medium' : ''}>{item.contract_status || '대기중'}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>배송상태</span>
                                    <span className={item.delivery_status === 'delivered' ? 'text-primary font-medium' : ''}>{item.delivery_status || '대기중'}</span>
                                </div>
                                <div className="w-full bg-muted h-1.5 rounded-full mt-2">
                                    <div
                                        className="bg-primary h-1.5 rounded-full transition-all"
                                        style={{ width: item.contract_status === 'signed' ? (item.content_submission_status === 'submitted' ? '100%' : '66%') : '33%' }}
                                    ></div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-3 text-[10px] text-muted-foreground flex justify-between">
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                <span className="group-hover:text-primary transition-colors">상세보기 →</span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )
        }

        // LIST VIEW (Default)
        return (
            <div className="space-y-4">
                {items.map((item: any) => {
                    const isInbound = tabType === 'inbound' || (tabType === 'all' && item.campaign_id)
                    const isOutbound = tabType === 'outbound' || (tabType === 'all' && item.moment_id)

                    return (
                        <Card key={item.id} className={`p-6 border-l-4 bg-card hover:bg-accent/5 cursor-pointer hover:shadow-md transition-all
                            ${tabType === 'active' ? 'border-l-emerald-500' :
                                tabType === 'inbound' ? 'border-l-blue-500' :
                                    tabType === 'outbound' ? 'border-l-purple-500' :
                                        tabType === 'rejected' ? 'border-l-red-500' :
                                            tabType === 'completed' ? 'border-l-slate-400' :
                                                item.status === 'accepted' || item.status === 'signed' ? 'border-l-emerald-500' :
                                                    item.status === 'completed' ? 'border-l-slate-400' :
                                                        item.status === 'rejected' ? 'border-l-red-500' :
                                                            item.campaign_id ? 'border-l-blue-500' : 'border-l-purple-500'}
                        `} onClick={() => { setChatProposal(item); setIsChatOpen(true); }}>
                            <div className="flex gap-6">
                                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl shrink-0 overflow-hidden">
                                    {item.influencerAvatar ? <img src={item.influencerAvatar} alt="Profile" className="h-full w-full object-cover" /> : (item.influencerName?.[0] || item.influencer_name?.[0] || "C")}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                {item.influencerName || item.influencer_name}
                                                <Badge variant="outline" className={`text-xs font-medium border-2 rounded-full px-3 py-0.5 transition-all bg-background
                                                    ${item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                                                        item.status === 'completed' ? 'text-slate-700 dark:text-slate-300 border-slate-400/50 shadow-[0_0_12px_rgba(148,163,184,0.3)]' :
                                                            item.status === 'rejected' ? 'text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)]' :
                                                                'text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.3)]'}
                                                `}>
                                                    {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' :
                                                        item.status === 'completed' ? '완료됨' :
                                                            item.status === 'rejected' ? '거절됨' :
                                                                '수락 대기중'}
                                                </Badge>
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">{item.product_name || item.productName || "제품 협찬"}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground/70">{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {item.message && (
                                        <div className="mt-3 bg-muted/30 p-3 rounded text-sm text-foreground/80 line-clamp-2">
                                            {item.message}
                                        </div>
                                    )}
                                    <div className="mt-4">
                                        <WorkspaceProgressBar
                                            status={item.status}
                                            contract_status={item.contract_status}
                                            delivery_status={item.delivery_status}
                                            content_submission_status={item.content_submission_status}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    {isInbound && (item.status === 'applied' || item.status === 'pending' || item.status === 'viewed') && (
                                        <div className="flex gap=2 mt-4">
                                            <Button
                                                size="sm"
                                                className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                                                onClick={(e) => handleAcceptProposal(e, item.id)}
                                            >
                                                <CheckCircle2 className="mr-1 h-3 w-3" /> 수락
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs border-red-200 hover:bg-red-50 text-red-700"
                                                onClick={(e) => handleRejectProposal(e, item.id)}
                                            >
                                                <X className="mr-1 h-3 w-3" /> 거절
                                            </Button>
                                        </div>
                                    )}

                                    {isOutbound && (!item.status || item.status === 'offered' || item.status === 'negotiating') && (
                                        <div className="mt-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs border-gray-200 hover:bg-gray-50 text-gray-700"
                                                onClick={(e) => handleCancelProposal(e, item.id)}
                                            >
                                                <Ban className="mr-1 h-3 w-3" /> 제안 취소
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Title and View Mode Selector */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">워크스페이스 아카이브</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">크리에이터와 진행 중인 모든 협업을 한곳에서 관리하세요.</p>
                </div>

                {/* View Mode Selector */}
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg self-start">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode('list')}
                        title="리스트 보기"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode('grid')}
                        title="그리드 보기"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode('table')}
                        title="테이블 보기"
                    >
                        <Table2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="w-full">
                <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0">
                    <TabsTrigger value="all" className="min-w-[130px] data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-foreground/90 font-medium transition-all">
                        전체 보기 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allWorkspaceItems.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="min-w-[120px] data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(16,185,129,0.6)] bg-background text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500/50 px-4 py-2 rounded-full font-medium transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        진행중 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allActive.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="inbound" className="min-w-[130px] data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(59,130,246,0.6)] bg-background text-blue-700 dark:text-blue-400 border-2 border-blue-500/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                        받은 제안 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{inboundApplications.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="outbound" className="min-w-[130px] data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(168,85,247,0.6)] bg-background text-purple-700 dark:text-purple-400 border-2 border-purple-500/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        보낸 제안 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{outboundOffers.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="min-w-[120px] data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(239,68,68,0.6)] bg-background text-red-700 dark:text-red-400 border-2 border-red-500/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        거절됨 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allRejected.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="min-w-[120px] data-[state=active]:bg-slate-400 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(148,163,184,0.6)] bg-background text-slate-700 dark:text-slate-400 border-2 border-slate-400/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(148,163,184,0.4)]">
                        완료됨 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allCompleted.length}</span>
                    </TabsTrigger>
                </TabsList>

                {/* Sub-tabs */}
                <div className="mt-4 mb-4">
                    {workspaceTab === 'all' && renderSubTabs(allWorkspaceItems)}
                    {workspaceTab === 'active' && renderSubTabs(allActive)}
                    {workspaceTab === 'inbound' && renderSubTabs(inboundApplications)}
                    {workspaceTab === 'outbound' && renderSubTabs(outboundOffers)}
                    {workspaceTab === 'rejected' && renderSubTabs(allRejected)}
                    {workspaceTab === 'completed' && renderSubTabs(allCompleted)}
                </div>

                <TabsContent value="all" className="space-y-4">
                    {renderItems(filterByType(allWorkspaceItems, workspaceSubTab), 'all')}
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                    {renderItems(filterByType(allActive, workspaceSubTab), 'active')}
                </TabsContent>

                <TabsContent value="inbound" className="space-y-4">
                    {renderItems(filterByType(inboundApplications, workspaceSubTab), 'inbound')}
                </TabsContent>

                <TabsContent value="outbound" className="space-y-4">
                    {renderItems(filterByType(outboundOffers, workspaceSubTab), 'outbound')}
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" asChild>
                            <Link href="/brand?view=discover">크리에이터 찾으러 가기</Link>
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                    {renderItems(filterByType(allRejected, workspaceSubTab), 'rejected')}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {renderItems(filterByType(allCompleted, workspaceSubTab), 'completed')}
                </TabsContent>
            </Tabs>

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
                onConfirm={() => {
                    confirmDialog.onConfirm()
                    setConfirmDialog({ ...confirmDialog, open: false })
                }}
                title={confirmDialog.title}
                description={confirmDialog.description}
                variant={confirmDialog.variant}
            />
        </div>
    )
})
