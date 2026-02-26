"use client"

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog"
import { useAuth } from "@/components/providers/auth-provider"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"
import { PerformanceDialog } from "@/components/workspace/brand/performance-dialog"
import { BarChart3, Ban, ChevronRight, FileText, LayoutGrid, List, Pencil, Table2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

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
    const { user } = useAuth()
    const { supabase, refreshData } = useUnifiedProvider()
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('list')
    const [workspaceSubTab, setWorkspaceSubTab] = useState<'all' | 'moment' | 'campaign' | 'brand'>('all')
    const [pageSize, setPageSize] = useState<20 | 50 | 100>(50)
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ open: false, title: '', description: '', onConfirm: () => { } })

    // Performance dialog state
    const [perfDialogProposal, setPerfDialogProposal] = useState<any>(null)
    const [perfDialogOpen, setPerfDialogOpen] = useState(false)

    // G2: Edit proposal state
    const [editingProposal, setEditingProposal] = useState<any>(null)
    const [editMessage, setEditMessage] = useState('')
    const [editCompensation, setEditCompensation] = useState('')
    const [isSavingEdit, setIsSavingEdit] = useState(false)

    // === 정산서 / 인보이스 발급 ===
    const handleDownloadSettlement = (e: React.MouseEvent, item: any) => {
        e.stopPropagation()
        const docNo = `CPK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(item.id || '').slice(-6).toUpperCase()}`
        const today = new Date().toLocaleDateString('ko-KR')
        const amount = item.price_offer || item.priceOffer || item.budget || 0
        const amountText = amount > 0 ? `${Number(amount).toLocaleString()}원` : '협의 금액'
        const win = window.open('', '', 'width=800,height=700')
        win?.document.write(`
            <html><head><title>협업 정산서</title>
            <style>
                body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; padding: 50px; color: #111; line-height: 1.7; }
                .header { text-align: center; border-bottom: 3px double #111; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size: 26px; font-weight: bold; letter-spacing: 8px; margin-bottom: 4px; }
                .subtitle { font-size: 12px; color: #555; }
                .doc-no { text-align: right; font-size: 11px; color: #666; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #f5f5f5; padding: 10px 14px; font-size: 13px; border: 1px solid #ddd; text-align: left; }
                td { padding: 10px 14px; font-size: 13px; border: 1px solid #ddd; }
                .amount-row td { font-weight: bold; font-size: 16px; background: #f9f9f9; }
                .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 15px; }
                .seal { margin-top: 30px; text-align: right; font-size: 13px; }
            </style>
            </head><body>
            <div class="doc-no">문서번호: ${docNo} | 발급일: ${today}</div>
            <div class="header">
                <div class="title">협 업 정 산 서</div>
                <div class="subtitle">Collaboration Settlement Statement | Powered by Creadypick</div>
            </div>
            <table>
                <tr><th style="width:30%">브랜드</th><td>${item.brand_name || 'Creadypick 브랜드'}</td></tr>
                <tr><th>크리에이터</th><td>${item.influencer_name || item.influencerName || '-'}</td></tr>
                <tr><th>협업 유형</th><td>${item.campaign_id || item.campaignId ? '캠페인 협업' : item.moment_id ? '모먼트 협업' : '브랜드 직접 제안'}</td></tr>
                <tr><th>제품/서비스</th><td>${item.product_name || item.productName || item.campaign_title || '-'}</td></tr>
                <tr><th>협업 시작일</th><td>${item.created_at ? new Date(item.created_at).toLocaleDateString('ko-KR') : '-'}</td></tr>
                <tr><th>협업 완료일</th><td>${item.completed_at ? new Date(item.completed_at).toLocaleDateString('ko-KR') : today}</td></tr>
                <tr class="amount-row"><th>정산 금액</th><td>${amountText}</td></tr>
            </table>
            <p style="font-size:12px; color:#888; margin-top:10px">※ 본 정산서는 Creadypick 플랫폼을 통해 자동 발급된 협업 정산 내역서입니다.</p>
            <p style="font-size:12px; color:#888">※ 전자세금계산서가 필요하신 경우 별도 요청해 주시기 바랍니다.</p>
            <div class="seal">발급기관: Creadypick &nbsp;&nbsp;&nbsp; (인)</div>
            <div class="footer">본 문서는 Creadypick 플랫폼 협업 정산 기록을 토대로 자동 생성되었습니다. | creadypick.com</div>
            <script>window.onload = function(){ window.print(); }</script>
            </body></html>`)
        win?.document.close()
    }

    const handleDownloadInvoice = (e: React.MouseEvent, item: any) => {
        e.stopPropagation()
        const docNo = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(item.id || '').slice(-6).toUpperCase()}`
        const today = new Date().toLocaleDateString('ko-KR')
        const amount = item.price_offer || item.priceOffer || item.budget || 0
        const vat = Math.round(Number(amount) * 0.1)
        const win = window.open('', '', 'width=800,height=750')
        win?.document.write(`
            <html><head><title>거래명세서 (인보이스)</title>
            <style>
                body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; padding: 50px; color: #111; line-height: 1.7; }
                .header { text-align: center; border-bottom: 3px double #111; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size: 26px; font-weight: bold; letter-spacing: 6px; margin-bottom: 4px; }
                .subtitle { font-size: 12px; color: #555; }
                .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #f0f0f0; padding: 10px 14px; font-size: 12px; border: 1px solid #ccc; text-align: center; }
                td { padding: 10px 14px; font-size: 13px; border: 1px solid #ccc; text-align: center; }
                .total-section { margin-top: 10px; text-align: right; }
                .total-section table { width: 300px; margin-left: auto; }
                .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 15px; }
            </style>
            </head><body>
            <div class="header">
                <div class="title">거 래 명 세 서</div>
                <div class="subtitle">Invoice | Powered by Creadypick</div>
            </div>
            <div class="meta">
                <div><b>공급자:</b> Creadypick (플랫폼)</div>
                <div><b>문서번호:</b> ${docNo} &nbsp; <b>발급일:</b> ${today}</div>
            </div>
            <table>
                <tr>
                    <th>거래처 (브랜드)</th>
                    <th>크리에이터</th>
                    <th>거래일</th>
                    <th>계약상태</th>
                </tr>
                <tr>
                    <td>${item.brand_name || 'Creadypick 브랜드'}</td>
                    <td>${item.influencer_name || item.influencerName || '-'}</td>
                    <td>${item.completed_at ? new Date(item.completed_at).toLocaleDateString('ko-KR') : today}</td>
                    <td>완료</td>
                </tr>
            </table>
            <table>
                <tr><th>#</th><th>품목</th><th>규격/내용</th><th>수량</th><th>단가</th><th>공급가액</th></tr>
                <tr>
                    <td>1</td>
                    <td>${item.campaign_id || item.campaignId ? '캠페인 광고' : '브랜드 협업 광고'}</td>
                    <td>${item.product_name || item.productName || item.campaign_title || '콘텐츠 협업'}</td>
                    <td>1</td>
                    <td>${amount > 0 ? Number(amount).toLocaleString() + '원' : '협의'}</td>
                    <td>${amount > 0 ? Number(amount).toLocaleString() + '원' : '협의'}</td>
                </tr>
            </table>
            <div class="total-section">
                <table>
                    <tr><td><b>공급가액</b></td><td>${amount > 0 ? Number(amount).toLocaleString() + '원' : '협의'}</td></tr>
                    <tr><td>부가세 (10%)</td><td>${amount > 0 ? vat.toLocaleString() + '원' : '별도 협의'}</td></tr>
                    <tr style="font-weight:bold; font-size:15px"><td>합 계</td><td>${amount > 0 ? (Number(amount) + vat).toLocaleString() + '원' : '협의'}</td></tr>
                </table>
            </div>
            <p style="font-size:11px; color:#888; margin-top:20px">※ 부가세 납부 의무는 거래 당사자에게 있으며, 면세 사업자의 경우 별도 확인이 필요합니다.</p>
            <div class="footer">본 문서는 Creadypick 플랫폼 협업 기록을 토대로 자동 생성된 거래명세서입니다. | creadypick.com</div>
            <script>window.onload = function(){ window.print(); }</script>
            </body></html>`)
        win?.document.close()
    }

    const handleOpenEditProposal = (e: React.MouseEvent, item: any) => {
        e.stopPropagation()
        setEditingProposal(item)
        setEditMessage(item.message || '')
        setEditCompensation(item.compensation || item.product_name || '')
    }

    const handleSaveEditProposal = async () => {
        if (!editingProposal) return
        setIsSavingEdit(true)
        try {
            const { error } = await supabase
                .from('moment_proposals')
                .update({
                    message: editMessage,
                    compensation_amount: editCompensation,
                })
                .eq('id', editingProposal.id)
            if (error) throw error
            toast.success('제안이 수정되었습니다.')
            setEditingProposal(null)
            await refreshData()
        } catch (err: any) {
            toast.error(err.message || '제안 수정에 실패했습니다.')
        } finally {
            setIsSavingEdit(false)
        }
    }

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
                    // [FIX] Check both snake_case and camelCase
                    if (proposal.campaign_id || proposal.campaignId) {
                        const result = await supabase
                            .from('campaign_applications')
                            .update({ status: 'accepted' })
                            .eq('id', proposalId)
                        error = result.error
                    } else {
                        const result = await supabase
                            .from('product_applications')
                            .update({ status: 'accepted' })
                            .eq('id', proposalId)
                        error = result.error
                    }

                    if (error) {
                        toast.error('수락 실패: ' + error.message)
                        throw error
                    }

                    // 1. 워크스페이스 자동 오픈
                    setChatProposal(proposal)
                    setIsChatOpen(true)

                    // 2. 크리에이터에게 알림 발송
                    try {
                        await supabase.from('notifications').insert({
                            recipient_id: proposal.influencer_id,
                            sender_id: proposal.brand_id,
                            type: 'proposal_accepted',
                            content: `"${proposal.product_name || '제안'}"이 수락되었습니다. 협업을 시작하세요!`,
                            reference_id: proposal.id
                        })
                    } catch (notifErr) {
                        console.warn('알림 발송 실패 (무시):', notifErr)
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

                    // [FIX] Check both snake_case and camelCase
                    if (proposal.campaign_id || proposal.campaignId) {
                        const result = await supabase
                            .from('campaign_applications')
                            .update({ status: 'rejected' })
                            .eq('id', proposalId)
                        error = result.error
                    } else {
                        const result = await supabase
                            .from('product_applications')
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

    // 1. Inbound (Received from Creators) - campaign_applications + brand_proposals
    // brand_proposals: 크리에이터가 브랜드 제품 보고 제안 (influencer_id = 크리에이터, brand_id = 브랜드)
    // campaign_applications: 크리에이터가 브랜드 캠페인에 지원
    const inboundApplications = useMemo(
        () => [
            ...(campaignProposals?.filter((p: any) => p.status === 'applied' || p.status === 'pending' || p.status === 'viewed') || []),
            ...(brandProposals?.filter((p: any) =>
                !p.moment_id && // moment_proposals 제외
                (p.status === 'applied' || p.status === 'pending' || p.status === 'offered' || !p.status)
            ) || [])
        ],
        [campaignProposals, brandProposals]
    )

    // 2. Outbound (Sent by Brand to Creators) - moment_proposals only
    // moment_proposals: 브랜드가 크리에이터 모먼트 보고 제안 (brand_id = 브랜드, influencer_id = 크리에이터)
    const outboundOffers = useMemo(
        () => brandProposals?.filter(p =>
            p.moment_id &&
            p.status !== 'rejected' &&
            p.status !== 'cancelled' &&
            p.status !== 'completed' &&
            p.status !== 'accepted' &&
            p.status !== 'signed' &&
            p.status !== 'confirmed' &&
            (
                !p.status ||
                p.status === 'offered' ||
                p.status === 'negotiating' ||
                !p.brand_condition_confirmed
            )
        ) || [],
        [brandProposals]
    )

    // 3. Active (In Progress) — settlement/final_complete도 진행중으로 분류
    const ACTIVE_STATUSES = ['accepted', 'signed', 'confirmed', 'settlement', 'final_complete']
    const activeInbound = useMemo(
        () => campaignProposals?.filter((p: any) => ACTIVE_STATUSES.includes(p.status)) || [],
        [campaignProposals]
    )

    const activeOutbound = useMemo(
        () => brandProposals?.filter((p: any) => ACTIVE_STATUSES.includes(p.status)) || [],
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
        () => brandProposals?.filter((p: any) => p.status === 'completed') || [],
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
        () => brandProposals?.filter((p: any) => p.status === 'rejected' || p.status === 'cancelled') || [],
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
                return !!item.moment_id // 1. Moment has highest priority
            }
            if (type === 'campaign') {
                // 2. Campaign has second priority
                return (!!item.campaign_id || !!item.campaignId) && !item.moment_id
            }
            if (type === 'brand') {
                // 3. Brand is the fallback
                // Note: brand_id exists in almost all proposals, so we check for absence of others
                // Ensure we check both ID styles for campaign exclusion
                return !!item.brand_id && !item.moment_id && !item.campaign_id && !item.campaignId
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
            <div className="flex gap-2 mb-4 flex-nowrap overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                <div className="border rounded-lg overflow-x-auto">
                    <Table className="min-w-[600px]">
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
                                                {(item.influencerAvatar || item.influencer_avatar)
                                                    ? <img src={item.influencerAvatar || item.influencer_avatar} alt="Profile" className="h-full w-full object-cover" />
                                                    : (item.influencerName?.[0] || item.influencer_name?.[0] || "C")}
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
                                            {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' : item.status === 'settlement' ? '성과 대기' : item.status === 'final_complete' ? '완료 대기' : item.status === 'completed' ? '완료' : item.status === 'rejected' ? '거절' : '수락 대기중'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {item.moment_id && onViewProposal && (
                                                <Button size="icon" variant="ghost" className="h-7 w-7" title="제안서 보기"
                                                    onClick={(e) => { e.stopPropagation(); onViewProposal(item); }}>
                                                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                                                </Button>
                                            )}
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
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
                                                            (item.campaign_id || item.campaignId) ? 'border-l-blue-500' : 'border-l-purple-500'}
                        `} onClick={() => { setChatProposal(item); setIsChatOpen(true); }}>
                            <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border overflow-hidden
                                    ${item.status === 'accepted' || item.status === 'signed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800' :
                                        item.status === 'completed' ? 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700' :
                                            'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800'}
                                `}>
                                    {(item.influencerAvatar || item.influencer_avatar)
                                        ? <img src={item.influencerAvatar || item.influencer_avatar} alt="Profile" className="h-full w-full object-cover" />
                                        : (item.influencerName?.[0] || item.influencer_name?.[0] || "C")}
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
                                    {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' : item.status === 'settlement' ? '성과 대기' : item.status === 'final_complete' ? '완료 대기' : item.status === 'completed' ? '완료' : item.status === 'rejected' ? '거절' : '수락 대기중'}
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
                            <CardFooter className="pt-0 pb-3 text-[10px] text-muted-foreground flex justify-between items-center">
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                <div className="flex items-center gap-2">
                                    {item.moment_id && onViewProposal && (
                                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={(e) => { e.stopPropagation(); onViewProposal(item); }}>
                                            <FileText className="h-3 w-3 mr-1" /> 제안서
                                        </Button>
                                    )}
                                    <span className="group-hover:text-primary transition-colors">상세보기 →</span>
                                </div>
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
                    const isInbound = tabType === 'inbound' || (
                        tabType === 'all' && (
                            item.campaign_id || item.campaignId || // [FIX] campaign_applications
                            (!item.moment_id && !item.event_id && !item.campaign_id && !item.campaignId) // [FIX] brand_proposals
                        )
                    )
                    const isOutbound = tabType === 'outbound' || (tabType === 'all' && (item.moment_id || item.event_id))

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
                                                            (item.campaign_id || item.campaignId) ? 'border-l-blue-500' : 'border-l-purple-500'}
                        `} onClick={() => { setChatProposal(item); setIsChatOpen(true); }}>
                            <div className="flex gap-6">
                                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl shrink-0 overflow-hidden">
                                    {item.influencerAvatar ? <img src={item.influencerAvatar} alt="Profile" className="h-full w-full object-cover" /> : (item.influencerName?.[0] || item.influencer_name?.[0] || "C")}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-base md:text-lg flex flex-wrap items-center gap-2">
                                                {item.influencerName || item.influencer_name}
                                                <Badge variant="outline" className={`text-[10px] md:text-xs font-medium border-2 rounded-full px-2 py-0.5 transition-all bg-background
                                                        ${item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                                                        item.status === 'settlement' || item.status === 'final_complete' ? 'text-amber-600 dark:text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]' :
                                                            item.status === 'completed' ? 'text-slate-700 dark:text-slate-300 border-slate-400/50 shadow-[0_0_12px_rgba(148,163,184,0.3)]' :
                                                                item.status === 'rejected' ? 'text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)]' :
                                                                    'text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.3)]'}
                                                    `}>
                                                    {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' :
                                                        item.status === 'settlement' ? '성과 대기' :
                                                            item.status === 'final_complete' ? '완료 대기' :
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
                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="flex-1">
                                            <WorkspaceProgressBar
                                                proposal={item}
                                            />
                                        </div>

                                        {/* Action Buttons - 브랜드 받은 제안: campaign_applications(applied/pending) + brand_proposals(offered) */}
                                        {isInbound && (item.status === 'applied' || item.status === 'pending' || item.status === 'viewed' || item.status === 'offered') && (
                                            <div className="flex gap-2 shrink-0">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                                                    onClick={(e) => handleAcceptProposal(e, item.id)}
                                                >
                                                    수락하기
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 font-semibold"
                                                    onClick={(e) => handleRejectProposal(e, item.id)}
                                                >
                                                    거절하기
                                                </Button>
                                            </div>
                                        )}

                                        {item.moment_id && onViewProposal && (
                                            <div className="shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                    onClick={(e) => { e.stopPropagation(); onViewProposal(item); }}
                                                >
                                                    <FileText className="mr-1 h-3 w-3" /> 제안서 보기
                                                </Button>
                                            </div>
                                        )}

                                        {/* 🆕 성과 및 최종 완료 버튼 — settlement 단계 전용 */}
                                        {item.status === 'settlement' && (
                                            <div className="shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold gap-1.5"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setPerfDialogProposal(item)
                                                        setPerfDialogOpen(true)
                                                    }}
                                                >
                                                    <BarChart3 className="h-3.5 w-3.5" /> 성과 및 최종 완료
                                                </Button>
                                            </div>
                                        )}

                                        {isOutbound && (!item.status || item.status === 'offered' || item.status === 'negotiating') && (
                                            <div className="flex gap-2 shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                                                    onClick={(e) => handleOpenEditProposal(e, item)}
                                                >
                                                    <Pencil className="mr-1 h-3 w-3" /> 수정
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-gray-200 hover:bg-gray-50 text-gray-700"
                                                    onClick={(e) => handleCancelProposal(e, item.id)}
                                                >
                                                    <Ban className="mr-1 h-3 w-3" /> 제안 취소
                                                </Button>
                                            </div>
                                        )}
                                    </div>
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
            {/* Missing Info Callout for Contracts */}
            {user?.role === 'brand' && (!(user as any)?.profile?.business_number || !(user as any)?.profile?.legal_name || !(user as any)?.profile?.representative_name) && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">정확한 전자계약을 위해 회사 정보를 입력해주세요.</h4>
                            <p className="text-sm text-amber-800/80 dark:text-amber-400/80 mt-1">
                                사업자등록번호, 법인명(상호), 대표자명 등 필수 정보가 누락되어 있습니다. 크리에이터와의 원활한 협업과 정산을 위해 채워주세요.
                            </p>
                        </div>
                    </div>
                    <Button variant="default" size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto" asChild>
                        <Link href="/brand?view=settings">
                            내 프로필 설정
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                </div>
            )}

            {/* Title and View Mode Selector */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">워크스페이스 아카이브</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">크리에이터와 진행 중인 모든 협업을 한곳에서 관리하세요.</p>
                </div>

                {/* View Mode Selector */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5">
                        {([20, 50, 100] as const).map(n => (
                            <button
                                key={n}
                                onClick={() => setPageSize(n)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${pageSize === n
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
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
            </div>

            <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="w-full">
                <TabsList className="flex flex-nowrap h-auto w-full justify-start gap-2 bg-transparent p-0 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                    {renderItems(filterByType(allWorkspaceItems, workspaceSubTab).slice(0, pageSize), 'all')}
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                    {renderItems(filterByType(allActive, workspaceSubTab).slice(0, pageSize), 'active')}
                </TabsContent>

                <TabsContent value="inbound" className="space-y-4">
                    {renderItems(filterByType(inboundApplications, workspaceSubTab).slice(0, pageSize), 'inbound')}
                </TabsContent>

                <TabsContent value="outbound" className="space-y-4">
                    {renderItems(filterByType(outboundOffers, workspaceSubTab).slice(0, pageSize), 'outbound')}
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" asChild>
                            <Link href="/brand?view=discover">크리에이터 찾으러 가기</Link>
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                    {renderItems(filterByType(allRejected, workspaceSubTab).slice(0, pageSize), 'rejected')}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {renderItems(filterByType(allCompleted, workspaceSubTab).slice(0, pageSize), 'completed')}
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

            {/* Performance Dialog (성과 확인 · 최종 완료) */}
            {perfDialogProposal && (
                <PerformanceDialog
                    open={perfDialogOpen}
                    onClose={() => { setPerfDialogOpen(false); setPerfDialogProposal(null) }}
                    proposal={perfDialogProposal}
                    proposalType={
                        perfDialogProposal.moment_id || perfDialogProposal.event_id
                            ? 'moment_proposal'
                            : perfDialogProposal.campaign_id || perfDialogProposal.campaignId
                                ? 'campaign_application'
                                : 'product_application'
                    }
                    onCompleted={async () => {
                        // 완료됨으로 탭 이동 & 데이터 갱신
                        await refreshData()
                    }}
                />
            )}

            {/* G2: Edit Proposal Dialog */}
            <Dialog open={!!editingProposal} onOpenChange={(open) => !open && setEditingProposal(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>제안 수정</DialogTitle>
                        <DialogDescription>
                            {editingProposal?.influencerName || editingProposal?.influencer_name}님에게 보낸 제안을 수정합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>원고료 / 제안 조건</Label>
                            <Input
                                value={editCompensation}
                                onChange={(e) => setEditCompensation(e.target.value)}
                                placeholder="예: 200,000원"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>전달 메시지</Label>
                            <Textarea
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                className="min-h-[120px]"
                                placeholder="크리에이터에게 전달할 메시지를 수정하세요."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingProposal(null)}>취소</Button>
                        <Button onClick={handleSaveEditProposal} disabled={isSavingEdit}>
                            {isSavingEdit ? '저장 중...' : '저장'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
})
