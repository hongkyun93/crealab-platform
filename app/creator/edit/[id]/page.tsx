"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Save, Trash2, Package, Send, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useEvents } from "@/components/providers/event-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { toast } from "sonner"

const MONTHS = [
    "1월", "2월", "3월", "4월",
    "5월", "6월", "7월", "8월",
    "9월", "10월", "11월", "12월"
]

const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "💊 건강", "💉 시술/병원", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

export default function EditEventPage() {
    const router = useRouter()
    const params = useParams()
    const { events, updateEvent, deleteEvent } = useEvents()
    const { user } = useAuth()
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDateFlexible, setIsDateFlexible] = useState(false)

    // Form States
    const [title, setTitle] = useState("")
    const [eventYear, setEventYear] = useState("2026")
    const [eventMonth, setEventMonth] = useState("")
    const [postingYear, setPostingYear] = useState("2026")
    const [postingMonth, setPostingMonth] = useState("")
    const [targetProduct, setTargetProduct] = useState("")
    const [description, setDescription] = useState("")
    const [guide, setGuide] = useState("")
    const [isPrivate, setIsPrivate] = useState(false)

    // Load Event Data
    useEffect(() => {
        if (params.id && events.length > 0) {
            const eventId = String(params.id)
            const event = events.find(e => String(e.id) === eventId)

            if (event) {
                // Check ownership
                // Relaxed check: Trust ID match primarily. 
                // Also, if user is not yet loaded (null), we shouldn't redirect yet. 
                // But this effect runs when [user] changes.

                if (user) {
                    // Strict ID check is best. Name check is flaky.
                    // Also allow if user.type is admin (optional, but good for support)
                    if (event.influencerId !== user.id && user.type !== 'admin') {
                        console.warn("[EditEvent] Permission denied: ownerId", event.influencerId, "currentUserId", user.id)
                        toast.error("수정 권한이 없습니다.")
                        router.push("/creator")
                        return
                    }
                } else {
                    // User not loaded yet? 
                    // ideally we show loading spinner and don't run this check until user is present.
                    // But for now, let's just return and let the next effect cycle handle it.
                    return;
                }

                setTitle(event.event)
                setDescription(event.description)
                setGuide(event.guide || "")
                setIsPrivate(event.isPrivate || false)
                setTargetProduct(event.targetProduct || "")

                // Parse Event Date
                if (event.eventDate) {
                    const yearMatch = event.eventDate.match(/(\d{4})년/)
                    const monthMatch = event.eventDate.match(/(\d+월)/)
                    if (yearMatch) setEventYear(yearMatch[1])
                    if (monthMatch) setEventMonth(monthMatch[1])
                }

                // Parse Posting Date
                if (event.postingDate) {
                    if (event.postingDate === '1993-01-06' || event.dateFlexible) {
                        setIsDateFlexible(true)
                    } else {
                        const yearMatch = event.postingDate.match(/(\d{4})년/)
                        const monthMatch = event.postingDate.match(/(\d+월)/)
                        if (yearMatch) setPostingYear(yearMatch[1])
                        if (monthMatch) setPostingMonth(monthMatch[1])
                    }
                }

                setSelectedTags(event.tags || [])
            } else {
                // If fetching events is still happening, this might trigger prematurely?
                // But events dependency handles updates. 
                // We'll let the user see a blank form or redirect if completely missing after load.
                // Ideally show loading state, but for now:
            }
        }
    }, [params.id, events, user, router])

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        const eventId = String(params.id)
        const success = await deleteEvent(eventId)
        if (success) {
            router.push("/creator")
        }
    }

    const handleSubmit = async () => {
        if (!title || !eventMonth || !description) {
            toast.error("모든 필수 항목을 입력해주세요.")
            return
        }
        if (!postingMonth && !isDateFlexible) {
            toast.error("업로드 시기를 선택해주세요.")
            return
        }

        const tags = [...selectedTags]

        const eventId = String(params.id)

        try {
            const success = await updateEvent(eventId, {
                category: selectedTags[0] || "기타",
                event: title,
                date: eventMonth, // Legacy support
                description: description,
                guide: guide,
                tags: tags,
                targetProduct: targetProduct || "미정",
                eventDate: `${eventYear}년 ${eventMonth}`,
                postingDate: isDateFlexible ? "" : `${postingYear}년 ${postingMonth}`,
                dateFlexible: isDateFlexible,
                isPrivate: isPrivate
            })

            if (success) {
                toast.success("모먼트가 성공적으로 수정되었습니다!")
                router.push("/creator")
            }
        } catch (error) {
            console.error("Failed to update event:", error)
            toast.error("모먼트 수정에 실패했습니다.")
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/creator">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">모먼트 수정하기</h1>
                                <p className="text-muted-foreground">
                                    등록된 모먼트 내용을 변경합니다.
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDeleteClick} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> 삭제
                        </Button>
                    </div>

                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    이 작업은 되돌릴 수 없습니다. 모먼트가 완전히 삭제됩니다.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                                    삭제
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <div className="space-y-8 rounded-xl border bg-card p-6 shadow-sm md:p-8">

                        <div className="space-y-2">
                            <Label htmlFor="title">모먼트 제목</Label>
                            <Input
                                id="title"
                                placeholder="예: 한남동으로 이사, 여름 다이어트 시작"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                브랜드가 한눈에 알아볼 수 있는 직관적인 제목을 지어주세요.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Label>광고 가능 아이템</Label>
                            <div className="relative">
                                <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="광고 진행이 가능한 제품이나 브랜드를 입력해주세요 (예: 로봇청소기, 립스틱)"
                                    className="pl-9"
                                    value={targetProduct}
                                    onChange={(e) => setTargetProduct(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Event Date Picker */}
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    모먼트 일정
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEventYear(prev => prev === "2026" ? "2027" : "2026")}
                                        className="h-6 px-2 text-xs ml-1 bg-background"
                                    >
                                        {eventYear}년 🔄
                                    </Button>
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {MONTHS.map((m) => {
                                        const isSelected = eventMonth === m
                                        return (
                                            <Button
                                                key={`event-${m}`}
                                                type="button"
                                                variant={isSelected ? "default" : "outline"}
                                                className={`h-10 text-sm ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                                                onClick={() => setEventMonth(m)}
                                            >
                                                {m}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="flex items-center gap-2">
                                    <Send className="h-4 w-4" />
                                    콘텐츠 업로드 시기
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPostingYear(prev => prev === "2026" ? "2027" : "2026")}
                                        className="h-6 px-2 text-xs ml-1 bg-background"
                                    >
                                        {postingYear}년 🔄
                                    </Button>
                                </Label>
                                <div className={`grid grid-cols-3 gap-2 ${isDateFlexible ? 'opacity-50 pointer-events-none' : ''}`}>
                                    {MONTHS.map((m) => {
                                        const isSelected = postingMonth === m
                                        return (
                                            <Button
                                                key={`posting-${m}`}
                                                type="button"
                                                variant={isSelected ? "default" : "outline"}
                                                className={`h-10 text-sm ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                                                onClick={() => setPostingMonth(m)}
                                            >
                                                {m}
                                            </Button>
                                        )
                                    })}
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="date-flexible"
                                        checked={isDateFlexible}
                                        onCheckedChange={(checked) => setIsDateFlexible(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="date-flexible"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                                    >
                                        업로드 일정 협의 가능
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>관심 카테고리 (복수 선택 가능)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {POPULAR_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`
                                text-sm px-3 py-2.5 rounded-md border transition-all duration-200 text-left md:text-center
                                ${selectedTags.includes(tag)
                                                ? "bg-primary text-primary-foreground border-primary font-medium ring-2 ring-offset-2 ring-primary/20"
                                                : "bg-background hover:bg-muted/50 hover:border-primary/50 text-muted-foreground"
                                            }
                            `}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            {selectedTags.length > 0 && (
                                <p className="text-xs text-primary font-medium">
                                    {selectedTags.length}개 선택됨: {selectedTags.join(", ")}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">상세 설명</Label>
                            <Textarea
                                id="description"
                                placeholder="어떤 상황이고 어떤 제품이 필요한지 자세히 적어주세요.&#10;예: 25평 아파트로 이사하게 되었습니다. 거실 커튼과 조명을 바꾸고 싶은데..."
                                className="min-h-[150px] resize-y"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="guide">제작 가이드</Label>
                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Optional</span>
                            </div>
                            <Textarea
                                id="guide"
                                placeholder="브랜드에게 제안할 콘텐츠의 방향성이나 촬영 구도를 미리 적어주세요.&#10;예:&#10;1. 비포/애프터 컷 필수 포함&#10;2. 자연광에서 제품 텍스처 강조&#10;3. 실사용 1주일 후기 위주"
                                className="min-h-[120px] resize-y bg-muted/20"
                                value={guide}
                                onChange={(e) => setGuide(e.target.value)}
                            />
                            <p className="text-xs text-primary/80 font-medium">
                                ✨ 꿀팁: 가이드를 작성하면 브랜드로부터 광고 제안을 받을 확률이 높아져요!
                            </p>

                        </div>

                        <div className="space-y-3">
                            <Label>공개 범위 설정</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    className={`relative flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${!isPrivate ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`}
                                    onClick={() => setIsPrivate(false)}
                                >
                                    <Globe className={`h-5 w-5 mt-0.5 ${!isPrivate ? "text-primary" : "text-muted-foreground"}`} />
                                    <div>
                                        <div className={`font-medium ${!isPrivate ? "text-primary" : "text-foreground"}`}>전체 공개 (Public)</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            브랜드가 내 모먼트를 검색하고 제안을 보낼 수 있습니다.
                                        </p>
                                    </div>
                                    {!isPrivate && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />}
                                </div>

                                <div
                                    className={`relative flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${isPrivate ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`}
                                    onClick={() => setIsPrivate(true)}
                                >
                                    <Lock className={`h-5 w-5 mt-0.5 ${isPrivate ? "text-primary" : "text-muted-foreground"}`} />
                                    <div>
                                        <div className={`font-medium ${isPrivate ? "text-primary" : "text-foreground"}`}>나만 보기 (Private)</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            다른 사람에게 노출되지 않으며, 개인 일정 관리용으로 저장됩니다.
                                        </p>
                                    </div>
                                    {isPrivate && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" asChild>
                                <Link href="/creator">취소</Link>
                            </Button>
                            <Button size="lg" className="w-full md:w-auto" onClick={handleSubmit}>
                                <Save className="mr-2 h-4 w-4" /> 변경사항 저장
                            </Button>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    )
}
