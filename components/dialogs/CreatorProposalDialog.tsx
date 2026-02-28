"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AddressSearchDialog } from "@/components/ui/address-search-dialog"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { Loader2, Send, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

// ─── 타입 ────────────────────────────────────────────────────────────────────

export interface CreatorProposalFormData {
    channelName: string
    channelUrl: string
    channelSubtype: string
    motivation: string
    contentPlan: string
    portfolioLinks: string
    insightFile: File | null
    desiredCost: string
    appealMessage: string
    targetCreatorId?: string
    shippingName?: string
    shippingPhone?: string
    shippingAddress?: string
}

export interface CreatorProposalTarget {
    /** 표시용 브랜드명 */
    brandName: string
    /** 표시용 제품/캠페인명 */
    targetName: string
    /** 브랜드가 제시한 예산 (캠페인의 경우) */
    budget?: string
    /** AI 기획안 생성에 사용할 제품 정보 */
    productName?: string
    sellingPoints?: string
    category?: string
    requiredShots?: string
}

interface CreatorProposalDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    target: CreatorProposalTarget | null
    onSubmit: (data: CreatorProposalFormData) => Promise<void>
    isSubmitting?: boolean
    // MCN/Agency 대리 지원
    teamMembers?: { user_id: string; name: string; email?: string }[]
    prefillHandle?: string
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export function CreatorProposalDialog({
    open,
    onOpenChange,
    target,
    onSubmit,
    isSubmitting = false,
    teamMembers = [],
    prefillHandle = "",
}: CreatorProposalDialogProps) {
    const { user } = useUnifiedProvider()

    const [channelName, setChannelName] = useState("instagram")
    const [channelSubtype, setChannelSubtype] = useState("")
    const [channelUrl, setChannelUrl] = useState(prefillHandle)
    const [motivation, setMotivation] = useState("")
    const [contentPlan, setContentPlan] = useState("")
    const [portfolioLinks, setPortfolioLinks] = useState("")
    const [insightFile, setInsightFile] = useState<File | null>(null)
    const [desiredCost, setDesiredCost] = useState("")
    const [appealMessage, setAppealMessage] = useState("")
    const [targetCreatorId, setTargetCreatorId] = useState("")
    const [isAIPlanning, setIsAIPlanning] = useState(false)

    // 배송 정보
    const [shippingName, setShippingName] = useState("")
    const [shippingPhone, setShippingPhone] = useState("")
    const [shippingAddress, setShippingAddress] = useState("")
    const [shippingDetailAddress, setShippingDetailAddress] = useState("")
    const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false)

    // prefillHandle 및 유저 정보 동기화
    useEffect(() => {
        if (prefillHandle) setChannelUrl(prefillHandle)
    }, [prefillHandle])

    useEffect(() => {
        if (user && open) {
            setShippingName(user.shippingName || user.name || "")
            setShippingPhone(user.shippingPhone || user.phone || "")
            setShippingAddress(user.shippingAddress || "")
        }
    }, [user, open])

    // 다이얼로그 닫힐 때 폼 초기화
    useEffect(() => {
        if (!open) {
            setChannelName("instagram")
            setChannelSubtype("")
            setChannelUrl(prefillHandle)
            setMotivation("")
            setContentPlan("")
            setPortfolioLinks("")
            setInsightFile(null)
            setDesiredCost("")
            setAppealMessage("")
            setTargetCreatorId("")
            // 배송 정보는 user effect가 다시 채워주지만, 기본적으로 초기화
            setShippingName("")
            setShippingPhone("")
            setShippingAddress("")
            setShippingDetailAddress("")
        }
    }, [open, prefillHandle])

    const handleGenerateAIPlan = async () => {
        if (!target) return
        setIsAIPlanning(true)
        try {
            const response = await fetch('/api/generate-content-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: target.productName || target.targetName,
                    sellingPoints: target.sellingPoints || "제품의 일반적인 강점",
                    category: target.category || "기타",
                    requiredShots: target.requiredShots || "자유로운 구도",
                })
            })
            const data = await response.json()
            if (data.result) {
                if (data.result.motivation && data.result.content_plan) {
                    setMotivation(data.result.motivation)
                    setContentPlan(data.result.content_plan)
                } else if (typeof data.result === 'string') {
                    setContentPlan(data.result)
                }
            }
        } catch {
            alert("AI 기획안 생성에 실패했습니다.")
        } finally {
            setIsAIPlanning(false)
        }
    }

    const handleSubmit = async () => {
        if (!channelUrl || !motivation || !contentPlan) {
            alert("활동 채널/계정, 지원 동기, 콘텐츠 제작 계획은 필수 입력 항목입니다.")
            return
        }
        if (teamMembers.length > 0 && !targetCreatorId) {
            alert("지원을 대행할 크리에이터를 선택해주세요.")
            return
        }
        await onSubmit({
            channelName,
            channelUrl,
            channelSubtype,
            motivation,
            contentPlan,
            portfolioLinks,
            insightFile,
            desiredCost,
            appealMessage,
            targetCreatorId: targetCreatorId || undefined,
            shippingName,
            shippingPhone,
            shippingAddress: shippingDetailAddress ? `${shippingAddress} ${shippingDetailAddress}`.trim() : shippingAddress,
        })
    }

    const channelPlaceholder: Record<string, string> = {
        instagram: "hongkyuniiii (@ 없이 아이디만)",
        youtube: "채널 아이디 또는 @핸들명",
        tiktok: "채널 아이디 (@ 없이)",
        blog: "블로그 아이디 또는 URL",
        other: "채널 아이디 또는 링크",
    }
    const channelLabel: Record<string, string> = {
        instagram: "인스타그램 아이디",
        youtube: "유튜브 채널 아이디",
        tiktok: "틱톡 아이디",
        blog: "블로그 아이디",
        other: "채널 아이디 / 링크",
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg h-[90vh] sm:max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">협업 제안하기</DialogTitle>
                    <DialogDescription className="text-xs">
                        {target ? `${target.brandName} — ${target.targetName}` : ""}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* MCN/Agency 크리에이터 선택 */}
                    {teamMembers.length > 0 && (
                        <div className="space-y-2 pb-2 border-b">
                            <Label className="text-purple-600 font-bold">크리에이터 선택 (대리 지원)</Label>
                            <Select value={targetCreatorId} onValueChange={setTargetCreatorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="지원을 대행할 크리에이터를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map((m) => (
                                        <SelectItem key={m.user_id} value={m.user_id}>
                                            {m.name || m.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* 진행 채널 */}
                    <div className="space-y-3">
                        <Label>진행 채널 선택 <span className="text-red-500">*</span></Label>
                        <Tabs defaultValue="instagram" onValueChange={(val) => { setChannelName(val); setChannelSubtype('') }} className="w-full">
                            <TabsList className="grid w-full grid-cols-5 bg-background border h-12 p-1">
                                {["instagram", "youtube", "tiktok", "blog", "other"].map((ch) => (
                                    <TabsTrigger
                                        key={ch}
                                        value={ch}
                                        className="rounded-md text-xs font-medium transition-all border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20"
                                    >
                                        {ch === "instagram" ? "Instagram" :
                                            ch === "youtube" ? "YouTube" :
                                                ch === "tiktok" ? "TikTok" :
                                                    ch === "blog" ? "Blog" : "기타"}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>

                        {/* Channel Subtype */}
                        {channelName === 'instagram' && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                                <span className="text-xs text-muted-foreground min-w-[36px]">형태</span>
                                <div className="flex gap-1.5">
                                    {[{ id: 'instagram_reels', label: '릴스', emoji: '🎞️' }, { id: 'instagram_feed', label: '피드', emoji: '📷' }, { id: 'instagram_story', label: '스토리', emoji: '⭕' }].map(sub => (
                                        <button type="button" key={sub.id}
                                            onClick={() => setChannelSubtype(channelSubtype === sub.id ? '' : sub.id)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 ${channelSubtype === sub.id
                                                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 border-transparent text-white shadow-md scale-105'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span>{sub.emoji}</span><span>{sub.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {channelName === 'youtube' && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                                <span className="text-xs text-muted-foreground min-w-[36px]">형태</span>
                                <div className="flex gap-1.5">
                                    {[{ id: 'youtube_longform', label: '롱폼', emoji: '▶️' }, { id: 'youtube_shorts', label: '숏츠', emoji: '⚡' }].map(sub => (
                                        <button type="button" key={sub.id}
                                            onClick={() => setChannelSubtype(channelSubtype === sub.id ? '' : sub.id)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 ${channelSubtype === sub.id
                                                ? 'bg-gradient-to-r from-red-600 to-red-700 border-transparent text-white shadow-md scale-105'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span>{sub.emoji}</span><span>{sub.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {channelName === 'other' && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                                <span className="text-xs text-muted-foreground min-w-[36px]">채널명</span>
                                <Input
                                    value={channelSubtype.startsWith('other:') ? channelSubtype.slice(6) : ''}
                                    onChange={e => setChannelSubtype(e.target.value ? `other:${e.target.value}` : '')}
                                    placeholder="예: 팟캐스트, 카카오뷰, 네이버 클립..."
                                    className="h-8 text-xs max-w-xs rounded-full"
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{channelLabel[channelName]}</Label>
                            <Input
                                value={channelUrl}
                                onChange={(e) => setChannelUrl(e.target.value)}
                                placeholder={channelPlaceholder[channelName]}
                                className="bg-muted/30"
                            />
                        </div>
                    </div>

                    {/* 지원 동기 */}
                    <div className="space-y-2">
                        <Label>지원 동기 <span className="text-red-500">*</span></Label>
                        <Textarea
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                            placeholder="이 제품/캠페인에 관심을 갖게 된 계기나 표현하고 싶은 포인트를 적어주세요."
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* 콘텐츠 제작 계획 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>콘텐츠 제작 계획 <span className="text-red-500">*</span></Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                onClick={handleGenerateAIPlan}
                                disabled={isAIPlanning}
                            >
                                {isAIPlanning
                                    ? <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    : <Sparkles className="mr-1 h-3 w-3" />}
                                AI 기획안 받기
                            </Button>
                        </div>
                        <Textarea
                            value={contentPlan}
                            onChange={(e) => setContentPlan(e.target.value)}
                            className="min-h-[150px]"
                            placeholder="어떤 컨셉과 흐름(오프닝, 본문, 클로징)으로 콘텐츠를 제작할지 구체적으로 작성해주세요."
                        />
                    </div>

                    {/* 포트폴리오 */}
                    <div className="space-y-2">
                        <Label>포트폴리오 링크 (선택)</Label>
                        <Textarea
                            value={portfolioLinks}
                            onChange={(e) => setPortfolioLinks(e.target.value)}
                            placeholder="관련된 콘텐츠 URL을 줄바꿈으로 구분하여 입력해주세요."
                            className="min-h-[80px]"
                        />
                    </div>

                    {/* 인사이트 캡처 */}
                    <div className="space-y-2">
                        <Label>인사이트 캡처 (선택)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) setInsightFile(e.target.files[0])
                                }}
                                className="cursor-pointer"
                            />
                            {insightFile && <span className="text-xs text-emerald-600 font-bold">선택됨</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            계정 도달수나 팔로워 인사이트 캡처를 첨부하면 선정 확률이 높아집니다.
                        </p>
                    </div>

                    {/* 희망 원고료 */}
                    <div className="space-y-2 border-t pt-3">
                        <Label>희망 원고료 (선택)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₩</span>
                            <Input
                                type="number"
                                value={desiredCost}
                                onChange={(e) => setDesiredCost(e.target.value)}
                                placeholder="0"
                                className="pl-8"
                            />
                        </div>
                        {target?.budget && (
                            <p className="text-xs text-muted-foreground">
                                브랜드가 제시한 예산: {target.budget}
                            </p>
                        )}
                    </div>

                    {/* 추가 메시지 */}
                    <div className="space-y-2">
                        <Label>추가 어필 메시지 (선택)</Label>
                        <Textarea
                            value={appealMessage}
                            onChange={(e) => setAppealMessage(e.target.value)}
                            className="min-h-[80px]"
                            placeholder="기타 브랜드에게 하고 싶은 말이 있다면 자유롭게 적어주세요."
                        />
                    </div>

                    {/* 배송 정보 (캠페인 등 제품 수령용) */}
                    <div className="space-y-4 pt-4 border-t mt-2">
                        <Label className="text-base text-foreground">배송 정보 <span className="text-muted-foreground text-xs font-normal">(제품 수령용)</span></Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">수령인 이름</Label>
                                <Input
                                    value={shippingName}
                                    onChange={(e) => setShippingName(e.target.value)}
                                    placeholder="본명 또는 닉네임"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">수령인 연락처</Label>
                                <Input
                                    value={shippingPhone}
                                    onChange={(e) => setShippingPhone(e.target.value)}
                                    placeholder="010-0000-0000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">배송지 주소</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={shippingAddress}
                                    readOnly
                                    placeholder="주소 검색을 클릭하여 기본 주소를 입력하세요"
                                    className="bg-muted text-foreground"
                                />
                                <Button type="button" variant="outline" onClick={() => setIsAddressSearchOpen(true)} className="shrink-0 gap-2">
                                    주소 검색
                                </Button>
                            </div>
                            <Input
                                value={shippingDetailAddress}
                                onChange={(e) => setShippingDetailAddress(e.target.value)}
                                placeholder="상세 주소 입력"
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <AddressSearchDialog
                        open={isAddressSearchOpen}
                        onOpenChange={setIsAddressSearchOpen}
                        onComplete={(data) => {
                            setShippingAddress(`[${data.zonecode}] ${data.address}`)
                            setShippingDetailAddress('')
                        }}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="font-bold">
                        {isSubmitting
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Send className="mr-2 h-4 w-4" />}
                        제안서 전송
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
