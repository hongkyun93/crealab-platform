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
import { useState } from "react"
import { WorkspaceCompactRow } from "@/components/brand/WorkspaceCompactRow"

interface WorkspaceViewProps {
    proposals: any[]
    brandProposals: any[]
    workspaceTab: string
    setWorkspaceTab: (tab: string) => void
    setChatProposal: (proposal: any) => void
    setIsChatOpen: (open: boolean) => void
    handleStatusUpdate: (id: string, status: string) => void
}

export const WorkspaceView = React.memo(function WorkspaceView({
    proposals,
    brandProposals,
    workspaceTab,
    setWorkspaceTab,
    setChatProposal,
    setIsChatOpen,
    handleStatusUpdate
}: WorkspaceViewProps) {
    const [viewMode, setViewMode] = useState<'detail' | 'compact'>('detail')

    // Memoize filtering logic to prevent recalculation on every render
    // 1. Inbound (Received Applications from Creators) - Waiting
    const inboundApplications = useMemo(
        () => proposals?.filter((p: any) => p.status === 'applied' || p.status === 'pending' || p.status === 'viewed') || [],
        [proposals]
    )

    // 2. Outbound (Sent Offers to Creators) - Waiting
    const outboundOffers = useMemo(
        () => brandProposals?.filter(p => !p.status || p.status === 'offered' || p.status === 'negotiating') || [],
        [brandProposals]
    )

    // 3. Active (In Progress) - Both sources
    const activeInbound = useMemo(
        () => proposals?.filter((p: any) => p.status === 'accepted' || p.status === 'signed' || p.status === 'confirmed') || [],
        [proposals]
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
        () => proposals?.filter((p: any) => p.status === 'completed') || [],
        [proposals]
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
        () => proposals?.filter((p: any) => p.status === 'rejected') || [],
        [proposals]
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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">워크스페이스 아카이브</h1>
                <p className="text-muted-foreground">크리에이터와 진행 중인 모든 협업을 한곳에서 관리하세요.</p>
            </div>

            <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="w-full">
                <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0 mb-6">
                    <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        전체 보기 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allWorkspaceItems.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        진행중 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allActive.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="inbound" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        받은 제안 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{inboundApplications.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="outbound" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        보낸 제안 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{outboundOffers.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        거절됨 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allRejected.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background px-4 py-2 rounded-full text-muted-foreground font-medium transition-all">
                        완료됨 <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs">{allCompleted.length}</span>
                    </TabsTrigger>
                </TabsList>

                <div className="flex justify-end mb-4">
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

                {/* 0. All Items Tab */}
                <TabsContent value="all" className="space-y-4">
                    {allWorkspaceItems.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                            내역이 없습니다.
                        </div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
                            {allWorkspaceItems.map((p: any) => (
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
                                                            <p className="text-sm text-muted-foreground">{p.product_name || "제품 협찬"}</p>
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
                    {allActive.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">진행 중인 협업이 없습니다.</div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
                            {allActive.map((p: any) => (
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
                                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">진행중</Badge>
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">{p.product_name || p.campaign?.product_name || "제품 협찬"}</p>
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
                    {inboundApplications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">도착한 지원서가 없습니다.</div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
                            {inboundApplications.map((p: any) => (
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
                                                                    <span className="font-medium text-pink-600">@{p.instagramHandle.replace('@', '')}</span>
                                                                    <span className="text-slate-300">|</span>
                                                                </>
                                                            )}
                                                            {p.followers !== undefined && (
                                                                <>
                                                                    <span className="font-medium text-slate-700">{p.followers >= 10000 ? `${(p.followers / 10000).toFixed(1)}만` : p.followers.toLocaleString()}</span>
                                                                    <span className="text-slate-300">|</span>
                                                                </>
                                                            )}
                                                            {p.tags && p.tags.length > 0 && (
                                                                <>
                                                                    <div className="flex gap-1">
                                                                        {p.tags.slice(0, 3).map((tag: string, i: number) => (
                                                                            <span key={i} className="text-slate-500">#{tag}</span>
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-slate-300">|</span>
                                                                </>
                                                            )}

                                                            <span className="font-bold text-emerald-600">{p.cost ? `${p.cost.toLocaleString()}원` : '협의'}</span>
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
                    {outboundOffers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">보낸 제안이 없습니다.</div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
                            {
                                outboundOffers.map((p: any) => (
                                    viewMode === 'compact' ? (
                                        <WorkspaceCompactRow key={p.id} item={p} onClick={() => { setChatProposal(p); setIsChatOpen(true); }} />
                                    ) : (
                                        <Card key={p.id} className="p-6 cursor-pointer hover:border-border border-l-4 border-l-purple-500 transition-all bg-card" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-6 w-full">
                                                    <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl shrink-0 overflow-hidden">
                                                        {p.influencerAvatar ? <img src={p.influencerAvatar} alt="Profile" className="h-full w-full object-cover" /> : (p.influencer_name?.[0] || "C")}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h3 className="font-bold text-lg flex items-center gap-2">
                                                                    {p.influencer_name}
                                                                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-900/30 dark:text-purple-400">제안함</Badge>
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">{p.product_name || p.productName || "제품 협찬"}</p>
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
                    {allRejected.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">거절된 내역이 없습니다.</div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
                            {
                                allRejected.map((p: any) => (
                                    viewMode === 'compact' ? (
                                        <WorkspaceCompactRow key={p.id} item={p} onClick={() => { setChatProposal(p); setIsChatOpen(true); }} />
                                    ) : (
                                        <Card key={p.id} className="p-6 cursor-pointer hover:border-border border-l-4 border-l-red-200 transition-all bg-search opacity-75 hover:opacity-100" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
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
                    {allCompleted.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">완료된 협업이 없습니다.</div>
                    ) : (
                        <div className={viewMode === 'compact' ? "space-y-2" : "space-y-4"}>
                            {
                                allCompleted.map((p: any) => (
                                    viewMode === 'compact' ? (
                                        <WorkspaceCompactRow key={p.id} item={p} onClick={() => { setChatProposal(p); setIsChatOpen(true); }} />
                                    ) : (
                                        <Card key={p.id} className="p-6 cursor-pointer hover:border-border border-l-4 border-l-muted-foreground transition-all bg-card" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-6 w-full">
                                                    <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl shrink-0 overflow-hidden">
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
