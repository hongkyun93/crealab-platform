"use client"

import { useProducts } from "@/components/providers/product-provider"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { BadgeCheck, Calendar, Package } from "lucide-react"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

export interface MomentProposalFormData {
    productName: string
    productUrl: string
    productType: "gift" | "loan"
    videoGuide: "brand_provided" | "creator_planned"
    priceOffer: string
    hasIncentive: boolean
    incentiveDetail: string
    channelName: string
    channelSubtype: string
    draftSubmissionDate?: Date
    finalSubmissionDate?: Date
    desiredDate?: Date
    dateFlexible: boolean
    secondaryUsagePeriod: string
    secondaryUsageFee: string
    maintenancePeriod: string
    proposalMessage: string
    selectedProductId?: string
}

interface MomentProposalDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** 
     * [수정 모드]를 위한 기존 제안 데이터
     * null 이면 '신규 발송' 모드로 동작
     */
    initialData?: MomentProposalFormData | null
    /** 타겟 모먼트 정보 (모먼트/크리에이터 이름 등 표시용) */
    targetMomentTitle?: string
    targetInfluencer?: string
    /** 제출 핸들러 (신규/수정 공통) */
    onSubmit: (data: MomentProposalFormData) => Promise<void>
    isSubmitting?: boolean
}

