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

// Removed static MY_EVENTS


const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

import { Suspense } from "react"

function InfluencerDashboardContent() {
    const { user, updateUser, campaigns, events, isLoading, notifications, resetData } = usePlatform()
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialView = searchParams.get('view') || "dashboard"
    const [currentView, setCurrentView] = useState(initialView)

    // Filter My Events
    const myEvents = user ? events.filter(e => e.influencer === user.name) : []

    // Profile Edit States
    const [editName, setEditName] = useState("")
    const [editBio, setEditBio] = useState("")
    const [editHandle, setEditHandle] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    // Initialize state when user loads or view changes
    useEffect(() => {
        if (user) {
            setEditName(user.name || "")
            setEditBio(user.bio || "")
            setEditHandle(user.handle || "")
            setSelectedTags(user.tags || [])
        }
    }, [user, currentView])

    // Onboarding Check: If new user (no tags), force settings view
    useEffect(() => {
        if (user && !isLoading) {
            if ((!user.tags || user.tags.length === 0)) {
                // Only force if not already there to avoid constant fighting if they try to leave? 
                // Creating a simplified onboarding experience.
                setCurrentView("settings")
            }
        }
    }, [user, isLoading])

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [isLoading, user, router])

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    if (!user) return null

    const handleSaveProfile = async () => {
        await updateUser({
            name: editName,
            bio: editBio,
            handle: editHandle,
            tags: selectedTags
        })
        alert("프로필이 저장되었습니다!")
        setCurrentView("dashboard") // Go to dashboard after saving
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
                            <h1 className="text-3xl font-bold tracking-tight">내 이벤트 관리</h1>
                            <Button className="gap-2" asChild>
                                <Link href="/influencer/new">
                                    <Plus className="h-4 w-4" /> 새 이벤트 만들기
                                </Link>
                            </Button>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">활성 이벤트</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1</div>
                                    <p className="text-xs text-muted-foreground mt-1">다음 달 예정 1건</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">받은 제안</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">3</div>
                                    <p className="text-xs text-muted-foreground mt-1">+2개의 진행중인 대화</p>
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

                        {/* Active Events List */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold">예정된 이벤트</h2>
                            <div className="grid gap-4">
                                <div className="grid gap-4">
                                    {myEvents.length === 0 ? (
                                        <div className="text-center py-10 border rounded-lg border-dashed text-muted-foreground">
                                            등록된 이벤트가 없습니다. 새로운 이벤트를 등록해보세요!
                                        </div>
                                    ) : myEvents.map((event) => (
                                        <Card key={event.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-lg font-bold bg-primary/10 text-primary`}>
                                                    {event.date.includes("월") ? event.date.split(" ")[0] : "D-Day"}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{event.event}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>모집중</span>
                                                        <span>•</span>
                                                        <span>{event.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className="text-right hidden md:block">
                                                    <div className="font-medium">0개의 제안</div>
                                                    <div className="text-xs text-muted-foreground">검토 대기중</div>
                                                </div>
                                                <Button variant="outline" size="sm" className="ml-auto md:ml-0" asChild>
                                                    <Link href={`/influencer/edit/${event.id}`}>
                                                        관리 / 수정
                                                    </Link>
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
                    </div>
                )
            case "proposals":
                return (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold tracking-tight">브랜드 제안함</h1>
                        <p className="text-muted-foreground">브랜드로부터 도착한 제안을 확인하세요.</p>
                        <div className="grid gap-4">
                            <Card className="p-8 text-center bg-muted/20 border-dashed">
                                <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-lg">새로운 제안이 도착했습니다!</h3>
                                <p className="text-muted-foreground mb-4">삼성전자에서 'Galaxy Watch 6' 체험단 제안을 보냈습니다.</p>
                                <Button onClick={() => alert("제안을 수락했습니다! 담당자가 곧 연락드립니다.")}>제안 확인하기</Button>
                            </Card>
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
                                    <Label htmlFor="handle">핸들 (@ID)</Label>
                                    <Input
                                        id="handle"
                                        value={editHandle}
                                        onChange={(e) => setEditHandle(e.target.value)}
                                        placeholder="@example"
                                    />
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
                                <Button onClick={handleSaveProfile}>저장하기</Button>
                            </CardFooter>
                        </Card>
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
                                <Calendar className="mr-2 h-4 w-4" /> 내 이벤트
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
