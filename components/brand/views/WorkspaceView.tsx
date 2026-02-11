"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { CheckCircle2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"

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
                    <TabsTrigger value="all" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-slate-700 font-medium transition-all">
                        전체 보기 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{allWorkspaceItems.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-slate-700 font-medium transition-all">
                        진행중 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{allActive.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="inbound" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-slate-600 font-medium transition-all">
                        받은 제안 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{inboundApplications.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="outbound" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-slate-600 font-medium transition-all">
                        보낸 제안 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{outboundOffers.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-slate-600 font-medium transition-all">
                        거절됨 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{allRejected.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-slate-600 font-medium transition-all">
                        완료됨 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{allCompleted.length}</span>
                    </TabsTrigger>
                </TabsList>

                {/* 0. All Items Tab */}
                <TabsContent value="all" className="space-y-4">
                    {allWorkspaceItems.map((p: any) => (
                        <Card key={p.id} className="p-6 cursor-pointer hover:border-slate-300 border-l-4 border-l-slate-200 transition-all bg-white" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-6 w-full">
                                    <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl shrink-0">
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
                                                <p className="text-sm text-slate-500">{p.product_name || "제품 협찬"}</p>
                                            </div>
                                            <span className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mt-3 bg-slate-50 p-3 rounded text-sm text-slate-600">
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
                    ))}
                    {allWorkspaceItems.length === 0 && (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                            내역이 없습니다.
                        </div>
                    )}
                </TabsContent>

                {/* 1. Active Tab */}
                <TabsContent value="active" className="space-y-4">
                    {allActive.map((p: any) => (
                        <Card key={p.id} className="p-6 cursor-pointer hover:border-slate-300 border-l-4 border-l-green-500 transition-all bg-white" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
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
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">진행중</Badge>
                                                </h3>
                                                <p className="text-sm text-slate-500">{p.product_name || p.campaign?.product_name || "제품 협찬"}</p>
                                            </div>
                                            <span className="text-xs text-slate-400">{new Date(p.created_at || p.date).toLocaleDateString()}</span>
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
                    ))}
                    {allActive.length === 0 && <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">진행 중인 협업이 없습니다.</div>}
                </TabsContent>

                {/* 2. Inbound Tab (Received Proposals) */}
                <TabsContent value="inbound" className="space-y-4">
                    {inboundApplications.map((p: any) => (
                        <Card key={p.id} className="p-6 cursor-pointer hover:border-slate-300 border-l-4 border-l-blue-500 transition-all bg-white group" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4 w-full">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0 overflow-hidden border border-slate-200">
                                        {p.influencerAvatar ? <img src={p.influencerAvatar} alt="Profile" className="h-full w-full object-cover" /> : (p.influencerName?.[0] || "C")}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {/* Unified Header: Name | Insta | Followers | Tags | Cost ... Badge */}
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                {/* Name */}
                                                <h3 className="font-bold text-sm text-slate-900">{p.influencerName}</h3>
                                                <span className="text-slate-300">|</span>

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

                                            <Badge variant="secondary" className="shrink-0 bg-blue-50 text-blue-600 border-blue-200 text-[10px] h-5 px-1.5 ml-2">지원서 도착</Badge>
                                        </div>

                                        {/* Message Preview */}
                                        {p.message && (
                                            <div className="bg-slate-50 px-3 py-2 rounded text-xs text-slate-600 line-clamp-1 border border-slate-100 italic mb-2">
                                                "{p.message}"
                                            </div>
                                        )}

                                        {/* Footer: Date & Quick Action */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>

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

                        </Card >
                    ))
                    }
                    {inboundApplications.length === 0 && <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">도착한 지원서가 없습니다.</div>}
                </TabsContent >

                {/* 3. Outbound Tab (Sent Offers) */}
                < TabsContent value="outbound" className="space-y-4" >
                    {
                        outboundOffers.map((p: any) => (
                            <Card key={p.id} className="p-6 cursor-pointer hover:border-slate-300 border-l-4 border-l-purple-500 transition-all bg-white" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
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
                                                        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">제안함</Badge>
                                                    </h3>
                                                    <p className="text-sm text-slate-500">{p.product_name || p.productName || "제품 협찬"}</p>
                                                </div>
                                                <span className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
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
                        ))
                    }
                    {outboundOffers.length === 0 && <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">보낸 제안이 없습니다.</div>}
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" asChild>
                            <Link href="/brand?view=discover">크리에이터 찾으러 가기</Link>
                        </Button>
                    </div>
                </TabsContent >

                {/* 4. Rejected Tab (Archive) */}
                < TabsContent value="rejected" className="space-y-4" >
                    {
                        allRejected.map((p: any) => (
                            <Card key={p.id} className="p-6 cursor-pointer hover:border-slate-300 border-l-4 border-l-red-200 transition-all bg-slate-50 opacity-75 hover:opacity-100" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-6 w-full">
                                        <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl shrink-0 overflow-hidden">
                                            <X className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h3 className="font-bold text-lg flex items-center gap-2 text-slate-500 line-through decoration-slate-400">
                                                        {p.influencer_name || p.influencerName}
                                                        <Badge variant="secondary" className="bg-slate-200 text-slate-500">거절됨</Badge>
                                                    </h3>
                                                    <p className="text-sm text-slate-500">{p.product_name || p.campaign?.product_name || "제품 협찬"}</p>
                                                </div>
                                                <span className="text-xs text-slate-400">{new Date(p.created_at || p.date).toLocaleDateString()}</span>
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
                        ))
                    }
                    {allRejected.length === 0 && <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">거절된 내역이 없습니다.</div>}
                </TabsContent >

                {/* 5. Completed Tab */}
                < TabsContent value="completed" className="space-y-4" >
                    {
                        allCompleted.map((p: any) => (
                            <Card key={p.id} className="p-6 cursor-pointer hover:border-slate-300 border-l-4 border-l-slate-500 transition-all bg-white" onClick={() => { setChatProposal(p); setIsChatOpen(true); }}>
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
                                                        <Badge className="bg-slate-100 text-slate-600 border border-slate-200">완료됨</Badge>
                                                    </h3>
                                                    <p className="text-sm text-slate-500">{p.product_name || p.campaign?.product_name || "제품 협찬"}</p>
                                                </div>
                                                <span className="text-xs text-slate-400">{new Date(p.completed_at || p.created_at).toLocaleDateString()}</span>
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
                        ))
                    }
                    {allCompleted.length === 0 && <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">완료된 협업이 없습니다.</div>}
                </TabsContent >
            </Tabs >
        </div >
    )
})