export function MomentProposalDialog({
    open,
    onOpenChange,
    initialData,
    targetMomentTitle,
    targetInfluencer,
    onSubmit,
    isSubmitting = false
}: MomentProposalDialogProps) {
    const { user } = useUnifiedProvider()
    const { products } = useProducts()

    // ─── 상태 관리 ───
    const [productName, setProductName] = useState("")
    const [productUrl, setProductUrl] = useState("")
    const [selectedProductId, setSelectedProductId] = useState<string | undefined>()
    const [productType, setProductType] = useState<"gift" | "loan">("gift")
    const [videoGuide, setVideoGuide] = useState<"brand_provided" | "creator_planned">("brand_provided")
    const [priceOffer, setPriceOffer] = useState("")

    const [hasIncentive, setHasIncentive] = useState(false)
    const [incentiveDetail, setIncentiveDetail] = useState("")

    const [channelName, setChannelName] = useState("instagram")
    const [channelSubtype, setChannelSubtype] = useState("")

    const [draftSubmissionDate, setDraftSubmissionDate] = useState<Date | undefined>()
    const [finalSubmissionDate, setFinalSubmissionDate] = useState<Date | undefined>()
    const [desiredDate, setDesiredDate] = useState<Date | undefined>()
    const [dateFlexible, setDateFlexible] = useState(false)

    const [secondaryUsagePeriod, setSecondaryUsagePeriod] = useState("")
    const [secondaryUsageFee, setSecondaryUsageFee] = useState("")
    const [maintenancePeriod, setMaintenancePeriod] = useState("")
    const [proposalMessage, setProposalMessage] = useState("")

    // 모달 열릴 때 초기화 (수정 모드 vs 신규 모드)
    useEffect(() => {
        if (open) {
            if (initialData) {
                // 수정 모드: 전달받은 데이터를 채움
                setProductName(initialData.productName || "")
                setProductUrl(initialData.productUrl || "")
                setSelectedProductId(initialData.selectedProductId)
                setProductType(initialData.productType || "gift")
                setVideoGuide(initialData.videoGuide || "brand_provided")
                setPriceOffer(initialData.priceOffer || "")
                setHasIncentive(initialData.hasIncentive || false)
                setIncentiveDetail(initialData.incentiveDetail || "")
                setChannelName(initialData.channelName || "instagram")
                setChannelSubtype(initialData.channelSubtype || "")
                setDraftSubmissionDate(initialData.draftSubmissionDate)
                setFinalSubmissionDate(initialData.finalSubmissionDate)
                setDesiredDate(initialData.desiredDate)
                setDateFlexible(initialData.dateFlexible || false)
                setSecondaryUsagePeriod(initialData.secondaryUsagePeriod || "불가")
                setSecondaryUsageFee(initialData.secondaryUsageFee || "")
                setMaintenancePeriod(initialData.maintenancePeriod || "")
                setProposalMessage(initialData.proposalMessage || "")
            } else {
                // 신규 모드: 빈 값 또는 기본값 유지 (부모쪽에서 message 등은 prefill 가능하지만 여기선 순수 초기화)
                setProductName("")
                setProductUrl("")
                setSelectedProductId(undefined)
                setProductType("gift")
                setVideoGuide("brand_provided")
                setPriceOffer("")
                setHasIncentive(false)
                setIncentiveDetail("")
                setChannelName("instagram")
                setChannelSubtype("")
                setDraftSubmissionDate(undefined)
                setFinalSubmissionDate(undefined)
                setDesiredDate(undefined)
                setDateFlexible(false)
                setSecondaryUsagePeriod("")
                setSecondaryUsageFee("")
                setMaintenancePeriod("")
                // proposalMessage는 부모가 띄울 때 주입하지 않으면 빈칸. 구현에 따라 부모에서 initialData.proposalMessage에 기본템플릿만 넣어 줄 수도 있음
            }
        }
    }, [open, initialData])

    // [Item 5] 제안 메시지 템플릿 실시간 치환 로직
    const [prevProductName, setPrevProductName] = useState("[ 제안 드리는 제품명 ]")
    const [prevChannelFormat, setPrevChannelFormat] = useState("[ 희망 콘텐츠 형식 ]")

    useEffect(() => {
        if (!open) return

        let newContent = proposalMessage

        // 1. 제품명 치환
        const currentProductStr = productName || "[ 제안 드리는 제품명 ]"
        if (prevProductName !== currentProductStr && newContent.includes(prevProductName)) {
            newContent = newContent.replace(prevProductName, currentProductStr)
        }

        // 2. 채널 형태 치환
        const getChannelFormat = () => {
            if (!channelName) return "[ 희망 콘텐츠 형식 ]"
            let str = channelName === 'instagram' ? '인스타그램' :
                channelName === 'youtube' ? '유튜브' :
                    channelName === 'tiktok' ? '틱톡' :
                        channelName === 'blog' ? '블로그' : '기타'

            if (channelSubtype) {
                if (channelSubtype.startsWith('other:')) {
                    str += ` ${channelSubtype.slice(6)}`
                } else {
                    const subLabel = channelSubtype.includes('reels') ? '릴스' :
                        channelSubtype.includes('shorts') ? '숏츠' :
                            channelSubtype.includes('feed') ? '피드' :
                                channelSubtype.includes('story') ? '스토리' :
                                    channelSubtype.includes('longform') ? '롱폼' : '콘텐츠'
                    str += ` ${subLabel}`
                }
            } else {
                str += ' 콘텐츠'
            }
            return str
        }

        const currentChannelStr = getChannelFormat()
        if (prevChannelFormat !== currentChannelStr && newContent.includes(prevChannelFormat)) {
            newContent = newContent.replace(prevChannelFormat, currentChannelStr)
        }

        // 상태 업데이트
        if (newContent !== proposalMessage) {
            setProposalMessage(newContent)
            setPrevProductName(currentProductStr)
            setPrevChannelFormat(currentChannelStr)
        } else {
            // 본문 치환은 안 일어났어도, prev 추적은 업데이트 해둠 (사용자가 직접 텍스트를 지웠을 때 포맷 꼬임 방지)
            setPrevProductName(currentProductStr)
            setPrevChannelFormat(currentChannelStr)
        }
    }, [productName, channelName, channelSubtype, open])

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (!productName || !proposalMessage) {
            toast.error("제품명과 제안 메시지는 필수입니다.")
            return
        }

        await onSubmit({
            productName,
            productUrl,
            productType,
            videoGuide,
            priceOffer,
            hasIncentive,
            incentiveDetail,
            channelName,
            channelSubtype,
            draftSubmissionDate,
            finalSubmissionDate,
            desiredDate,
            dateFlexible,
            secondaryUsagePeriod,
            secondaryUsageFee,
            maintenancePeriod,
            proposalMessage,
            selectedProductId
        })
    }

    const isEditMode = !!initialData

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "협업 제안서 수정" : "협업 제안서 작성"}</DialogTitle>
                    <DialogDescription>
                        {targetInfluencer}님에게 보낼 {isEditMode ? "제안서를 수정합니다." : "제안서를 작성해주세요."}
                        {targetMomentTitle && <span className="block mt-1 font-semibold text-primary">[{targetMomentTitle}]</span>}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* ===== 기본 조건 ===== */}
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
                                    <Button variant="outline" size="sm" title="내 제품 불러오기" className="h-9 px-3 shrink-0 gap-1.5">
                                        <Package className="h-4 w-4" />
                                        <span className="text-xs">내 제품 불러오기</span>
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
                                                setSelectedProductId(p.id)
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

                    <div className="space-y-2">
                        <Label>영상 가이드 *</Label>
                        <RadioGroup
                            value={videoGuide}
                            onValueChange={(v: any) => setVideoGuide(v)}
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

                    {/* ===== 보상 및 채널 ===== */}
                    <div className="space-y-2">
                        <Label htmlFor="compensation">보상 금액 (원)</Label>
                        <div className="relative">
                            <Input
                                id="compensation"
                                type="text"
                                value={priceOffer}
                                onChange={(e) => setPriceOffer(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="예: 300000"
                                className="pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
                        </div>
                    </div>

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
                                    placeholder="예: 팟캐스트, 카카오뷰..."
                                    className="h-8 text-xs max-w-xs rounded-full"
                                />
                            </div>
                        )}
                    </div>

                    {/* ===== 일정 및 조건 ===== */}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>초안 제출일 (선택)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal h-9 text-sm", !draftSubmissionDate && "text-muted-foreground")}>
                                        {draftSubmissionDate ? format(draftSubmissionDate, "yyyy-MM-dd", { locale: ko }) : <span>초안 제출일 선택</span>}
                                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent mode="single" selected={draftSubmissionDate} onSelect={setDraftSubmissionDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>최종본 제출일 (선택)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal h-9 text-sm", !finalSubmissionDate && "text-muted-foreground")}>
                                        {finalSubmissionDate ? format(finalSubmissionDate, "yyyy-MM-dd", { locale: ko }) : <span>최종본 제출일 선택</span>}
                                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent mode="single" selected={finalSubmissionDate} onSelect={setFinalSubmissionDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>콘텐츠 업로드일 (선택)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !desiredDate && "text-muted-foreground")}>
                                            {desiredDate ? format(desiredDate, "yyyy-MM-dd", { locale: ko }) : <span>콘텐츠 업로드일 선택</span>}
                                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent mode="single" selected={desiredDate} onSelect={setDesiredDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    type="button"
                                    variant={dateFlexible ? "default" : "outline"}
                                    onClick={() => setDateFlexible(!dateFlexible)}
                                    className={cn("gap-1", dateFlexible && "bg-primary text-primary-foreground hover:bg-primary/90")}
                                >
                                    {dateFlexible && <BadgeCheck className="h-4 w-4" />}
                                    (쯔음)
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">게시 유지 기간 (업로드일 기준)</Label>
                                <select
                                    value={maintenancePeriod}
                                    onChange={(e) => setMaintenancePeriod(e.target.value)}
                                    className="h-9 w-full text-sm rounded-md border border-input bg-background px-3 focus:ring-1 focus:ring-ring"
                                >
                                    <option value="">선택 안 함</option>
                                    <option value="제한없음">제한 없음</option>
                                    <option value="1개월">1개월</option>
                                    <option value="3개월">3개월</option>
                                    <option value="6개월">6개월</option>
                                    <option value="1년">1년</option>
                                    <option value="영구">영구</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ===== 메시지 ===== */}
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
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        취소
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} type="button">
                        {isSubmitting ? "처리 중..." : (isEditMode ? "제안서 수정 완료" : "제안서 발송")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
