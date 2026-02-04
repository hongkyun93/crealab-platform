"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { BadgeCheck, Calendar, Filter, MapPin, Settings, Package, Send, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePlatform } from "@/components/providers/platform-provider"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

export default function BrandDashboard() {
    const { events, user, resetData, isLoading } = usePlatform()
    const router = useRouter()
    const supabase = createClient()
    const [sortOrder, setSortOrder] = useState("latest")

    // Filter Query States
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [followerFilter, setFollowerFilter] = useState<string>("all")

    // Manual Range States (using string to handle empty input easily)
    // Manual Range States (using string to handle empty input easily)
    const [minFollowers, setMinFollowers] = useState<string>("")
    const [maxFollowers, setMaxFollowers] = useState<string>("")

    // Propose Modal State
    const [proposeModalOpen, setProposeModalOpen] = useState(false)
    const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
    const [offerProduct, setOfferProduct] = useState("")
    const [productType, setProductType] = useState("gift")
    const [compensation, setCompensation] = useState("")
    const [hasIncentive, setHasIncentive] = useState(false)
    const [incentiveDetail, setIncentiveDetail] = useState("")
    const [contentType, setContentType] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
    }, [user, router, isLoading])

    const handlePresetClick = (key: string) => {
        setFollowerFilter(key)
        if (key === "all") {
            setMinFollowers("")
            setMaxFollowers("")
        } else if (key === "nano") {
            setMinFollowers("0")
            setMaxFollowers("10000")
        } else if (key === "micro") {
            setMinFollowers("10000")
            setMaxFollowers("100000")
        } else if (key === "macro") {
            setMinFollowers("100000")
            setMaxFollowers("1000000")
        } else if (key === "mega") {
            setMinFollowers("1000000")
            setMaxFollowers("")
        }
    }

    const handleManualChange = (type: 'min' | 'max', value: string) => {
        if (type === 'min') setMinFollowers(value)
        else setMaxFollowers(value)
        setFollowerFilter("custom") // Switch to custom mode to unselect presets
    }

    const getFilteredAndSortedEvents = () => {
        let result = [...events]

        // 1. Filter by Tag
        if (selectedTag) {
            result = result.filter(e =>
                e.category === selectedTag ||
                e.tags.some(t => t.includes(selectedTag) || selectedTag.includes(t))
            )
        }

        // 2. Filter by Follower Count (Using Range Logic)
        if (minFollowers !== "" || maxFollowers !== "") {
            const min = minFollowers === "" ? 0 : parseInt(minFollowers)
            const max = maxFollowers === "" ? Infinity : parseInt(maxFollowers)

            result = result.filter(e => {
                const count = e.followers || 0
                return count >= min && count <= max
            })
        }

        // 3. Sort
        if (sortOrder === "deadline") {
            // Mock deadline sort
            result.reverse()
        } else if (sortOrder === "match") {
            // Mock match sort (random)
            result.sort(() => Math.random() - 0.5)
        } else if (sortOrder === "verified") {
            result = result.filter(e => e.verified)
        } else if (sortOrder === "followers_high") {
            result.sort((a, b) => (b.followers || 0) - (a.followers || 0))
        }

        // If "latest" (default), reverse to show newest first
        if (sortOrder === "latest") {
            result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }

        return result
    }

    const handlePropose = (influencer: any) => {
        // Open modal with pre-filled or empty details
        setSelectedInfluencer(influencer)
        setOfferProduct("")
        setProductType("gift")
        setCompensation("")
        setHasIncentive(false)
        setIncentiveDetail("")
        setContentType("")
        setMessage(`안녕하세요, ${influencer.influencer}님! ${influencer.category} 콘텐츠를 인상 깊게 보았습니다. 저희 브랜드의 신제품과 잘 어울릴 것 같아 제안 드립니다.`)
        setProposeModalOpen(true)
    }

    const submitProposal = async () => {
        if (!offerProduct || !compensation || !contentType) {
            alert("필수 항목을 모두 입력해주세요.")
            return
        }

        try {
            console.log('[submitProposal] Starting proposal submission...')
            console.log('[submitProposal] Data:', {
                brand_id: user?.id,
                influencer_id: selectedInfluencer.influencerId,
                product_name: offerProduct,
                product_type: productType,
                compensation_amount: compensation,
                has_incentive: hasIncentive,
                incentive_detail: incentiveDetail,
                content_type: contentType,
                message: message,
                status: 'offered'
            })

            const { error } = await supabase
                .from('brand_proposals')
                .insert({
                    brand_id: user?.id,
                    influencer_id: selectedInfluencer.influencerId,
                    product_name: offerProduct,
                    product_type: productType,
                    compensation_amount: compensation,
                    has_incentive: hasIncentive,
                    incentive_detail: incentiveDetail,
                    content_type: contentType,
                    message: message,
                    status: 'offered'
                })

            if (error) {
                console.error('[submitProposal] Supabase error:', JSON.stringify(error, null, 2))
                console.error('[submitProposal] Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                })
                throw error
            }

            console.log('[submitProposal] Proposal submitted successfully!')
            alert(`${selectedInfluencer?.influencer}님에게 제안서가 성공적으로 발송되었습니다!\n\n크리에이터가 제안을 수락하면 채팅방이 개설되어 대화를 나누실 수 있습니다.`)
            setProposeModalOpen(false)
        } catch (error: any) {
            console.error("=== Proposal Error Details ===")
            console.error("Error type:", typeof error)
            console.error("Error message:", error?.message)
            console.error("Error code:", error?.code)
            console.error("Error details:", error?.details)
            console.error("Error hint:", error?.hint)
            console.error("Full error:", error)
            console.error("==============================")
            alert("제안서 발송에 실패했습니다. 다시 시도해주세요.")
        }
    }

    const filteredEvents = getFilteredAndSortedEvents()

    const formatFollowers = (num: number) => {
        if (num >= 10000) return `${(num / 10000).toFixed(1)}만`
        return num.toLocaleString()
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="flex flex-col gap-8">

                    {/* Header Section */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">기회 발견하기</h1>
                            <p className="text-muted-foreground mt-1">
                                브랜드와 딱 맞는 모먼트를 가진 크리에이터를 찾아보세요.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Filter className="h-4 w-4" />
                                        {sortOrder === "latest" && "최신 등록순"}
                                        {sortOrder === "deadline" && "마감 임박순"}
                                        {sortOrder === "match" && "매칭 적합도순"}
                                        {sortOrder === "verified" && "인증됨"}
                                        {sortOrder === "followers_high" && "팔로워 많은순"}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuLabel>정렬 기준</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                                        <DropdownMenuRadioItem value="latest">최신 등록순</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="followers_high">팔로워 많은순</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="deadline">마감 임박순</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="match">매칭 적합도순</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="verified">인증된 크리에이터만</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" asChild>
                                <Link href="/brand/settings" className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    프로필 관리
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/brand/products/new">제품 등록하기</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 md:items-center">
                            <span className="text-sm font-medium text-muted-foreground w-20">팔로워 수</span>
                            <div className="flex flex-1 flex-col md:flex-row gap-4 md:items-center">
                                {/* Presets */}
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { k: "all", l: "전체" },
                                        { k: "nano", l: "나노 (<1만)" },
                                        { k: "micro", l: "마이크로 (1~10만)" },
                                        { k: "macro", l: "매크로 (10~100만)" },
                                        { k: "mega", l: "메가 (>100만)" }
                                    ].map(opt => (
                                        <Button
                                            key={opt.k}
                                            variant={followerFilter === opt.k ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePresetClick(opt.k)}
                                            className="rounded-full"
                                        >
                                            {opt.l}
                                        </Button>
                                    ))}
                                </div>

                                <div className="hidden md:block w-px h-6 bg-border mx-2"></div>

                                {/* Manual Range */}
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="최소"
                                            value={minFollowers}
                                            onChange={(e) => handleManualChange('min', e.target.value)}
                                            className="w-24 h-8 text-xs"
                                        />
                                    </div>
                                    <span className="text-muted-foreground">~</span>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="최대"
                                            value={maxFollowers}
                                            onChange={(e) => handleManualChange('max', e.target.value)}
                                            className="w-24 h-8 text-xs"
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">명</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 md:items-start">
                            <span className="text-sm font-medium text-muted-foreground w-20 pt-2">관심 태그</span>
                            <div className="flex flex-wrap gap-2 flex-1">
                                <Button
                                    variant={selectedTag === null ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedTag(null)}
                                    className="rounded-md"
                                >
                                    전체
                                </Button>
                                {POPULAR_TAGS.map(tag => (
                                    <Button
                                        key={tag}
                                        variant={selectedTag === tag ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                        className={`rounded-md ${selectedTag === tag ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground'}`}
                                    >
                                        {tag}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span>총 <span className="font-bold text-foreground">{filteredEvents.length}</span>개의 모먼트를 발견했습니다.</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetData}
                                className="h-auto p-0 text-xs text-red-500 hover:text-red-600 hover:bg-transparent"
                            >
                                🔄 데모 데이터 초기화
                            </Button>
                        </div>
                        {(selectedTag || followerFilter !== "all") && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground" onClick={() => {
                                setSelectedTag(null)
                                handlePresetClick("all") // Use new handler
                            }}>
                                필터 초기화
                            </Button>
                        )}
                    </div>

                    {/* Event Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredEvents.map((item) => (
                            <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-border/60 bg-background/50 backdrop-blur-sm flex flex-col h-full">
                                <Link href={`/event/${item.id}`} className="flex-1 flex flex-col">
                                    <div className="relative">
                                        <div className="absolute top-0 right-0 p-3">
                                            {item.verified && <BadgeCheck className="h-5 w-5 text-blue-500 fill-white" />}
                                        </div>
                                    </div>
                                    <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/30 text-primary font-bold text-lg">
                                            {item.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-base truncate">{item.influencer}</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{item.handle}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-medium bg-secondary px-2 py-0.5 rounded-full">
                                                    {item.followers ? formatFollowers(item.followers) : '0'} 팔로워
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4 flex-1">
                                        <div>
                                            <span className="text-xs font-semibold text-primary mb-1 block">
                                                {item.category}
                                            </span>
                                            <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                {item.event}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 border-t border-b py-3 my-2">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Package className="h-3.5 w-3.5 text-primary" />
                                                <span className="text-muted-foreground shrink-0">희망 제품:</span>
                                                <span className="font-medium truncate">{item.targetProduct}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                                <span className="text-muted-foreground shrink-0">모먼트일:</span>
                                                <span className="font-medium">{item.eventDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Send className="h-3.5 w-3.5 text-primary" />
                                                <span className="text-muted-foreground shrink-0">업로드 시기:</span>
                                                <span className="font-medium">{item.postingDate}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-foreground/70 line-clamp-3 whitespace-pre-wrap">
                                            {item.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {item.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted/30">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {item.tags.length > 3 && (
                                                <span className="text-[10px] text-muted-foreground self-center">+{item.tags.length - 3}</span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Link>
                                <CardFooter className="bg-muted/20 p-4 mt-auto border-t">
                                    <Button className="w-full" variant="ghost" onClick={(e) => {
                                        e.stopPropagation() // Prevent link click
                                        handlePropose(item)
                                    }}>
                                        협업 제안하기
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}

                    </div>
                </div>

                {/* Propose Modal */}
                <Dialog open={proposeModalOpen} onOpenChange={setProposeModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>협업 제안하기</DialogTitle>
                            <DialogDescription>
                                {selectedInfluencer?.influencer}님에게 보낼 제안서를 작성해주세요.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            {/* Product Section */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="product" className="text-right pt-2">
                                    제공 제품
                                </Label>
                                <div className="col-span-3 space-y-2">
                                    <Input
                                        id="product"
                                        placeholder="예: 갤럭시 워치 6"
                                        value={offerProduct}
                                        onChange={(e) => setOfferProduct(e.target.value)}
                                    />
                                    <RadioGroup
                                        defaultValue="gift"
                                        value={productType}
                                        onValueChange={setProductType}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="gift" id="r-gift" />
                                            <Label htmlFor="r-gift" className="font-normal cursor-pointer">제품 제공</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="loan" id="r-loan" />
                                            <Label htmlFor="r-loan" className="font-normal cursor-pointer">제품 대여</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            {/* Compensation Section */}
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="compensation" className="text-right pt-2">
                                    원고료/보상
                                </Label>
                                <div className="col-span-3 space-y-2">
                                    <Input
                                        id="compensation"
                                        placeholder="기본 원고료 (예: 20만원)"
                                        value={compensation}
                                        onChange={(e) => setCompensation(e.target.value)}
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="incentive"
                                            checked={hasIncentive}
                                            onCheckedChange={(checked) => setHasIncentive(checked as boolean)}
                                        />
                                        <Label htmlFor="incentive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                            인센티브 추가
                                        </Label>
                                    </div>
                                    {hasIncentive && (
                                        <Input
                                            placeholder="예: 조회수 1k 달성 시 10만원 추가 지급"
                                            className="text-sm"
                                            value={incentiveDetail}
                                            onChange={(e) => setIncentiveDetail(e.target.value)}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Content Type Section */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">
                                    콘텐츠 형태
                                </Label>
                                <Select value={contentType} onValueChange={setContentType}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="형태 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reels">인스타그램 릴스</SelectItem>
                                        <SelectItem value="tiktok">틱톡</SelectItem>
                                        <SelectItem value="video">유튜브 영상</SelectItem>
                                        <SelectItem value="shorts">유튜브 쇼츠</SelectItem>
                                        <SelectItem value="post">인스타그램 포스팅</SelectItem>
                                        <SelectItem value="blog">블로그 리뷰</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <Label htmlFor="message" className="text-right pt-2">
                                    메시지
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="브랜드 소개와 제안 배경을 입력해주세요."
                                    className="col-span-3 min-h-[100px]"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setProposeModalOpen(false)}>취소</Button>
                            <Button onClick={submitProposal}>제안서 발송</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </main >
        </div >
    )
}
