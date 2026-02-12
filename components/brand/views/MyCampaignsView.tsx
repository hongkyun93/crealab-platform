"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { Plus, Package, Bell, Pencil, Trash2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateToMonth } from "@/lib/utils"

interface MyCampaignsViewProps {
    myCampaigns: any[]
    proposals: any[]
    selectedCampaignId: string | null
    setSelectedCampaignId: (id: string | null) => void
    deleteCampaign: (id: string) => Promise<void>
    updateCampaignStatus: (id: string, status: string) => void
}

export const MyCampaignsView = React.memo(function MyCampaignsView({
    myCampaigns,
    proposals,
    selectedCampaignId,
    setSelectedCampaignId,
    deleteCampaign,
    updateCampaignStatus
}: MyCampaignsViewProps) {
    // Memoize selected campaign lookup
    const selectedCampaign = useMemo(
        () => myCampaigns.find(c => c.id === selectedCampaignId),
        [myCampaigns, selectedCampaignId]
    )

    // Memoize campaign proposals filtering
    const campaignProposals = useMemo(
        () => proposals.filter(p => p.campaignId === selectedCampaign?.id && p.type === 'creator_apply'),
        [proposals, selectedCampaign?.id]
    )

    // List View State (Moved up for Hook Rules)
    const [activeTab, setActiveTab] = React.useState<"active" | "closed">("active")

    const filteredCampaigns = useMemo(() => {
        const now = new Date()
        return myCampaigns.filter(c => {
            const isClosed = c.status === 'closed' || (c.recruitment_deadline && new Date(c.recruitment_deadline) < now)
            return activeTab === 'active' ? !isClosed : isClosed
        })
    }, [myCampaigns, activeTab])

    // Detail View
    if (selectedCampaignId && selectedCampaign) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCampaignId(null)} className="gap-1 pl-0 hover:bg-transparent hover:text-primary">
                        <ArrowRight className="h-4 w-4 rotate-180" /> 목록으로 돌아가기
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]">
                    {/* Left: Campaign Detail Card */}
                    <Card className="h-fit">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Badge variant="outline" className="w-fit">{selectedCampaign.category}</Badge>
                                    <CardTitle className="text-2xl font-bold">{selectedCampaign.product}</CardTitle>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/brand/edit/${selectedCampaign.id}`}>수정하기</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Description Box */}
                            <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
                                <h4 className="text-sm font-bold text-muted-foreground mb-3">상세 내용</h4>
                                <p className="whitespace-pre-wrap leading-relaxed text-sm">
                                    {selectedCampaign.description}
                                </p>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-4 rounded-xl">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-muted-foreground">일정</span>
                                    <p className="font-medium text-sm">{selectedCampaign.eventDate || "미정"}</p>
                                </div>
                                <span className="text-xs font-bold text-muted-foreground">모집 대상</span>
                                <p className="font-medium text-sm">{selectedCampaign.target || "전체"}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">모먼트 일정</p>
                                <p className="font-medium text-sm">{formatDateToMonth(selectedCampaign.eventDate) || "미정"}</p>
                            </div>
                            {selectedCampaign.postingDate && (
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">예상 업로드</p>
                                    <p className="font-medium text-sm">{formatDateToMonth(selectedCampaign.postingDate)}</p>
                                </div>
                            )}
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground">제공 혜택</span>
                                <p className="font-bold text-emerald-600 text-sm">{selectedCampaign.budget || "협의"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Proposals */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <Package className="h-5 w-5" /> 도착한 제안
                        </div>

                        <div className="bg-muted/10 rounded-xl border min-h-[400px] p-4">
                            {campaignProposals.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 py-10">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                        <Bell className="h-5 w-5 opacity-30" />
                                    </div>
                                    <p className="text-sm">이 캠페인에 도착한 제안이 아직 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {campaignProposals.map((p: any) => (
                                        <Card key={p.id} className="overflow-hidden hover:shadow-md transition-all border-l-4 border-l-primary">
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold overflow-hidden">
                                                            {p.influencerAvatar ? <img src={p.influencerAvatar} alt="" className="w-full h-full object-cover" /> : p.influencerName?.[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm">{p.influencerName}</div>
                                                            <div className="text-[10px] text-muted-foreground">{new Date(p.date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <Badge variant={p.status === 'accepted' ? 'default' : (p.status === 'viewed' ? 'outline' : 'secondary')} className="text-[10px] h-5">
                                                        {p.status === 'accepted' ? '수락됨' : '대기중'}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-2 space-y-2">
                                                <div className="bg-muted/30 p-2.5 rounded text-xs text-foreground/80 italic leading-relaxed">
                                                    "{p.message}"
                                                </div>
                                                <div className="flex justify-between items-center text-xs pt-1">
                                                    <span className="text-muted-foreground">희망 비용</span>
                                                    <span className="font-bold text-emerald-600">{p.cost ? `${p.cost.toLocaleString()}원` : "협의"}</span>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-2 bg-muted/5 grid grid-cols-2 gap-2">
                                                {p.status !== 'accepted' && (
                                                    <Button
                                                        size="sm"
                                                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                                        onClick={async () => {
                                                            if (confirm('수락하시겠습니까?')) {
                                                                const { updateApplicationStatus } = await import('@/app/actions/proposal')
                                                                await updateApplicationStatus(p.id.toString(), 'accepted')
                                                                alert('수락되었습니다')
                                                                window.location.reload()
                                                            }
                                                        }}
                                                    >
                                                        수락
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                                                    <Link href="/message">채팅</Link>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">내 캠페인 관리</h1>
                    <p className="text-muted-foreground mt-1">등록하신 캠페인 공고를 관리하고 지원자를 확인하세요.</p>
                </div>
                <Button asChild className="gap-2">
                    <Link href="/brand/new"><Plus className="h-4 w-4" /> 새 캠페인 등록</Link>
                </Button>
            </div>

            {/* Campaign Status Tabs */}
            <div className="flex items-center gap-2 border-b border-border/50 pb-1">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "active"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    진행중인 캠페인 ({myCampaigns.filter(c => !(c.status === 'closed' || (c.recruitment_deadline && new Date(c.recruitment_deadline) < new Date()))).length})
                </button>
                <button
                    onClick={() => setActiveTab("closed")}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "closed"
                        ? "border-slate-500 text-slate-700"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    마감/종료된 캠페인 ({myCampaigns.filter(c => c.status === 'closed' || (c.recruitment_deadline && new Date(c.recruitment_deadline) < new Date())).length})
                </button>
            </div>

            {filteredCampaigns.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold">
                        {activeTab === 'active' ? "진행중인 캠페인이 없습니다." : "마감된 캠페인이 없습니다."}
                    </h3>
                    {activeTab === 'active' && (
                        <Button asChild className="mt-4"><Link href="/brand/new">캠페인 등록하기</Link></Button>
                    )}
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredCampaigns.map((c) => {
                        const appCount = proposals.filter(p => p.campaignId === c.id && p.type === 'creator_apply').length
                        return (
                            <Card
                                key={c.id}
                                className={`group hover:shadow-md transition-all cursor-pointer border-border/60 overflow-hidden ${c.status === 'closed' ? 'opacity-75 bg-slate-50' : ''}`}
                                onClick={() => setSelectedCampaignId(c.id)}
                            >
                                <div className="flex flex-col md:flex-row h-full">
                                    {/* Image Section */}
                                    {c.image && c.image !== "📦" && (
                                        <div className="w-full md:w-48 h-32 md:h-auto bg-muted/20 shrink-0 relative">
                                            <img src={c.image} alt={c.product} className={`w-full h-full object-cover ${c.status === 'closed' ? 'grayscale' : ''}`} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
                                            <div className="absolute bottom-2 left-2 md:hidden">
                                                <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm shadow-sm">
                                                    {c.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {/* Main Content */}
                                    <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                                        <div>
                                            {/* Header Row */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className="hidden md:inline-flex text-xs font-normal bg-slate-50">{c.category}</Badge>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.status === 'active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                                                        {c.status === 'active' ? '● 모집중' : '● 마감됨'}
                                                    </span>
                                                    {(() => {
                                                        if (!c.recruitment_deadline) return null;
                                                        const today = new Date();
                                                        const dDay = Math.ceil((new Date(c.recruitment_deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                                        return (
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${dDay < 0 ? 'bg-slate-200 text-slate-500' : dDay <= 3 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
                                                                {dDay < 0 ? '마감' : `D-${dDay}`}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                                {/* Channels */}
                                                <div className="flex gap-1">
                                                    {c.channels?.map((channel: string) => (
                                                        <div key={channel} className="text-sm bg-slate-100 p-1 rounded-md" title={channel}>
                                                            {channel === 'instagram' && '📸'}
                                                            {channel === 'youtube' && '▶️'}
                                                            {channel === 'tiktok' && '🎵'}
                                                            {channel === 'blog' && '📝'}
                                                            {channel === 'shorts' && '⚡'}
                                                            {channel === 'reels' && '🎞️'}
                                                            {!['instagram', 'youtube', 'tiktok', 'blog', 'shorts', 'reels'].includes(channel) && channel}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <h3 className="text-lg md:text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-1">{c.product}</h3>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-sm text-slate-600">
                                                <div className="space-y-0.5">
                                                    <div className="text-[10px] font-bold text-slate-400">제공 혜택</div>
                                                    <div className={c.status === 'active' ? "text-emerald-600 font-bold text-xs" : "text-slate-600 font-bold text-xs"}>{c.budget || "협의"}</div>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-[10px] font-bold text-slate-400">모집 인원</div>
                                                    <div className="font-medium text-xs text-slate-900">{c.recruitment_count ? `${c.recruitment_count}명` : '-'}</div>
                                                </div>
                                                <div className="space-y-0.5 col-span-2 md:col-span-1">
                                                    <div className="text-[10px] font-bold text-slate-400">모집 대상</div>
                                                    <div className="truncate text-xs text-slate-900">{c.target || "전체"}</div>
                                                </div>
                                                <div className="space-y-0.5 hidden md:block">
                                                    <div className="text-[10px] font-bold text-slate-400">예상 업로드</div>
                                                    <div className="text-xs text-slate-900">{formatDateToMonth(c.postingDate) || '협의'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Action Area */}
                                    <div className="border-t md:border-t-0 md:border-l p-4 md:w-40 bg-slate-50/50 flex flex-row md:flex-col items-center justify-between md:justify-center gap-3 shrink-0">
                                        <div className="text-center flex items-center md:block gap-2 md:gap-0">
                                            <div className="text-[10px] text-muted-foreground md:mb-1">도착한 제안</div>
                                            <div className={`text-lg font-bold ${appCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {appCount}
                                            </div>
                                        </div>

                                        <div className="flex gap-1 md:flex-col md:w-full" onClick={e => e.stopPropagation()}>
                                            <Button variant="outline" size="sm" className="h-8 md:w-full text-xs" asChild>
                                                <Link href={`/brand/edit/${c.id}`}>수정</Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 px-2 text-xs md:w-full ${c.status === 'active' ? 'text-slate-500 hover:text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (confirm(c.status === 'active' ? "캠페인을 마감하시겠습니까?" : "캠페인을 다시 진행하시겠습니까?")) {
                                                        updateCampaignStatus(c.id.toString(), c.status === 'active' ? 'closed' : 'active')
                                                    }
                                                }}
                                            >
                                                {c.status === 'active' ? '마감하기' : '재진행'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
})
