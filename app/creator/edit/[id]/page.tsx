"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Save, Trash2, Package, Send } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { usePlatform } from "@/components/providers/platform-provider"

const MONTHS = [
    "1월", "2월", "3월", "4월",
    "5월", "6월", "7월", "8월",
    "9월", "10월", "11월", "12월"
]

const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

export default function EditEventPage() {
    const router = useRouter()
    const params = useParams()
    const { events, updateEvent, deleteEvent, user } = usePlatform()
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    // Form States
    const [title, setTitle] = useState("")
    const [eventMonth, setEventMonth] = useState("")
    const [postingMonth, setPostingMonth] = useState("")
    const [targetProduct, setTargetProduct] = useState("")
    const [description, setDescription] = useState("")
    const [customTags, setCustomTags] = useState("")

    // Load Event Data
    useEffect(() => {
        if (params.id && events.length > 0) {
            const eventId = String(params.id)
            const event = events.find(e => String(e.id) === eventId)

            if (event) {
                // Check ownership (simple name check for prototype)
                // Note: user.name comparison might be flaky if names change, but sticking to prototype logic
                if (user && event.influencer !== user.name && event.influencerId !== user.id) {
                    alert("수정 권한이 없습니다.")
                    router.push("/creator")
                    return
                }

                setTitle(event.event)
                setDescription(event.description)
                setTargetProduct(event.targetProduct || "")

                // Parse Event Month (e.g., "2026년 3월" -> "3월")
                if (event.eventDate) {
                    const match = event.eventDate.match(/(\d+월)/)
                    if (match) setEventMonth(match[1])
                }

                // Parse Posting Month
                if (event.postingDate) {
                    const match = event.postingDate.match(/(\d+월)/)
                    if (match) setPostingMonth(match[1])
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

    const handleDelete = async () => {
        if (confirm("정말로 이 모먼트를 삭제하시겠습니까?")) {
            const eventId = String(params.id)
            await deleteEvent(eventId)
            router.push("/creator")
        }
    }

    const handleSubmit = async () => {
        if (!title || !eventMonth || !postingMonth || !description) {
            alert("모든 필수 항목을 입력해주세요.")
            return
        }

        const tags = [...selectedTags]
        if (customTags) {
            customTags.split(/[\s,]+/).forEach(t => {
                const cleanTag = t.replace("#", "").trim()
                if (cleanTag && !tags.includes(cleanTag)) tags.push(cleanTag)
            })
        }

        const eventId = String(params.id)

        await updateEvent(eventId, {
            category: selectedTags[0] || "기타",
            event: title,
            date: eventMonth, // Legacy support
            description: description,
            tags: tags,
            targetProduct: targetProduct || "미정",
            eventDate: `2026년 ${eventMonth}`,
            postingDate: `2026년 ${postingMonth}`
        })

        alert("모먼트가 성공적으로 수정되었습니다!")
        router.push("/creator")
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
                        <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> 삭제
                        </Button>
                    </div>

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
                            <Label>희망 협찬 제품</Label>
                            <div className="relative">
                                <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="협찬받고 싶은 제품을 입력하세요 (예: 로봇청소기, 립스틱)"
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
                                    모먼트 일정 (2026년)
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

                            {/* Posting Date Picker */}
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2">
                                    <Send className="h-4 w-4" />
                                    콘텐츠 업로드 시기
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
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
                            <Label htmlFor="tags">직접 입력 태그</Label>
                            <Input
                                id="tags"
                                placeholder="추가하고 싶은 태그가 있다면 입력해주세요 (예: #자취 #이사)"
                                value={customTags}
                                onChange={(e) => setCustomTags(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">상세 설명</Label>
                            <Textarea
                                id="description"
                                placeholder="어떤 상황이고 어떤 제품이 필요한지 자세히 적어주세요.\n예: 25평 아파트로 이사하게 되었습니다. 거실 커튼과 조명을 바꾸고 싶은데..."
                                className="min-h-[200px] resize-y"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
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
            </main>
        </div>
    )
}
