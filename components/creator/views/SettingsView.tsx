"use client"

import { useEffect, useState } from "react"
import { useUnifiedProvider, useSocialChannels } from "@/components/providers/unified-provider"
import { useEffectiveUser } from "@/lib/hooks/use-effective-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Save, Loader2, Lock, Plus, Edit2, Trash2, Instagram, Youtube, Globe, Pencil, Music2, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AccountDeleteDialog } from "@/components/account-delete-dialog"

const PROFILE_CATEGORIES = [
    "✈️ 여행", "💄 뷰티", "💊 건강", "💉 시술/병원", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

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


                    <Card>
                        <CardHeader>
                            <CardTitle>활동 정보 & 정산 정보</CardTitle>
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
            )}

            {/* 위험 구역 - 프록시 모드에서는 숨김 */}
            {!isProxyMode && (
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
            )}
        </div>
    )
}
