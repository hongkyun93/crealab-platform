"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, User, BadgeCheck, MessageCircle, Share2, MapPin, Package, Send, SearchX, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { usePlatform } from "@/components/providers/platform-provider"
import { useEffect, useState } from "react"
import { InfluencerEvent } from "@/components/providers/platform-provider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function EventDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { events, user, sendNotification, supabase, products } = usePlatform()
    const [event, setEvent] = useState<InfluencerEvent | null>(null)
    const [showProposalDialog, setShowProposalDialog] = useState(false)

    // Proposal form state
    const [productName, setProductName] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [productUrl, setProductUrl] = useState("")
    const [productType, setProductType] = useState<"gift" | "loan">("gift")
    const [compensationAmount, setCompensationAmount] = useState("")
    const [hasIncentive, setHasIncentive] = useState(false)
    const [incentiveDetail, setIncentiveDetail] = useState("")
    const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
    const [customContentType, setCustomContentType] = useState("")
    const [desiredDate, setDesiredDate] = useState<Date>()
    const [dateFlexible, setDateFlexible] = useState(false)
    const [draftSubmissionDate, setDraftSubmissionDate] = useState<Date>()
    const [finalSubmissionDate, setFinalSubmissionDate] = useState<Date>()
    const [secondaryUsagePeriod, setSecondaryUsagePeriod] = useState("")
    const [proposalMessage, setProposalMessage] = useState("")
    const [videoGuide, setVideoGuide] = useState("brand_provided")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingEvent, setIsLoadingEvent] = useState(false)

    useEffect(() => {
        const loadEvent = async () => {
            if (!params.id || params.id === 'default') return

            // 1. Try to find in context first
            const fromContext = events.find(e => String(e.id) === String(params.id))

            let targetEvent: InfluencerEvent | null | undefined = fromContext

            // 2. If not in context, fetch from DB
            if (!targetEvent) {
                setIsLoadingEvent(true)
                try {
                    const { data: e, error } = await supabase
                        .from('influencer_events')
                        .select(`
                            *,
                            profiles:influencer_id(
                                display_name,
                                avatar_url,
                                role,
                                influencer_details(*)
                            )
                        `)
                        .eq('id', params.id)
                        .single()

                    if (e) {
                        const profile = e.profiles;
                        const details = profile?.influencer_details ? (Array.isArray(profile.influencer_details) ? profile.influencer_details[0] : profile.influencer_details) : null;

                        targetEvent = {
                            id: e.id,
                            influencer: profile?.display_name || "Unknown",
                            influencerId: e.influencer_id,
                            handle: details?.instagram_handle || "",
                            avatar: profile?.avatar_url || "",
                            category: e.category,
                            event: e.title,
                            date: new Date(e.created_at).toISOString().split('T')[0],
                            description: e.description,
                            tags: e.tags || [],
                            verified: e.is_verified || false,
                            followers: details?.followers_count || 0,
                            priceVideo: details?.price_video || 0,
                            targetProduct: e.target_product || "",
                            eventDate: e.event_date || "",
                            postingDate: e.posting_date || "",
                            guide: e.guide || "",
                            status: e.status || ((e.event_date && new Date(e.event_date) < new Date()) ? 'completed' : 'recruiting'),
                            isPrivate: e.is_private,
                            schedule: e.schedule
                        }
                    }
                } catch (err) {
                    console.error("Failed to load event directly:", err)
                } finally {
                    setIsLoadingEvent(false)
                }
            }

            // 3. Update state
            if (targetEvent) {
                setEvent(targetEvent)
            }
        }

        loadEvent()
    }, [params.id, events, supabase])

    const generateDefaultMessage = (ev: InfluencerEvent, u: any) => {
        return `안녕하세요 ${ev.influencer}님,
${u.name}의 담당자입니다.

올려주신 '${ev.event}' 모먼트${ev.eventDate ? `(${ev.eventDate} 예정)` : ''}를 인상 깊게 보았습니다.
저희 브랜드의 결과 핏이 잘 맞을 것 같아 협업을 제안드립니다.

[ 제안 드리는 제품명 ] 제품을 제공해드리고 싶으며,
[ 희망 콘텐츠 형식 ] 형식으로 소개해주시면 좋을 것 같습니다.

긍정적인 검토 부탁드립니다.
감사합니다.`
    }

    const handlePropose = () => {
        if (!user) {
            router.push("/login")
            return
        }
        if (event && !proposalMessage) {
            setProposalMessage(generateDefaultMessage(event, user))
        }
        setShowProposalDialog(true)
    }

    const handleSubmitProposal = async (e?: React.MouseEvent) => {
        // Prevent default form submission if any
        if (e) e.preventDefault()

        // Prevent duplicate submissions
        if (isSubmitting) return

        if (!user || !event) return

        if (!productName || !proposalMessage) {
            alert("제품명과 제안 메시지는 필수입니다.")
            return
        }

        setIsSubmitting(true)

        setIsSubmitting(true)
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 15000)
            })

            console.log("Submitting proposal to DB...")
            const dbPromise = supabase
                .from('brand_proposals')
                .insert({
                    brand_id: user.id,
                    influencer_id: event.influencerId,
                    product_name: productName,
                    product_type: productType,
                    compensation_amount: compensationAmount || null,
                    has_incentive: hasIncentive,
                    incentive_detail: hasIncentive ? incentiveDetail : null,
                    content_type: [...selectedContentTypes, customContentType.trim()].filter(Boolean).join(', ') || null,
                    desired_date: desiredDate ? format(desiredDate, "yyyy-MM-dd") : null,
                    condition_draft_submission_date: draftSubmissionDate ? format(draftSubmissionDate, "yyyy-MM-dd") : null,
                    condition_final_submission_date: finalSubmissionDate ? format(finalSubmissionDate, "yyyy-MM-dd") : null,
                    condition_upload_date: desiredDate ? format(desiredDate, "yyyy-MM-dd") : null, // Sync desired_date with condition_upload_date
                    condition_secondary_usage_period: secondaryUsagePeriod || "불가",
                    date_flexible: dateFlexible,
                    message: proposalMessage,
                    video_guide: videoGuide,
                    product_id: selectedProduct?.id || null,
                    product_url: productUrl || null,
                    status: 'offered'
                })
                .select()
                .single()

            // Race against timeout
            const result: any = await Promise.race([dbPromise, timeoutPromise])
            const { data, error } = result

            if (error) {
                console.error('Error creating proposal (Full):', error)
                console.error('Error Message:', error.message)
                console.error('Error Details:', error.details)
                console.error('Error Hint:', error.hint)
                alert(`제안서 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`)
                return
            }


            // Send Notification to Influencer
            if (event.influencerId) {
                const notifMessage = `${user.name}님이 '${productName}' 협업을 제안했습니다.`
                // We don't await this to keep UI responsive
                sendNotification(event.influencerId, notifMessage, 'proposal_received', data.id)
            }

            // Success
            alert("제안서가 성공적으로 발송되었습니다!")
            setShowProposalDialog(false)

            // Reset form
            setProductName("")
            setProductType("gift")
            setCompensationAmount("")
            setHasIncentive(false)
            setIncentiveDetail("")
            setCustomContentType("")
            setSelectedContentTypes([])
            setDraftSubmissionDate(undefined)
            setFinalSubmissionDate(undefined)
            setSecondaryUsagePeriod("")
            setProposalMessage("")


        } catch (error: any) {
            console.error("Failed to submit proposal:", error)

            if (error.message === 'REQUEST_TIMEOUT') {
                alert("서버 응답이 지연되고 있습니다. (15초 초과)\n잠시 후 다시 시도해 주세요. 네트워크 상태를 확인 부탁드립니다.")
            } else {
                alert(`제안서 발송 중 예기치 못한 오류가 발생했습니다: ${error.message || "알 수 없음"}`)
            }

        } finally {
            setIsSubmitting(false)
        }
    }



    if (isLoadingEvent) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">모먼트 정보를 불러오는 중입니다...</p>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-muted/30">
                <SiteHeader />
                <main className="container flex flex-col items-center justify-center py-24 px-4 text-center">
                    <Card className="w-full max-w-md p-8 shadow-lg border-dashed">
                        <div className="flex flex-col items-center gap-6">
                            <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center">
                                <SearchX className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold tracking-tight">모먼트를 찾을 수 없습니다</h1>
                                <p className="text-sm text-muted-foreground break-keep">
                                    요청하신 페이지가 삭제되었거나, 잘못된 주소로 접속하셨습니다.<br />
                                    입력하신 주소를 다시 한번 확인해주세요.
                                </p>
                            </div>
                            <div className="flex w-full gap-2 pt-2">
                                <Button variant="outline" className="flex-1" asChild>
                                    <Link href="/" onClick={() => router.back()}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> 뒤로 가기
                                    </Link>
                                </Button>
                                <Button className="flex-1" asChild>
                                    <Link href="/brand">
                                        목록으로 <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-4xl px-4 mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="gap-2">
                        <Link href="/brand">
                            <ArrowLeft className="h-4 w-4" /> 목록으로
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                    {/* Main Content */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-lg">
                                            {event.influencer[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{event.influencer}</h3>
                                                {event.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{event.handle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">팔로워</p>
                                        <p className="font-bold">{event.followers?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-3">
                                        {event.category}
                                    </span>
                                    <h1 className="text-3xl font-bold mb-4">{event.event}</h1>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">모먼트 일정</p>
                                        <p className="font-semibold">{event.eventDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">콘텐츠 업로드</p>
                                        <p className="font-semibold">{event.postingDate}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Package className="h-4 w-4" /> 광고 가능 아이템
                                    </p>
                                    <p className="text-muted-foreground">{event.targetProduct}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 border rounded-full text-sm text-muted-foreground">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Action */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>일정 및 액션</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">모먼트 일정</p>
                                        <p className="font-semibold">{event.date}</p>
                                    </div>
                                </div>
                                <div className="pt-2 space-y-2">
                                    <Button className="w-full gap-2" size="lg" onClick={handlePropose}>
                                        <MessageCircle className="h-5 w-5" /> 협업 제안하기
                                    </Button>
                                    <Button variant="outline" className="w-full gap-2" onClick={() => alert("링크가 복사되었습니다!")}>
                                        <Share2 className="h-4 w-4" /> 공유하기
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rate Card (New) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BadgeCheck className="h-5 w-5 text-emerald-600" />
                                    예상 단가표 <span className="text-xs font-normal text-muted-foreground ml-1">(Rate Card)</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 relative">
                                {/* Lock Overlay or just visual blur */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-dashed">
                                        <span className="text-sm font-medium text-muted-foreground">숏폼 영상 (Reels)</span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="h-3 w-3 text-muted-foreground/70" />
                                            <span className="font-bold text-emerald-700 blur-[6px] select-none hover:blur-sm transition-all text-sm">
                                                {/* @ts-ignore */}
                                                {event.priceVideo ? `₩${event.priceVideo.toLocaleString()}` : '협의 필요'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-dashed">
                                        <span className="text-sm font-medium text-muted-foreground">이미지 (Feed)</span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="h-3 w-3 text-muted-foreground/70" />
                                            <span className="font-bold text-emerald-700 blur-[6px] select-none hover:blur-sm transition-all text-sm">
                                                {/* @ts-ignore */}
                                                {event.priceFeed ? `₩${event.priceFeed.toLocaleString()}` : '협의 필요'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-dashed">
                                        <span className="text-sm font-medium text-muted-foreground">2차 활용 권한</span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="h-3 w-3 text-muted-foreground/70" />
                                            <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none hover:blur-sm transition-all">
                                                {/* @ts-ignore */}
                                                {event.usageRightsPrice ? (
                                                    <>{/* @ts-ignore */}
                                                        {event.usageRightsMonth}개월 / ₩{event.usageRightsPrice.toLocaleString()}
                                                    </>
                                                ) : (
                                                    '협의 필요'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground">자동 DM (Auto Reply)</span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="h-3 w-3 text-muted-foreground/70" />
                                            <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none hover:blur-sm transition-all">
                                                {/* @ts-ignore */}
                                                {event.autoDmPrice ? (
                                                    <>{/* @ts-ignore */}
                                                        {event.autoDmMonth}개월 / ₩{event.autoDmPrice.toLocaleString()}
                                                    </>
                                                ) : (
                                                    '협의 필요'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-md border border-dashed flex items-start gap-2">
                                    <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted-foreground">
                                        <strong>단가표 비공개 보호</strong><br />
                                        정확한 단가는 협업 제안이 수락되어 <strong>워크스페이스가 생성된 후</strong> 공개됩니다.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Proposal Dialog */}
            <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>협업 제안서 작성</DialogTitle>
                        <DialogDescription>
                            {event.influencer}님에게 보낼 제안서를 작성해주세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Product Name */}
                        <div className="space-y-2">
                            <Label htmlFor="productName">제품명 *</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="productName"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder="예: 프리미엄 스킨케어 세트"
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" title="내 제품 불러오기">
                                            <Package className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[300px]">
                                        <DropdownMenuLabel>내 제품 선택</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {products.filter(p => !user || p.brandId === user.id).map(p => (
                                            <DropdownMenuItem
                                                key={p.id}
                                                className="cursor-pointer flex flex-col items-start gap-1"
                                                onClick={() => {
                                                    setProductName(p.name)
                                                    setSelectedProduct(p)
                                                    setProductUrl(p.link || "")
                                                }}
                                            >
                                                <span className="font-bold">{p.name}</span>
                                                <span className="text-xs text-muted-foreground line-clamp-1">{p.name}</span>
                                            </DropdownMenuItem>
                                        ))}
                                        {products.filter(p => !user || p.brandId === user.id).length === 0 && (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                등록된 제품이 없습니다.
                                            </div>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Product Type (Inline) */}
                        <div className="space-y-2">
                            <Label>제품 제공 방식 *</Label>
                            <RadioGroup
                                value={productType}
                                onValueChange={(v) => setProductType(v as "gift" | "loan")}
                                className="flex flex-row gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="gift" id="gift" />
                                    <Label htmlFor="gift" className="font-normal cursor-pointer">증정 (제품 제공)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="loan" id="loan" />
                                    <Label htmlFor="loan" className="font-normal cursor-pointer">대여 (반납 필요)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Video Guide (New, Inline) */}
                        <div className="space-y-2">
                            <Label>영상 가이드 *</Label>
                            <RadioGroup
                                value={videoGuide}
                                onValueChange={setVideoGuide}
                                className="flex flex-row gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="brand_provided" id="guide_brand" />
                                    <Label htmlFor="guide_brand" className="font-normal cursor-pointer">브랜드 제공</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="creator_planned" id="guide_creator" />
                                    <Label htmlFor="guide_creator" className="font-normal cursor-pointer">크리에이터 기획</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        {/* Compensation */}
                        <div className="space-y-2">
                            <Label htmlFor="compensation">보상 금액 (선택)</Label>
                            <Input
                                id="compensation"
                                value={compensationAmount}
                                onChange={(e) => setCompensationAmount(e.target.value)}
                                placeholder="예: 100만원"
                            />
                        </div>

                        {/* Incentive */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="incentive"
                                    checked={hasIncentive}
                                    onCheckedChange={(checked) => setHasIncentive(checked as boolean)}
                                />
                                <Label htmlFor="incentive" className="font-normal cursor-pointer">
                                    성과 인센티브 제공
                                </Label>
                            </div>
                            {hasIncentive && (
                                <Textarea
                                    value={incentiveDetail}
                                    onChange={(e) => setIncentiveDetail(e.target.value)}
                                    placeholder="인센티브 상세 내용을 입력하세요 (예: 조회수 10만 달성 시 추가 50만원)"
                                    rows={3}
                                />
                            )}
                        </div>

                        {/* Content Type (Multi-select) */}
                        <div className="space-y-3">
                            <Label>희망 콘텐츠 형식 (중복 선택 가능)</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {['릴스 (Reels)', '숏츠 (Shorts)', '틱톡 (TikTok)'].map((type) => (
                                    <div key={type} className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors">
                                        <Checkbox
                                            id={type}
                                            checked={selectedContentTypes.includes(type)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedContentTypes([...selectedContentTypes, type])
                                                } else {
                                                    setSelectedContentTypes(selectedContentTypes.filter(t => t !== type))
                                                }
                                            }}
                                        />
                                        <Label htmlFor={type} className="font-normal cursor-pointer text-xs w-full">{type}</Label>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-1">
                                <Label htmlFor="customContentType" className="text-xs text-muted-foreground mb-1 block">기타 (직접 입력)</Label>
                                <Input
                                    id="customContentType"
                                    value={customContentType}
                                    onChange={(e) => setCustomContentType(e.target.value)}
                                    placeholder="예: 유튜브 브랜디드 콘텐츠, 블로그 리뷰 등"
                                    className="h-9 text-sm"
                                />
                            </div>
                        </div>

                        {/* Secondary Usage Period (New) */}
                        <div className="space-y-2">
                            <Label htmlFor="secondaryUsage">2차 활용 기간 (선택)</Label>
                            <Input
                                id="secondaryUsage"
                                value={secondaryUsagePeriod}
                                onChange={(e) => setSecondaryUsagePeriod(e.target.value)}
                                placeholder="예: 3개월, 6개월 (협의 가능)"
                                className="h-9 text-sm"
                            />
                        </div>

                        {/* Date Pickers Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Draft Submission Date */}
                            <div className="space-y-2">
                                <Label>초안 제출일 (선택)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal h-9 text-sm",
                                                !draftSubmissionDate && "text-muted-foreground"
                                            )}
                                        >
                                            {draftSubmissionDate ? (
                                                format(draftSubmissionDate, "yyyy-MM-dd", { locale: ko })
                                            ) : (
                                                <span>초안 제출일 선택</span>
                                            )}
                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={draftSubmissionDate}
                                            onSelect={setDraftSubmissionDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Final Submission Date */}
                            <div className="space-y-2">
                                <Label>최종본 제출일 (선택)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal h-9 text-sm",
                                                !finalSubmissionDate && "text-muted-foreground"
                                            )}
                                        >
                                            {finalSubmissionDate ? (
                                                format(finalSubmissionDate, "yyyy-MM-dd", { locale: ko })
                                            ) : (
                                                <span>최종본 제출일 선택</span>
                                            )}
                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={finalSubmissionDate}
                                            onSelect={setFinalSubmissionDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Desired Date & Flexible (New) */}
                        <div className="space-y-2">
                            <Label>콘텐츠 업로드일 (선택)</Label>
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !desiredDate && "text-muted-foreground"
                                            )}
                                        >
                                            {desiredDate ? (
                                                format(desiredDate, "yyyy-MM-dd", { locale: ko })
                                            ) : (
                                                <span>콘텐츠 업로드일 선택</span>
                                            )}
                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={desiredDate}
                                            onSelect={setDesiredDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    type="button"
                                    variant={dateFlexible ? "default" : "outline"}
                                    onClick={() => setDateFlexible(!dateFlexible)}
                                    className={cn(
                                        "gap-1",
                                        dateFlexible && "bg-primary text-primary-foreground hover:bg-primary/90"
                                    )}
                                >
                                    {dateFlexible && <BadgeCheck className="h-4 w-4" />}
                                    (쯔음)
                                </Button>
                            </div>
                            {dateFlexible && (
                                <p className="text-xs text-muted-foreground text-primary">
                                    * 희망일 전후로 유동적인 조정이 가능합니다.
                                </p>
                            )}
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label htmlFor="message">제안 메시지 *</Label>
                            <Textarea
                                id="message"
                                value={proposalMessage}
                                onChange={(e) => setProposalMessage(e.target.value)}
                                placeholder="크리에이터에게 전달할 메시지를 작성해주세요."
                                rows={8}
                            />
                            <p className="text-xs text-muted-foreground">
                                * 제안 메시지는 크리에이터에게 첫 인상을 결정하는 중요한 요소입니다. 정중하고 명확하게 작성해주세요.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowProposalDialog(false)} disabled={isSubmitting}>
                            취소
                        </Button>
                        <Button onClick={handleSubmitProposal} disabled={isSubmitting} type="button">
                            {isSubmitting ? "발송 중..." : "제안서 발송"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Security Watermark (Only visible if logged in) */}
            {user && (
                <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex flex-wrap content-center justify-center opacity-[0.03] select-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="w-[300px] h-[300px] flex items-center justify-center -rotate-45">
                            <span className="text-xl font-black text-slate-900 whitespace-nowrap">
                                {user.name} ({user.handle || user.type})<br />
                                CreadyPick Security
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
