"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { usePlatform } from "@/components/providers/platform-provider"

const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
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
    const [date, setDate] = useState("")
    const [description, setDescription] = useState("")
    const [customTags, setCustomTags] = useState("")

    // Load Event Data
    useEffect(() => {
        if (params.id && events.length > 0) {
            const eventId = String(params.id)
            const event = events.find(e => String(e.id) === eventId)

            if (event) {
                // Check ownership (simple name check for prototype)
                if (user && event.influencer !== user.name) {
                    alert("수정 권한이 없습니다.")
                    router.push("/creator")
                    return
                }

                setTitle(event.event)
                setDate(event.date)
                setDescription(event.description)

                // Separate request tags from custom tags
                const popular = event.tags.filter(t => POPULAR_TAGS.some(pt => pt.includes(t)) || POPULAR_TAGS.includes(t))
                // For simplicity in prototype, we'll just set selection based on matches
                // and put everything else in custom? Or just load all into selectedTags for now.
                // Let's just load them.
                setSelectedTags(event.tags)
            } else {
                alert("이벤트를 찾을 수 없습니다.")
                router.push("/creator")
            }
        }
    }, [params.id, events, user, router])

    const toggleTag = (tag: string) => {
        // Simple string match might be tricky with emojis, but let's try direct comparison
        // The tag passed here is from POPULAR_TAGS (e.g. "✈️ 여행")
        // The event tags might be just "여행" or "✈️ 여행" depending on how they were saved.
        // Let's standardise on saving the full tag string from POPULAR_TAGS.

        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    const handleDelete = () => {
        if (confirm("정말로 이 이벤트를 삭제하시겠습니까?")) {
            const eventId = String(params.id)
            deleteEvent(eventId)
            router.push("/creator")
        }
    }

    const handleSubmit = () => {
        if (!title || !date || !description) {
            alert("제목,시기,상세 설명을 모두 입력해주세요.")
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

        updateEvent(eventId, {
            category: selectedTags[0] || "기타",
            event: title,
            date: date,
            description: description,
            tags: tags
        })

        alert("이벤트가 수정되었습니다!")
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
                                <h1 className="text-2xl font-bold tracking-tight">이벤트 수정하기</h1>
                                <p className="text-muted-foreground">
                                    등록된 이벤트 내용을 변경합니다.
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> 삭제
                        </Button>
                    </div>

                    <div className="space-y-8 rounded-xl border bg-card p-6 shadow-sm md:p-8">
                        {/* Same Form Fields as New Page */}
                        <div className="space-y-2">
                            <Label htmlFor="title">이벤트 제목</Label>
                            <Input
                                id="title"
                                placeholder="예: 한남동으로 이사, 여름 다이어트 시작"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">예상 시기</Label>
                            <div className="relative">
                                <Input
                                    id="date"
                                    placeholder="예: 2024년 9월, 빠를수록 좋음"
                                    className="pl-9"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">추가 태그 (직접 입력)</Label>
                            <Input
                                id="tags"
                                placeholder="추가하고 싶은 태그가 있다면 입력해주세요"
                                value={customTags}
                                onChange={(e) => setCustomTags(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">상세 설명</Label>
                            <Textarea
                                id="description"
                                placeholder="어떤 상황이고 어떤 제품이 필요한지 자세히 적어주세요."
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
