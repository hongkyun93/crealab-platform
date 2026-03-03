"use client"

import { CreatorProfileCard } from "@/components/profile/CreatorProfileCard"
import { ReadonlyProposalDialog } from "@/components/proposal/readonly-proposal-dialog"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { SiteHeader } from "@/components/site-header"
import { MomentProposalDialog, MomentProposalFormData } from "@/components/dialogs/MomentProposalDialog"
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
import type { CreatorMoment, MomentProposal } from "@/lib/types"; // Added MomentProposal
import { cn, formatDateToMonth, formatDateToMonthWithPeriod } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ArrowLeft, BadgeCheck, Calendar, Clock, FileText, Globe, Instagram, Loader2, Lock, MessageCircle, Music, Package, SearchX, Send, Share2, Sparkles, Tv, Youtube } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function MomentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { moments, user, sendNotification, supabase, products, refreshData, momentProposals, addMomentProposal } = useUnifiedProvider()
    const [momentData, setMomentData] = useState<CreatorMoment | null>(null)
    const [showProposalDialog, setShowProposalDialog] = useState(false)
    const [showReadonlyDialog, setShowReadonlyDialog] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState<MomentProposal | null>(null) // [NEW] state

    // Proposal form state
    const [productName, setProductName] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [productUrl, setProductUrl] = useState("")
    const [productType, setProductType] = useState<"gift" | "loan">("gift")
    const [priceOffer, setPriceOffer] = useState("")
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
    const [isLoadingMoment, setIsLoadingMoment] = useState(true)

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
        const loadMoment = async () => {
            if (!params.id || params.id === 'default') return

            // 1. Try to find in context first
            const fromContext = moments.find(e => String(e.id) === String(params.id))

            let targetEvent: CreatorMoment | null | undefined = fromContext

            // 2. If not in context, fetch from DB
            if (!targetEvent) {
                setIsLoadingMoment(true)
                try {
                    const { data: e, error } = await supabase
                        .from('life_moments')
                        .select(`
                            *,
                            profiles:creator_id(
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
                            creatorId: e.creator_id,
                            handle: profile.instagram_handle || "",
                            avatar: profile.avatar_url || "",
                            category: e.category || "Life Moment", // Default category
                            title: e.title, // map 'title' to 'moment'
                            date: new Date(e.created_at).toISOString().split('T')[0],
                            description: e.description,
                            tags: e.tags || [],
                            verified: e.is_verified || false,
                            followers: profile.followers_count || 0,
                            priceVideo: profile.price_video || 0,
                            targetProduct: e.target_product || "",
                            momentStartDate: e.moment_start_date || "",
                            postingDateExact: e.posting_date_exact || "",
                            guide: e.guide || "",
                            status: e.status || ((e.moment_start_date && new Date(e.moment_start_date) < new Date()) ? 'completed' : 'recruiting'),
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
                    setIsLoadingMoment(false)
                }
            }

            // 3. Update state
            if (targetEvent) {
                setMomentData(targetEvent)
            }
            setIsLoadingMoment(false)
        }

        loadMoment()
    }, [params.id, moments, supabase])

    const generateDefaultMessage = (ev: CreatorMoment, u: any) => {
        return `안녕하세요 ${ev.influencer}님,
${u.name}의 담당자입니다.

올려주신 '${ev.title}' 모먼트${ev.momentStartDate ? `(${formatDateToMonth(ev.momentStartDate)} 예정)` : ''}를 인상 깊게 보았습니다.
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
        if (momentData?.channels && momentData.channels.length > 0) {
            const firstChannel = momentData.channels[0]
            // Check if it's a subtype (e.g., "instagram_reels") or base channel (e.g., "tiktok")
            const baseCh = firstChannel.split("_")[0]
            const hasSubtype = firstChannel.includes("_") && firstChannel !== baseCh
            setChannelName(baseCh)
            setChannelSubtype(hasSubtype ? firstChannel : "")
        }
        if (momentData && !proposalMessage) {
            setProposalMessage(generateDefaultMessage(momentData, user))
        }
        setShowProposalDialog(true)
    }

    const handleSubmitProposal = async (formData: MomentProposalFormData) => {
        // Prevent duplicate submissions
        if (isSubmitting) return

        if (!user || !momentData) return

        if (!formData.productName || !formData.proposalMessage) {
            toast.error("제품명과 제안 메시지는 필수입니다.")
            return
        }

        setIsSubmitting(true)

        try {
            const proposalData: any = {
                brand_id: user.id,
                creator_id: momentData.creatorId,
                moment_id: momentData.id,
                product_id: formData.selectedProductId || selectedProduct?.id || null,
                message: formData.proposalMessage,
                status: 'offered',
                conditions: {
                    product_name: formData.productName,
                    product_type: formData.productType,
                    price_offer: formData.priceOffer ? parseInt(formData.priceOffer.replace(/[^0-9]/g, '')) : null,
                    has_incentive: formData.hasIncentive,
                    incentive_detail: formData.hasIncentive ? formData.incentiveDetail : null,
                    channel_name: formData.channelName,
                    channel_subtype: formData.channelSubtype || null,
                    desired_date: formData.desiredDate ? format(formData.desiredDate, "yyyy-MM-dd") : null,
                    condition_draft_submission_date: formData.draftSubmissionDate ? format(formData.draftSubmissionDate, "yyyy-MM-dd") : null,
                    condition_final_submission_date: formData.finalSubmissionDate ? format(formData.finalSubmissionDate, "yyyy-MM-dd") : null,
                    condition_upload_date: formData.desiredDate ? format(formData.desiredDate, "yyyy-MM-dd") : null,
                    condition_secondary_usage_period: formData.secondaryUsagePeriod || "불가",
                    secondary_usage_fee: formData.secondaryUsageFee ? parseInt(formData.secondaryUsageFee.replace(/[^0-9]/g, '')) : 0,
                    date_flexible: formData.dateFlexible,
                    video_guide: formData.videoGuide,
                    product_url: formData.productUrl || null,
                }
            }

            // API 라우트로 서버 측 insert (RLS 우회)
            const res = await fetch('/api/moment-proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(proposalData),
            })
            const json = await res.json()
            if (!res.ok || json.error) {
                console.error('Error creating proposal:', json.error)
                throw new Error(json.error || "알 수 없는 오류")
            }
            const data = json.data
            const success = !!data

            // Optimistic Update
            if (addMomentProposal) {
                const optimisticProposal: any = {
                    id: data.id,
                    moment_id: momentData.id,
                    brand_id: user.id,
                    creator_id: momentData.creatorId,
                    status: 'offered',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),

                    // Joins (Optimistic)
                    brand_name: user.name,
                    brand_avatar: user.avatar,
                    creator_name: momentData.influencer,
                    creator_avatar: momentData.avatar,
                    moment_title: momentData.title,

                    // Conditions
                    conditions: proposalData.conditions,
                    product_name: formData.productName,
                    price_offer: formData.priceOffer ? parseInt(formData.priceOffer.replace(/[^0-9]/g, '')) : 0,
                    // [Added] Top-level condition fields for immediate UI reflection
                    condition_product_receipt_date: null, // Usually not set on creation
                    condition_draft_submission_date: formData.draftSubmissionDate ? format(formData.draftSubmissionDate, "yyyy-MM-dd") : null,
                    condition_final_submission_date: formData.finalSubmissionDate ? format(formData.finalSubmissionDate, "yyyy-MM-dd") : null,
                    condition_upload_date: formData.desiredDate ? format(formData.desiredDate, "yyyy-MM-dd") : null,
                    condition_secondary_usage_period: formData.secondaryUsagePeriod || "불가",
                    secondary_usage_fee: formData.secondaryUsageFee ? parseInt(formData.secondaryUsageFee.replace(/[^0-9]/g, '')) : 0,
                    product_url: formData.productUrl,
                    product_type: formData.productType,
                    channel_name: formData.channelName,
                    channel_subtype: formData.channelSubtype || null,
                }
                addMomentProposal(optimisticProposal)

                // [Item 6] DB 트리거(notify_influencer_on_moment_proposal)에서 이미 알림을 발송하므로,
                // 클라이언트에서의 중복 발송 및 에러 유발 가능성(sender_id 누락 등)을 제거합니다.

                // Success (직관적인 토스트 메시지)
                toast.success("제안서가 성공적으로 발송되었습니다!\n보낸 제안함에서 상세 내용을 확인할 수 있습니다.")
                setShowProposalDialog(false)

                // Trigger manual refresh in background (Do not await)
                if (refreshData) refreshData()

            }
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

    if (isLoadingMoment) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">모먼트 정보를 불러오는 중입니다...</p>
                </div>
            </div>
        )
    }

    if (!momentData) {
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
    const channelsByPlatform = (momentData.channels || []).reduce<Record<string, string[]>>((acc, ch) => {
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
                            creatorId={momentData.creatorId || ''}
                            trigger={
                                <div className="rounded-xl border bg-card p-5 text-center cursor-pointer hover:border-primary/40 transition-all">
                                    {momentData.avatar ? (
                                        <img src={momentData.avatar} alt="" className="h-24 w-24 rounded-full object-cover border-3 border-primary/20 mx-auto mb-3 shadow-lg" />
                                    ) : (
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center font-bold text-white text-3xl mx-auto mb-3 shadow-lg">
                                            {momentData.influencer?.[0]?.toUpperCase() || 'C'}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                        <span className="font-bold text-xl">{momentData.influencer}</span>
                                        {momentData.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                                    </div>

                                    {momentData.verified && (
                                        <div className="flex justify-center mb-2">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white' }}>
                                                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                                                    <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="white" strokeWidth="1.5" />
                                                    <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.5" />
                                                    <circle cx="17" cy="7" r="1" fill="white" />
                                                </svg>
                                                인스타그램 연동 확인됨
                                            </span>
                                        </div>
                                    )}

                                    {/* [Item 2] Creator Info Placeholder (Conditional) */}
                                    {momentData.followers && momentData.followers > 0 ? (
                                        <div className="flex flex-wrap items-center justify-center gap-2 mt-2 pt-3 border-t border-border/50 text-xs text-muted-foreground w-full">
                                            <div className="flex flex-col items-center px-4 last:border-0">
                                                <span className="block text-[10px] text-muted-foreground/70 mb-0.5">총 팔로워</span>
                                                <span className="font-semibold text-foreground">{formatFollowers(momentData.followers)}</span>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            }
                        />

                        {/* Schedule */}
                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-primary" /> 모먼트 일정
                                </div>
                                <span className="text-base font-bold text-primary">
                                    {momentData.momentStartDate
                                        ? (user?.id === momentData.creatorId
                                            ? (() => {
                                                const start = new Date(momentData.momentStartDate)
                                                const startStr = `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일`
                                                if (momentData.momentEndDate && momentData.momentStartDate !== momentData.momentEndDate) {
                                                    const end = new Date(momentData.momentEndDate)
                                                    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
                                                        return `${startStr} ~ ${end.getDate()}일`
                                                    } else if (start.getFullYear() === end.getFullYear()) {
                                                        return `${startStr} ~ ${end.getMonth() + 1}월 ${end.getDate()}일`
                                                    } else {
                                                        return `${startStr} ~ ${end.getFullYear()}년 ${end.getMonth() + 1}월 ${end.getDate()}일`
                                                    }
                                                }
                                                return startStr
                                            })()
                                            : formatDateToMonthWithPeriod(momentData.momentStartDate))
                                        : "미정"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 text-emerald-600" /> 업로드 시기
                                </div>
                                <span className="text-base font-bold text-emerald-600">
                                    {momentData.dateFlexible
                                        ? "협의 가능"
                                        : (momentData.postingDateExact
                                            ? (user?.id === momentData.creatorId
                                                ? `${new Date(momentData.postingDateExact).getFullYear()}년 ${new Date(momentData.postingDateExact).getMonth() + 1}월 ${new Date(momentData.postingDateExact).getDate()}일`
                                                : formatDateToMonthWithPeriod(momentData.postingDateExact))
                                            : "미정")}
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
                                        const social = momentData.socialChannels?.find(sc => sc.platform === platform)
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
                            <p className="text-base font-medium leading-snug">{momentData.targetProduct}</p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                            {momentData.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-sm px-3 py-1">{tag}</Badge>
                            ))}
                        </div>
                    </div>

                    {/* ─── COL 2: Title + Description + Guide ─── */}
                    <div className="space-y-5">
                        <h1 className="text-3xl font-bold tracking-tight leading-tight">{momentData.title}</h1>

                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">상세 설명</h3>
                            <p className="text-base leading-[1.85] whitespace-pre-wrap">{momentData.description}</p>
                        </div>

                        {momentData.guide && (
                            <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/5 border-amber-200/50 p-6">
                                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> 제작 가이드
                                </h3>
                                <p className="text-base leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">{momentData.guide}</p>
                                <p className="text-xs text-amber-600/60 mt-3 pt-3 border-t border-amber-200/40">💡 크리에이터 제안 가이드입니다. 언제든지 협의 가능합니다.</p>
                            </div>
                        )}
                    </div>

                    {/* ─── COL 3: Rate Card + CTA ─── */}
                    <div>
                        <div className="sticky top-20 space-y-4">
                            {user?.id === momentData.creatorId ? (
                                /* ─── Creator View: ONLY Received Proposals List ─── */
                                <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm border-primary/20">
                                    <h3 className="text-base font-bold flex items-center gap-2 pb-3 border-b border-primary/10">
                                        <MessageCircle className="h-5 w-5 text-primary" />
                                        도착한 제안 ({momentProposals.filter(p => p.moment_id === momentData.id).length})
                                    </h3>
                                    {momentProposals.filter(p => p.moment_id === momentData.id).length > 0 ? (
                                        <div className="space-y-3">
                                            {momentProposals.filter(p => p.moment_id === momentData.id).map(prop => (
                                                <div key={prop.id} className="bg-background border border-border/80 rounded-xl p-3.5 space-y-3 hover:border-primary/30 transition-all shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        {prop.brand_avatar ? (
                                                            <img src={prop.brand_avatar} alt={prop.brand_name} className="w-8 h-8 rounded-full object-cover border border-border/50" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                                {prop.brand_name?.substring(0, 1) || 'B'}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold truncate text-foreground">{prop.brand_name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{formatDateToMonth(prop.created_at)}</p>
                                                        </div>
                                                        <Badge variant={prop.status === 'accepted' ? 'default' : 'outline'} className={prop.status === 'accepted' ? 'bg-emerald-500 text-white' : 'text-[11px]'}>
                                                            {prop.status === 'offered' ? '대기' : prop.status === 'accepted' ? '수락완료' : prop.status}
                                                        </Badge>
                                                    </div>

                                                    {/* 제안 세부 정보 추가 표시 */}
                                                    <div className="bg-muted/40 rounded-md p-3 space-y-2 mt-2">
                                                        <div>
                                                            <p className="text-[10px] text-muted-foreground mb-0.5">제안 제품</p>
                                                            <p className="text-sm font-medium">{prop.conditions?.product_name || prop.product_name || '제품명 없음'}</p>
                                                        </div>
                                                        {(prop.price_offer || prop.conditions?.price_offer) && (
                                                            <div>
                                                                <p className="text-[10px] text-muted-foreground mb-0.5">제안 금액</p>
                                                                <p className="text-sm font-bold text-emerald-600">₩{(prop.price_offer || prop.conditions?.price_offer || 0).toLocaleString()}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full text-xs h-9 hover:bg-primary/5 hover:text-primary transition-colors border-dashed hover:border-primary/40 mt-1"
                                                        onClick={() => {
                                                            setSelectedProposal(prop);
                                                            setShowReadonlyDialog(true);
                                                        }}
                                                    >
                                                        제안 상세 보기
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-muted/20 rounded-xl text-sm text-muted-foreground border border-dashed flex flex-col items-center gap-2">
                                            <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                                                <Package className="h-5 w-5 text-muted-foreground/50" />
                                            </div>
                                            아직 도착한 제안이 없습니다.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* ─── Brand / Visitor View: Rate Card & CTA & Share ─── */
                                <>
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
                                                        {momentData.priceVideo ? `₩${momentData.priceVideo.toLocaleString()}` : '협의 필요'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-dashed">
                                                <span className="text-sm text-muted-foreground">이미지 (Feed)</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Lock className="h-3 w-3 text-muted-foreground/50" />
                                                    <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">
                                                        {momentData.priceFeed ? `₩${momentData.priceFeed.toLocaleString()}` : '협의 필요'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-dashed">
                                                <span className="text-sm text-muted-foreground">2차 활용 권한</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Lock className="h-3 w-3 text-muted-foreground/50" />
                                                    <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">
                                                        {momentData.usageRightsPrice ? `${momentData.usageRightsMonth}개월 / ₩${momentData.usageRightsPrice.toLocaleString()}` : '협의 필요'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center py-3">
                                                <span className="text-sm text-muted-foreground">자동 DM (Auto Reply)</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Lock className="h-3 w-3 text-muted-foreground/50" />
                                                    <span className="font-bold text-emerald-700 text-sm blur-[6px] select-none">
                                                        {momentData.autoDmPrice ? `${momentData.autoDmMonth}개월 / ₩${momentData.autoDmPrice.toLocaleString()}` : '협의 필요'}
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
                                        {(() => {
                                            const activeProp = momentProposals.find(p =>
                                                p.moment_id === momentData.id &&
                                                (user?.role === 'brand' ? p.brand_id === user.id : p.creator_id === user?.id) &&
                                                p.status !== 'cancelled' && p.status !== 'rejected'
                                            );

                                            if (activeProp) {
                                                const prop = activeProp;
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
                                                                <p className="text-sm font-semibold truncate">{prop.conditions?.product_name || prop.product_name || '제품명 없음'}</p>
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
                                            } else {
                                                return (
                                                    <Button className="w-full gap-2" size="lg" onClick={handlePropose}>
                                                        <MessageCircle className="h-5 w-5" /> 협업 제안하기
                                                    </Button>
                                                )
                                            }
                                        })()}

                                        <Button variant="outline" className="w-full gap-2 hover:bg-muted" onClick={() => {
                                            navigator.clipboard.writeText(window.location.href)
                                            toast.success("링크가 복사되었습니다!")
                                        }}>
                                            <Share2 className="h-4 w-4" /> 공유하기
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main >

            {/* Reusable Proposal Dialog */}
            <MomentProposalDialog
                open={showProposalDialog}
                onOpenChange={setShowProposalDialog}
                targetMomentTitle={momentData.title}
                targetInfluencer={momentData.influencer}
                onSubmit={handleSubmitProposal}
                isSubmitting={isSubmitting}
                initialData={
                    channelName ? {
                        productName: "",
                        productUrl: "",
                        productType: "gift",
                        videoGuide: "brand_provided",
                        priceOffer: "",
                        hasIncentive: false,
                        incentiveDetail: "",
                        channelName: channelName,
                        channelSubtype: channelSubtype,
                        dateFlexible: false,
                        secondaryUsagePeriod: "",
                        secondaryUsageFee: "",
                        proposalMessage: proposalMessage,
                    } : null
                }
            />

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
        </div >
    )
}
