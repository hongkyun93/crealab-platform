"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { CheckCircle2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"
import { LayoutList, AlignJustify } from "lucide-react"
import { useState, useEffect } from "react"
import { WorkspaceCompactRow } from "@/components/brand/WorkspaceCompactRow"

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
    const [viewMode, setViewMode] = useState<'detail' | 'compact'>('detail')
    const [workspaceSubTab, setWorkspaceSubTab] = useState<'all' | 'moment' | 'campaign' | 'brand'>('all')

    // Reset sub-tab when main workspace tab changes
    useEffect(() => {
        setWorkspaceSubTab('all')
    }, [workspaceTab])

    // Memoize filtering logic to prevent recalculation on every render
    // 1. Inbound (Received Applications from Creators) - Waiting
    const inboundApplications = useMemo(
        () => campaignProposals?.filter((p: any) => p.status === 'applied' || p.status === 'pending' || p.status === 'viewed') || [],
        [campaignProposals]
    )

    // 2. Outbound (Sent Offers to Creators) - Waiting
    const outboundOffers = useMemo(
        () => brandProposals?.filter(p => !p.status || p.status === 'offered' || p.status === 'negotiating') || [],
        [brandProposals]
    )

    // 3. Active (In Progress) - Both sources
    const activeInbound = useMemo(
        () => campaignProposals?.filter((p: any) => p.status === 'accepted' || p.status === 'signed' || p.status === 'confirmed') || [],
        [campaignProposals]
    )

    const activeOutbound = useMemo(
        () => brandProposals?.filter((p: any) => p.status === 'accepted' || p.status === 'signed' || p.status === 'confirmed') || [],
        [brandProposals]
    )

    const allActive = useMemo(
        () => [...activeInbound, ...activeOutbound].sort((a: any, b: any) =>
            new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()
        ),
        [activeInbound, activeOutbound]
    )

    // 4. Completed - Both sources
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

    // 5. Rejected - Both sources
    const rejectedInbound = useMemo(
        () => campaignProposals?.filter((p: any) => p.status === 'rejected') || [],
        [campaignProposals]
    )

    const rejectedOutbound = useMemo(
        () => brandProposals?.filter((p: any) => p.status === 'rejected') || [],
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
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    전체 <span className="ml-1.5 text-xs opacity-70">{items.length}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('moment')}
                    className={`min-w-[100px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'moment'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    모먼트 <span className="ml-1.5 text-xs opacity-70">{momentCount}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('campaign')}
                    className={`min-w-[100px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'campaign'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    캠페인 <span className="ml-1.5 text-xs opacity-70">{campaignCount}</span>
                </button>
                <button
                    onClick={() => setWorkspaceSubTab('brand')}
                    className={`min-w-[100px] px-4 py-1.5 rounded-full text-sm font-medium transition-all ${workspaceSubTab === 'brand'
                        ? 'bg-slate-900 text-white'
                        : 'bg-background border border-border text-foreground/90 hover:bg-accent'
                        }`}
                >
                    브랜드 <span className="ml-1.5 text-xs opacity-70">{brandCount}</span>
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Title and View Mode Selector on same row */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">워크스페이스 아카이브</h1>
                    <p className="text-muted-foreground">크리에이터와 진행 중인 모든 협업을 한곳에서 관리하세요.</p>
                </div>

                {/* View Mode Selector */}
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                    <Button
                        variant={viewMode === 'detail' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode('detail')}
                        title="상세 보기"
                    >
                        <LayoutList className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'compact' ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewMode('compact')}
                        title="컴팩트 보기"
                    >
                        <AlignJustify className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="w-full">
                <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0 mb-6">
                    <TabsTrigger value="all" className="min-w-[130px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        전체 보기 <span className="ml-2 bg-muted dark:bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allWorkspaceItems.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="min-w-[110px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        진행중 <span className="ml-2 bg-muted dark:bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allActive.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="inbound" className="min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        받은 제안 <span className="ml-2 bg-muted dark:bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded text-xs">{inboundApplications.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="outbound" className="min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        보낸 제안 <span className="ml-2 bg-muted dark:bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded text-xs">{outboundOffers.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="min-w-[110px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        거절됨 <span className="ml-2 bg-muted dark:bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allRejected.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="min-w-[110px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        완료됨 <span className="ml-2 bg-muted dark:bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allCompleted.length}</span>
                    </TabsTrigger>
                </TabsList>

                {/* Sub-tabs - Moved below main tabs */}
                <div className="mt-4 mb-4">
                    {workspaceTab === 'all' && renderSubTabs(allWorkspaceItems)}
                    {workspaceTab === 'active' && renderSubTabs(allActive)}
                    {workspaceTab === 'inbound' && renderSubTabs(inboundApplications)}
                    {workspaceTab === 'outbound' && renderSubTabs(outboundOffers)}
                    {workspaceTab === 'rejected' && renderSubTabs(allRejected)}
                    {workspaceTab === 'completed' && renderSubTabs(allCompleted)}
                </div>

                {/* 0. All Items Tab */}
                <TabsContent value="all" className="space-y-4">
                    {filterByType(allWorkspaceItems, workspaceSubTab).length === 0 ? (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                            내역이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filterByType(allWorkspaceItems, workspaceSubTab).map((p: any) => (
                                viewMode === 'compact' ? (
                                    <WorkspaceCompactRow
                                        key={p.id}
                                        item={p}
                                        onClick={() => { setChatProposal(p); setIsChatOpen(true); }}
                                    />
                                ) : (
                                    <Card key={p.id} className="p-6 cursor-pointer hover:border-border border-l-4 border-l-muted transition-all bg-card" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-6 w-full">
                                                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl shrink-0">
                                                    {(p.influencer_name?.[0] || "C")}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                                {p.influencer_name}
                                                                <Badge variant="outline" className="text-xs font-normal">
                                                                    {p.status === 'accepted' || p.status === 'signed' ? '진행중' :
                                                                        p.status === 'completed' ? '완료됨' :
                                                                            p.status === 'rejected' ? '거절됨' :
                                                                                '대기중'}
                                                                </Badge>
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {p.type === 'moment_offer' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border-0">모먼트</Badge>}
                                                                {p.type === 'brand_invite' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border-0">직접제안</Badge>}
                                                                {p.type === 'creator_apply' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 border-0">캠페인</Badge>}
                                                                <p className="text-sm text-muted-foreground">{p.product_name || "제품 협찬"}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground/70">{new Date(p.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="mt-3 bg-muted/30 p-3 rounded text-sm text-foreground/80">
                                                        {p.message}
                                                    </div>
                                                    <div className="mt-4">
                                                        <WorkspaceProgressBar
                                                            status={p.status}
                                                            contract_status={p.contract_status}
                                                            delivery_status={p.delivery_status}
                                                            content_submission_status={p.content_submission_status}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* 1. Active Tab */}
                <TabsContent value="active" className="space-y-4">
                    {filterByType(allActive, workspaceSubTab).length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">진행 중인 협업이 없습니다.</div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
                            {filterByType(allActive, workspaceSubTab).map((p: any) => (
                                viewMode === 'compact' ? (
                                    <WorkspaceCompactRow key={p.id} item={p} onClick={() => { setChatProposal(p); setIsChatOpen(true); }} />
                                ) : (
                                    <Card key={p.id} className="p-6 cursor-pointer hover:border-border border-l-4 border-l-green-500 transition-all bg-card" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-6 w-full">
                                                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl shrink-0 overflow-hidden">
                                                    {p.influencerAvatar ? <img src={p.influencerAvatar} alt="Profile" className="h-full w-full object-cover" /> : (p.influencer_name?.[0] || "C")}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                                {p.influencer_name}
                                                                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 border-0">진행중</Badge>
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {p.type === 'moment_offer' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border-0">모먼트</Badge>}
                                                                {p.type === 'brand_invite' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border-0">직접제안</Badge>}
                                                                {p.type === 'creator_apply' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 border-0">캠페인</Badge>}
                                                                <p className="text-sm text-muted-foreground">{p.product_name || p.campaign?.product_name || "제품 협찬"}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground/70">{new Date(p.created_at || p.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="mt-4">
                                                        <WorkspaceProgressBar
                                                            status={p.status}
                                                            contract_status={p.contract_status}
                                                            delivery_status={p.delivery_status}
                                                            content_submission_status={p.content_submission_status}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* 2. Inbound Tab (Received Proposals) */}
                <TabsContent value="inbound" className="space-y-4">
                    {filterByType(inboundApplications, workspaceSubTab).length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">도착한 지원서가 없습니다.</div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2 " : "space-y-4"}>
                            {filterByType(inboundApplications, workspaceSubTab).map((p: any) => (
                                viewMode === 'compact' ? (
                                    <WorkspaceCompactRow key={p.id} item={p} onClick={() => { setChatProposal(p); setIsChatOpen(true); }} />
                                ) : (
                                    <Card key={p.id} className="p-6 cursor-pointer hover:border-border border-l-4 border-l-blue-500 transition-all bg-card group" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4 w-full">
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-lg shrink-0 overflow-hidden border border-border">
                                                    {p.influencerAvatar ? <img src={p.influencerAvatar} alt="Profile" className="h-full w-full object-cover" /> : (p.influencerName?.[0] || "C")}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {/* Unified Header: Name | Insta | Followers | Tags | Cost ... Badge */}
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                            {/* Name */}
                                                            <h3 className="font-bold text-sm text-foreground">{p.influencerName}</h3>
                                                            <span className="text-muted-foreground/50">|</span>

                                                            {/* Stats */}
                                                            {p.instagramHandle && (
                                                                <>
                                                                    <span className="font-medium text-pink-600 dark:text-pink-400">@{p.instagramHandle.replace('@', '')}</span>
                                                                    <span className="text-slate-300 dark:text-slate-700">|</span>
                                                                </>
                                                            )}
                                                            {p.followers !== undefined && (
                                                                <>
                                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{p.followers >= 10000 ? `${(p.followers / 10000).toFixed(1)}만` : p.followers.toLocaleString()}</span>
                                                                    <span className="text-slate-300 dark:text-slate-700">|</span>
                                                                </>
                                                            )}
                                                            {p.tags && p.tags.length > 0 && (
                                                                <>
                                                                    <div className="flex gap-1">
                                                                        {p.tags.slice(0, 3).map((tag: string, i: number) => (
                                                                            <span key={i} className="text-slate-500 dark:text-slate-400">#{tag}</span>
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-slate-300 dark:text-slate-700">|</span>
                                                                </>
                                                            )}

                                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.cost ? `${p.cost.toLocaleString()}원` : '협의'}</span>
                                                        </div>

                                                        <Badge variant="secondary" className="shrink-0 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30 text-[10px] h-5 px-1.5 ml-2">지원서 도착</Badge>
                                                    </div>

                                                    {/* Message Preview */}
                                                    {p.message && (
                                                        <div className="bg-muted/30 px-3 py-2 rounded text-xs text-foreground/80 line-clamp-1 border border-border/50 italic mb-2">
                                                            "{p.message}"
                                                        </div>
                                                    )}

                                                    {/* Footer: Date & Quick Action */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-muted-foreground/50">{new Date(p.created_at).toLocaleDateString()}</span>

                                                        {/* Quick Accept Button */}
                                                        <Button
                                                            size="sm"
                                                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity px-3"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(p.id, 'accepted');
                                                            }}
                                                        >
                                                            <CheckCircle2 className="mr-1 h-3 w-3" /> 바로 수락
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* 3. Outbound Tab (Sent Offers) */}
                <TabsContent value="outbound" className="space-y-4">
                    {filterByType(outboundOffers, workspaceSubTab).length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">보낸 제안이 없습니다.</div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
                            {
                                filterByType(outboundOffers, workspaceSubTab).map((p: any) => (
                                    viewMode === 'compact' ? (
                                        <WorkspaceCompactRow key={p.id} item={p} onClick={() => { setChatProposal(p); setIsChatOpen(true); }} />
                                    ) : (
                                        <Card key={p.id} className="p-6 cursor-pointer hover:border-border border-l-4 border-l-purple-500 transition-all bg-card group" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-6 w-full">
                                                    <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xl shrink-0 overflow-hidden">
                                                        {p.influencerAvatar ? <img src={p.influencerAvatar} alt="Profile" className="h-full w-full object-cover" /> : (p.influencer_name?.[0] || "C")}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h3 className="font-bold text-lg flex items-center gap-2">
                                                                    {p.influencer_name}
                                                                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-900/30 dark:text-purple-400">제안함</Badge>
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {p.type === 'moment_offer' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border-0">모먼트</Badge>}
                                                                    {p.type === 'brand_invite' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border-0">직접제안</Badge>}
                                                                    <p className="text-sm text-muted-foreground">{p.product_name || p.productName || "제품 협찬"}</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground/70">{new Date(p.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="mt-4">
                                                            <WorkspaceProgressBar
                                                                status={p.status}
                                                                contract_status={p.contract_status}
                                                                delivery_status={p.delivery_status}
                                                                content_submission_status={p.content_submission_status}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2 mt-4">
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 h-8 text-xs font-bold border-purple-200 hover:bg-purple-50 text-purple-700 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20 px-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onViewProposal) {
                                                                        onViewProposal(p);
                                                                    } else {
                                                                        setChatProposal(p); // Fallback
                                                                        setIsChatOpen(true);
                                                                    }
                                                                }}
                                                            >
                                                                보낸 제안 보기
                                                            </Button>
                                                            <Button
                                                                className="flex-1 h-8 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setChatProposal(p);
                                                                    setIsChatOpen(true);
                                                                }}
                                                            >
                                                                워크스페이스 열기
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                ))
                            }
                        </div>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" asChild>
                            <Link href="/brand?view=discover">크리에이터 찾으러 가기</Link>
                        </Button>
                    </div>
                </TabsContent >

                {/* 4. Rejected Tab (Archive) */}
                <TabsContent value="rejected" className="space-y-4">
                    {filterByType(allRejected, workspaceSubTab).length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">거절된 내역이 없습니다.</div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
                            {
                                filterByType(allRejected, workspaceSubTab).map((p: any) => (
                                    viewMode === 'compact' ? (
                                        <WorkspaceCompactRow key={p.id} item={p} onClick={() => { setChatProposal(p); setIsChatOpen(true); }} />
                                    ) : (
                                        <Card key={p.id} className="p-6 cursor-pointer hover:border-border border-l-4 border-l-red-200 transition-all bg-muted opacity-75 hover:opacity-100" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-6 w-full">
                                                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl shrink-0 overflow-hidden">
                                                        <X className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h3 className="font-bold text-lg flex items-center gap-2 text-muted-foreground line-through decoration-muted-foreground/50">
                                                                    {p.influencer_name || p.influencerName}
                                                                    <Badge variant="secondary" className="bg-muted text-muted-foreground">거절됨</Badge>
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">{p.product_name || p.campaign?.product_name || "제품 협찬"}</p>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground/70">{new Date(p.created_at || p.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="mt-4 opacity-50">
                                                            <WorkspaceProgressBar
                                                                status={p.status}
                                                                contract_status={p.contract_status}
                                                                delivery_status={p.delivery_status}
                                                                content_submission_status={p.content_submission_status}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                ))
                            }
                        </div>
                    )}
                </TabsContent >

                {/* 5. Completed Tab */}
                <TabsContent value="completed" className="space-y-4">
                    {filterByType(allCompleted, workspaceSubTab).length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">완료된 협업이 없습니다.</div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
                            {
                                filterByType(allCompleted, workspaceSubTab).map((p: any) => (
                                    viewMode === 'compact' ? (
                                        <WorkspaceCompactRow key={p.id} item={p} onClick={() => { setChatProposal(p); setIsChatOpen(true); }} />
                                    ) : (
                                        <Card key={p.id} className="p-6 cursor-pointer hover:border-border border-l-4 border-l-muted-foreground transition-all bg-card" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-6 w-full">
                                                    <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xl shrink-0 overflow-hidden">
                                                        {p.influencerAvatar ? <img src={p.influencerAvatar} alt="Profile" className="h-full w-full object-cover" /> : (p.influencer_name?.[0] || "C")}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h3 className="font-bold text-lg flex items-center gap-2">
                                                                    {p.influencer_name || p.influencerName}
                                                                    <Badge className="bg-muted text-muted-foreground border border-border">완료됨</Badge>
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">{p.product_name || p.campaign?.product_name || "제품 협찬"}</p>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground/70">{new Date(p.completed_at || p.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="mt-4">
                                                            <WorkspaceProgressBar
                                                                status={p.status}
                                                                contract_status={p.contract_status}
                                                                delivery_status={p.delivery_status}
                                                                content_submission_status={p.content_submission_status}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                ))
                            }
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div >
    )
})
