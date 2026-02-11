"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkspaceProgressBar } from "@/components/workspace-progress-bar"
import { FileText, Loader2 } from "lucide-react"
import { usePlatform } from "@/components/providers/platform-provider"

export default function WorkspacePage() {
    const {
        brandProposals,
        updateBrandProposal,
        isLoading,
    } = usePlatform()

    const [workspaceTab, setWorkspaceTab] = useState("all")
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatProposal, setChatProposal] = useState<any>(null)
    const [isProductGuideOpen, setIsProductGuideOpen] = useState(false)
    const [guideProduct, setGuideProduct] = useState<any>(null)

    // Debug: log proposals data
    React.useEffect(() => {
        console.log('Workspace Page - brandProposals:', brandProposals)
        console.log('Workspace Page - isLoading:', isLoading)
    }, [brandProposals, isLoading])

    // Filter proposals by type and status
    const inboundProposals = brandProposals?.filter((p: any) => p.type === 'inbound' && p.status !== 'rejected') || []
    const outboundApplications = brandProposals?.filter((p: any) => p.type === 'outbound' && p.status !== 'rejected') || []
    const allActive = brandProposals?.filter((p: any) => p.status === 'accepted' || p.status === 'signed' || p.status === 'started') || []
    const allCompleted = brandProposals?.filter((p: any) => p.status === 'completed') || []
    const rejectedProposals = brandProposals?.filter((p: any) => p.status === 'rejected') || []
    const allWorkspaceItems = brandProposals || []

    const handleStatusUpdate = async (proposalId: string, newStatus: string) => {
        setIsUpdatingStatus(true)
        try {
            await updateBrandProposal(proposalId, { status: newStatus })
        } catch (error) {
            console.error('Failed to update proposal status:', error)
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const handleReject = async (proposal: any) => {
        if (confirm("이 제안을 거절하시겠습니까?")) {
            await handleStatusUpdate(proposal.id, 'rejected')
        }
    }

    const fetchProductGuide = async (productId: string) => {
        // Implement product guide fetching logic
        console.log('Fetching product guide for:', productId)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">워크스페이스 아카이브</h1>
                <p className="text-muted-foreground">브랜드와 진행 중인 모든 협업을 한곳에서 관리하세요.</p>
            </div>

            <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="w-full">
                <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0">
                    <TabsTrigger value="all" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-slate-700 font-medium transition-all">
                        전체 보기 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{allWorkspaceItems.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="active" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full text-slate-700 font-medium transition-all">
                        진행중 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{allActive.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="inbound" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full transition-all">
                        받은 제안 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{inboundProposals.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="outbound" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full transition-all">
                        보낸 지원 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{outboundApplications.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full transition-all">
                        거절됨 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{rejectedProposals.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white border bg-background px-4 py-2 rounded-full transition-all">
                        완료됨 <span className="ml-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">{allCompleted.length}</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab 0: All Items */}
                <TabsContent value="all" className="space-y-4 mt-6">
                    {allWorkspaceItems.length > 0 ? (
                        allWorkspaceItems.map((proposal: any) => (
                            <Card key={proposal.id} className="p-6 border-l-4 border-l-slate-200 bg-white cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-50 border-2 border-slate-100 overflow-hidden">
                                        <span className="font-bold text-lg text-slate-400">{proposal.brand_name?.[0] || "W"}</span>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl flex items-center gap-2">
                                                    {proposal.product_name}
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {proposal.status === 'accepted' || proposal.status === 'signed' || proposal.status === 'started' ? '진행중' :
                                                            proposal.status === 'completed' ? '완료됨' :
                                                                proposal.status === 'rejected' ? '거절됨' :
                                                                    '대기중'}
                                                    </Badge>
                                                </h3>
                                                <p className="text-sm text-slate-500">{proposal.brand_name}</p>
                                            </div>
                                            <span className="text-xs text-slate-400">{new Date(proposal.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mt-4">
                                            <WorkspaceProgressBar
                                                status={proposal.status}
                                                contract_status={proposal.contract_status}
                                                delivery_status={proposal.delivery_status}
                                                content_submission_status={proposal.content_submission_status}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">내역이 없습니다.</div>
                    )}
                </TabsContent>

                {/* Tab 1: Active (In Progress) */}
                <TabsContent value="active" className="space-y-4 mt-6">
                    {allActive.length > 0 ? (
                        allActive.map((proposal: any) => (
                            <Card key={proposal.id} className="p-6 border-l-4 border-l-slate-200 bg-white cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-50 border-2 border-slate-100 overflow-hidden">
                                        <span className="font-bold text-lg text-slate-400">{proposal.brand_name?.[0] || "W"}</span>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl flex items-center gap-2">
                                                    {proposal.product_name || proposal.brand_name + " 프로젝트"}
                                                    <Badge className="bg-slate-100 text-slate-600 border border-slate-200 font-medium">진행중</Badge>
                                                </h3>
                                                <p className="text-sm text-slate-500 font-normal mt-1">{proposal.brand_name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={(e) => {
                                                    e.stopPropagation();
                                                    const pId = proposal.product_id;
                                                    if (pId) {
                                                        fetchProductGuide(pId);
                                                    } else {
                                                        setGuideProduct({
                                                            name: proposal.product_name,
                                                            selling_points: proposal.product?.selling_points || proposal.product?.points,
                                                            required_shots: proposal.product?.required_shots || proposal.product?.shots,
                                                            image_url: proposal.product?.image_url || proposal.product?.image,
                                                            content_guide: proposal.product?.content_guide,
                                                            format_guide: proposal.product?.format_guide,
                                                            tags: proposal.product?.tags,
                                                            account_tag: proposal.product?.account_tag
                                                        });
                                                        setIsProductGuideOpen(true);
                                                    }
                                                }}>
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="h-4 w-4" />
                                                        가이드 보기
                                                    </div>
                                                </Button>
                                                <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                                                    워크스페이스 입장
                                                </Button>
                                            </div>
                                        </div>

                                        {/* 6-Stage Progress Tracker */}
                                        <div className="mt-6 w-full max-w-xl">
                                            <WorkspaceProgressBar
                                                status={proposal.status}
                                                contract_status={proposal.contract_status}
                                                delivery_status={proposal.delivery_status}
                                                content_submission_status={proposal.content_submission_status}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground bg-muted/20">현재 진행중인 프로젝트가 없습니다.</div>
                    )}
                </TabsContent>

                {/* Tab 2: Inbound (Received) */}
                <TabsContent value="inbound" className="space-y-4 mt-6">
                    {inboundProposals.length > 0 ? (
                        inboundProposals.map((proposal: any) => (
                            <Card key={proposal.id} className="p-6 border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                        {proposal.brand_avatar ? (
                                            <img src={proposal.brand_avatar} alt={proposal.brand_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-emerald-600 font-bold text-xl">{proposal.brand_name?.[0] || "B"}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-xl">{proposal.brand_name}</span>
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">New Offer</Badge>
                                                    <div className="flex gap-2 ml-4">
                                                        <Button size="sm" variant="outline" className="h-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReject(proposal);
                                                        }}>거절하기</Button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{proposal.product_name} • {proposal.product_type === 'gift' ? '제품 협찬' : '대여'}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{new Date(proposal.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="bg-muted/30 p-4 rounded-lg text-sm">
                                            <span className="font-bold text-emerald-600 mr-2">{proposal.compensation_amount}</span>
                                            <span className="text-muted-foreground">{proposal.message}</span>
                                        </div>
                                        <div className="mt-4">
                                            <WorkspaceProgressBar
                                                status={proposal.status}
                                                contract_status={proposal.contract_status}
                                                delivery_status={proposal.delivery_status}
                                                content_submission_status={proposal.content_submission_status}
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70"
                                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(proposal.id, 'accepted'); }}
                                                disabled={isUpdatingStatus}
                                            >
                                                {isUpdatingStatus ? <Loader2 className="h-3 w-3 animate-spin" /> : "수락하기"}
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setChatProposal(proposal); setIsChatOpen(true); }}>상세 보기</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">아직 도착한 제안이 없습니다.</div>
                    )}
                </TabsContent>

                {/* Tab 3: Outbound (Sent) */}
                <TabsContent value="outbound" className="space-y-4 mt-6">
                    {outboundApplications.length > 0 ? (
                        outboundApplications.map((proposal: any) => (
                            <Card key={proposal.id} className="p-6 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                        {proposal.brandAvatar ? (
                                            <img src={proposal.brandAvatar} alt={proposal.brand_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-blue-600 font-bold text-xl">{proposal.brand_name?.[0] || "C"}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="div flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl">{proposal.brand_name} 캠페인</h3>
                                                <p className="text-sm text-muted-foreground mt-1">지원 메시지: "{proposal.message}"</p>
                                                <div className="mt-4">
                                                    <WorkspaceProgressBar
                                                        status={proposal.status}
                                                        contract_status={proposal.contract_status}
                                                        delivery_status={proposal.delivery_status}
                                                        content_submission_status={proposal.content_submission_status}
                                                    />
                                                </div>
                                            </div>
                                            <Badge variant="outline">지원 완료</Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">아직 지원한 캠페인이 없습니다.</div>
                    )}
                </TabsContent>

                {/* Tab 4: Rejected */}
                <TabsContent value="rejected" className="space-y-4 mt-6">
                    {rejectedProposals.length > 0 ? (
                        rejectedProposals.map((proposal: any) => (
                            <Card key={proposal.id} className="p-6 opacity-60 hover:opacity-80 transition-all bg-white border-l-4 border-l-red-200">
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 font-bold border-2 border-slate-100">
                                        {proposal.brand_name?.[0] || "R"}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-xl text-slate-800">{proposal.product_name}</h3>
                                            <Badge className="bg-red-100 text-red-600 border border-red-200 font-medium">거절됨</Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{proposal.brand_name}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">거절된 제안이 없습니다.</div>
                    )}
                </TabsContent>

                {/* Tab 5: Completed */}
                <TabsContent value="completed" className="space-y-4 mt-6">
                    {allCompleted.length > 0 ? (
                        allCompleted.map((proposal: any) => (
                            <Card key={proposal.id} className="p-6 opacity-90 hover:opacity-100 transition-all bg-white border-l-4 border-l-slate-200 cursor-pointer" onClick={() => { setChatProposal(proposal); setIsChatOpen(true); }}>
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 font-bold border-2 border-slate-100">
                                        {proposal.brand_name?.[0] || "C"}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-xl text-slate-800">{proposal.product_name}</h3>
                                            <Badge className="bg-slate-100 text-slate-600 border border-slate-200 font-medium">완료됨</Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">{proposal.brand_name} • {proposal.completed_at ? new Date(proposal.completed_at).toLocaleDateString() : '완료됨'}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">완료된 프로젝트 내역이 없습니다.</div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
