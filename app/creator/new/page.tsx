"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Calendar, Plus, Package, Send, Sparkles, Loader2, Lock, Globe } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePlatform } from "@/components/providers/legacy-platform-hook"

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

export default function NewEventPage() {
    const router = useRouter()
    const { addEvent } = usePlatform()
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    // Form States
    const [title, setTitle] = useState("")
    const [isDateFlexible, setIsDateFlexible] = useState(false)
    const [eventYear, setEventYear] = useState("2026")
    const [eventMonth, setEventMonth] = useState("")
    const [postingYear, setPostingYear] = useState("2026")
    const [postingMonth, setPostingMonth] = useState("")
    const [targetProduct, setTargetProduct] = useState("")
    const [description, setDescription] = useState("")
    const [guide, setGuide] = useState("")
    const [isPrivate, setIsPrivate] = useState(false)
    const [validationError, setValidationError] = useState<string | null>(null)

    // Schedule Template State
    const [showSchedule, setShowSchedule] = useState(false)
    const [schedule, setSchedule] = useState({
        product_delivery: "",
        draft_submission: "",
        shooting: "",
        feedback: "",
        upload: ""
    })

    const applyTemplate = () => {
        if (!eventMonth) {
            alert("먼저 모먼트 일정을 선택해주세요!")
            return
        }

        const year = parseInt(eventYear)
        const monthIndex = MONTHS.indexOf(eventMonth)
        // Default to current year if parsing fails, though it shouldn't with select

        // Base date: 1st of selected month
        const baseDate = new Date(year, monthIndex, 1)

        const formatDate = (date: Date) => {
            const y = date.getFullYear()
            const m = String(date.getMonth() + 1).padStart(2, '0')
            const d = String(date.getDate()).padStart(2, '0')
            return `${y}-${m}-${d}`
        }

        const addDays = (d: Date, days: number) => {
            const newDate = new Date(d)
            newDate.setDate(d.getDate() + days)
            return newDate
        }

        setSchedule({
            product_delivery: formatDate(addDays(baseDate, 5)),
            draft_submission: formatDate(addDays(baseDate, 12)),
            shooting: formatDate(addDays(baseDate, 15)),
            feedback: formatDate(addDays(baseDate, 18)),
            upload: formatDate(addDays(baseDate, 25))
        })
        setShowSchedule(true)
    }

    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateAI = async () => {
        if (!title) {
            alert("먼저 모먼트 제목을 입력해주세요!")
            return
        }

        setIsGenerating(true)
        try {
            const response = await fetch("/api/generate-description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: title + (targetProduct ? ` (광고 가능 아이템: ${targetProduct})` : ""),
                    category: selectedTags[0] || "일상"
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.error === "GEMINI_API_KEY not configured") {
                    alert("서버에 GEMINI_API_KEY가 설정되지 않았습니다.")
                } else {
                    throw new Error(data.details || "AI 생성 실패")
                }
                return
            }

            setDescription(data.result)
        } catch (error: any) {
            console.error("AI Error:", error)
            alert(`AI 작문 실패: ${error.message}`)
        } finally {
            setIsGenerating(false)
        }
    }

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    const handleSubmit = async () => {
        setValidationError(null)

        if (!title) {
            setValidationError("모먼트 제목을 입력해주세요.")
            return
        }
        if (!eventMonth) {
            setValidationError("모먼트 일정을 선택해주세요.")
            return
        }
        if (!postingMonth && !isDateFlexible) {
            setValidationError("업로드 시기를 선택해주세요.")
            return
        }
        if (!description) {
            setValidationError("상세 설명을 입력해주세요.")
            return
        }

        const tags = [...selectedTags]


        const formatToDate = (year: string, monthStr: string) => {
            const month = monthStr.replace('월', '').padStart(2, '0')
            return `${year}-${month}-01`
        }

        const success = await addEvent({
            category: selectedTags[0] || "기타",
            event: title,
            date: eventMonth, // Legacy support (display purpose)
            description: description,
            guide: guide,
            tags: tags,
            targetProduct: targetProduct || "미정",
            eventDate: formatToDate(eventYear, eventMonth),
            postingDate: isDateFlexible ? "" : formatToDate(postingYear, postingMonth),
            isPrivate: isPrivate,
            dateFlexible: isDateFlexible,
            schedule: schedule
        })

        if (success) {
            alert("모먼트가 성공적으로 등록되었습니다!")
            router.push("/creator")
        } else {
            // Fallback alert if addEvent fails silently (e.g. auth issue)
            // Note: addEvent usually alerts on DB error, but might return false on !user
            alert("모먼트 등록에 실패했습니다. 다시 시도해주세요. (로그인이 필요할 수 있습니다)")
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

                    {/* Main Content Div - Form Removed */}
                    <div>
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
                                <Label>
                                    관심 태그 (복수 선택 가능) <span className="text-xs text-muted-foreground ml-1 font-normal">*첫번째로 선택하는 태그는 카테고리로 저장됩니다</span>
                                </Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {POPULAR_TAGS.map((tag) => (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`
                                text-sm px-3 py-2.5 rounded-md border transition-all duration-200 text-left md:text-center
                                ${selectedTags.includes(tag)
                                                    ? "bg-primary text-primary-foreground border-primary font-medium ring-2 ring-offset-2 ring-primary/20"
                                                    : "bg-background hover:bg-muted/50 hover:border-primary/5 text-muted-foreground"
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="description">상세 설명</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGenerateAI}
                                        disabled={isGenerating}
                                        className="h-7 text-xs gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-3 w-3 text-yellow-500" />
                                        )}
                                        AI 작문 도우미
                                    </Button>
                                </div>
                                <Textarea
                                    id="description"
                                    placeholder="어떤 상황이고 어떤 제품이 필요한지 자세히 적어주세요.&#10;예: 25평 아파트로 이사하게 되었습니다. 거실 커튼과 조명을 바꾸고 싶은데..."
                                    className="min-h-[150px] resize-y"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground text-right mt-1">
                                    * AI가 생성한 내용은 자유롭게 수정 가능합니다.
                                </p>
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

                        </div>

                        {/* Schedule Template Section */}
                        <div className="space-y-4 border-t pt-6 mt-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base">상세 일정 관리</Label>
                                    <p className="text-xs text-muted-foreground">
                                        브랜드와의 원활한 협업을 위해 주요 마일스톤을 미리 계획해보세요.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={applyTemplate}
                                    className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    일정 템플릿 자동 적용
                                </Button>
                            </div>

                            {(showSchedule || schedule.product_delivery) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 bg-slate-50 p-4 rounded-lg border">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">📦 제품 배송/수령</Label>
                                        <Input
                                            type="date"
                                            value={schedule.product_delivery}
                                            onChange={(e) => setSchedule({ ...schedule, product_delivery: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">📝 기획안(초안) 제출</Label>
                                        <Input
                                            type="date"
                                            value={schedule.draft_submission}
                                            onChange={(e) => setSchedule({ ...schedule, draft_submission: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">📸 촬영 진행</Label>
                                        <Input
                                            type="date"
                                            value={schedule.shooting}
                                            onChange={(e) => setSchedule({ ...schedule, shooting: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">📢 피드백 반영</Label>
                                        <Input
                                            type="date"
                                            value={schedule.feedback}
                                            onChange={(e) => setSchedule({ ...schedule, feedback: e.target.value })}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground font-bold text-primary">🚀 최종 업로드</Label>
                                        <Input
                                            type="date"
                                            value={schedule.upload}
                                            onChange={(e) => setSchedule({ ...schedule, upload: e.target.value })}
                                            className="bg-white border-primary/50 ring-primary/20"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-4 pt-4 mt-6 relative z-50 pb-20">
                            <Button variant="outline" asChild type="button">
                                <Link href="/creator">취소</Link>
                            </Button>
                            {validationError && (
                                <div className="absolute bottom-full mb-2 right-0 text-sm text-red-500 font-medium bg-red-50 px-3 py-1 rounded-md animate-in slide-in-from-bottom-1 fade-in">
                                    ⚠️ {validationError}
                                </div>
                            )}
                            <Button
                                size="lg"
                                className="w-full md:w-auto cursor-pointer"
                                onClick={handleSubmit}
                                type="button"
                                disabled={false}
                            >
                                <Plus className="mr-2 h-4 w-4" /> 모먼트 등록하기
                            </Button>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    )
}
