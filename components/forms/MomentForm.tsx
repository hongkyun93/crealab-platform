"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Plus, Sparkles, Loader2, Lock, Globe, Package, Calendar, Send, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEffectiveUser } from "@/lib/hooks/use-effective-user"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { toast } from "sonner"
import { ChannelSelector } from "@/components/shared/ChannelSelector"

const MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1}월`)

const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "💊 건강", "💉 시술/병원", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

interface MomentFormProps {
    mode: 'create' | 'edit'
    eventId?: string
}

export function MomentForm({ mode, eventId }: MomentFormProps) {
    const router = useRouter()
    const { user, addEvent, updateEvent, deleteEvent, supabase, currentTeam, events } = useUnifiedProvider()
    const { effectiveUserId, isProxyMode, effectiveUser } = useEffectiveUser()

    // MCN/Agency specific
    const [targetCreatorId, setTargetCreatorId] = useState<string>("")
    const [teamMembers, setTeamMembers] = useState<{ id: string, name: string }[]>([])

    // Form states
    const [title, setTitle] = useState("")
    const [eventYear, setEventYear] = useState("2026")
    const [eventMonth, setEventMonth] = useState("")
    const [postingYear, setPostingYear] = useState("2026")
    const [postingMonth, setPostingMonth] = useState("")
    const [isDateFlexible, setIsDateFlexible] = useState(false)
    const [description, setDescription] = useState("")
    const [guide, setGuide] = useState("")
    const [targetProduct, setTargetProduct] = useState("")
    const [isPrivate, setIsPrivate] = useState(false)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedChannels, setSelectedChannels] = useState<string[]>([])
    const [schedule, setSchedule] = useState({
        product_delivery: "",
        draft_submission: "",
        shooting: "",
        feedback: "",
        upload: ""
    })

    // UI State
    const [isGenerating, setIsGenerating] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    // Set initial target creator if in proxy mode
    useEffect(() => {
        if (isProxyMode && effectiveUserId && user?.id !== effectiveUserId) {
            setTargetCreatorId(effectiveUserId)
        }
    }, [isProxyMode, effectiveUserId, user])

    // Fetch team members for MCN/Agency
    useEffect(() => {
        const fetchTeamMembers = async () => {
            if (user?.role === 'agency' || user?.role === 'mcn') {
                const { data, error } = await supabase
                    .from('team_members')
                    .select(`
                        id,
                        user_id,
                        role,
                        profile:profiles!team_members_user_id_fkey (
                            display_name,
                            email
                        )
                    `)
                    .eq('team_id', user.teamId)

                if (data) {
                    const members = data.map((m: any) => ({
                        id: m.id,
                        user_id: m.user_id,
                        name: m.profile?.display_name || m.profile?.email || 'Unknown',
                        email: m.profile?.email
                    }))
                    setTeamMembers(members)
                }
            }
        }
        if (user) fetchTeamMembers()
    }, [user, supabase])

    // Load event data for edit mode
    useEffect(() => {
        if (mode === 'edit' && eventId && events.length > 0) {
            const event = events.find(e => String(e.id) === eventId)

            if (!event) {
                toast.error("모먼트를 찾을 수 없습니다")
                router.push('/creator')
                return
            }

            // Check permission
            if (user) {
                if (event.influencerId !== user.id && user.role !== 'admin') {
                    console.warn("[MomentForm] Permission denied: ownerId", event.influencerId, "currentUserId", user.id)
                    toast.error("수정 권한이 없습니다.")
                    router.push("/creator")
                    return
                }
            } else {
                return
            }

            // Populate form fields
            setTitle(event.event)
            setDescription(event.description)
            setGuide(event.guide || "")
            setIsPrivate(event.isPrivate || false)
            setTargetProduct(event.targetProduct || "")
            setSelectedTags(event.tags || [])
            setSelectedChannels(event.channels || [])

            // Load schedule if exists
            if (event.schedule) {
                setSchedule(event.schedule)
            }

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
        }
    }, [mode, eventId, events, user, router])

    const handleGenerateAI = async () => {
        if (!title && !selectedTags.length) {
            toast.error("AI 작문을 위해 제목이나 태그를 먼저 선택해주세요.")
            return
        }

        setIsGenerating(true)
        try {
            const response = await fetch('/api/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    tags: selectedTags,
                    targetProduct
                })
            })

            const data = await response.json()
            if (data.description) {
                setDescription(data.description)
                toast.success("AI가 설명을 생성했습니다!")
            }
        } catch (error) {
            console.error('AI Generation error:', error)
            toast.error("AI 생성에 실패했습니다.")
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

    const validate = () => {
        if (!user) {
            toast.error("로그인 정보가 없습니다. 새로고침 후 다시 시도해주세요.")
            return false
        }

        if (!title) {
            toast.error("모먼트 제목을 입력해주세요.")
            return false
        }
        if (!eventMonth) {
            toast.error("모먼트 일정을 선택해주세요.")
            return false
        }
        if (!postingMonth && !isDateFlexible) {
            toast.error("업로드 시기를 선택해주세요.")
            return false
        }
        if (!description) {
            toast.error("상세 설명을 입력해주세요.")
            return false
        }

        // MCN/Agency check (only for create mode or if not proxy)
        if (mode === 'create' && !isProxyMode && (user.role === 'agency' || user.role === 'mcn')) {
            if (!targetCreatorId) {
                toast.error("모먼트를 등록할 크리에이터를 선택해주세요.")
                return false
            }
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validate()) return

        const tags = [...selectedTags]

        const formatToDate = (year: string, monthStr: string) => {
            const month = monthStr.replace('월', '').padStart(2, '0')
            return `${year}-${month}-01`
        }

        if (mode === 'edit' && eventId) {
            // UPDATE
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
                    isPrivate: isPrivate,
                    channels: selectedChannels
                })

                if (success) {
                    toast.success("모먼트가 성공적으로 수정되었습니다!")
                    router.push("/creator")
                }
            } catch (error) {
                console.error("Failed to update event:", error)
                toast.error("모먼트 수정에 실패했습니다.")
            }
        } else {
            // CREATE
            // Determine effective creator ID
            let finalInfluencerId = user!.id

            if (isProxyMode) {
                finalInfluencerId = effectiveUserId || user!.id
            } else if (user!.role === 'agency' || user!.role === 'mcn') {
                if (!targetCreatorId) {
                    toast.error("모먼트를 등록할 크리에이터를 선택해주세요.")
                    return
                }
                finalInfluencerId = targetCreatorId
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
                channels: selectedChannels,
                schedule: schedule,
                influencerId: finalInfluencerId
            })

            if (success) {
                toast.success("모먼트가 성공적으로 등록되었습니다!")
                router.push('/creator')
            } else {
                toast.error("모먼트 등록에 실패했습니다. 다시 시도해주세요.")
            }
        }
    }

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (eventId) {
            const success = await deleteEvent(eventId)
            if (success) {
                toast.success("모먼트가 삭제되었습니다.")
                router.push("/creator")
            }
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
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {mode === 'create' ? '새 모먼트 만들기' : '모먼트 수정하기'}
                                </h1>
                                <p className="text-muted-foreground">
                                    {mode === 'create'
                                        ? `브랜드에게 제안받을 ${isProxyMode ? `${effectiveUser?.name}님의` : '당신의'} 다음 라이프 모먼트를 등록하세요.`
                                        : '등록된 모먼트 내용을 변경합니다.'
                                    }
                                </p>
                            </div>
                        </div>
                        {mode === 'edit' && (
                            <Button variant="outline" size="sm" onClick={handleDeleteClick} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="mr-2 h-4 w-4" /> 삭제
                            </Button>
                        )}
                    </div>

                    {/* Delete Dialog */}
                    {mode === 'edit' && (
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
                    )}

                    <div className="space-y-8 rounded-xl border bg-card p-6 shadow-sm md:p-8">
                        {/* Creator Selector for MCN/Agency (Create mode only, not proxy) */}
                        {mode === 'create' && ((user?.role === 'agency' || user?.role === 'mcn') && !isProxyMode) && (
                            <div className="p-4 border rounded-lg bg-indigo-50/50 border-indigo-100">
                                <Label className="mb-2 block text-indigo-900 font-semibold">
                                    어떤 크리에이터의 모먼트인가요?
                                </Label>
                                <Select value={targetCreatorId} onValueChange={setTargetCreatorId}>
                                    <SelectTrigger className="bg-white border-indigo-200">
                                        <SelectValue placeholder="크리에이터를 선택해주세요" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teamMembers.map(member => (
                                            <SelectItem key={member.id} value={member.id}>
                                                {member.name} ({member.id.substring(0, 8)}...)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-indigo-600 mt-2">
                                    * 선택한 크리에이터의 이름으로 모먼트가 등록됩니다.
                                </p>
                            </div>
                        )}

                        {/* Proxy Mode Info */}
                        {mode === 'create' && isProxyMode && (
                            <div className="p-3 border rounded-lg bg-blue-50/50 border-blue-100 flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Proxy Mode</span>
                                <span className="text-sm text-blue-800">
                                    <strong>{effectiveUser?.name}</strong>님의 모먼트로 등록됩니다.
                                </span>
                            </div>
                        )}

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

                        <ChannelSelector
                            selected={selectedChannels}
                            onChange={setSelectedChannels}
                            label="희망 채널"
                            description="이 모먼트에 적합한 SNS 채널을 선택해주세요"
                        />

                        <div className="space-y-3">
                            <Label>관심 카테고리 (복수 선택 가능)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {POPULAR_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description">상세 설명</Label>
                                {mode === 'create' && (
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
                                )}
                            </div>
                            <Textarea
                                id="description"
                                placeholder="어떤 상황이고 어떤 제품이 필요한지 자세히 적어주세요.&#10;예: 25평 아파트로 이사하게 되었습니다. 거실 커튼과 조명을 바꾸고 싶은데..."
                                className="min-h-[150px] resize-y"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {mode === 'create' && (
                                <p className="text-xs text-muted-foreground text-right mt-1">
                                    * AI가 생성한 내용은 자유롭게 수정 가능합니다.
                                </p>
                            )}
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
                            <Button variant="outline" asChild type="button">
                                <Link href="/creator">취소</Link>
                            </Button>
                            <Button
                                size="lg"
                                className="w-full md:w-auto cursor-pointer"
                                onClick={handleSubmit}
                                type="button"
                            >
                                {mode === 'edit' ? (
                                    <><Save className="mr-2 h-4 w-4" /> 변경사항 저장</>
                                ) : (
                                    <><Plus className="mr-2 h-4 w-4" /> 모먼트 등록하기</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    )
}
