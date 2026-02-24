"use client"

import { AccountDeleteDialog } from "@/components/account-delete-dialog"
import { useSocialChannels, useUnifiedProvider } from "@/components/providers/unified-provider"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useEffectiveUser } from "@/lib/hooks/use-effective-user"
import { cn } from "@/lib/utils"
import { BookOpen, Instagram, Loader2, Lock, Music2, Plus, Save, Trash2, TrendingUp, Youtube, ChevronDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

import { POPULAR_TAGS as PROFILE_CATEGORIES } from "@/lib/constants/categories"

const REGIONS = [
    "전국", "서울", "경기", "인천", "부산", "대구", "대전",
    "광주", "울산", "세종", "강원", "충북", "충남",
    " 전북", "전남", "경북", "경남", "제주"
]

function SocialChannelCard({ channel, userId }: { channel: any, userId: string }) {
    const { updateChannel, deleteChannel, setPrimaryChannel } = useSocialChannels()
    const [followersInput, setFollowersInput] = useState(channel.followersCount?.toLocaleString() || "0")
    const [handleInput, setHandleInput] = useState(channel.handle || "")

    // Sync with external updates (optimistic)
    useEffect(() => {
        setFollowersInput(channel.followersCount?.toLocaleString() || "0")
        setHandleInput(channel.handle || "")
    }, [channel.followersCount, channel.handle])

    const handleSave = async () => {
        const numeric = parseInt(followersInput.replace(/,/g, "")) || 0
        await updateChannel(channel.id, {
            followersCount: numeric,
            handle: handleInput
        })
    }

    const togglePublic = async () => {
        await updateChannel(channel.id, { isPublic: !channel.isPublic })
    }

    // Styles
    let gradientClass = "from-slate-700 to-slate-800"
    let icon = <div className="h-10 w-10 mb-4 text-2xl">🌐</div>

    if (channel.platform === 'instagram') {
        gradientClass = "from-purple-600 via-pink-600 to-orange-600"
        icon = <Instagram className="h-10 w-10 mb-4" />
    } else if (channel.platform === 'youtube') {
        gradientClass = "from-red-600 to-red-700"
        icon = <Youtube className="h-10 w-10 mb-4" />
    } else if (channel.platform === 'tiktok') {
        gradientClass = "from-black via-slate-900 to-slate-800"
        icon = <Music2 className="h-10 w-10 mb-4" />
    } else if (channel.platform === 'blog') {
        gradientClass = "from-green-500 to-green-600"
        icon = <BookOpen className="h-10 w-10 mb-4" />
    }

    const isMain = channel.isPrimary

    return (
        <div className={cn(
            "relative group rounded-2xl transition-all duration-300",
            isMain ? "ring-4 ring-primary ring-offset-2 scale-[1.02]" : "hover:scale-[1.02]"
        )}>
            <div className={`bg-gradient-to-br ${gradientClass} rounded-2xl p-6 text-white shadow-lg h-full`}>
                {/* Top Actions */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                        onClick={handleSave}
                        className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/30 text-white hover:text-white/80 transition-colors"
                        title="저장하기"
                    >
                        <Save className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => deleteChannel(channel.id)}
                        className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/30 text-red-300 hover:text-red-100 transition-colors"
                        title="채널 삭제"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                {/* Header icon */}
                <div className="flex items-start justify-between mb-4">
                    {icon}
                </div>

                {/* Inline Handle Input */}
                <div className="mb-2 pr-12">
                    <Input
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                        className="bg-transparent border-none text-white font-bold text-xl h-auto p-0 focus-visible:ring-0 placeholder:text-white/50 w-full"
                        placeholder="채널명/ID"
                    />
                </div>

                {/* Inline Followers Input */}
                <div className="bg-black/20 rounded-lg p-3 mb-4 backdrop-blur-sm flex items-center gap-2">
                    <span className="text-white/90 text-sm font-medium whitespace-nowrap flex-shrink-0">👥 팔로워</span>
                    <Input
                        value={followersInput}
                        onChange={(e) => setFollowersInput(e.target.value)}
                        className="bg-transparent border-none text-white font-bold text-lg h-8 p-0 focus-visible:ring-0 placeholder:text-white/50 w-full text-right flex-1 min-w-0"
                        placeholder="0"
                    />
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    {/* Public Toggle */}
                    <button
                        onClick={togglePublic}
                        className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-full transition-colors"
                        title="공개/비공개 전환"
                    >
                        <div className={cn("w-2.5 h-2.5 rounded-full transition-colors", channel.isPublic ? "bg-green-400 animate-pulse" : "bg-gray-400")} />
                        <span className="text-xs text-white/80 font-medium">{channel.isPublic ? '공개' : '비공개'}</span>
                    </button>

                    {isMain ? (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 text-xs bg-white/20 text-white border-none shadow-sm backdrop-blur-sm cursor-default hover:bg-white/20"
                        >
                            <span className="text-sm mr-1">👑</span>
                            메인 채널
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 text-xs bg-white/20 hover:bg-white/40 text-white border-none shadow-sm backdrop-blur-sm"
                            onClick={() => setPrimaryChannel(channel.id)}
                        >
                            메인채널로 설정
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export function SettingsView() {
    const { user, updateUser, isLoading } = useUnifiedProvider()
    const { effectiveUser, effectiveUserId, isProxyMode } = useEffectiveUser()

    // 내 광고 가치 계산기 성과 데이터
    const [perfStats, setPerfStats] = useState<{ avgEngagementRate: number | null, avgCpe: number | null, count: number } | null>(null)
    // Instagram API 실제 인사이트
    const [igStats, setIgStats] = useState<{
        er: number | null, avgReach: number | null, avgLikes: number | null,
        avgSaves: number | null, saveRate: number | null, reachRate: number | null,
        postCount: number, source: string
    } | null>(null)
    const [igStatsLoading, setIgStatsLoading] = useState(false)
    const { channels, fetchChannels, createChannel, deleteChannel, setPrimaryChannel, updateChannel } = useSocialChannels()

    // Form State
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [primaryRegion, setPrimaryRegion] = useState("")

    // Bank Info
    const [bankName, setBankName] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [accountHolder, setAccountHolder] = useState("")

    // Contact Info
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")

    // Rate Card (Extended - 5 fields)
    const [priceVideo, setPriceVideo] = useState("")
    const [priceFeed, setPriceFeed] = useState("")
    const [priceStory, setPriceStory] = useState("")
    const [usageRightsMonth, setUsageRightsMonth] = useState("")
    const [usageRightsPrice, setUsageRightsPrice] = useState("")
    const [autoDmMonth, setAutoDmMonth] = useState("")
    const [autoDmPrice, setAutoDmPrice] = useState("")

    // Add Channel State
    const [isAddChannelOpen, setIsAddChannelOpen] = useState(false)
    const [newChannelPlatform, setNewChannelPlatform] = useState<string>("instagram")
    const [newChannelHandle, setNewChannelHandle] = useState("")
    const [newChannelFollowers, setNewChannelFollowers] = useState("")

    // Creator Legal/Tax Fields
    const [legalName, setLegalName] = useState("")
    const [birthDate, setBirthDate] = useState("")
    const [legalAddress, setLegalAddress] = useState("")
    const [isBusinessRegistered, setIsBusinessRegistered] = useState(false)
    const [creatorBusinessNumber, setCreatorBusinessNumber] = useState("")

    // 광고 가치 계산기 옵션
    const [calcContentType, setCalcContentType] = useState<'reels' | 'feed' | 'story' | 'youtube'>('reels')
    const [calcUsageRights, setCalcUsageRights] = useState(false)
    const [calcExclusivity, setCalcExclusivity] = useState(false)
    const [calcHighProduction, setCalcHighProduction] = useState(false)
    const [calcSeason, setCalcSeason] = useState(false)



    // Initialize state from effectiveUser
    useEffect(() => {
        if (effectiveUser) {
            setName(effectiveUser.name || "")
            setBio(effectiveUser.bio || "")
            setSelectedTags(effectiveUser.tags || [])
            setPrimaryRegion(effectiveUser.primaryRegion || "")

            setBankName(effectiveUser.bankName || "")
            setAccountNumber(effectiveUser.accountNumber || "")
            setAccountHolder(effectiveUser.accountHolder || "")

            setPhone(effectiveUser.phone || "")
            setAddress(effectiveUser.address || "")

            // Extended Rate Card (5 fields)
            setPriceVideo(effectiveUser.priceVideo?.toString() || "")
            setPriceFeed(effectiveUser.priceFeed?.toString() || "")
            setPriceStory(effectiveUser.priceStory?.toString() || "")
            setUsageRightsMonth(effectiveUser.usageRightsMonth?.toString() || "")
            setUsageRightsPrice(effectiveUser.usageRightsPrice?.toString() || "")
            setAutoDmMonth(effectiveUser.autoDmMonth?.toString() || "")
            setAutoDmPrice(effectiveUser.autoDmPrice?.toString() || "")

            // Creator Legal/Tax Fields
            setLegalName(effectiveUser.legalName || "")
            setBirthDate(effectiveUser.birthDate || "")
            setLegalAddress(effectiveUser.legalAddress || "")
            setIsBusinessRegistered(effectiveUser.isBusinessRegistered || false)
            setCreatorBusinessNumber(effectiveUser.creatorBusinessNumber || "")
        }
    }, [effectiveUser])

    // Load social channels
    useEffect(() => {
        if (effectiveUserId) {
            fetchChannels(effectiveUserId)
        }
    }, [effectiveUserId, fetchChannels])

    // Instagram OAuth 결과 처리
    const searchParams = useSearchParams()
    const router = useRouter()
    useEffect(() => {
        const igConnected = searchParams.get('ig_connected')
        const igError = searchParams.get('ig_error')
        const igConnectedBasic = searchParams.get('ig_connected_basic')
        const igErrorBasic = searchParams.get('ig_error_basic')

        if (igConnected === 'true' || igConnectedBasic === 'true') {
            toast.success('📸 Instagram이 성공적으로 연결되었습니다!')
            if (effectiveUserId) fetchChannels(effectiveUserId)
            router.replace('/creator?tab=settings')
        } else if (igError) {
            const msg = igError === 'no_business_account'
                ? 'Instagram 비즈니스 계정이 연결된 Facebook 페이지를 찾지 못했습니다.'
                : igError === 'cancelled'
                    ? '연결이 취소되었습니다.'
                    : 'Instagram 연결 중 오류가 발생했습니다.'
            toast.error(msg)
            router.replace('/creator?tab=settings')
        } else if (igErrorBasic) {
            const msg = igErrorBasic === 'cancelled'
                ? 'Instagram 연결이 취소되었습니다.'
                : 'Instagram 직접 연동 중 오류가 발생했습니다.'
            toast.error(msg)
            router.replace('/creator?tab=settings')
        }
    }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

    // 성과 데이터 로드 (가치 계산기용)
    useEffect(() => {
        if (!effectiveUserId) return
        const supabase = createClient()
        supabase
            .from('campaign_performance')
            .select('engagement_rate, cpe')
            .eq('creator_id', effectiveUserId)
            .then(({ data }) => {
                if (data && data.length > 0) {
                    const validER = data.filter(d => d.engagement_rate != null)
                    const validCpe = data.filter(d => d.cpe != null)
                    setPerfStats({
                        avgEngagementRate: validER.length > 0
                            ? validER.reduce((s, d) => s + d.engagement_rate, 0) / validER.length
                            : null,
                        avgCpe: validCpe.length > 0
                            ? validCpe.reduce((s, d) => s + d.cpe, 0) / validCpe.length
                            : null,
                        count: data.length
                    })
                } else {
                    setPerfStats({ avgEngagementRate: null, avgCpe: null, count: 0 })
                }
            })
    }, [effectiveUserId])

    // Instagram API 실제 ER 조회
    useEffect(() => {
        if (!effectiveUserId) return
        const igChannel = channels.find(ch => ch.platform === 'instagram')
        if (!igChannel) return
        setIgStatsLoading(true)
        fetch(`/api/instagram/profile-stats?userId=${effectiveUserId}`)
            .then(r => r.json())
            .then(data => {
                if (!data.error) setIgStats(data)
            })
            .catch(() => { })
            .finally(() => setIgStatsLoading(false))
    }, [effectiveUserId, channels])

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag))
        } else {
            if (selectedTags.length >= 5) {
                toast.error("최대 5개까지 선택 가능합니다.")
                return
            }
            setSelectedTags(prev => [...prev, tag])
        }
    }

    const handleAddChannel = async () => {
        if (!effectiveUserId) return
        if (!newChannelHandle) {
            toast.error("채널 핸들(ID)을 입력해주세요")
            return
        }

        try {
            await createChannel({
                userId: effectiveUserId,
                platform: newChannelPlatform as any,
                handle: newChannelHandle,
                followersCount: newChannelFollowers ? parseInt(newChannelFollowers.replace(/,/g, "")) : 0,
                isPrimary: channels.length === 0, // First channel is primary by default
                isPublic: true
            })
            setIsAddChannelOpen(false)
            setNewChannelHandle("")
            setNewChannelFollowers("")
            setNewChannelPlatform("instagram")
        } catch (error) {
            console.error("Failed to add channel", error)
        }
    }



    const handleSave = async () => {
        if (!effectiveUserId) return

        try {
            await updateUser({
                name,
                bio,
                tags: selectedTags,
                primaryRegion, // NEW
                // Bank Info
                bankName,
                accountNumber,
                accountHolder,
                phone,
                address,
                // Extended Rate Card (5 fields)
                priceVideo: priceVideo ? parseInt(priceVideo) : 0,
                priceFeed: priceFeed ? parseInt(priceFeed) : 0,
                priceStory: priceStory ? parseInt(priceStory) : 0,
                usageRightsMonth: usageRightsMonth ? parseInt(usageRightsMonth) : 0,
                usageRightsPrice: usageRightsPrice ? parseInt(usageRightsPrice) : 0,
                autoDmMonth: autoDmMonth ? parseInt(autoDmMonth) : 0,
                autoDmPrice: autoDmPrice ? parseInt(autoDmPrice) : 0,
                // Creator Legal/Tax Fields
                legalName,
                birthDate,
                legalAddress,
                isBusinessRegistered,
                creatorBusinessNumber,
            }, effectiveUserId) // Pass effectiveUserId to update the correct profile

            toast.success("✓ 프로필이 저장되었습니다", { description: "변경 내용이 즉시 반영됩니다." })
        } catch (error) {
            console.error("Failed to save settings:", error)
            toast.error("저장에 실패했습니다.")
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Proxy Mode Indicator */}
            {isProxyMode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Lock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900">관리자 모드 (Proxy Mode)</h3>
                        <p className="text-xs text-blue-700">
                            현재 <strong>{effectiveUser?.name}</strong>님의 프로필을 수정하고 있습니다.
                        </p>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>기본 정보</CardTitle>
                    <CardDescription>
                        {isProxyMode ? '크리에이터의 기본 정보를 관리합니다.' : '나를 표현하는 매력적인 프로필 사진과 소개를 등록해보세요.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center justify-center">
                        <Label className="mb-4">프로필 이미지</Label>
                        <AvatarUpload
                            uid={effectiveUserId || "default"}
                            url={effectiveUser?.avatar}
                            onUpload={async (url) => {
                                await updateUser({ avatar: url }, effectiveUserId)
                            }}
                            size={120}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">크레디픽 활동명</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="활동명 입력"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="primaryRegion">주요 활동 지역</Label>
                            <Select value={primaryRegion} onValueChange={setPrimaryRegion}>
                                <SelectTrigger>
                                    <SelectValue placeholder="지역 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REGIONS.map(region => (
                                        <SelectItem key={region} value={region}>{region}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>활동 카테고리 / 태그 (최대 5개)</Label>
                        <div className="flex flex-wrap gap-2">
                            {/* Standardizing Tags: Use PROFILE_CATEGORIES */}
                            {PROFILE_CATEGORIES.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer px-3 py-1.5 text-sm hover:bg-primary/90"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            선택된 태그: {selectedTags.join(", ")}
                        </p>
                        {selectedTags[0] && (() => {
                            const TAG_DESCRIPTIONS: Record<string, string> = {
                                "💄 뷰티": "메이크업, 스킨케어, 헤어 등 뷰티 전반의 콘텐츠를 제작하는 크리에이터입니다.",
                                "👗 패션": "스타일링, 코디, 트렌드 등 패션 관련 콘텐츠를 전문으로 합니다.",
                                "💊 건강": "운동, 영양, 웰니스 등 건강한 라이프스타일을 다루는 크리에이터입니다.",
                                "💉 시술/병원": "시술, 의료 뷰티, 건강 관련 정보를 전문으로 공유합니다.",
                                "🍽️ 맛집": "국내외 레스토랑 리뷰 및 맛집 탐방 콘텐츠를 제작합니다.",
                                "🏡 리빙/인테리어": "홈 데코, 인테리어, 라이프스타일 공간을 소개하는 크리에이터입니다.",
                                "💍 웨딩/결혼": "웨딩 준비, 신혼 라이프 등 결혼 관련 콘텐츠를 제작합니다.",
                                "🏋️ 헬스/운동": "피트니스, 스포츠, 다이어트 운동 콘텐츠를 전문으로 합니다.",
                                "🥗 다이어트": "식단 관리, 체중 감량, 건강한 식습관 콘텐츠를 제공합니다.",
                                "👶 육아": "육아, 유아 제품, 자녀 교육 관련 콘텐츠를 제작합니다.",
                                "🐶 반려동물": "반려견, 반려묘 등 펫 라이프 콘텐츠를 전문으로 합니다.",
                                "💻 테크/IT": "최신 기기, 앱, IT 트렌드를 리뷰하는 크리에이터입니다.",
                                "🎮 게임": "게임 플레이, 리뷰, 공략 등 게이밍 콘텐츠를 제작합니다.",
                                "📚 도서/자기계발": "자기계발, 독서, 커리어 성장 콘텐츠를 공유합니다.",
                                "🎨 취미/DIY": "수공예, 취미 활동, DIY 프로젝트 콘텐츠를 제작합니다.",
                                "🎓 교육/강의": "전문 지식, 강의, 학습 콘텐츠를 제공하는 크리에이터입니다.",
                                "🎬 영화/문화": "영화, 전시, 공연 등 문화 전반을 리뷰하고 소개합니다.",
                                "💰 재테크": "투자, 절약, 금융 정보를 공유하는 크리에이터입니다.",
                                "✈️ 여행": "국내외 여행지, 숙소, 여행 팁을 소개하는 크리에이터입니다.",
                            }
                            const desc = TAG_DESCRIPTIONS[selectedTags[0]]
                            return desc ? (
                                <p className="text-xs text-blue-600 mt-1.5 bg-blue-50 rounded-md px-3 py-2 border border-blue-100">
                                    🏷 <strong>대표 태그: {selectedTags[0]}</strong> — {desc}
                                </p>
                            ) : null
                        })()}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">자기소개</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="브랜드에게 어필할 수 있는 소개글을 작성해주세요."
                            className="min-h-[100px]"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Creator Specific Fields (Show if effectiveUser type/role is creator) */}
            {/* Note: In proxy mode, effectiveUser always has type='creator'. If checking role, use profile data if available */}
            {/* Since we fetch profile tags above, we can rely on that or effectiveUser logic. For simplicity, assume MCN manages creators or Creator manages self. */}
            {(effectiveUser?.role === 'creator' || isProxyMode) && (
                <>
                    {/* Social Channels - Option A Style */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        📱 소셜 채널
                                        <Badge className="bg-purple-600">New</Badge>
                                    </CardTitle>
                                    <CardDescription>연결된 채널을 통해 브랜드에게 더 많은 정보를 제공하세요</CardDescription>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Instagram OAuth 연결 버튼 */}
                                    {effectiveUserId && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="gap-2 border-pink-200 text-pink-600 hover:bg-pink-50"
                                                >
                                                    <Instagram className="h-4 w-4" />
                                                    Instagram 연결
                                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[240px]">
                                                <DropdownMenuLabel>연결 방식 선택</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => window.location.href = `/api/instagram/connect?userId=${effectiveUserId}`}
                                                    className="gap-2 cursor-pointer py-3"
                                                >
                                                    <div className="bg-pink-100 p-1.5 rounded-md">
                                                        <TrendingUp className="h-4 w-4 text-pink-600" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">비즈니스 계정 연결 <span className="text-xs text-primary font-bold">(추천)</span></span>
                                                        <span className="text-xs text-muted-foreground whitespace-normal">조회수 등 상세 통계 제공 (Facebook 필요)</span>
                                                    </div>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => window.location.href = `/api/instagram/connect-basic?userId=${effectiveUserId}`}
                                                    className="gap-2 cursor-pointer py-3"
                                                >
                                                    <div className="bg-slate-100 p-1.5 rounded-md">
                                                        <Instagram className="h-4 w-4 text-slate-600" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">일반 인스타그램 연결</span>
                                                        <span className="text-xs text-muted-foreground whitespace-normal">계정 소유 인증 전용 (팔로워 수 직접 기입)</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                    <Dialog open={isAddChannelOpen} onOpenChange={setIsAddChannelOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="gap-2" variant="outline">
                                                <Plus className="h-4 w-4" />
                                                채널 추가
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>소셜 채널 추가</DialogTitle>
                                                <DialogDescription>
                                                    활동 중인 소셜 미디어 채널을 추가하여 브랜드에게 어필하세요.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="platform">플랫폼</Label>
                                                    <Select value={newChannelPlatform} onValueChange={setNewChannelPlatform}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="플랫폼 선택" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="instagram">Instagram</SelectItem>
                                                            <SelectItem value="youtube">YouTube</SelectItem>
                                                            <SelectItem value="blog">Naver Blog</SelectItem>
                                                            <SelectItem value="tiktok">TikTok</SelectItem>
                                                            <SelectItem value="other">기타 (Web)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="handle">계정/핸들 (ID)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                                                            {newChannelPlatform === 'instagram' || newChannelPlatform === 'tiktok' ? '@' : ''}
                                                        </span>
                                                        <Input
                                                            id="handle"
                                                            value={newChannelHandle}
                                                            onChange={(e) => setNewChannelHandle(e.target.value)}
                                                            className={newChannelPlatform === 'instagram' || newChannelPlatform === 'tiktok' ? 'pl-7' : ''}
                                                            placeholder={newChannelPlatform === 'youtube' ? '채널명 입력' : 'username'}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="channelFollowers">팔로워/구독자 수</Label>
                                                    <Input
                                                        id="channelFollowers"
                                                        type="number"
                                                        value={newChannelFollowers}
                                                        onChange={(e) => setNewChannelFollowers(e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAddChannelOpen(false)}>취소</Button>
                                                <Button onClick={handleAddChannel}>추가하기</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {channels.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                                    <p>연결된 소셜 채널이 없습니다.</p>
                                    <p className="text-sm mt-1">인스타그램, 유튜브 등 활동 중인 채널을 추가해보세요.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {channels.map((channel) => (
                                        <SocialChannelCard
                                            key={channel.id}
                                            channel={channel}
                                            userId={effectiveUserId!}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Channel Dialog */}

                    {/* 내 광고 가치 계산기 */}
                    <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 to-transparent">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                                내 광고 가치 계산기
                                <span className="text-xs font-normal text-muted-foreground ml-1">
                                    {perfStats?.count ? `${perfStats.count}건 실적 데이터 기반` : '업계 평균 기준 예상치'}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const totalFollowers = channels.reduce((s, ch) => s + (ch.followersCount || 0), 0)
                                if (totalFollowers === 0) {
                                    return <p className="text-sm text-muted-foreground">소셜 채널을 연결하면 예상 단가를 확인할 수 있습니다.</p>
                                }

                                // ── 1. 참여율 (우선순위: Instagram API실측 > 캠페인실적 > 팔로워티어추정)
                                const igErRaw = igStats?.er != null ? igStats.er / 100 : null
                                const er: number = igErRaw
                                    ?? (perfStats?.avgEngagementRate != null ? perfStats.avgEngagementRate / 100 : null)
                                    ?? (totalFollowers >= 1000000 ? 0.012 : totalFollowers >= 100000 ? 0.025 : totalFollowers >= 10000 ? 0.04 : 0.06)
                                const erSource = igErRaw != null ? 'instagram_api' : perfStats?.avgEngagementRate != null ? 'campaign' : 'estimate'
                                const erSourceLabel = erSource === 'instagram_api' ? '📸 Instagram 실측' : erSource === 'campaign' ? '📊 캠페인 실적' : '📐 추정값'
                                const erSourceColor = erSource === 'instagram_api' ? 'text-pink-600 bg-pink-50 border-pink-200' : erSource === 'campaign' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-slate-500 bg-slate-50 border-slate-200'

                                // ── 2. 카테고리 CPE ──
                                const primaryTag = selectedTags[0] || ''
                                const CATEGORY_CPE: Record<string, number> = {
                                    '💊 건강': 2200, '💉 시술/병원': 2200, '🥗 다이어트': 2000,
                                    '💄 뷰티': 1800, '💻 테크/IT': 1600, '💍 웨딩/결혼': 1500,
                                    '👶 육아': 1300, '🏋️ 헬스/운동': 1300, '👗 패션': 1200,
                                    '✈️ 여행': 1100, '🏡 리빙/인테리어': 1000, '🐶 반려동물': 900,
                                    '🍽️ 맛집': 700, '🎮 게임': 600,
                                }
                                const baseCpe = CATEGORY_CPE[primaryTag] ?? 800

                                // ── 3. ER 프리미엄 ──
                                const erPremium = er >= 0.08 ? 1.5 : er >= 0.04 ? 1.0 : er >= 0.02 ? 0.7 : 0.4
                                const erLabel = er >= 0.08 ? '팬덤형' : er >= 0.04 ? '우수' : er >= 0.02 ? '평균' : '도달형'
                                const erColor = er >= 0.08 ? 'text-purple-600 bg-purple-50 border-purple-200'
                                    : er >= 0.04 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                                        : er >= 0.02 ? 'text-blue-600 bg-blue-50 border-blue-200'
                                            : 'text-slate-500 bg-slate-50 border-slate-200'
                                const effectiveCpe = perfStats?.avgCpe ?? Math.round(baseCpe * erPremium)

                                // ── 4. 콘텐츠 유형 배율 ──
                                const CONTENT_MULT: Record<string, number> = {
                                    reels: 1.5, feed: 1.0, story: 0.5, youtube: 3.0
                                }
                                const CONTENT_LABEL: Record<string, string> = {
                                    reels: '릴스/쇼츠 ×1.5', feed: '피드(사진) ×1.0', story: '스토리 ×0.5', youtube: '유튜브 ×3.0'
                                }
                                const contentMult = CONTENT_MULT[calcContentType] ?? 1.0

                                // ── 5. 부가 조건 배율 ──
                                const usageMult = calcUsageRights ? 1.35 : 1.0
                                const exclusivityMult = calcExclusivity ? 1.5 : 1.0
                                const productionMult = calcHighProduction ? 1.3 : 1.0
                                const seasonMult = calcSeason ? 1.15 : 1.0
                                const totalAddMult = usageMult * exclusivityMult * productionMult * seasonMult

                                // ── 6. 최종 계산 ──
                                const base = Math.round(totalFollowers * er * effectiveCpe)
                                const estimatedValue = Math.round(base * contentMult * totalAddMult)
                                const minValue = Math.round(estimatedValue * 0.8)
                                const maxValue = Math.round(estimatedValue * 1.2)

                                const fmt = (n: number) => {
                                    if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`
                                    if (n >= 10000) return `${Math.round(n / 10000)}만원`
                                    return `${n.toLocaleString()}원`
                                }
                                const tierLabel = totalFollowers >= 1000000 ? '메가' : totalFollowers >= 100000 ? '매크로' : totalFollowers >= 10000 ? '마이크로' : '나노'
                                const tierColor = totalFollowers >= 1000000 ? 'text-orange-600' : totalFollowers >= 100000 ? 'text-blue-600' : totalFollowers >= 10000 ? 'text-emerald-600' : 'text-slate-500'

                                return (
                                    <div className="space-y-4">
                                        {/* 기본 지표 */}
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            <div className="p-2.5 rounded-lg bg-white border space-y-0.5">
                                                <p className="text-[10px] text-muted-foreground">팔로워</p>
                                                <p className={`text-sm font-bold ${tierColor}`}>
                                                    {totalFollowers >= 10000 ? `${(totalFollowers / 10000).toFixed(1)}만` : totalFollowers.toLocaleString()}
                                                </p>
                                                <p className={`text-[9px] font-medium ${tierColor}`}>{tierLabel}</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-white border space-y-0.5">
                                                <p className="text-[10px] text-muted-foreground">참여율</p>
                                                <p className="text-sm font-bold text-emerald-600">{(er * 100).toFixed(1)}%</p>
                                                <span className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${erSourceColor}`}>{erSourceLabel}</span>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-white border space-y-0.5">
                                                <p className="text-[10px] text-muted-foreground">카테고리 CPE</p>
                                                <p className="text-sm font-bold">₩{baseCpe.toLocaleString()}</p>
                                                <p className="text-[9px] text-muted-foreground truncate">{primaryTag || '미설정'}</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-white border space-y-0.5">
                                                <p className="text-[10px] text-muted-foreground">실효 CPE</p>
                                                <p className="text-sm font-bold text-indigo-600">₩{effectiveCpe.toLocaleString()}</p>
                                                <p className="text-[9px] text-muted-foreground">×{erPremium} 보정</p>
                                            </div>
                                        </div>

                                        {/* Instagram 실측 인사이트 패널 */}
                                        {igStatsLoading ? (
                                            <div className="px-3 py-2.5 rounded-lg bg-pink-50 border border-pink-200 text-[10px] text-pink-500 animate-pulse">
                                                📸 Instagram 실측 데이터 불러오는 중...
                                            </div>
                                        ) : igStats && igStats.source === 'instagram_api' ? (
                                            <div className="px-3 py-2.5 rounded-lg bg-pink-50 border border-pink-200 space-y-1.5">
                                                <p className="text-[10px] font-semibold text-pink-700 flex items-center gap-1">
                                                    📸 Instagram 실측 인사이트
                                                    <span className="text-[9px] font-normal text-pink-400">최근 {igStats.postCount}개 게시물 기준</span>
                                                </p>
                                                <div className="grid grid-cols-4 gap-2 text-center">
                                                    <div>
                                                        <p className="text-[9px] text-pink-400">평균 도달</p>
                                                        <p className="text-[11px] font-bold text-pink-700">
                                                            {igStats.avgReach != null ? igStats.avgReach.toLocaleString() : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-pink-400">도달률</p>
                                                        <p className="text-[11px] font-bold text-pink-700">
                                                            {igStats.reachRate != null ? `${igStats.reachRate}%` : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-pink-400">평균 저장</p>
                                                        <p className="text-[11px] font-bold text-pink-700">
                                                            {igStats.avgSaves != null ? igStats.avgSaves.toLocaleString() : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-pink-400">저장률</p>
                                                        <p className="text-[11px] font-bold text-pink-700">
                                                            {igStats.saveRate != null ? `${igStats.saveRate}%` : '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}


                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-slate-600">📹 콘텐츠 유형</p>
                                            <div className="grid grid-cols-4 gap-1.5">
                                                {(['reels', 'feed', 'story', 'youtube'] as const).map((ct) => (
                                                    <button
                                                        key={ct}
                                                        onClick={() => setCalcContentType(ct)}
                                                        className={`py-2 px-1 rounded-lg text-[11px] font-medium border transition-all ${calcContentType === ct
                                                            ? 'bg-slate-900 text-white border-slate-900'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                                            }`}
                                                    >
                                                        {ct === 'reels' ? '🎬 릴스' : ct === 'feed' ? '🖼️ 피드' : ct === 'story' ? '⏱️ 스토리' : '▶️ 유튜브'}
                                                        <span className="block text-[9px] opacity-60 mt-0.5">
                                                            {ct === 'reels' ? '×1.5' : ct === 'feed' ? '×1.0' : ct === 'story' ? '×0.5' : '×3.0'}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 부가 조건 */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-slate-600">➕ 부가 조건 (해당되면 체크)</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { key: 'usage', label: '2차 활용권', desc: '광고 소재 재사용', mult: '+35%', active: calcUsageRights, set: setCalcUsageRights },
                                                    { key: 'excl', label: '독점 계약', desc: '경쟁사 협업 제한', mult: '+50%', active: calcExclusivity, set: setCalcExclusivity },
                                                    { key: 'prod', label: '고제작 난이도', desc: '스튜디오·모델 포함', mult: '+30%', active: calcHighProduction, set: setCalcHighProduction },
                                                    { key: 'season', label: '시의성 콘텐츠', desc: '트렌드·시즌 한정', mult: '+15%', active: calcSeason, set: setCalcSeason },
                                                ].map(({ key, label, desc, mult, active, set }) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => set(!active)}
                                                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all ${active
                                                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <div className={`mt-0.5 h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${active ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                                                            }`}>
                                                            {active && <span className="text-white text-[10px] font-bold">✓</span>}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-semibold leading-tight">{label} <span className="text-[10px] font-normal text-emerald-600">{mult}</span></p>
                                                            <p className="text-[10px] text-muted-foreground">{desc}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 최종 단가 */}
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-center">
                                            <p className="text-xs text-muted-foreground mb-1">예상 광고 단가 범위 ({CONTENT_LABEL[calcContentType]})</p>
                                            <p className="text-2xl font-bold text-emerald-700 tracking-tight">
                                                {fmt(minValue)} ~ {fmt(maxValue)}
                                            </p>
                                            <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">
                                                평균 {fmt(Math.round((minValue + maxValue) / 2))}
                                            </p>
                                        </div>

                                        {/* 계산 근거 */}
                                        <div className="text-[10px] text-muted-foreground space-y-1 bg-slate-50 rounded-lg px-3 py-2.5 border">
                                            <p className="font-semibold text-slate-600 mb-1">📐 계산 근거</p>
                                            <p>팔로워 {totalFollowers.toLocaleString()} × ER {(er * 100).toFixed(1)}% × 실효CPE ₩{effectiveCpe.toLocaleString()}</p>
                                            <p>× 콘텐츠({contentMult}) × 부가조건({totalAddMult.toFixed(2)}) = ₩{estimatedValue.toLocaleString()}</p>
                                            <p className="text-slate-400">
                                                {primaryTag ? `카테고리(${primaryTag}) CPE ₩${baseCpe.toLocaleString()}` : '카테고리 미설정'} · ER보정 ×{erPremium}
                                                {calcUsageRights ? ' · 2차활용+35%' : ''}
                                                {calcExclusivity ? ' · 독점+50%' : ''}
                                                {calcHighProduction ? ' · 고제작+30%' : ''}
                                                {calcSeason ? ' · 시의성+15%' : ''}
                                            </p>
                                            {!primaryTag && (
                                                <p className="text-amber-500 font-medium">💡 카테고리 태그를 설정하면 더 정확합니다</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })()}
                        </CardContent>
                    </Card>

                    {/* 활동 정보 & 정산 정보 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>활동 정보 &amp; 정산 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Rate Card - Extended Version (5 fields) */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold">예상 단가표 (Rate Card)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>숏폼 영상 (Reels/Shorts)</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={priceVideo}
                                                onChange={(e) => setPriceVideo(e.target.value)}
                                                className="pr-8"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>피드 게시물 (Photo/Carousel)</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={priceFeed}
                                                onChange={(e) => setPriceFeed(e.target.value)}
                                                className="pr-8"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>스토리 (Story)</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={priceStory}
                                                onChange={(e) => setPriceStory(e.target.value)}
                                                className="pr-8"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>2차 활용권</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={usageRightsMonth}
                                                    onChange={(e) => setUsageRightsMonth(e.target.value)}
                                                    className="pr-8"
                                                    placeholder="기간"
                                                />
                                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">개월</span>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={usageRightsPrice}
                                                    onChange={(e) => setUsageRightsPrice(e.target.value)}
                                                    className="pr-8"
                                                    placeholder="비용"
                                                />
                                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>자동 DM 발송</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={autoDmMonth}
                                                    onChange={(e) => setAutoDmMonth(e.target.value)}
                                                    className="pr-8"
                                                    placeholder="기간"
                                                />
                                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">개월</span>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={autoDmPrice}
                                                    onChange={(e) => setAutoDmPrice(e.target.value)}
                                                    className="pr-8"
                                                    placeholder="비용"
                                                />
                                                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">원</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Info */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-base font-semibold">정산 계좌 정보</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>은행명</Label>
                                        <Input
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            placeholder="예: 카카오뱅크"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>계좌번호</Label>
                                        <Input
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            placeholder="하이픈(-) 포함"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>예금주</Label>
                                        <Input
                                            value={accountHolder}
                                            onChange={(e) => setAccountHolder(e.target.value)}
                                            placeholder="실명 입력"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Creator Legal/Tax Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>계약서 · 세무 정보</CardTitle>
                            <CardDescription>계약서 생성 및 원천징수에 사용되는 법적 정보입니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>실명 (법적 이름)</Label>
                                    <Input
                                        value={legalName}
                                        onChange={(e) => setLegalName(e.target.value)}
                                        placeholder="홍길동"
                                    />
                                    <p className="text-[11px] text-muted-foreground">계약서 '을' 기명에 사용됩니다</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>생년월일</Label>
                                    <Input
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        placeholder="1990-01-01"
                                    />
                                    <p className="text-[11px] text-muted-foreground">원천징수(3.3%) 신고에 필요합니다</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>법적 주소 (계약서용)</Label>
                                <Input
                                    value={legalAddress}
                                    onChange={(e) => setLegalAddress(e.target.value)}
                                    placeholder="서울시 강남구..."
                                />
                                <p className="text-[11px] text-muted-foreground">배송 주소와 다를 수 있습니다</p>
                            </div>
                            <div className="space-y-4 pt-2 border-t">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="biz-reg"
                                        checked={isBusinessRegistered}
                                        onChange={(e) => setIsBusinessRegistered(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="biz-reg" className="cursor-pointer">개인사업자로 등록되어 있습니다</Label>
                                </div>
                                {isBusinessRegistered && (
                                    <div className="space-y-2 ml-7">
                                        <Label>사업자 등록번호</Label>
                                        <Input
                                            value={creatorBusinessNumber}
                                            onChange={(e) => setCreatorBusinessNumber(e.target.value)}
                                            placeholder="000-00-00000"
                                            className="max-w-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>



                    <Card>
                        <CardHeader>
                            <CardTitle>연락처 & 배송 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>연락처 (휴대폰)</Label>
                                <Input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="010-0000-0000"
                                    className="max-w-md"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>제품 배송지 주소</Label>
                                <Input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="도로명 주소 입력"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-6">
                            <Button onClick={handleSave} className="w-full md:w-auto gap-2" size="lg">
                                <Save className="h-4 w-4" />
                                {isProxyMode ? '크리에이터 프로필 저장' : '설정 저장하기'}
                            </Button>
                        </CardFooter>
                    </Card>
                </>
            )
            }

            {/* 위험 구역 - 프록시 모드에서는 숨김 */}
            {
                !isProxyMode && (
                    <Card className="border-destructive/30">
                        <CardHeader>
                            <CardTitle className="text-destructive text-base">위험 구역</CardTitle>
                            <CardDescription>
                                계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AccountDeleteDialog />
                        </CardContent>
                    </Card>
                )
            }
        </div >
    )
}
