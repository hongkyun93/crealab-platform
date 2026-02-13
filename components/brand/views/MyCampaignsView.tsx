"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, Package, Bell, Pencil, Trash2, ArrowRight, Calendar, FileText, Gift, Megaphone, Send, User, X, CheckCircle2, Instagram, Youtube, MessageCircle, Hash, Link as LinkIcon, Users, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateToMonth } from "@/lib/utils"
import { CampaignDetailContent } from "@/components/campaign/campaign-detail-content"

interface MyCampaignsViewProps {
    myCampaigns: any[]
    campaignProposals: any[]
    selectedCampaignId: string | null
    setSelectedCampaignId: (id: string | null) => void
    deleteCampaign: (id: string) => Promise<void>
    updateCampaignStatus: (id: string, status: string) => void
    refreshData?: () => Promise<void>
}

export const MyCampaignsView = React.memo(function MyCampaignsView({
    myCampaigns,
    campaignProposals,
    selectedCampaignId,
    setSelectedCampaignId,
    deleteCampaign,
    updateCampaignStatus,
    refreshData
}: MyCampaignsViewProps) {
    const router = useRouter()
    const [isImageUploading, setIsImageUploading] = React.useState(false)
    const [optimisticImage, setOptimisticImage] = React.useState<string | null>(null)
    const supabase = createClient()

    // Reset optimistic image when selection changes
    React.useEffect(() => {
        setOptimisticImage(null)
    }, [selectedCampaignId])

    const handleImageUpload = async (file: File) => {
        if (!file || !selectedCampaign) return

        if (file.size > 5 * 1024 * 1024) {
            alert("파일 크기는 5MB 이하여야 합니다.")
            return
        }

        setIsImageUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `campaign-images/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('campaigns')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('campaigns')
                .getPublicUrl(filePath)

            // Optimistic Update
            setOptimisticImage(publicUrl)

            // Update campaign image in DB
            const { error: updateError } = await supabase
                .from('campaigns')
                .update({ image: publicUrl })
                .eq('id', selectedCampaign.id)

            if (updateError) throw updateError

            // Refresh data
            if (refreshData) await refreshData()
            else router.refresh()

            alert("캠페인 이미지가 변경되었습니다.")
        } catch (error: any) {
            console.error("Image upload error:", error)
            alert(`이미지 업로드 실패: ${error.message || "알 수 없는 오류"}`)
        } finally {
            setIsImageUploading(false)
        }
    }
    // Memoize selected campaign lookup
    const selectedCampaign = useMemo(
        () => myCampaigns.find(c => c.id === selectedCampaignId),
        [myCampaigns, selectedCampaignId]
    )

    // Merge optimistic image if exists
    const displayCampaign = React.useMemo(() => {
        if (!selectedCampaign) return null
        if (optimisticImage) {
            return { ...selectedCampaign, image: optimisticImage }
        }
        return selectedCampaign
    }, [selectedCampaign, optimisticImage])

    // Memoize campaign proposals filtering
    const filteredProposals = useMemo(
        () => campaignProposals.filter(p => p.campaignId === selectedCampaign?.id && p.type === 'creator_apply'),
        [campaignProposals, selectedCampaign?.id]
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
        const today = new Date()
        const dDay = selectedCampaign.recruitment_deadline
            ? Math.ceil((new Date(selectedCampaign.recruitment_deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            : null

        const CHANNELS = [
            { id: "instagram", label: "인스타그램", icon: "📸" },
            { id: "youtube", label: "유튜브", icon: "▶️" },
            { id: "tiktok", label: "틱톡", icon: "🎵" },
            { id: "blog", label: "블로그", icon: "📝" },
            { id: "shorts", label: "유튜브 숏츠", icon: "⚡" },
            { id: "reels", label: "인스타 릴스", icon: "🎞️" }
        ]
        const getChannelLabel = (id: string) => CHANNELS.find(c => c.id === id)?.label || id
        const getChannelIcon = (id: string) => CHANNELS.find(c => c.id === id)?.icon || ""

        return (
            <div className="w-full space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCampaignId(null)} className="gap-1 pl-0 hover:bg-transparent hover:text-primary">
                        <ArrowRight className="h-4 w-4 rotate-180" /> 목록으로 돌아가기
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                    {/* Left: Campaign Detail Card (Refactored to match Dialog UI) */}
                    {/* Left: Campaign Detail Card (Refactored to match Dialog UI) */}
                    <div className="h-[calc(100vh-200px)] min-h-[600px] border rounded-xl overflow-hidden shadow-sm flex flex-col bg-card">
                        <CampaignDetailContent
                            campaign={displayCampaign}
                            onImageUpload={handleImageUpload}
                            isUploading={isImageUploading}
                            className="" // Let it use default grid behavior
                            renderHeaderSideAction={() => (
                                <Button variant="secondary" size="sm" asChild className="h-9 px-4 text-xs font-semibold shadow-lg hover:bg-white shrink-0">
                                    <Link href={`/brand/edit/${displayCampaign.id}`}>
                                        <Pencil className="h-3.5 w-3.5 mr-1.5" /> 캠페인 수정
                                    </Link>
                                </Button>
                            )}
                        />

                    </div>

                    {/* Right: Proposals */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-lg">
                            <Package className="h-5 w-5" /> 도착한 제안
                        </div>

                        <div className="bg-muted/10 rounded-xl border min-h-[400px] p-4">
                            {filteredProposals.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 py-10">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                        <Bell className="h-5 w-5 opacity-30" />
                                    </div>
                                    <p className="text-sm">이 캠페인에 도착한 제안이 아직 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredProposals.map((p: any) => (
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
                </div >
            </div >
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">캠페인 관리</h1>
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
                        ? "border-muted-foreground text-foreground"
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
                        const appCount = campaignProposals.filter(p => p.campaignId === c.id && p.type === 'creator_apply').length
                        return (
                            <Card
                                key={c.id}
                                className={`group hover:shadow-md transition-all cursor-pointer border-border/60 overflow-hidden bg-card ${c.status === 'closed' ? 'opacity-75 bg-muted/30' : ''}`}
                                onClick={() => setSelectedCampaignId(c.id)}
                            >
                                <div className="flex flex-col md:flex-row h-full">
                                    {/* Image Section */}
                                    {(c.image && c.image !== "📦") || c.product_image_url ? (
                                        <div className="w-full md:w-48 h-32 md:h-auto bg-muted/20 shrink-0 relative flex items-center justify-center overflow-hidden">
                                            <img src={c.image && c.image !== "📦" ? c.image : c.product_image_url} alt={c.product} className={`w-full h-full object-cover transition-transform hover:scale-105 duration-500 ${c.status === 'closed' ? 'grayscale' : ''}`} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
                                            <div className="absolute bottom-2 left-2 md:hidden">
                                                <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm shadow-sm">
                                                    {c.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    ) : (
                                        // Placeholder if no image at all
                                        <div className="w-full md:w-48 h-32 md:h-auto bg-muted flex items-center justify-center shrink-0">
                                            <Package className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                    )}

                                    {/* Main Content */}
                                    {/* Main Content */}
                                    <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                                        <div>
                                            {/* Header Row */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className="hidden md:inline-flex text-xs font-normal bg-muted/50">{c.category}</Badge>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.status === 'active' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30' : 'text-muted-foreground bg-muted border-border'}`}>
                                                        {c.status === 'active' ? '● 모집중' : '● 마감됨'}
                                                    </span>
                                                    {(() => {
                                                        if (!c.recruitment_deadline) return null;
                                                        const today = new Date();
                                                        const dDay = Math.ceil((new Date(c.recruitment_deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                                        return (
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${dDay < 0 ? 'bg-muted text-muted-foreground' : dDay <= 3 ? 'bg-red-100 text-red-600 animate-pulse dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                                                {dDay < 0 ? '마감' : `D-${dDay}`}
                                                            </span>
                                                        );
                                                    })()}

                                                    {/* Top Row Extra Info (To save space) */}
                                                    <div className="hidden xl:flex items-center gap-2 text-[10px] text-muted-foreground border-l pl-2 ml-1">
                                                        {c.selection_announcement_date && <span>선정발표 : {c.selection_announcement_date}</span>}
                                                        {(c.min_followers || c.max_followers) && <span>| 지원조건 : 팔로워 {c.min_followers ? c.min_followers.toLocaleString() : '0'} ~ {c.max_followers ? c.max_followers.toLocaleString() : '제한없음'}</span>}
                                                    </div>
                                                    {c.reference_link && (
                                                        <a href={c.reference_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                                                            <LinkIcon className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                                {/* Channels */}
                                                <div className="flex gap-1">
                                                    {c.channels?.map((channel: string) => (
                                                        <div key={channel} className="text-sm bg-muted p-1 rounded-md" title={channel}>
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

                                            {/* Title & Hashtags */}
                                            <div className="mb-3">
                                                <h3 className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{c.title || c.product}</h3>
                                                {c.title && c.product && (
                                                    <div className="text-xs text-muted-foreground mb-1">{c.product}</div>
                                                )}
                                                {c.hashtags && c.hashtags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {c.hashtags.slice(0, 4).map((tag: string, i: number) => (
                                                            <span key={i} className="text-[10px] text-muted-foreground/80">#{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Grid - Restored to 4 Cols (Single Row on PC) */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-sm text-muted-foreground">
                                                <div className="space-y-0.5">
                                                    <div className="text-[10px] font-bold text-muted-foreground/70">제공 혜택</div>
                                                    <div className={c.status === 'active' ? "text-emerald-600 font-bold text-xs" : "text-muted-foreground font-bold text-xs"}>{c.budget || "협의"}</div>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-[10px] font-bold text-muted-foreground/70">모집 인원</div>
                                                    <div className="font-medium text-xs text-foreground">{c.recruitment_count ? `${c.recruitment_count}명` : '-'}</div>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-[10px] font-bold text-muted-foreground/70">모집 대상</div>
                                                    <div className="truncate text-xs text-foreground">{c.target || "전체"}</div>
                                                </div>
                                                <div className="space-y-0.5 hidden md:block">
                                                    <div className="text-[10px] font-bold text-muted-foreground/70">예상 업로드</div>
                                                    <div className="text-xs text-foreground">{formatDateToMonth(c.postingDate) || '협의'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Action Area */}
                                    <div className="border-t md:border-t-0 md:border-l p-4 md:w-40 bg-muted/20 flex flex-row md:flex-col items-center justify-between md:justify-center gap-3 shrink-0">
                                        <div className="text-center flex items-center md:block gap-2 md:gap-0">
                                            <div className="text-[10px] text-muted-foreground md:mb-1">도착한 제안</div>
                                            <div className={`text-lg font-bold ${appCount > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
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
                                                className={`h-8 px-2 text-xs md:w-full ${c.status === 'active' ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
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
