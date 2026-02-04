"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Briefcase, Calendar, ChevronRight, Plus, Rocket, Settings, ShoppingBag, User, Trash2, Pencil, BadgeCheck, Search, ExternalLink } from "lucide-react"
import Link from "next/link"
import { usePlatform } from "@/components/providers/platform-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

// Removed static MY_EVENTS


const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

import { Suspense } from "react"

function InfluencerDashboardContent() {
    const {
        user, updateUser, campaigns, events, isLoading, notifications, resetData,
        brandProposals, updateBrandProposal, sendMessage, messages: allMessages, deleteEvent,
        products
    } = usePlatform()
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialView = searchParams.get('view') || "dashboard"
    const [currentView, setCurrentView] = useState(initialView)
    const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null)

    // Filter events (Admins see all, users see theirs)
    const displayEvents = user?.type === 'admin' ? events : (user ? events.filter((e: any) => e.influencerId === user.id) : [])
    const pastMoments = displayEvents.filter((e: any) => e.status === 'completed')
    const upcomingMoments = displayEvents.filter((e: any) => e.status !== 'completed')
    const myEvents = user ? events.filter((e: any) => e.influencerId === user.id) : [] // For personal stats

    const filteredProposalsByMoment = selectedMomentId
        ? (brandProposals?.filter((p: any) => p.event_id === selectedMomentId) || [])
        : []

    // Profile Edit States
    const [editName, setEditName] = useState("")
    const [editBio, setEditBio] = useState("")
    const [editHandle, setEditHandle] = useState("")
    const [editFollowers, setEditFollowers] = useState<string>("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)

    // Chat states
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatProposal, setChatProposal] = useState<any>(null)
    const [chatMessage, setChatMessage] = useState("")
    const [activeProposalTab, setActiveProposalTab] = useState<string>("new")
    const [productSearchQuery, setProductSearchQuery] = useState("")

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.brandName?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearchQuery.toLowerCase())
    ) || []

    // Initialize state when user loads or view changes
    useEffect(() => {
        if (user) {
            setEditName(user.name || "")
            setEditBio(user.bio || "")
            setEditHandle(user.handle || "")
            setEditFollowers(user.followers?.toString() || "")
            setSelectedTags(user.tags || [])
        }
    }, [user, currentView])

    // Onboarding Check: Automatically show settings if crucial info is missing
    useEffect(() => {
        if (user && !isLoading && user.type === 'influencer') {
            // Only force settings if name or handle is truly missing
            const isMissingInfo = !user.handle || !user.name
            if (isMissingInfo && currentView !== 'settings' && initialView !== 'settings' && currentView !== 'profile') {
                setCurrentView("settings")
            }
        }
    }, [user, isLoading, currentView, initialView])

    // Sync currentView with URL changes (e.g., when clicking "View Profile" from header)
    useEffect(() => {
        const view = searchParams.get('view')
        if (view && view !== currentView) {
            setCurrentView(view)
        }
    }, [searchParams, currentView])


    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [isLoading, user, router])

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    if (!user) return null



    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            await updateUser({
                name: editName,
                bio: editBio,
                handle: editHandle,
                followers: parseInt(editFollowers) || 0,
                tags: selectedTags
            })
            setShowSuccessDialog(true)
        } catch (e) {
            console.error("Save profile error:", e)
            alert("프로필 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleStatusUpdate = async (proposalId: string, status: string) => {
        await updateBrandProposal(proposalId, status)
        if (status === 'accepted' || status === 'pending') {
            const proposal = brandProposals.find(p => p.id === proposalId)
            if (proposal) {
                setChatProposal(proposal)
                setIsChatOpen(true)

                // Send confirmation message to brand
                if (status === 'accepted') {
                    await sendMessage(proposal.brand_id, "협업 제안을 수락했습니다! 대화를 통해 상세 내용을 협의해요.")
                }
            }
        }
    }

    const renderProposalCard = (proposalId: string) => {
        const proposal = brandProposals?.find(p => p.id === proposalId)
        if (!proposal) return null

        return (
            <Card className="mt-2 border-primary/20 bg-primary/5 p-4 space-y-3 max-w-sm shadow-sm group hover:border-primary/40 transition-all text-foreground">
                <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">COLLABORATION PROPOSAL</span>
                    <BadgeCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">{proposal.product_name}</h4>
                    <p className="text-[11px] text-muted-foreground">{proposal.product_type === 'gift' ? '제품 협찬' : '제품 대여'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/50 p-2 rounded">
                    <div>
                        <p className="text-muted-foreground">제시 원고료</p>
                        <p className="font-bold text-emerald-600 font-mono">{proposal.compensation_amount}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">희망 채널</p>
                        <p className="font-medium">{proposal.content_type}</p>
                    </div>
                </div>
                <div className="bg-white/80 p-2 rounded text-[11px] text-muted-foreground italic line-clamp-2">
                    "{proposal.message}"
                </div>
                <Button variant="outline" size="sm" className="w-full text-[10px] h-7 font-bold border-primary/30 text-primary hover:bg-primary/10">
                    상태: {proposal.status === 'accepted' ? '수락됨' : '제안됨'}
                </Button>
            </Card>
        )
    }

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || !chatProposal) return
        await sendMessage(chatProposal.brand_id, chatMessage)
        setChatMessage("")
    }

    const filteredProposals = (status: string) => {
        if (status === 'new') return brandProposals?.filter(p => (!p.status || p.status === 'offered') && p.influencer_id === user.id)
        if (status === 'applied') return brandProposals?.filter(p => p.status === 'applied' && p.influencer_id === user.id)
        return brandProposals?.filter(p => p.status === status && p.influencer_id === user.id)
    }


    const handleFollowerPreset = (val: number) => {
        setEditFollowers(val.toString())
    }

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    const renderContent = () => {
        switch (currentView) {
            case "profile":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold tracking-tight">내 프로필 미리보기</h1>
                            <Button onClick={() => setCurrentView('settings')}>편집하기</Button>
                        </div>

                        <Card className="overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                            <CardContent className="relative pt-12 pb-8 px-6">
                                <div className="absolute -top-12 left-6 h-24 w-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center font-bold text-3xl text-primary">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        user.name[0]
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold">{user.name}</h2>
                                        {user.handle && <span className="text-primary font-medium">{user.handle}</span>}
                                    </div>
                                    <p className="text-muted-foreground">{user.bio || "아직 소개글이 없습니다."}</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-primary">{user.followers?.toLocaleString() || 0}</div>
                                        <div className="text-xs text-muted-foreground">팔로워</div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-primary">{myEvents.length}</div>
                                        <div className="text-xs text-muted-foreground">등록된 모먼트</div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-emerald-600">{brandProposals?.filter((p: any) => p.status === 'accepted').length || 0}</div>
                                        <div className="text-xs text-muted-foreground">진행중 협업</div>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-indigo-600">{user.tags?.length || 0}</div>
                                        <div className="text-xs text-muted-foreground">보유 태그</div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Rocket className="h-4 w-4 text-primary" /> 활동 키워드
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.tags && user.tags.length > 0 ? (
                                            user.tags.map((tag: string) => (
                                                <div key={tag} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                                                    {tag}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">아직 태그가 설정되지 않았습니다.</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            case "dashboard":
                return (
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold tracking-tight">내 모먼트 관리</h1>
                            <Button className="gap-2" asChild>
                                <Link href="/creator/new">
                                    <Plus className="h-4 w-4" /> 새 모먼트 만들기
                                </Link>
                            </Button>
                        </div>

                        {/* Selected Moment Detail View */}
                        {selectedMomentId ? (
                            <div className="grid gap-6 md:grid-cols-[2fr_1fr] animate-in slide-in-from-bottom-4 duration-500">
                                {/* Left: Moment Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedMomentId(null)} className="h-8">
                                            <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> 목록으로
                                        </Button>
                                    </div>
                                    {/* Find the selected moment */}
                                    {upcomingMoments.find(e => e.id === selectedMomentId) && (
                                        <Card className="p-6 border-l-4 border-l-primary shadow-md">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs font-semibold text-primary mb-1 block">
                                                        {upcomingMoments.find(e => e.id === selectedMomentId)?.category}
                                                    </span>
                                                    <h2 className="text-2xl font-bold">
                                                        {upcomingMoments.find(e => e.id === selectedMomentId)?.event}
                                                    </h2>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/creator/edit/${selectedMomentId}`}>
                                                        수정하기
                                                    </Link>
                                                </Button>
                                            </div>
                                            <p className="text-muted-foreground mb-6 whitespace-pre-wrap leading-relaxed bg-muted/30 p-4 rounded-md">
                                                {upcomingMoments.find(e => e.id === selectedMomentId)?.description}
                                            </p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-muted/50 p-3 rounded-md">
                                                    <span className="text-muted-foreground block mb-1">일정</span>
                                                    <span className="font-semibold">{upcomingMoments.find(e => e.id === selectedMomentId)?.date}</span>
                                                </div>
                                                <div className="bg-muted/50 p-3 rounded-md">
                                                    <span className="text-muted-foreground block mb-1">희망 제품</span>
                                                    <span className="font-semibold">{upcomingMoments.find(e => e.id === selectedMomentId)?.targetProduct}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </div>

                                {/* Right: Proposals List */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                        도착한 제안
                                    </h3>
                                    <div className="space-y-3">
                                        {filteredProposalsByMoment.length > 0 ? (
                                            filteredProposalsByMoment.map((proposal: any) => (
                                                <Card
                                                    key={proposal.id}
                                                    className="p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                                                    onClick={() => {
                                                        setChatProposal(proposal)
                                                        setIsChatOpen(true)
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="font-bold text-sm truncate pr-2">
                                                            {proposal.brand_name || "익명 브랜드"}
                                                        </div>
                                                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                                                            {new Date(proposal.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-emerald-600 mb-1">
                                                        {proposal.product_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        "{proposal.message}"
                                                    </p>
                                                    <div className="mt-3 text-xs w-full text-right text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                                        자세히 보기 →
                                                    </div>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 bg-muted/20 rounded-lg border-dashed border">
                                                <p className="text-sm text-muted-foreground">이 일정에 도착한 제안이 아직 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Stats Overview */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCurrentView('past_moments')}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">지나간 모먼트</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{pastMoments.length}</div>
                                            <p className="text-xs text-muted-foreground mt-1">완료된 모먼트 기록 확인</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCurrentView('proposals')}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">받은 제안</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{brandProposals?.length || 0}</div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {brandProposals?.filter(p => !p.status || p.status === 'offered').length}개의 신규 제안
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">프로필 조회수</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">128</div>
                                            <p className="text-xs text-muted-foreground mt-1">지난주 대비 +14%</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Upcoming Moments List */}
                                <section className="space-y-4">
                                    <h2 className="text-xl font-semibold">다가오는 모먼트</h2>
                                    <div className="grid gap-4">
                                        <div className="grid gap-4">
                                            {upcomingMoments.length === 0 ? (
                                                <div className="text-center py-10 border rounded-lg border-dashed text-muted-foreground">
                                                    등록된 다가오는 모먼트가 없습니다. 새로운 모먼트를 등록해보세요!
                                                </div>
                                            ) : upcomingMoments.map((event) => (
                                                <Card
                                                    key={event.id}
                                                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                                                    onClick={() => setSelectedMomentId(event.id as any)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg font-bold bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors`}>
                                                            {event.date.includes("월") ? event.date.split(" ")[0] : "D-Day"}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{event.event}</h3>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <span>모집중</span>
                                                                <span>•</span>
                                                                <span>{event.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                                        <div className="text-right hidden md:block">
                                                            <div className="font-medium text-emerald-600">
                                                                {brandProposals?.filter((p: any) => p.event_id === event.id).length || 0}개의 제안
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">확인하기 →</div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteEvent(event.id);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Recommended Matches from Context */}
                                <section className="space-y-4">
                                    <h2 className="text-xl font-semibold">추천 브랜드 매칭</h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {campaigns.map((getCampaign) => (
                                            <Link key={getCampaign.id} href={`/campaign/${getCampaign.id}`}>
                                                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex gap-4">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
                                                                {getCampaign.brand[0]}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold">{getCampaign.product}</h3>
                                                                <p className="text-sm text-emerald-500 font-medium">
                                                                    {getCampaign.matchScore ? `${getCampaign.matchScore}% 일치` : '매칭 분석 중'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {getCampaign.brand} • {getCampaign.budget}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button size="icon" variant="ghost">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                )
            case "proposals":
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <h1 className="text-3xl font-bold tracking-tight">협업 제안 관리</h1>
                            <p className="text-muted-foreground">도착한 제안을 관리하고 브랜드와 대화하세요.</p>
                        </div>

                        {/* Proposal Status Tabs */}
                        <Tabs defaultValue="new" value={activeProposalTab} onValueChange={setActiveProposalTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-5 lg:max-w-2xl">
                                <TabsTrigger value="new">받은 제안</TabsTrigger>
                                <TabsTrigger value="applied">내 지원</TabsTrigger>
                                <TabsTrigger value="accepted">수락됨</TabsTrigger>
                                <TabsTrigger value="pending">보류됨</TabsTrigger>
                                <TabsTrigger value="rejected">거절됨</TabsTrigger>
                            </TabsList>

                            {["new", "applied", "accepted", "pending", "rejected"].map((tab: any) => (
                                <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
                                    {filteredProposals(tab)?.length > 0 ? (
                                        filteredProposals(tab).map((proposal: any) => (
                                            <Card
                                                key={proposal.id}
                                                className="p-6 overflow-hidden relative border-l-4 border-l-primary/30 cursor-pointer hover:shadow-lg hover:border-l-primary transition-all"
                                                onClick={() => {
                                                    setChatProposal(proposal)
                                                    setIsChatOpen(true)
                                                }}
                                            >
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xl">
                                                        {proposal.brand_name?.[0] || "B"}
                                                    </div>
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                            <div>
                                                                <h3 className="font-bold text-xl">{proposal.brand_name}</h3>
                                                                <p className="text-sm text-primary font-semibold mt-0.5">
                                                                    {proposal.product_name} • {proposal.product_type === 'gift' ? '제품 협찬' : '대여'}
                                                                </p>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                                {new Date(proposal.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                                                            <div>
                                                                <span className="text-muted-foreground block mb-1">제시 보상</span>
                                                                <span className="font-bold text-emerald-600">{proposal.compensation_amount}</span>
                                                                {proposal.has_incentive && <span className="text-[11px] ml-1">(+인센티브 별도)</span>}
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground block mb-1">희망 콘텐츠</span>
                                                                <span className="font-medium">{proposal.content_type || "별도 협의"}</span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 italic text-sm text-foreground/80">
                                                            "{proposal.message}"
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                                                            {tab === 'new' && (
                                                                <>
                                                                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => handleStatusUpdate(proposal.id, 'accepted')}>수락하기</Button>
                                                                    <Button variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold" onClick={() => handleStatusUpdate(proposal.id, 'pending')}>보류하기</Button>
                                                                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold" onClick={() => handleStatusUpdate(proposal.id, 'rejected')}>거절하기</Button>
                                                                </>
                                                            )}
                                                            {tab === 'applied' && (
                                                                <Button variant="secondary" disabled className="font-bold">응답 대기 중</Button>
                                                            )}
                                                            {(tab === 'accepted' || tab === 'pending') && (
                                                                <Button
                                                                    className="gap-2"
                                                                    onClick={() => {
                                                                        setChatProposal(proposal)
                                                                        setIsChatOpen(true)
                                                                    }}
                                                                >
                                                                    <Briefcase className="h-4 w-4" /> 브랜드와 대화하기
                                                                </Button>
                                                            )}
                                                            {tab === 'rejected' && (
                                                                <Button variant="ghost" disabled>거절된 제안입니다</Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card className="p-12 text-center bg-muted/20 border-dashed">
                                            <div className="mx-auto w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                                                <Briefcase className="h-8 w-8" />
                                            </div>
                                            <h3 className="font-semibold text-lg">이 함에는 아직 제안이 없습니다.</h3>
                                            <p className="text-muted-foreground">다른 탭을 확인하거나 프로필을 더 매력적으로 꾸며보세요!</p>
                                        </Card>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>

                    </div>
                )


            case "past_moments":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')}>
                                <ChevronRight className="h-4 w-4 rotate-180" /> 돌아가기
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">지나간 모먼트</h1>
                        </div>
                        <div className="grid gap-4">
                            {pastMoments.length === 0 ? (
                                <div className="text-center py-10 border rounded-lg border-dashed text-muted-foreground">
                                    완료된 모먼트가 없습니다.
                                </div>
                            ) : pastMoments.map((event) => (
                                <Card key={event.id} className="opacity-75">
                                    <CardHeader>
                                        <CardTitle>{event.event}</CardTitle>
                                        <CardDescription>{event.eventDate}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">완료된 모먼트입니다.</p>
                                        <p className="text-xs text-muted-foreground mt-2">{event.postingDate} (업로드 완료)</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            case "analysis":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold tracking-tight">성장 분석</h1>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4">팔로워 성장 추이</h3>
                                <div className="h-[200px] flex items-end justify-between gap-2 px-4 pb-2 border-b">
                                    {[40, 55, 45, 70, 85, 90, 100].map((h, i) => (
                                        <div key={i} className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </Card>
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4">참여율 분석</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span>평균 좋아요</span>
                                        <span className="font-bold">1,240</span>
                                    </div>
                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                        <div className="bg-pink-500 h-full w-[70%]"></div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>평균 댓글</span>
                                        <span className="font-bold">85</span>
                                    </div>
                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                        <div className="bg-pink-500 h-full w-[45%]"></div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )
            case "notifications":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold tracking-tight">알림</h1>
                        <div className="space-y-2">
                            {notifications && notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div key={notif.id} className="p-4 bg-white dark:bg-card border rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                                        <div className={`w-2 h-2 mt-2 rounded-full ${notif.read ? "bg-gray-300" : "bg-red-500"}`}></div>
                                        <div>
                                            <p className="text-sm">{notif.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{notif.date}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                                    새로운 알림이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                )
            case "settings":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold tracking-tight">프로필 설정</h1>
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle>기본 정보</CardTitle>
                                <CardDescription>브랜드에게 보여질 나의 프로필 정보를 수정합니다.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">활동명 (닉네임)</Label>
                                    <Input
                                        id="name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="이름을 입력하세요"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="handle">핸들 (ID)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                                        <Input
                                            id="handle"
                                            value={editHandle.replace(/^@/, '')} // Display without @
                                            onChange={(e) => {
                                                // Always save with @ internally
                                                const val = e.target.value.replace(/[^a-zA-Z0-9_.]/g, '') // Basic sanitization
                                                setEditHandle(`@${val}`)
                                            }}
                                            placeholder="username"
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="followers">팔로워 수</Label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            id="followers"
                                            type="number"
                                            value={editFollowers}
                                            onChange={(e) => setEditFollowers(e.target.value)}
                                            placeholder="Ex: 10000"
                                            className="max-w-[200px]"
                                        />
                                        <span className="text-sm text-muted-foreground">명</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {[
                                            { label: "나노 (<1만)", val: 1000 },
                                            { label: "마이크로 (1~10만)", val: 10000 },
                                            { label: "매크로 (10~100만)", val: 100000 },
                                            { label: "메가 (>100만)", val: 1000000 }
                                        ].map((preset) => (
                                            <Button
                                                key={preset.label}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleFollowerPreset(preset.val)}
                                                className="rounded-full text-xs"
                                            >
                                                {preset.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        인스타그램, 유튜브 등 주요 채널의 팔로워 수를 입력해주세요.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">한줄 소개</Label>
                                    <Textarea
                                        id="bio"
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        placeholder="나를 표현하는 멋진 한마디를 적어주세요."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>관심 태그 (전문 분야)</Label>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {POPULAR_TAGS.map(tag => (
                                            <Button
                                                key={tag}
                                                type="button"
                                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleTag(tag)}
                                                className={`rounded-full transition-all ${selectedTags.includes(tag) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                {tag}
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-1">
                                        선택된 태그: {selectedTags.length > 0 ? selectedTags.join(", ") : "없음"}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveProfile} disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    저장하기
                                </Button>
                            </CardFooter>
                        </Card>

                        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>저장 완료</DialogTitle>
                                    <DialogDescription>
                                        프로필 정보가 성공적으로 업데이트되었습니다.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button onClick={() => {
                                        setShowSuccessDialog(false)
                                        setCurrentView("dashboard")
                                    }}>
                                        확인
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )
            case "discover-products":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">브랜드 제품 둘러보기</h1>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    마음에 들면 광고나 공구를 먼저 제안해보세요.
                                </p>
                            </div>
                            <div className="flex w-full max-w-sm items-center space-x-2">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="브랜드, 제품명 검색"
                                        className="pl-9"
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <Card className="p-20 text-center border-dashed bg-muted/20">
                                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">검색 결과가 없습니다.</h3>
                            </Card>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <Link href={`/creator/products/${product.id}`} key={product.id}>
                                        <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 bg-background border-border/60 group">
                                            <div className="aspect-square bg-muted flex items-center justify-center text-6xl overflow-hidden relative">
                                                {product.image?.startsWith('http') ? (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <span className="transition-transform group-hover:scale-125">{product.image || "📦"}</span>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button variant="secondary" size="sm" className="font-bold">자세히 보기</Button>
                                                </div>
                                            </div>
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-primary uppercase tracking-tight truncate max-w-[120px]">{product.brandName || "브랜드"}</span>
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium">{product.category}</Badge>
                                                </div>
                                                <CardTitle className="text-sm font-bold line-clamp-2 leading-tight h-10">
                                                    {product.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-1">
                                                <p className="font-extrabold text-lg text-foreground">
                                                    {product.price > 0 ? `${product.price.toLocaleString()}원` : "가격 미정"}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0 text-[10px] font-bold text-muted-foreground uppercase flex items-center border-t mt-2 pt-3">
                                                <span className="text-primary group-hover:underline">협업 제안하기</span>
                                                <ChevronRight className="ml-auto h-3 w-3 text-primary" />
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

                    {/* Sidebar (Desktop) */}
                    <aside className="hidden lg:flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2 py-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                            <div>
                                <h2 className="font-bold">{user?.name || "사용자"}</h2>
                                <p className="text-xs text-muted-foreground">{user?.handle || "핸들 없음"}</p>
                            </div>
                        </div>
                        <nav className="space-y-2">
                            <Button
                                variant={currentView === "dashboard" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("dashboard")}
                            >
                                <Calendar className="mr-2 h-4 w-4" /> 내 모먼트
                            </Button>
                            <Button
                                variant={currentView === "proposals" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("proposals")}
                            >
                                <Briefcase className="mr-2 h-4 w-4" /> 브랜드 제안
                            </Button>
                            <Button
                                variant={currentView === "discover-products" ? "secondary" : "ghost"}
                                className="w-full justify-start text-primary font-medium"
                                onClick={() => setCurrentView("discover-products")}
                            >
                                <ShoppingBag className="mr-2 h-4 w-4" /> 브랜드 제품 둘러보기
                            </Button>
                            <Button
                                variant={currentView === "analysis" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("analysis")}
                            >
                                <Rocket className="mr-2 h-4 w-4" /> 성장 분석
                            </Button>
                            <Button
                                variant={currentView === "notifications" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("notifications")}
                            >
                                <Bell className="mr-2 h-4 w-4" /> 알림
                            </Button>
                            <div className="my-2 border-t" />
                            <Button
                                variant={currentView === "settings" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("settings")}
                            >
                                <Settings className="mr-2 h-4 w-4" /> 프로필 관리
                            </Button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    {renderContent()}

                    {/* Chat Dialog - Moved outside to work in all views */}
                    <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                        <DialogContent className="sm:max-w-[500px] h-[650px] flex flex-col p-0 overflow-hidden">
                            <DialogHeader className="p-6 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        {chatProposal?.brand_name?.[0] || "B"}
                                    </div>
                                    <div>
                                        <DialogTitle>{chatProposal?.brand_name}</DialogTitle>
                                        <DialogDescription className="text-xs">
                                            {chatProposal?.product_name} 협업 관련 대화
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
                                {/* Proposal Detail Box (at the top of chat) */}
                                {chatProposal && (
                                    <div className="mb-6 p-5 bg-white border border-primary/20 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-2">
                                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                                <BadgeCheck className="h-5 w-5" /> 협업 제안 상세
                                            </h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${chatProposal.status === 'accepted' ? 'bg-emerald-500 text-white' :
                                                chatProposal.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                                                }`}>
                                                {chatProposal.status === 'accepted' ? '수락됨' :
                                                    chatProposal.status === 'rejected' ? '거절됨' :
                                                        chatProposal.status === 'pending' ? '보류 중' : '검토 요청됨'}
                                            </span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">브랜드 / 제품</p>
                                                    <p className="font-bold text-sm truncate">{chatProposal.brand_name} / {chatProposal.product_name}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">제시 원고료</p>
                                                    <p className="font-bold text-emerald-600 text-sm">{chatProposal.compensation_amount}</p>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-muted/20 rounded-lg border border-primary/5">
                                                <p className="text-[11px] text-muted-foreground mb-1">브랜드 메시지</p>
                                                <p className="text-xs italic leading-relaxed whitespace-pre-wrap text-foreground/80">"{chatProposal.message}"</p>
                                            </div>

                                            {/* Action Buttons inside Chat (Available in all views now) */}
                                            {(chatProposal.status === 'offered' || !chatProposal.status) && (
                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold h-9"
                                                        onClick={() => handleStatusUpdate(chatProposal.id, 'accepted')}
                                                    >
                                                        수락하기
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 font-bold h-9 border-amber-200 text-amber-700 hover:bg-amber-50"
                                                        onClick={() => handleStatusUpdate(chatProposal.id, 'pending')}
                                                    >
                                                        보류
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {allMessages
                                    .filter((m: any) => m.proposalId === chatProposal?.id || (m.senderId === chatProposal?.brand_id && m.receiverId === user?.id) || (m.senderId === user?.id && m.receiverId === chatProposal?.brand_id))
                                    .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                    .map((msg: any, idx: any) => (
                                        <div key={idx} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                                                <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.senderId === user?.id
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-white border rounded-tl-none'
                                                    }`}>
                                                    {msg.content}
                                                    {msg.proposalId && renderProposalCard(msg.proposalId)}
                                                    <span className="block text-[10px] opacity-70 mt-1">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <div className="p-4 border-t bg-white">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="메시지를 입력하세요..."
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button onClick={handleSendMessage}>전송</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                </div>
            </main>
        </div>
    )
}

export default function InfluencerDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <InfluencerDashboardContent />
        </Suspense>
    )
}
