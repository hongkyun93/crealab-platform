"use client"

import { useUnifiedProvider } from "@/components/providers/unified-provider"
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
import { createClient } from "@/lib/supabase/client"
import { Loader2, Send, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface CampaignApplicationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    campaign: any
}

export function CampaignApplicationDialog({
    open,
    onOpenChange,
    campaign
}: CampaignApplicationDialogProps) {
    const { user, addProposal } = useUnifiedProvider()

    // Form State
    const [channelName, setChannelName] = useState("instagram")
    const [channelSubtype, setChannelSubtype] = useState("")
    const [channelUrl, setChannelUrl] = useState("")
    const [motivation, setMotivation] = useState("")
    const [contentPlan, setContentPlan] = useState("")
    const [portfolioLinks, setPortfolioLinks] = useState("")
    const [insightFile, setInsightFile] = useState<File | null>(null)
    const [desiredCost, setDesiredCost] = useState("")
    const [additionalMessage, setAdditionalMessage] = useState("")

    // AI State
    const [isAIPlanning, setIsAIPlanning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // MCN/Agency Support
    const [targetCreatorId, setTargetCreatorId] = useState<string>("")
    const [teamMembers, setTeamMembers] = useState<any[]>([])

    // Pre-fill handle from user profile
    useEffect(() => {
        if (user?.handle) {
            setChannelUrl(user.handle)
        }
    }, [user])

    // Fetch team members for MCN/Agency
    useEffect(() => {
        const fetchTeamMembers = async () => {
            if (user?.role === 'agency' || user?.role === 'mcn') {
                const supabase = createClient()
                const { data } = await supabase
                    .from('team_members')
                    .select('team_id')
                    .eq('user_id', user.id)
                    .single()

                if (data?.team_id) {
                    const { data: members } = await supabase
                        .from('team_members')
                        .select(`
                            id,
                            user_id,
                            profile:profiles!team_members_user_id_fkey (
                                display_name,
                                email
                            )
                        `)
                        .eq('team_id', data.team_id)

                    if (members) {
                        setTeamMembers(members.map((m: any) => ({
                            id: m.id,
                            user_id: m.user_id,
                            name: m.profile?.display_name || m.profile?.email || 'Unknown',
                            email: m.profile?.email
                        })))
                    }
                }
            }
        }
        fetchTeamMembers()
    }, [user])

    // AI Content Plan Generation
    const handleGenerateAIPlan = async () => {
        if (!campaign) return

        setIsAIPlanning(true)
        try {
            const response = await fetch('/api/generate-content-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: campaign.product || campaign.title,
                    sellingPoints: campaign.description || "캠페인 상세 설명",
                    category: campaign.category || campaign.tags?.[0] || "기타",
                    requiredShots: "캠페인 요구사항에 맞는 구성"
                })
            })

            const data = await response.json()
            if (data.result) {
                if (data.result.motivation && data.result.content_plan) {
                    setMotivation(data.result.motivation)
                    setContentPlan(data.result.content_plan)
                    toast.success("AI 기획안이 생성되었습니다!")
                } else if (typeof data.result === 'string') {
                    setContentPlan(data.result)
                    toast.success("AI 기획안이 생성되었습니다!")
                }
            }
        } catch (error) {
            console.error("AI Generation Failed:", error)
            toast.error("AI 기획안 생성에 실패했습니다.")
        } finally {
            setIsAIPlanning(false)
        }
    }

    // Form Submission
    const handleSubmit = async () => {
        if (!user) {
            toast.error("로그인이 필요합니다.")
            return
        }

        // Validation
        if (!channelUrl || !motivation || !contentPlan) {
            toast.error("활동 채널/계정, 지원 동기, 콘텐츠 제작 계획은 필수 입력 항목입니다.")
            return
        }

        setIsSubmitting(true)
        try {
            // Upload Insight File if exists
            let insightUrl = null
            if (insightFile) {
                const supabase = createClient()
                const fileExt = insightFile.name.split('.').pop()
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `insights/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('campaigns')
                    .upload(filePath, insightFile)

                if (!uploadError) {
                    const { data } = supabase.storage.from('campaigns').getPublicUrl(filePath)
                    insightUrl = data.publicUrl
                }
            }

            // Determine effective creator ID
            const effectiveCreatorId = (user?.role === 'agency' || user?.role === 'mcn')
                ? targetCreatorId
                : user?.id

            if ((user?.role === 'agency' || user?.role === 'mcn') && !targetCreatorId) {
                toast.error("지원을 대행할 크리에이터를 선택해주세요.")
                setIsSubmitting(false)
                return
            }

            // Format message with all info
            const formattedMessage = `
[지원 정보]
- 활동 채널: ${channelName} (${channelUrl})
- 희망 원고료: ${desiredCost || '제시 없음'}
- 포트폴리오: ${portfolioLinks || '없음'}
- 인사이트 첨부: ${insightUrl ? '첨부됨' : '없음'}

[지원 동기]
${motivation}

[콘텐츠 제작 계획]
${contentPlan}

[추가 메시지]
${additionalMessage || '없음'}
            `.trim()

            console.log("Submitting campaign application:", {
                campaignId: campaign.id,
                brandId: campaign.brandId,
                creatorId: effectiveCreatorId
            })

            await addProposal({
                type: "campaign_apply",
                dealType: "ad",
                campaignId: campaign.id,
                cost: desiredCost ? Number(desiredCost.replace(/[^0-9]/g, '')) : 0,
                commission: 0,
                requestDetails: formattedMessage,
                status: "applied",
                fromId: effectiveCreatorId,
                toId: campaign.brandId,
                // Structured data
                motivation: motivation,
                content_plan: contentPlan,
                portfolioLinks: portfolioLinks ? [portfolioLinks] : [],
                channel_name: channelName,
                channel_url: channelUrl,
                channel_subtype: channelSubtype || undefined, // [NEW]
                insightScreenshot: insightUrl || undefined,
            })

            toast.success("캠페인 지원서가 성공적으로 전송되었습니다!")
            onOpenChange(false)

            // Reset form
            setChannelName("instagram")
            setChannelSubtype("")
            setChannelUrl(user?.handle || "")
            setMotivation("")
            setContentPlan("")
            setPortfolioLinks("")
            setInsightFile(null)
            setDesiredCost("")
            setAdditionalMessage("")

        } catch (error) {
            console.error("Application Error:", error)
            toast.error("지원서 전송 중 오류가 발생했습니다.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!campaign) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">캠페인 협업 제안하기</DialogTitle>
                    <DialogDescription className="text-sm">
                        브랜드에게 전달할 지원 정보와 기획안을 작성해주세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* MCN/Agency Creator Selection */}
                    {teamMembers && teamMembers.length > 0 && (
                        <div className="space-y-2 pb-2 border-b">
                            <Label htmlFor="creator_select" className="text-purple-600 font-bold">
                                크리에이터 선택 (대리 지원)
                            </Label>
                            <Select value={targetCreatorId} onValueChange={setTargetCreatorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="지원을 대행할 크리에이터를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map((member) => (
                                        <SelectItem key={member.user_id || member.id} value={member.user_id || member.id}>
                                            {member.name || member.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Channel Selection */}
                    <div className="space-y-4">
                        <Label>진행 채널 선택 <span className="text-red-500">*</span></Label>
                        <Tabs defaultValue="instagram" onValueChange={(val) => {
                            setChannelName(val)
                            setChannelSubtype("") // 채널 변경 시 서브타입 초기화
                        }} className="w-full">
                            <TabsList className="grid w-full grid-cols-5 bg-background border h-12 p-1">
                                <TabsTrigger value="instagram" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200 border border-transparent rounded-md text-xs font-medium transition-all">
                                    Instagram
                                </TabsTrigger>
                                <TabsTrigger value="youtube" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 data-[state=active]:border-red-200 border border-transparent rounded-md text-xs font-medium transition-all">
                                    YouTube
                                </TabsTrigger>
                                <TabsTrigger value="tiktok" className="data-[state=active]:bg-stone-100 data-[state=active]:text-stone-900 data-[state=active]:border-stone-200 border border-transparent rounded-md text-xs font-medium transition-all">
                                    TikTok
                                </TabsTrigger>
                                <TabsTrigger value="blog" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:border-green-200 border border-transparent rounded-md text-xs font-medium transition-all">
                                    Blog
                                </TabsTrigger>
                                <TabsTrigger value="other" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent rounded-md text-xs font-medium transition-all">
                                    기타
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* 서브타입 선택 (인스타/유튜브만) */}
                        {channelName === 'instagram' && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                                <span className="text-xs text-muted-foreground min-w-[36px]">형태</span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {[{ id: 'instagram_reels', label: '릴스', emoji: '🎞️' }, { id: 'instagram_feed', label: '피드', emoji: '📷' }, { id: 'instagram_story', label: '스토리', emoji: '⭕' }].map(sub => (
                                        <button
                                            key={sub.id}
                                            type="button"
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
                                        <button
                                            key={sub.id}
                                            type="button"
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

                        <div className="space-y-2">
                            <Label htmlFor="channelUrl" className="text-xs text-muted-foreground">
                                {channelName === 'instagram' && '인스타그램 프로필 주소 또는 ID'}
                                {channelName === 'youtube' && '유튜브 채널 주소'}
                                {channelName === 'tiktok' && '틱톡 프로필 주소'}
                                {channelName === 'blog' && '블로그 주소'}
                                {channelName === 'other' && '채널/포트폴리오 주소'}
                            </Label>
                            <Input
                                id="channelUrl"
                                value={channelUrl}
                                onChange={(e) => setChannelUrl(e.target.value)}
                                placeholder={
                                    channelName === 'instagram' ? "https://instagram.com/userid" :
                                        channelName === 'youtube' ? "https://youtube.com/@channel" :
                                            "https://..."
                                }
                                className="bg-muted/30"
                            />
                        </div>
                    </div>

                    {/* Motivation */}
                    <div className="space-y-2">
                        <Label htmlFor="motivation">
                            지원 동기 <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="motivation"
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                            placeholder="이 캠페인에 지원하게 된 계기나, 표현하고 싶은 포인트를 적어주세요."
                            className="min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Content Plan with AI */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="contentPlan">
                                콘텐츠 제작 계획 <span className="text-red-500">*</span>
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                onClick={handleGenerateAIPlan}
                                disabled={isAIPlanning}
                            >
                                {isAIPlanning ? (
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-1 h-3 w-3" />
                                )}
                                AI 기획안 받기
                            </Button>
                        </div>
                        <Textarea
                            id="contentPlan"
                            value={contentPlan}
                            onChange={(e) => setContentPlan(e.target.value)}
                            className="min-h-[150px] resize-none"
                            placeholder="어떤 컨셉과 흐름(오프닝, 본문, 클로징)으로 영상을 제작할지 구체적으로 작성해주세요."
                        />
                    </div>

                    {/* Portfolio Links */}
                    <div className="space-y-2">
                        <Label htmlFor="portfolio">포트폴리오 링크 (선택)</Label>
                        <Textarea
                            id="portfolio"
                            value={portfolioLinks}
                            onChange={(e) => setPortfolioLinks(e.target.value)}
                            placeholder="관련된 콘텐츠 URL을 줄바꿈으로 구분하여 입력해주세요."
                            className="min-h-[80px] resize-none"
                        />
                    </div>

                    {/* Insight File */}
                    <div className="space-y-2">
                        <Label htmlFor="insight">인사이트 캡처 (선택)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="insight"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setInsightFile(e.target.files[0])
                                    }
                                }}
                                className="cursor-pointer"
                            />
                            {insightFile && <span className="text-xs text-emerald-600 font-bold">선택됨</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            계정 도달수나 팔로워 인사이트 캡처를 첨부하면 선정 확률이 높아집니다.
                        </p>
                    </div>

                    {/* Desired Cost */}
                    <div className="space-y-2 border-t pt-4">
                        <Label htmlFor="cost">희망 원고료 (선택)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₩</span>
                            <Input
                                id="cost"
                                type="number"
                                value={desiredCost}
                                onChange={(e) => setDesiredCost(e.target.value)}
                                placeholder="0"
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {/* Additional Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">추가 메시지</Label>
                        <Textarea
                            id="message"
                            value={additionalMessage}
                            onChange={(e) => setAdditionalMessage(e.target.value)}
                            className="min-h-[80px] resize-none"
                            placeholder="기타 브랜드에게 하고 싶은 말이 있다면 적어주세요."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        취소
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="font-bold">
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        제안서 전송
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
