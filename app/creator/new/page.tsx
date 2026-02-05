"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Plus, Package, Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function NewEventPage() {
    const router = useRouter()
    const { addEvent } = usePlatform()
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    // Form States
    const [title, setTitle] = useState("")
    const [eventYear, setEventYear] = useState("2026")
    const [eventMonth, setEventMonth] = useState("")
    const [postingYear, setPostingYear] = useState("2026")
    const [postingMonth, setPostingMonth] = useState("")
    const [targetProduct, setTargetProduct] = useState("")
    const [description, setDescription] = useState("")
    const [guide, setGuide] = useState("")
    const [customTags, setCustomTags] = useState("")

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    const handleSubmit = async () => {
        if (!title || !eventMonth || !postingMonth || !description) {
            alert("모든 필수 항목을 입력해주세요.")
            return
        }

        const tags = [...selectedTags]
        if (customTags) {
            // Split by space or comma and add clean tags
            customTags.split(/[\s,]+/).forEach(t => {
                const cleanTag = t.replace("#", "").trim()
                if (cleanTag) tags.push(cleanTag)
            })
        }

        const success = await addEvent({
            category: selectedTags[0] || "기타",
            event: title,
            date: eventMonth, // Legacy support (display purpose)
            description: description,
            guide: guide,
            tags: tags,
            targetProduct: targetProduct || "미정",
            eventDate: `${eventYear}년 ${eventMonth}`,
            postingDate: `${postingYear}년 ${postingMonth}`
        })

        if (success) {
            alert("모먼트가 성공적으로 등록되었습니다!")
            router.push("/creator")
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-8 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/creator">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">새 모먼트 만들기</h1>
                            <p className="text-muted-foreground">
                                브랜드에게 제안받을 당신의 다음 라이프 모먼트를 등록하세요.
                            </p>
                        </div>
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
                                브랜드가 한눈에 알아볼 수 있는 직관적인 제목을 지어주세요. (예: 비행기에서 사용할 마스크팩 광고할 준비가 되었어요.)
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

                            {/* Posting Date Picker */}
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

                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" asChild>
                                <Link href="/creator">취소</Link>
                            </Button>
                            <Button size="lg" className="w-full md:w-auto" onClick={handleSubmit}>
                                <Plus className="mr-2 h-4 w-4" /> 모먼트 등록하기
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
