"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Briefcase, Calendar, ChevronRight, Plus, Rocket, Settings, ShoppingBag, User } from "lucide-react"
import Link from "next/link"
import { usePlatform } from "@/components/providers/platform-provider"
import { useEffect, useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
    const { user, updateUser, campaigns, events, isLoading, notifications, resetData, brandProposals } = usePlatform()
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialView = searchParams.get('view') || "dashboard"
    const [currentView, setCurrentView] = useState(initialView)
    const [selectedMomentId, setSelectedMomentId] = useState<string | null>(null)

    // Filter My Events
    // Filter My Events
    const myEvents = user ? events.filter(e => e.influencerId === user.id) : []
    const pastMoments = myEvents.filter(e => (e as any).status === 'completed')
    const upcomingMoments = myEvents.filter(e => (e as any).status !== 'completed')

    // Profile Edit States
    const [editName, setEditName] = useState("")
    const [editBio, setEditBio] = useState("")
    const [editHandle, setEditHandle] = useState("")
    const [editFollowers, setEditFollowers] = useState<string>("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)

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
            const isMissingInfo = !user.handle || user.followers === undefined || user.followers === 0
            if (isMissingInfo && currentView !== 'settings' && initialView !== 'settings') {
                setCurrentView("settings")
            }
        }
    }, [user, isLoading, currentView, initialView])

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
            case "dashboard":
                return (
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold tracking-tight">내 모먼트 관리</h1>
                            <Button className="gap-2" asChild>
                                <Link href="/influencer/new">
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
                                                    <Link href={`/influencer/edit/${selectedMomentId}`}>
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
                                        {/* Show ALL proposals for now as we lack event_id linking in DB */}
                                        {brandProposals && brandProposals.length > 0 ? (
                                            brandProposals.map((proposal) => (
                                                <Card
                                                    key={proposal.id}
                                                    className="p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                                                    onClick={() => {
                                                        alert(`[${proposal.brand_name || 'Brand'}]의 제안\n\n제품: ${proposal.product_name}\n보상: ${proposal.compensation_amount}\n메시지: ${proposal.message}`)
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
                                                <p className="text-sm text-muted-foreground">아직 도착한 제안이 없습니다.</p>
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
                                                                {brandProposals?.length || 0}개의 제안
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">확인하기 →</div>
                                                        </div>
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
                        <h1 className="text-3xl font-bold tracking-tight">브랜드 제안함</h1>
                        <p className="text-muted-foreground">브랜드로부터 도착한 협업 제안을 확인하세요.</p>
                        <div className="grid gap-4">
                            {brandProposals && brandProposals.length > 0 ? (
                                brandProposals.map((proposal) => (
                                    <Card key={proposal.id} className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {proposal.brand_name?.[0] || "B"}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{proposal.brand_name}의 제안</h3>
                                                    <p className="text-sm font-medium text-primary mt-1">
                                                        {proposal.product_name} ({proposal.product_type === 'gift' ? '제품 협찬' : '대여'})
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        보상: {proposal.compensation_amount}
                                                        {proposal.has_incentive && ` (+인센티브: ${proposal.incentive_detail})`}
                                                    </p>
                                                    <div className="mt-4 p-3 bg-muted/30 rounded-md text-sm">
                                                        "{proposal.message}"
                                                    </div>
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        받은 날짜: {new Date(proposal.created_at).toLocaleDateString()} • 상태: {proposal.status}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline">거절하기</Button>
                                                <Button onClick={() => alert("제안을 수락했습니다! 채팅방이 연결됩니다.")}>수락하기</Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Card className="p-8 text-center bg-muted/20 border-dashed">
                                    <div className="mx-auto w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold text-lg">아직 받은 제안이 없습니다.</h3>
                                    <p className="text-muted-foreground mb-4">프로필을 더 매력적으로 꾸며보세요!</p>
                                </Card>
                            )}
                        </div>
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
                                variant="ghost"
                                className="w-full justify-start text-primary font-medium"
                                asChild
                            >
                                <Link href="/influencer/products">
                                    <ShoppingBag className="mr-2 h-4 w-4" /> 브랜드 제품 둘러보기
                                </Link>
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
