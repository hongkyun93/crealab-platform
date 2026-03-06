import React, { useMemo } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, List, LayoutGrid, FileText, ChevronRight, Pencil, Package, Trophy } from 'lucide-react'
import { FavoriteButton } from "@/components/ui/favorite-button"
import { Table as TableIcon } from 'lucide-react'
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { toast } from "sonner"

interface WorkspaceViewProps {
    workspaceTab: string
    setWorkspaceTab: (v: string) => void
    workspaceSubTab: 'all' | 'moment' | 'campaign' | 'contest' | 'brand'
    setWorkspaceSubTab: (v: 'all' | 'moment' | 'campaign' | 'contest' | 'brand') => void
    workspaceFavoritesOnly: boolean
    setWorkspaceFavoritesOnly: (v: boolean) => void
    workspaceSearchQuery: string
    setWorkspaceSearchQuery: (v: string) => void
    workspacePageSize: 20 | 50 | 100
    setWorkspacePageSize: (v: 20 | 50 | 100) => void
    workspaceViewMode: 'list' | 'grid' | 'table'
    setWorkspaceViewMode: (v: 'list' | 'grid' | 'table') => void

    allWorkspaceItems: any[]
    allActive: any[]
    inboundProposals: any[]
    outboundApplications: any[]
    rejectedProposals: any[]
    allCompleted: any[]
    favorites: any[]

    setChatProposal: (p: any) => void
    setIsChatOpen: (v: boolean) => void
    setEditApplicationParams: (p: any) => void
    setIsCampaignApplyOpen: (v: boolean) => void
    setProposalTarget: (p: any) => void
    setIsProposalOpen: (v: boolean) => void
    setSelectedProposal: (p: any) => void
    setShowReadonlyDialog: (v: boolean) => void
    fetchProductGuide: (id: string) => void
    setGuideProduct: (p: any) => void
    setIsProductGuideOpen: (v: boolean) => void
    setPerfSubmitProposal: (p: any) => void
    setPerfSubmitOpen: (v: boolean) => void
    handleAcceptProposal: (e: any, id: string) => void
    handleRejectClick: (p: any) => void
    handleOpenEditApplication: (p: any) => void
}

