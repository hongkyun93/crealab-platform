"use client"

import { submitDirectProposal } from "@/app/actions/proposal"
import { CreatorProfileCard } from "@/components/profile/CreatorProfileCard"
import { ReadonlyProposalDialog } from "@/components/proposal/readonly-proposal-dialog"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { InfluencerEvent, MomentProposal } from "@/lib/types"; // Added MomentProposal
import { cn, formatDateToMonth } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ArrowLeft, BadgeCheck, Calendar, Clock, FileText, Globe, Instagram, Loader2, Lock, MessageCircle, Music, Package, SearchX, Send, Share2, Sparkles, Tv, Youtube } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function EventDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { events, user, sendNotification, supabase, products, refreshData, momentProposals, addMomentProposal } = useUnifiedProvider()
    const [event, setEvent] = useState<InfluencerEvent | null>(null)
    const [showProposalDialog, setShowProposalDialog] = useState(false)
    const [showReadonlyDialog, setShowReadonlyDialog] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState<MomentProposal | null>(null) // [NEW] state

    // Proposal form state
    const [productName, setProductName] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [productUrl, setProductUrl] = useState("")
    const [productType, setProductType] = useState<"gift" | "loan">("gift")
    const [compensationAmount, setCompensationAmount] = useState("")
    const [hasIncentive, setHasIncentive] = useState(false)
    const [incentiveDetail, setIncentiveDetail] = useState("")
    const [channelName, setChannelName] = useState("instagram")
    const [channelSubtype, setChannelSubtype] = useState("")
    const [desiredDate, setDesiredDate] = useState<Date>()
    const [dateFlexible, setDateFlexible] = useState(false)
    const [draftSubmissionDate, setDraftSubmissionDate] = useState<Date>()
    const [finalSubmissionDate, setFinalSubmissionDate] = useState<Date>()
    const [secondaryUsagePeriod, setSecondaryUsagePeriod] = useState("")
    const [secondaryUsageFee, setSecondaryUsageFee] = useState("")
    const [proposalMessage, setProposalMessage] = useState("")
    const [videoGuide, setVideoGuide] = useState("brand_provided")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingEvent, setIsLoadingEvent] = useState(true)

    // [NEW] Auto-fill message logic
    useEffect(() => {
        if (!showProposalDialog) return

        setProposalMessage(prev => {
            let updated = prev

            // 1. Update Product Name Line
            const productLineRegex = /^.*제품을 제공해드리고 싶으며,$/m
            if (productLineRegex.test(updated)) {
                const newProductPart = productName ? `[ ${productName} ]` : `[ 제안 드리는 제품명 ]`
                updated = updated.replace(productLineRegex, `${newProductPart} 제품을 제공해드리고 싶으며,`)
            }

            // 2. Update Channel Line
            const contentLineRegex = /^.*형식으로 소개해주시면 좋을 것 같습니다\.$/m
            const SUBTYPE_LABELS: Record<string, string> = {
                instagram_reels: '릴스', instagram_feed: '피드', instagram_story: '스토리',
                youtube_longform: '롱폼', youtube_shorts: '숏츠',
            }
            const channelLabel = channelSubtype
                ? (channelSubtype.startsWith('other:') ? channelSubtype.slice(6) : (SUBTYPE_LABELS[channelSubtype] || channelSubtype))
                : channelName

            if (contentLineRegex.test(updated)) {
                const newContentPart = channelLabel ? `[ ${channelLabel} ]` : `[ 희망 콘텐츠 형식 ]`
                updated = updated.replace(contentLineRegex, `${newContentPart} 형식으로 소개해주시면 좋을 것 같습니다.`)
            }

            return updated
        })
    }, [productName, channelName, channelSubtype, showProposalDialog])

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
                        .from('life_moments')
                        .select(`
                            *,
                            profiles:influencer_id(
                                display_name,
                                avatar_url,
                                role,
                                instagram_handle,
                                followers_count,
                                price_video,
                                social_channels(*)
                            )
                        `)
                        .eq('id', params.id)
                        .single()

                    if (e) {
                        const profile = e.profiles || {};

                        targetEvent = {
                            id: e.id,
                            influencer: profile.display_name || "Unknown",
                            influencerId: e.influencer_id,
                            handle: profile.instagram_handle || "",
                            avatar: profile.avatar_url || "",
                            category: e.category || "Life Moment", // Default category
                            event: e.title, // map 'title' to 'event'
                            date: new Date(e.created_at).toISOString().split('T')[0],
                            description: e.description,
                            tags: e.tags || [],
                            verified: e.is_verified || false,
                            followers: profile.followers_count || 0,
                            priceVideo: profile.price_video || 0,
                            targetProduct: e.target_product || "",
                            eventDate: e.event_date || "",
                            postingDate: e.posting_date || "",
                            guide: e.guide || "",
                            status: e.status || ((e.event_date && new Date(e.event_date) < new Date()) ? 'completed' : 'recruiting'),
                            isPrivate: e.is_private,
                            dateFlexible: e.date_flexible || false,
                            schedule: e.schedule,
                            channels: e.channels || [],
                            socialChannels: (profile.social_channels || []).map((c: any) => ({
                                platform: c.channel_type || c.platform || '',
                                handle: c.handle || '',
                                followersCount: c.followers_count || 0,
                            }))
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
            setIsLoadingEvent(false)
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
            // 공유링크 플로우: 로그인 후 이 페이지로 자동 복귀
            router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        // Pre-fill channel from creator's preferred channels
        if (event?.channels && event.channels.length > 0) {
            const firstChannel = event.channels[0]
            // Check if it's a subtype (e.g., "instagram_reels") or base channel (e.g., "tiktok")
            const baseCh = firstChannel.split("_")[0]
            const hasSubtype = firstChannel.includes("_") && firstChannel !== baseCh
            setChannelName(baseCh)
            setChannelSubtype(hasSubtype ? firstChannel : "")
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
            toast.error("제품명과 제안 메시지는 필수입니다.")
            return
        }


        setIsSubmitting(true)
        try {

            const proposalData = {
                influencer_id: event.influencerId,
                event_id: event.id,
                product_name: productName,
                product_type: productType,
                compensation_amount: compensationAmount ? String(parseInt(compensationAmount.replace(/[^0-9]/g, ''))) : null,
                has_incentive: hasIncentive,
                incentive_detail: hasIncentive ? incentiveDetail : null,
                channel_name: channelName,
                channel_subtype: channelSubtype || null,
                desired_date: desiredDate ? format(desiredDate, "yyyy-MM-dd") : null,
                condition_draft_submission_date: draftSubmissionDate ? format(draftSubmissionDate, "yyyy-MM-dd") : null,
                condition_final_submission_date: finalSubmissionDate ? format(finalSubmissionDate, "yyyy-MM-dd") : null,
                condition_upload_date: desiredDate ? format(desiredDate, "yyyy-MM-dd") : null,
                condition_secondary_usage_period: secondaryUsagePeriod || "불가",
                secondary_usage_fee: secondaryUsageFee ? parseInt(secondaryUsageFee.replace(/[^0-9]/g, '')) : 0,
                date_flexible: dateFlexible,
                message: proposalMessage,
                video_guide: videoGuide,
                product_id: selectedProduct?.id || null,
                product_url: productUrl || null,
            }

            // Call Server Action
            const { success, data, error } = await submitDirectProposal(proposalData)

            if (!success || error) {
                console.error('Error creating proposal (Server Action):', error)
                throw new Error(error || "Unknown Server Error")
            }

            // Optimistic Update
            if (addMomentProposal) {
                const optimisticProposal: any = {
                    id: data.id,
                    moment_id: event.id,
                    brand_id: user.id,
                    influencer_id: event.influencerId,
                    status: 'offered',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),

                    // Joins (Optimistic)
                    brand_name: user.name,
                    brand_avatar: user.avatar,
                    influencer_name: event.influencer,
                    influencer_avatar: event.avatar,
                    moment_title: event.event,

                    // Conditions
                    conditions: {
                        product_name: productName,
                        product_type: productType,
                        compensation_amount: compensationAmount,
                        has_incentive: hasIncentive,
                        incentive_detail: incentiveDetail,
                        content_type: undefined, // deprecated
                        channel_name: channelName,
                        channel_subtype: channelSubtype || null,
                        desired_date: desiredDate ? format(desiredDate, "yyyy-MM-dd") : null,
                        condition_draft_submission_date: draftSubmissionDate ? format(draftSubmissionDate, "yyyy-MM-dd") : null,
                        condition_final_submission_date: finalSubmissionDate ? format(finalSubmissionDate, "yyyy-MM-dd") : null,
                        condition_upload_date: desiredDate ? format(desiredDate, "yyyy-MM-dd") : null,
                        condition_secondary_usage_period: secondaryUsagePeriod || "불가",
                        secondary_usage_fee: secondaryUsageFee ? parseInt(secondaryUsageFee.replace(/[^0-9]/g, '')) : 0,
                        video_guide: videoGuide,
                        product_url: productUrl
                    },
                    product_name: productName,
                    price_offer: compensationAmount ? parseInt(compensationAmount.replace(/[^0-9]/g, '')) : 0,
                    // [Added] Top-level condition fields for immediate UI reflection
                    condition_product_receipt_date: null, // Usually not set on creation
                    condition_draft_submission_date: draftSubmissionDate ? format(draftSubmissionDate, "yyyy-MM-dd") : null,
                    condition_final_submission_date: finalSubmissionDate ? format(finalSubmissionDate, "yyyy-MM-dd") : null,
                    condition_upload_date: desiredDate ? format(desiredDate, "yyyy-MM-dd") : null,
                    condition_secondary_usage_period: secondaryUsagePeriod || "불가",
                    secondary_usage_fee: secondaryUsageFee ? parseInt(secondaryUsageFee.replace(/[^0-9]/g, '')) : 0,
                    product_url: productUrl,
                    product_type: productType,
                    channel_name: channelName,
                    channel_subtype: channelSubtype || null,
                }
                addMomentProposal(optimisticProposal)
            }

            // Success
            toast.success("제안서가 성공적으로 발송되었습니다!")
            setShowProposalDialog(false)

            // Trigger manual refresh in background (Do not await)
            if (refreshData) refreshData()

            // Reset form
            setProductName("")
            setProductUrl("") // [NEW] Reset URL
            setProductType("gift")
            setCompensationAmount("")
            setHasIncentive(false)
            setIncentiveDetail("")
            setChannelName("instagram")
            setChannelSubtype("")
            setDraftSubmissionDate(undefined)
            setFinalSubmissionDate(undefined)
            setSecondaryUsagePeriod("")
            setSecondaryUsageFee("")
            setProposalMessage("")


        } catch (error: any) {
            console.error("Failed to submit proposal:", error)

            if (error.message === 'REQUEST_TIMEOUT') {
                toast.error("서버 응답이 지연되고 있습니다. (15초 초과)\n잠시 후 다시 시도해 주세요. 네트워크 상태를 확인 부탁드립니다.")
            } else {
                toast.error(`제안서 발송 중 예기치 못한 오류가 발생했습니다: ${error.message || "알 수 없음"}`)
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

    // Helper: group channels by platform for display
    const channelsByPlatform = (event.channels || []).reduce<Record<string, string[]>>((acc, ch) => {
        const base = ch.split("_")[0]
        if (!acc[base]) acc[base] = []
        acc[base].push(ch)
        return acc
    }, {})

    const CHANNEL_DISPLAY: Record<string, { Icon: any; bg: string; label: string }> = {
        instagram: { Icon: Instagram, bg: "from-purple-600 via-pink-600 to-orange-600", label: "Instagram" },
        youtube: { Icon: Youtube, bg: "from-red-600 to-red-700", label: "YouTube" },
        tiktok: { Icon: Music, bg: "from-black to-slate-800", label: "TikTok" },
        blog: { Icon: FileText, bg: "from-green-500 to-green-600", label: "Blog" },
    }

    const CONTENT_TYPE_LABELS: Record<string, string> = {
        instagram_reels: "🎞️ 릴스", instagram_feed: "📷 피드", instagram_story: "⭕ 스토리",
        youtube_longform: "▶️ 롱폼", youtube_shorts: "⚡ 숏츠",
    }

    const formatFollowers = (n: number) => {
        if (n >= 10000) return `${(n / 10000).toFixed(1)}만`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return String(n)
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container max-w-7xl mx-auto px-4 py-4">
                <Button variant="ghost" size="sm" asChild className="gap-2 mb-3">
                    <Link href="/brand">
                        <ArrowLeft className="h-4 w-4" /> 목록으로
                    </Link>
                </Button>

                {/* ===== Design E: 3-Column Layout ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-5">

                    {/* ─── COL 1: Profile + Meta ─── */}
                    <div className="space-y-4">
                        {/* Profile Card */}
                        <CreatorProfileCard
                            creatorId={event.influencerId || ''}
                            trigger={
                                <div className="rounded-xl border bg-card p-5 text-center cursor-pointer hover:border-primary/40 transition-all">
                                    {event.avatar ? (
                                        <img src={event.avatar} alt="" className="h-24 w-24 rounded-full object-cover border-3 border-primary/20 mx-auto mb-3 shadow-lg" />
                                    ) : (
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center font-bold text-white text-3xl mx-auto mb-3 shadow-lg">
                                            {event.influencer?.[0]?.toUpperCase() || 'C'}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <span className="font-bold text-xl">{event.influencer}</span>
                                        {event.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                                    </div>
                                </div>
                            }
                        />

                        {/* Schedule */}
                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-primary" /> 모먼트 일정
                                </div>
                                <span className="text-base font-bold text-primary">{formatDateToMonth(event.eventDate) || "미정"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 text-emerald-600" /> 업로드 시기
                                </div>
                                <span className="text-base font-bold text-emerald-600">
                                    {event.dateFlexible ? "협의 가능" : (formatDateToMonth(event.postingDate) || "미정")}
                                </span>
                            </div>
                        </div>

                        {/* Channels: handle + followers + content types */}
                        {Object.keys(channelsByPlatform).length > 0 && (
                            <div className="rounded-xl border bg-card p-4">
                                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                    <Tv className="h-4 w-4" /> 희망 채널 · 형태
                                </p>
                                <div className="space-y-3">
                                    {Object.entries(channelsByPlatform).map(([platform, subtypes]) => {
                                        const chInfo = CHANNEL_DISPLAY[platform] || { Icon: Globe, bg: "from-slate-600 to-slate-700", label: platform }
                                        const ChIcon = chInfo.Icon
                                        const social = event.socialChannels?.find(sc => sc.platform === platform)
                                        return (
                                            <div key={platform} className="p-3 rounded-lg bg-muted/50">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${chInfo.bg} flex items-center justify-center shrink-0`}>
                                                        <ChIcon className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold truncate">{social?.handle || chInfo.label}</p>
                                                        {social && (
                                                            <p className="text-xs text-muted-foreground">팔로워 {formatFollowers(social.followersCount)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 pl-10">
                                                    {subtypes.map(st => (
                                                        <span key={st} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-white bg-gradient-to-r ${chInfo.bg} shadow-sm`}>
                                                            {CONTENT_TYPE_LABELS[st] || st}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Target Product */}
                        <div className="rounded-xl border bg-card p-4">
                            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                <Package className="h-4 w-4" /> 광고 가능 아이템
                            </p>
                            <p className="text-base font-medium leading-snug">{event.targetProduct}</p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                            {event.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-sm px-3 py-1">{tag}</Badge>
                            ))}
                        </div>
                    </div>

                    {/* ─── COL 2: Title + Description + Guide ─── */}
                    <div className="space-y-5">
                        <h1 className="text-3xl font-bold tracking-tight leading-tight">{event.event}</h1>

                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">상세 설명</h3>
                            <p className="text-base leading-[1.85] whitespace-pre-wrap">{event.description}</p>
                        </div>

                        {event.guide && (
                            <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/5 border-amber-200/50 p-6">
                                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> 제작 가이드
                                </h3>
                                <p className="text-base leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">{event.guide}</p>
                                <p className="text-xs text-amber-600/60 mt-3 pt-3 border-t border-amber-200/40">💡 크리에이터 제안 가이드입니다. 언제든지 협의 가능합니다.</p>
                            </div>
                        )}
                    </div>

                    {/* ─── COL 3: Rate Card + CTA ─── */}
                    <div>
                        <div className="sticky top-20 space-y-4">
                            {/* Rate Card */}
                            <div className="rounded-xl border overflow-hidden">
                                <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b">
                                    <h3 className="text-base font-bold flex items-center gap-2">
                                        <BadgeCheck className="h-5 w-5 text-emerald-600" />
                                        예상 단가표
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Rate Card</p>
                                </div>
                                <div className="p-5 space-y-0">
                                    <div className="flex justify-between items-center py-3 border-b border-dashed">
                                        <span className="text-sm text-muted-foreground">숏폼 영상 (Reels)</span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="h-3 w-3 text-muted-foreground/50" />
                                            <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">
                                                {event.priceVideo ? `₩${event.priceVideo.toLocaleString()}` : '협의 필요'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-dashed">
                                        <span className="text-sm text-muted-foreground">이미지 (Feed)</span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="h-3 w-3 text-muted-foreground/50" />
                                            <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">
                                                {event.priceFeed ? `₩${event.priceFeed.toLocaleString()}` : '협의 필요'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-dashed">
                                        <span className="text-sm text-muted-foreground">2차 활용 권한</span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="h-3 w-3 text-muted-foreground/50" />
                                            <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">
                                                {event.usageRightsPrice ? `${event.usageRightsMonth}개월 / ₩${event.usageRightsPrice.toLocaleString()}` : '협의 필요'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-sm text-muted-foreground">자동 DM (Auto Reply)</span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="h-3 w-3 text-muted-foreground/50" />
                                            <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">
                                                {event.autoDmPrice ? `${event.autoDmMonth}개월 / ₩${event.autoDmPrice.toLocaleString()}` : '협의 필요'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 py-4 bg-muted/40 border-t">
                                    <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                                        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                        <span>정확한 단가는 협업 제안 수락 후 워크스페이스에서 공개됩니다.</span>
                                    </p>
                                </div>
                            </div>

                            {/* CTA & Proposal Status */}
                            <div className="space-y-2">
                                {/* Creator View: Received Proposals List */}
                                {user?.id === event.influencerId ? (
                                    <div className="rounded-xl border bg-card p-4 space-y-3">
                                        <span className="text-sm font-semibold">받은 제안 ({momentProposals.filter(p => p.moment_id === event.id).length})</span>
                                        {momentProposals.filter(p => p.moment_id === event.id).length > 0 ? (
                                            <div className="space-y-2">
                                                {momentProposals.filter(p => p.moment_id === event.id).map(prop => (
                                                    <div key={prop.id} className="bg-background border rounded-lg p-3 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            {prop.brand_avatar ? (
                                                                <img src={prop.brand_avatar} alt={prop.brand_name} className="w-6 h-6 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                                                                    {prop.brand_name?.substring(0, 1) || 'B'}
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{prop.brand_name}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{formatDateToMonth(prop.created_at)}</p>
                                                            </div>
                                                            <Badge variant={prop.status === 'accepted' ? 'default' : 'outline'} className="text-[10px]">
                                                                {prop.status === 'offered' ? '대기' : prop.status}
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full text-xs h-8"
                                                            onClick={() => { setSelectedProposal(prop); setShowReadonlyDialog(true) }}
                                                        >
                                                            제안 확인하기
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 bg-muted/30 rounded-lg text-xs text-muted-foreground border border-dashed">
                                                아직 도착한 제안이 없습니다.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Brand View / Visitor View
                                    <>
                                        {momentProposals.find(p => p.moment_id === event.id && (user?.role === 'brand' ? p.brand_id === user.id : p.influencer_id === user?.id)) ? (
                                            (() => {
                                                const prop = momentProposals.find(p => p.moment_id === event.id && (user?.role === 'brand' ? p.brand_id === user.id : p.influencer_id === user?.id))!;
                                                return (
                                                    <Card className="border-primary/50 bg-primary/5 shadow-sm">
                                                        <CardHeader className="p-4 pb-2">
                                                            <CardTitle className="text-sm font-medium flex justify-between items-center text-primary">
                                                                <span className="flex items-center gap-2"><Send className="h-4 w-4" /> 제안 보냄</span>
                                                                <Badge variant={prop.status === 'accepted' ? 'default' : 'outline'} className="text-xs">
                                                                    {prop.status === 'offered' ? '대기중' : prop.status === 'accepted' ? '수락됨' : prop.status === 'rejected' ? '거절됨' : prop.status}
                                                                </Badge>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="p-4 pt-2 space-y-3">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">제안 제품</p>
                                                                <p className="text-sm font-semibold truncate">{prop.conditions?.product_name || '제품명 없음'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">보낸 날짜</p>
                                                                <p className="text-xs font-medium">{new Date(prop.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <Button variant="outline" size="sm" className="w-full bg-background"
                                                                onClick={() => { setSelectedProposal(prop); setShowReadonlyDialog(true) }}
                                                            >
                                                                제안서 보기
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })()
                                        ) : (
                                            <Button className="w-full gap-2" size="lg" onClick={handlePropose}>
                                                <MessageCircle className="h-5 w-5" /> 협업 제안하기
                                            </Button>
                                        )}
                                    </>
                                )}

                                <Button variant="outline" className="w-full gap-2" onClick={() => {
                                    navigator.clipboard.writeText(window.location.href)
                                    toast.success("링크가 복사되었습니다!")
                                }}>
                                    <Share2 className="h-4 w-4" /> 공유하기
                                </Button>
                            </div>
                        </div>
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

                        {/* Product URL (New) */}
                        <div className="space-y-2">
                            <Label htmlFor="productUrl">제품 링크 (선택)</Label>
                            <Input
                                id="productUrl"
                                value={productUrl}
                                onChange={(e) => setProductUrl(e.target.value)}
                                onFocus={() => { if (!productUrl) setProductUrl("https://") }}
                                onBlur={() => { if (productUrl === "https://") setProductUrl("") }}
                                placeholder="https://..."
                            />
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
                            <Label htmlFor="compensation">보상 금액 (원)</Label>
                            <div className="relative">
                                <Input
                                    id="compensation"
                                    type="number"
                                    value={compensationAmount}
                                    onChange={(e) => setCompensationAmount(e.target.value)}
                                    placeholder="예: 300000"
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
                            </div>
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

                        {/* Channel Selection (replaces Content Type checkboxes) */}
                        <div className="space-y-3">
                            <Label>진행 채널 선택</Label>
                            <div className="grid grid-cols-5 gap-1.5">
                                {(['instagram', 'youtube', 'tiktok', 'blog', 'other'] as const).map(ch => (
                                    <button
                                        type="button"
                                        key={ch}
                                        onClick={() => { setChannelName(ch); setChannelSubtype('') }}
                                        className={`py-2 rounded-md border text-xs font-medium transition-all duration-200
                                            ${channelName === ch
                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                                            }`}
                                    >
                                        {ch === 'instagram' ? 'Instagram' : ch === 'youtube' ? 'YouTube' : ch === 'tiktok' ? 'TikTok' : ch === 'blog' ? 'Blog' : '기타'}
                                    </button>
                                ))}
                            </div>

                            {/* Subtypes */}
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secondaryUsage">2차 활용 기간 및 비용 (선택)</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    id="secondaryUsage"
                                    value={secondaryUsagePeriod}
                                    onChange={(e) => setSecondaryUsagePeriod(e.target.value)}
                                    className="h-9 text-sm rounded-md border border-input bg-background px-3 focus:ring-1 focus:ring-ring"
                                >
                                    <option value="">기간 선택</option>
                                    <option value="불가">불가 (2차 활용 안 함)</option>
                                    <option value="3개월">3개월</option>
                                    <option value="6개월">6개월</option>
                                    <option value="12개월">12개월</option>
                                    <option value="영구">영구</option>
                                    <option value="협의">협의 필요</option>
                                </select>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={secondaryUsageFee}
                                        onChange={(e) => setSecondaryUsageFee(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="2차 활용 비용 (원)"
                                        className="h-9 text-sm pr-6"
                                        disabled={secondaryUsagePeriod === '불가' || !secondaryUsagePeriod}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">원</span>
                                </div>
                            </div>
                            {secondaryUsagePeriod && secondaryUsagePeriod !== '불가' && secondaryUsageFee && (
                                <p className="text-[10px] text-muted-foreground">
                                    → {secondaryUsagePeriod}간 2차 활용, 비용 {parseInt(secondaryUsageFee).toLocaleString()}원
                                </p>
                            )}
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
                                                format(finalSubmissionDate!, "yyyy-MM-dd", { locale: ko })
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
                                                format(desiredDate!, "yyyy-MM-dd", { locale: ko })
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
            {
                user && (
                    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex flex-wrap content-center justify-center opacity-[0.03] select-none">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-[300px] h-[300px] flex items-center justify-center -rotate-45">
                                <span className="text-xl font-black text-slate-900 whitespace-nowrap">
                                    {user?.name} ({user?.handle || user?.role})<br />
                                    CreadyPick Security
                                </span>
                            </div>
                        ))}
                    </div>
                )
            }
            {/* Read-only Proposal Dialog (Full View) */}
            <ReadonlyProposalDialog
                open={showReadonlyDialog}
                onOpenChange={setShowReadonlyDialog}
                proposal={selectedProposal}
            />
        </div>
    )
}