export const WorkspaceView = React.memo(function WorkspaceView({
    workspaceTab, setWorkspaceTab,
    workspaceSubTab, setWorkspaceSubTab,
    workspaceFavoritesOnly, setWorkspaceFavoritesOnly,
    workspaceSearchQuery, setWorkspaceSearchQuery,
    workspacePageSize, setWorkspacePageSize,
    workspaceViewMode, setWorkspaceViewMode,

    allWorkspaceItems, allActive, inboundProposals, outboundApplications, rejectedProposals, allCompleted,
    favorites,

    setChatProposal, setIsChatOpen,
    setEditApplicationParams, setIsCampaignApplyOpen, setProposalTarget, setIsProposalOpen,
    setSelectedProposal, setShowReadonlyDialog,
    fetchProductGuide, setGuideProduct, setIsProductGuideOpen,
    setPerfSubmitProposal, setPerfSubmitOpen,
    handleAcceptProposal, handleRejectClick, handleOpenEditApplication
}: WorkspaceViewProps) {

    const { updateProductApplication, updateProposal, refreshData, sendMessage, sendNotification } = useUnifiedProvider();

    // Apply workspace search query filter
    const applyWorkspaceSearch = (items: any[]) => {
        const q = workspaceSearchQuery.toLowerCase()
        if (!q) return items
        return items.filter(item =>
            (item.brand_name || '').toLowerCase().includes(q) ||
            (item.product_name || '').toLowerCase().includes(q) ||
            (item.campaign_title || item.title || '').toLowerCase().includes(q) ||
            (item.moment_title || item.title || '').toLowerCase().includes(q) ||
            (item.message || '').toLowerCase().includes(q)
        )
    }

    // Apply workspace favorites filter
    const applyWorkspaceFavorites = (items: any[]) => {
        if (!workspaceFavoritesOnly) return items
        return items.filter(item =>
            favorites?.some((f: any) =>
                f.target_id === item.id &&
                f.target_type === 'workspace'
            )
        )
    }

    // Filter items by type (moment/campaign/brand)
    const filterByType = (items: any[], type: 'all' | 'moment' | 'campaign' | 'contest' | 'brand') => {
        if (type === 'all') return items

        return items.filter(item => {
            if (type === 'moment') {
                return !!item.moment_id // 1. Moment has highest priority
            }
            if (type === 'contest') {
                // [NEW] Contest sub-tab
                return item.type === 'contest' || !!item.contest_id
            }
            if (type === 'campaign') {
                // 2. Campaign has second priority
                return ((!!item.campaign_id || !!item.campaignId) && !item.moment_id && item.type !== 'contest')
            }
            if (type === 'brand') {
                // 3. Brand is the fallback
                return !!item.brand_id && !item.moment_id && !item.campaign_id && item.type !== 'contest'
            }
            return false
        })
    }

    // --- SUB-TAB RENDERING HELPER ---
    const renderSubTabs = (items: any[]) => {
        const momentCount = filterByType(items, 'moment').length
        const contestCount = filterByType(items, 'contest').length
        const campaignCount = filterByType(items, 'campaign').length
        const brandCount = filterByType(items, 'brand').length

        return (
            <div className="grid grid-cols-5 gap-2 mb-4 md:flex md:flex-wrap">
                <button
                    onClick={() => setWorkspaceSubTab('all')}
                    className={`w-full md:w-auto md:min-w-[80px] px-2 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    전체 <span className="hidden md:inline ml-1.5 text-xs opacity-70">{items.length}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('contest')}
                    className={`w-full md:w-auto md:min-w-[100px] px-2 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'contest'
                        ? 'bg-slate-900 text-white shadow-[0_0_15px_rgba(0,0,0,0.1)]'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    콘테스트 <span className="hidden md:inline ml-1.5 text-xs opacity-70">{contestCount}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('moment')}
                    className={`w-full md:w-auto md:min-w-[100px] px-2 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'moment'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    모먼트 <span className="hidden md:inline ml-1.5 text-xs opacity-70">{momentCount}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('campaign')}
                    className={`w-full md:w-auto md:min-w-[100px] px-2 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'campaign'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    캠페인 <span className="hidden md:inline ml-1.5 text-xs opacity-70">{campaignCount}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('brand')}
                    className={`w-full md:w-auto md:min-w-[100px] px-2 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'brand'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    브랜드 <span className="hidden md:inline ml-1.5 text-xs opacity-70">{brandCount}</span>
                </button>
            </div>
        )
    }

    // --- WORKSPACE RENDERING HELPER ---
    const fmtRelTime = (d: string) => {
        if (!d) return ''
        const diff = Date.now() - new Date(d).getTime()
        const m = Math.floor(diff / 60000), h = Math.floor(m / 60), day = Math.floor(h / 24)
        return day > 0 ? `${day}일 전` : h > 0 ? `${h}시간 전` : m > 0 ? `${m}분 전` : '방금 전'
    }
    const getUpdaterCreator = (p: any) => {
        if (p.content_submission_status === 'submitted') return '나'
        if (p.payment_confirmed_at) return p.brand_name || '브랜드'
        if (p.delivery_status === 'shipped' || p.delivery_status === 'delivered') return p.brand_name || '브랜드'
        if (p.type === 'product_apply' || p.status === 'offered') return p.brand_name || '브랜드'
        if (p.type === 'campaign_apply' || p.status === 'applied') return '나'
        return null
    }

    const renderWorkspaceItems = (items: any[], type: string) => {
        if (items.length === 0) {
            return <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground bg-muted/10">내역이 없습니다.</div>
        }

        // TABLE VIEW
        if (workspaceViewMode === 'table') {
            return (
                <div className="rounded-md border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-muted/50">
                                <TableHead className="w-[100px]">상태</TableHead>
                                <TableHead>브랜드/캠페인</TableHead>
                                <TableHead>제품</TableHead>
                                <TableHead>일정</TableHead>
                                <TableHead className="text-right">진행률</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                                    const isContestActive = item.type === 'contest' && ['selected', 'contract', 'active', 'accepted', 'in_progress'].includes(item.status);
                                    if (isContestActive || type === 'active' || ['accepted', 'signed', 'started', 'confirmed', 'settlement', 'final_complete'].includes(item.status)) {
                                        setChatProposal(item);
                                        setIsChatOpen(true);
                                    } else {
                                        if (item.status === 'draft' && type === 'outbound') {
                                            if (item.type === 'campaign_apply') {
                                                setEditApplicationParams({
                                                    brandId: item.brand_id,
                                                    campaignId: item.campaign_id,
                                                    existingData: item
                                                })
                                                setIsCampaignApplyOpen(true)
                                            } else {
                                                setProposalTarget({
                                                    brandName: item.brand_name || '브랜드',
                                                    targetName: item.product_name || '제품 제안',
                                                    productId: item.product_id,
                                                    brandId: item.brand_id,
                                                    productName: item.product_name,
                                                })
                                                setEditApplicationParams({ existingData: item })
                                                setIsProposalOpen(true)
                                            }
                                        } else {
                                            setSelectedProposal(item);
                                            setShowReadonlyDialog(true);
                                        }
                                    }
                                }}>
                                    <TableCell>
                                        {item.type === 'contest' ? (
                                            <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30">
                                                {item.status === 'selected' || item.status === 'contract' ? '챌린저 활동 중' :
                                                    item.status === 'settlement' ? '상금 정산 대기' :
                                                        item.status === 'completed' || item.status === 'final_complete' ? '수상 완료' : '대기중'}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className={`
                                                    ${item.status === 'accepted' || item.status === 'signed' || item.status === 'started' ? 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30' :
                                                    item.status === 'completed' ? 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' :
                                                        item.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30' :
                                                            'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/30'}
                                                `}>
                                                {item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed' ? '진행중' :
                                                    item.status === 'settlement' ? '성과 대기' :
                                                        item.status === 'final_complete' ? '완료 대기' :
                                                            item.status === 'completed' ? '완료됨' :
                                                                item.status === 'rejected' ? '거절됨' : '대기중'}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] overflow-hidden">
                                                {(item.brandAvatar || item.brand_avatar)
                                                    ? <img src={item.brandAvatar || item.brand_avatar} alt="Brand" className="h-full w-full object-cover" />
                                                    : (item.brand_name?.[0] || "B")}
                                            </div>
                                            {item.brand_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.product_name}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        <div className="flex flex-col gap-0.5">
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="font-mono text-[9px] text-muted-foreground/50">관리번호 : #{String(item.workspace_id || item.id).replace(/-/g, '').slice(-6).toUpperCase()}</span>
                                        </div>
                                    </TableCell>
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
                                            <FavoriteButton targetId={String(item.id)} targetType="workspace" />
                                            {item.moment_id && (
                                                <Button size="icon" variant="ghost" className="h-7 w-7" title="제안서 보기"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedProposal(item); setShowReadonlyDialog(true); }}>
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
        if (workspaceViewMode === 'grid') {
            return (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <Card key={item.id} className={`cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 bg-card border-l-4 overflow-hidden group
                            ${type === 'all'
                                ? (item.status === 'accepted' || item.status === 'signed' || item.status === 'started' || item.status === 'confirmed'
                                    ? 'border-l-emerald-500'
                                    : item.status === 'completed'
                                        ? 'border-l-slate-400'
                                        : item.status === 'rejected'
                                            ? 'border-l-red-500'
                                            : item.type === 'product_apply'
                                                ? 'border-l-blue-500'
                                                : 'border-l-purple-500')
                                : type === 'active'
                                    ? 'border-l-emerald-500'
                                    : type === 'inbound'
                                        ? 'border-l-blue-500'
                                        : type === 'outbound'
                                            ? 'border-l-purple-500'
                                            : type === 'outbound'
                                                ? 'border-l-purple-500'
                                                : type === 'rejected'
                                                    ? 'border-l-red-500'
                                                    : type === 'completed'
                                                        ? 'border-l-slate-400'
                                                        : 'border-l-emerald-500'}
                        `} onClick={() => {
                                const isContestActive = item.type === 'contest' && ['selected', 'contract', 'active', 'accepted', 'in_progress'].includes(item.status);
                                if (isContestActive || type === 'active' || ['accepted', 'signed', 'started', 'confirmed', 'settlement', 'final_complete'].includes(item.status)) {
                                    setChatProposal(item);
                                    setIsChatOpen(true);
                                } else {
                                    // [NEW] draft 상태의 보낸 제안이면 수정 모달 열기
                                    if (item.status === 'draft' && type === 'outbound') {
                                        if (item.type === 'campaign_apply') {
                                            setEditApplicationParams({
                                                brandId: item.brand_id,
                                                campaignId: item.campaign_id,
                                                // existingData에 item 원본 객체 전체를 전달
                                                existingData: item
                                            })
                                            setIsCampaignApplyOpen(true)
                                        } else {
                                            // 일반 제품 지원서
                                            setProposalTarget({
                                                brandName: item.brand_name || '브랜드',
                                                targetName: item.product_name || '제품 제안',
                                                productId: item.product_id,
                                                brandId: item.brand_id,
                                                productName: item.product_name,
                                            })
                                            setEditApplicationParams({ existingData: item })
                                            setIsProposalOpen(true)
                                        }
                                    } else {
                                        // 일반 읽기 전용 뷰
                                        setSelectedProposal(item);
                                        setShowReadonlyDialog(true);
                                    }
                                }
                            }}>
                            <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border overflow-hidden
                                    ${item.status === 'accepted' || item.status === 'signed' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' :
                                        item.status === 'completed' ? 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700' :
                                            'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800'}
                                `}>
                                    {(item.brandAvatar || item.brand_avatar)
                                        ? <img src={item.brandAvatar || item.brand_avatar} alt="Brand" className="h-full w-full object-cover" />
                                        : item.type === 'contest' ? <Trophy className="h-5 w-5 text-amber-500" /> : (item.brand_name?.[0] || "W")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold truncate text-sm">{item.brand_name}</h4>
                                    <p className="text-xs text-muted-foreground truncate">{item.product_name}</p>
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
                                <div className="flex flex-col gap-0.5">
                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    <span className="font-mono text-[9px] text-muted-foreground/40">관리번호 : #{String(item.workspace_id || item.id).replace(/-/g, '').slice(-6).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FavoriteButton targetId={String(item.id)} targetType="workspace" />
                                    {item.moment_id && (
                                        <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={(e) => { e.stopPropagation(); setSelectedProposal(item); setShowReadonlyDialog(true); }}>
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

        // LIST VIEW (Default - Enhanced)
        return (
            <div className="space-y-4">
                {items.map((proposal) => (
                    <Card key={proposal.id} className={`relative px-6 pt-6 pb-3.5 border-l-4 bg-card hover:bg-accent/5 cursor-pointer hover:shadow-md transition-all overflow-hidden
                        ${type === 'all'
                            ? (proposal.status === 'accepted' || proposal.status === 'signed' || proposal.status === 'started' || proposal.status === 'confirmed'
                                ? 'border-l-emerald-500'  // Active
                                : proposal.status === 'completed'
                                    ? 'border-l-slate-400'  // Completed - Gray
                                    : proposal.status === 'rejected'
                                        ? 'border-l-red-500'  // Rejected
                                        : proposal.type === 'product_apply'
                                            ? 'border-l-blue-500'  // Inbound
                                            : 'border-l-purple-500')  // Outbound
                            : type === 'active'
                                ? 'border-l-emerald-500'
                                : type === 'inbound'
                                    ? 'border-l-blue-500'
                                    : type === 'outbound'
                                        ? 'border-l-purple-500'
                                        : type === 'rejected'
                                            ? 'border-l-red-500'
                                            : type === 'completed'
                                                ? 'border-l-slate-400'
                                                : 'border-l-emerald-500'}
                    `} onClick={() => {
                            const isContestActive = proposal.type === 'contest' && ['selected', 'contract', 'active', 'accepted', 'in_progress'].includes(proposal.status);
                            if (isContestActive || type === 'active' || ['accepted', 'signed', 'started', 'confirmed', 'settlement', 'final_complete'].includes(proposal.status)) {
                                setChatProposal(proposal);
                                setIsChatOpen(true);
                            } else {
                                // [NEW] draft 상태의 보낸 제안이면 수정 모달 열기
                                if (proposal.status === 'draft' && type === 'outbound') {
                                    if (proposal.type === 'campaign_apply') {
                                        setEditApplicationParams({
                                            brandId: proposal.brand_id,
                                            campaignId: proposal.campaign_id,
                                            // existingData에 proposal 원본 객체 전체를 전달
                                            existingData: proposal
                                        })
                                        setIsCampaignApplyOpen(true)
                                    } else {
                                        // 일반 제품 지원서
                                        setProposalTarget({
                                            brandName: proposal.brand_name || '브랜드',
                                            targetName: proposal.product_name || '제품 제안',
                                            productId: proposal.product_id,
                                            brandId: proposal.brand_id,
                                            productName: proposal.product_name,
                                        })
                                        setEditApplicationParams({ existingData: proposal })
                                        setIsProposalOpen(true)
                                    }
                                } else {
                                    // 일반 읽기 전용 뷰
                                    setSelectedProposal(proposal);
                                    setShowReadonlyDialog(true);
                                }
                            }
                        }}>
                        {/* 모바일: 우상단 즐겨찾기 버튼 */}
                        <div className="absolute top-3 right-3 sm:hidden">
                            <FavoriteButton targetId={String(proposal.id)} targetType="workspace" />
                        </div>
                        <div className="flex flex-row items-start gap-4 md:gap-6">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted/50 border border-border overflow-hidden">
                                {(proposal.brandAvatar || proposal.brand_avatar)
                                    ? <img src={proposal.brandAvatar || proposal.brand_avatar} alt="Brand" className="h-full w-full object-cover" />
                                    : proposal.type === 'contest'
                                        ? <Trophy className="h-8 w-8 text-amber-500" />
                                        : <span className="font-bold text-lg text-muted-foreground">{proposal.brand_name?.[0] || "W"}</span>}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-base md:text-xl flex items-center gap-2 text-foreground">
                                            {proposal.product_name || proposal.brand_name}
                                            <Badge variant="outline" className={`text-xs font-medium border-2 rounded-full px-3 py-0.5 transition-all bg-background
                                                ${proposal.type === 'contest' ? 'text-amber-700 dark:text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]' :
                                                    proposal.status === 'accepted' || proposal.status === 'signed' || proposal.status === 'started' || proposal.status === 'confirmed' ? 'text-emerald-700 dark:text-emerald-400 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                                                        proposal.status === 'completed' ? 'text-slate-700 dark:text-slate-300 border-slate-400/50 shadow-[0_0_12px_rgba(148,163,184,0.3)]' :
                                                            proposal.status === 'rejected' ? 'text-red-700 dark:text-red-400 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)]' :
                                                                'text-orange-700 dark:text-orange-400 border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.3)]'}
                                            hidden md:inline-flex`}>
                                                {proposal.type === 'contest' ? (
                                                    proposal.status === 'settlement' ? '상금 정산 대기' :
                                                        proposal.status === 'final_complete' || proposal.status === 'completed' ? '수상 완료' :
                                                            ['selected', 'contract', 'active', 'accepted', 'in_progress'].includes(proposal.status) ? '챌린저 활동 중' : '대기중'
                                                ) : proposal.status === 'accepted' || proposal.status === 'signed' || proposal.status === 'started' || proposal.status === 'confirmed' ? '진행중' :
                                                    proposal.status === 'settlement' ? '성과 대기' :
                                                        proposal.status === 'final_complete' ? '완료 대기' :
                                                            proposal.status === 'completed' ? '완료됨' :
                                                                proposal.status === 'rejected' ? '거절됨' :
                                                                    '수락 대기중'}
                                            </Badge>
                                        </h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span>{proposal.brand_name}</span>
                                            <span className="font-mono text-[9px] text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded">관리번호 : #{String(proposal.workspace_id || proposal.id).replace(/-/g, '').slice(-6).toUpperCase()}</span>
                                            {proposal.moment_id && proposal.moment_title && (
                                                <span className="text-purple-600 dark:text-purple-400">
                                                    → {proposal.moment_title}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FavoriteButton targetId={String(proposal.id)} targetType="workspace" className="hidden sm:flex" />
                                        {/* 제안서 보기 button for moment proposals */}
                                        {proposal.moment_id && (
                                            <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hidden md:flex" onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProposal(proposal);
                                                setShowReadonlyDialog(true);
                                            }}>
                                                <FileText className="mr-1 h-3 w-3" /> 제안서
                                            </Button>
                                        )}
                                        {/* Contextual Actions based on type/status */}
                                        {type === 'active' && (
                                            <Button size="sm" variant="outline" className="border-border hidden md:flex" onClick={(e) => {
                                                e.stopPropagation();
                                                const pId = proposal.product_id;
                                                if (pId) fetchProductGuide(pId);
                                                else {
                                                    setGuideProduct({ name: proposal.product_name, image_url: proposal.product?.image_url });
                                                    setIsProductGuideOpen(true);
                                                }
                                            }}>
                                                가이드 보기
                                            </Button>
                                        )}
                                        {/* 🆕 성과 제출 버튼 — settlement 단계 전용 */}
                                        {proposal.status === 'settlement' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-semibold gap-1.5 hidden md:flex"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPerfSubmitProposal(proposal)
                                                    setPerfSubmitOpen(true)
                                                }}
                                            >
                                                📊 성과 제출
                                            </Button>
                                        )}
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Progress bar — full-width below on mobile, indented on desktop */}
                        <div className="mt-4 md:pl-[88px] flex items-center gap-4">
                            <div className="flex-1">
                                <WorkspaceProgressBar
                                    proposal={proposal}
                                />
                            </div>

                            {/* Accept/Reject Buttons - Only show for inbound offers (brand→creator), not outbound (creator→brand) */}
                            {proposal.status === 'offered' && proposal.type !== 'campaign_apply' && type !== 'outbound' && (
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        onClick={(e) => handleAcceptProposal(e, proposal.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        수락하기
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => handleRejectClick(proposal)}
                                    >
                                        거절하기
                                    </Button>
                                </div>
                            )}

                            {/* G3: 크리에이터가 보낸 지원서 수정 (outbound + pending/applied) */}
                            {type === 'outbound' && (proposal.status === 'applied' || proposal.status === 'pending' || !proposal.status) && (
                                <div className="shrink-0">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                                        onClick={(e) => { e.stopPropagation(); handleOpenEditApplication(proposal); }}
                                    >
                                        <Pencil className="mr-1 h-3 w-3" /> 수정
                                    </Button>
                                </div>
                            )}
                        </div>
                        {/* 최근 업데이트 */}
                        <div className="flex justify-end mt-1.5 md:pl-[88px]">
                            <span className="text-[10px] text-muted-foreground/50">
                                최근 업데이트 : {fmtRelTime(proposal.updated_at || proposal.created_at)}{getUpdaterCreator(proposal) ? ` (${getUpdaterCreator(proposal)})` : ''}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>
        )
    }


    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">워크스페이스 아카이브</h1>
                    <p className="text-muted-foreground">브랜드와 진행 중인 모든 협업을 한곳에서 관리하세요.</p>
                </div>
                <div className="flex w-full max-w-lg items-center gap-2">
                    {/* 즐겨찾기 */}
                    <Button
                        variant={workspaceFavoritesOnly ? "secondary" : "outline"}
                        size="icon"
                        onClick={() => setWorkspaceFavoritesOnly(!workspaceFavoritesOnly)}
                        className={workspaceFavoritesOnly ? "bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200" : "text-muted-foreground"}
                        title="즐겨찾기만 보기"
                    >
                        <Star className={`h-4 w-4 ${workspaceFavoritesOnly ? "fill-current" : ""}`} />
                    </Button>
                    {/* 검색창 */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="브랜드명, 제품명, 캠페인 검색"
                            className="pl-9"
                            value={workspaceSearchQuery}
                            onChange={(e) => setWorkspaceSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* 20/50/100 페이지 사이즈 */}
                    <div className="hidden md:flex items-center gap-0.5 border border-border rounded-lg p-0.5 shrink-0 h-10">
                        {([20, 50, 100] as const).map(n => (
                            <button
                                key={n}
                                onClick={() => setWorkspacePageSize(n)}
                                className={`px-2.5 h-full rounded-md text-sm font-medium transition-colors ${workspacePageSize === n ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    {/* 뷰 모드 */}
                    <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-lg shrink-0">
                        <Button
                            variant={workspaceViewMode === 'list' ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setWorkspaceViewMode('list')}
                            title="리스트형"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={workspaceViewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setWorkspaceViewMode('grid')}
                            title="그리드형"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={workspaceViewMode === 'table' ? 'default' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setWorkspaceViewMode('table')}
                            title="테이블형"
                        >
                            <TableIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="w-full">
                <TabsList className="grid grid-cols-3 gap-2 h-auto w-full bg-transparent p-0 md:flex md:flex-wrap md:justify-start">
                    <TabsTrigger value="all" className="w-full md:w-auto md:min-w-[130px] data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-foreground/90 font-medium transition-all">
                        전체 보기 <span className="hidden md:inline ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allWorkspaceItems.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="w-full md:w-auto md:min-w-[120px] data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(16,185,129,0.6)] bg-background text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500/50 px-4 py-2 rounded-full font-medium transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        진행중 <span className="hidden md:inline ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allActive.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="inbound" className="w-full md:w-auto md:min-w-[130px] data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(59,130,246,0.6)] bg-background text-blue-700 dark:text-blue-400 border-2 border-blue-500/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                        받은 제안 <span className="hidden md:inline ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{inboundProposals.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="outbound" className="w-full md:w-auto md:min-w-[130px] data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(168,85,247,0.6)] bg-background text-purple-700 dark:text-purple-400 border-2 border-purple-500/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        보낸 제안 <span className="hidden md:inline ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{outboundApplications.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="w-full md:w-auto md:min-w-[120px] data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(239,68,68,0.6)] bg-background text-red-700 dark:text-red-400 border-2 border-red-500/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        거절됨 <span className="hidden md:inline ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{rejectedProposals.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="w-full md:w-auto md:min-w-[120px] data-[state=active]:bg-slate-400 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(148,163,184,0.6)] bg-background text-slate-700 dark:text-slate-400 border-2 border-slate-400/50 px-4 py-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(148,163,184,0.4)]">
                        완료됨 <span className="hidden md:inline ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allCompleted.length}</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                    {renderSubTabs(allWorkspaceItems)}
                    {renderWorkspaceItems(filterByType(applyWorkspaceFavorites(allWorkspaceItems), workspaceSubTab).slice(0, workspacePageSize), 'all')}
                </TabsContent>

                <TabsContent value="active" className="space-y-4 mt-6">
                    {renderSubTabs(applyWorkspaceSearch(allActive))}
                    {renderWorkspaceItems(filterByType(applyWorkspaceFavorites(applyWorkspaceSearch(allActive)), workspaceSubTab).slice(0, workspacePageSize), 'active')}
                </TabsContent>

                <TabsContent value="inbound" className="space-y-4 mt-6">
                    {renderWorkspaceItems(applyWorkspaceFavorites(applyWorkspaceSearch(inboundProposals)).slice(0, workspacePageSize), 'inbound')}
                </TabsContent>

                <TabsContent value="outbound" className="space-y-4 mt-6">
                    {renderSubTabs(applyWorkspaceSearch(outboundApplications))}
                    {renderWorkspaceItems(filterByType(applyWorkspaceFavorites(applyWorkspaceSearch(outboundApplications)), workspaceSubTab).slice(0, workspacePageSize), 'outbound')}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4 mt-6">
                    {renderSubTabs(applyWorkspaceSearch(allCompleted))}
                    {renderWorkspaceItems(filterByType(applyWorkspaceFavorites(applyWorkspaceSearch(allCompleted)), workspaceSubTab).slice(0, workspacePageSize), 'completed')}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4 mt-6">
                    {renderSubTabs(applyWorkspaceSearch(rejectedProposals))}
                    {renderWorkspaceItems(filterByType(applyWorkspaceFavorites(applyWorkspaceSearch(rejectedProposals)), workspaceSubTab).slice(0, workspacePageSize), 'rejected')}
                </TabsContent>
            </Tabs>
        </div>
    )
})
