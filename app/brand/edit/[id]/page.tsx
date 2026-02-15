"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Edit2, Plus, Send, Package, Check, Upload, Loader2, X } from "lucide-react"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { updateCampaign } from "@/app/actions/campaign"
import { createClient } from "@/lib/supabase/client"

export default function EditCampaignPage() {
    const router = useRouter()
    const { id } = useParams()
    const { campaigns, isLoading, user, products } = useUnifiedProvider()

    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)

    // Form States
    const [title, setTitle] = useState("")
    const [productTitle, setProductTitle] = useState("")
    const [budget, setBudget] = useState("")
    const [target, setTarget] = useState("")
    const [description, setDescription] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string[]>([])
    const [image, setImage] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Date Picker State
    const [postingYear, setPostingYear] = useState("2026")
    const [postingMonth, setPostingMonth] = useState("3")
    const [postingDay, setPostingDay] = useState("")

    // New API Fields States
    const [selectedChannels, setSelectedChannels] = useState<string[]>([])
    const [deadline, setDeadline] = useState("")
    const [selectionDate, setSelectionDate] = useState("")
    const [minFollowers, setMinFollowers] = useState("")
    const [maxFollowers, setMaxFollowers] = useState("")
    const [recruitmentCount, setRecruitmentCount] = useState("")
    const [referenceLink, setReferenceLink] = useState("")
    const [hashtags, setHashtags] = useState("")

    // Product Load Modal State
    const [isProductLoadModalOpen, setIsProductLoadModalOpen] = useState(false)
    const brandProducts = products.filter(p => p.brandId === user?.id)

    const POPULAR_TAGS = [
        "✈️ 여행", "💄 뷰티", "💊 건강", "💉 시술/병원", "👗 패션", "🍽️ 맛집",
        "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
        "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
        "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
    ]

    const CHANNELS = [
        { id: "instagram", label: "인스타그램", icon: "📸" },
        { id: "youtube", label: "유튜브", icon: "▶️" },
        { id: "tiktok", label: "틱톡", icon: "🎵" },
        { id: "blog", label: "블로그", icon: "📝" },
        { id: "shorts", label: "유튜브 숏츠", icon: "⚡" },
        { id: "reels", label: "인스타 릴스", icon: "🎞️" }
    ]

    useEffect(() => {
        if (!isLoading && campaigns.length > 0) {
            const campaign = campaigns.find(c => c.id.toString() === id || c.id === id)

            if (campaign) {
                // Populate Basic Fields
                setTitle(campaign.title || "")
                setProductTitle(campaign.product)
                setBudget(campaign.budget)
                setTarget(campaign.target)
                setDescription(campaign.description)
                setImage(campaign.image && campaign.image !== "📦" ? campaign.image : (campaign.product_image_url || ""))

                // Categories
                if (campaign.category) {
                    setSelectedCategory(campaign.category.split(',').map(s => s.trim()).filter(Boolean))
                }

                // Posting Date
                if (campaign.postingDate) {
                    const [y, m, d] = campaign.postingDate.split('-')
                    if (y) setPostingYear(y)
                    if (m) setPostingMonth(parseInt(m).toString())
                    if (d) setPostingDay(d)
                }

                // Populate New Fields (from CampaignProvider mapping)
                if (campaign.recruitment_count) setRecruitmentCount(campaign.recruitment_count.toString())
                if (campaign.recruitment_deadline) setDeadline(campaign.recruitment_deadline)
                if (campaign.selection_announcement_date) setSelectionDate(campaign.selection_announcement_date)
                if (campaign.min_followers) setMinFollowers(campaign.min_followers.toString())
                if (campaign.max_followers) setMaxFollowers(campaign.max_followers.toString())
                if (campaign.reference_link) setReferenceLink(campaign.reference_link)

                // Channels
                if (campaign.channels && Array.isArray(campaign.channels)) {
                    setSelectedChannels(campaign.channels)
                }

                // Hashtags
                if (campaign.hashtags && Array.isArray(campaign.hashtags)) {
                    setHashtags(campaign.hashtags.join(', '))
                }

            }
            setInitializing(false)
        }
    }, [campaigns, id, isLoading])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (isUploading) {
            toast.info("이미지 업로드 중입니다. 잠시만 기다려주세요.")
            return
        }
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        // Ensure image is appended if state exists
        if (image) {
            formData.append("image", image)
        }

        const result = await updateCampaign(id as string, formData)

        if (result?.error) {
            toast.error(result.error)
            setLoading(false)
        } else {
            toast.success("캠페인이 성공적으로 수정되었습니다!")
            router.push("/brand")
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error("파일 크기는 5MB 이하여야 합니다.")
            return
        }

        setIsUploading(true)
        try {
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `campaign-images/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('campaigns')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('campaigns')
                .getPublicUrl(filePath)

            setImage(publicUrl)
        } catch (error: any) {
            console.error("Image upload error:", error)
            toast.error("이미지 업로드에 실패했습니다.")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSelectProduct = (product: any) => {
        setProductTitle(product.name)

        let desc = product.description || ""
        if (product.points) desc += `\n\n[소구 포인트]\n${product.points}`
        if (product.contentGuide) desc += `\n\n[콘텐츠 가이드]\n${product.contentGuide}`
        if (product.formatGuide) desc += `\n\n[포맷 가이드]\n${product.formatGuide}`
        if (product.shots) desc += `\n\n[필수 촬영 컷]\n${product.shots}`
        setDescription(desc)

        const prodImage = product.image || product.image_url || ""
        if (prodImage && prodImage !== "📦") {
            setImage(prodImage)
        }

        if (product.category && POPULAR_TAGS.some(t => t.includes(product.category))) {
            const matchedTag = POPULAR_TAGS.find(t => t.includes(product.category))
            if (matchedTag && !selectedCategory.includes(matchedTag)) {
                setSelectedCategory(prev => [...prev, matchedTag as string])
            }
        }
        setIsProductLoadModalOpen(false)
    }

    if (initializing && isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-4 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/brand">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">캠페인 수정하기</h1>
                            <p className="text-muted-foreground">
                                등록된 캠페인 내용을 수정합니다.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm md:p-8">
                        <div className="space-y-2">
                            <Label htmlFor="title">캠페인 제목</Label>
                            <Input
                                id="title"
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="예: [제품명] 신제품 런칭 캠페인 모집"
                                required
                            />
                            <p className="text-xs text-muted-foreground">크리에이터들에게 노출될 매력적인 제목을 입력해주세요.</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="product">제품/서비스명</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
                                    onClick={() => setIsProductLoadModalOpen(true)}
                                >
                                    <Package className="h-3 w-3" />
                                    내 브랜드 제품 불러오기
                                </Button>
                            </div>
                            <Input
                                id="product"
                                name="product"
                                value={productTitle}
                                onChange={(e) => setProductTitle(e.target.value)}
                                placeholder="예: 2024년형 스마트 모니터램프"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>제품 이미지 (선택사항)</Label>
                            <div className="flex items-start gap-4">
                                <div
                                    className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors relative group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {image ? (
                                        <>
                                            <img src={image} alt="Preview" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="h-6 w-6 text-white" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setImage("")
                                                }}
                                                className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </>
                                    ) : (
                                        isUploading ? (
                                            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                                <Upload className="h-6 w-6" />
                                                <span className="text-[10px]">업로드</span>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    <p className="text-xs text-muted-foreground pt-2">
                                        캠페인 대표 이미지를 등록하면 크리에이터에게 더 매력적으로 보입니다.<br />
                                        (권장: 1:1 비율, 5MB 이하)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget">제공 혜택</Label>
                            <Input
                                id="budget"
                                name="budget"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="예: 제품 제공 + 원고료 30만원"
                                required
                            />
                        </div>

                        {/* New Fields Group 1: Recruitment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="recruitmentCount">모집 인원 (명)</Label>
                                <Input
                                    id="recruitmentCount"
                                    name="recruitmentCount"
                                    type="number"
                                    value={recruitmentCount}
                                    onChange={(e) => setRecruitmentCount(e.target.value)}
                                    placeholder="예: 5"
                                    min={1}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recruitmentDeadline">모집 마감일</Label>
                                <Input
                                    id="recruitmentDeadline"
                                    name="recruitmentDeadline"
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* New Fields Group 1-2: Selection Date & Follower Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="selectionDate">선정 발표일</Label>
                                <Input
                                    id="selectionDate"
                                    name="selectionDate"
                                    type="date"
                                    value={selectionDate}
                                    onChange={(e) => setSelectionDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>모집 조건 (팔로워 수)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        name="minFollowers"
                                        type="number"
                                        placeholder="최소 (명)"
                                        value={minFollowers}
                                        onChange={(e) => setMinFollowers(e.target.value)}
                                    />
                                    <span className="text-muted-foreground">~</span>
                                    <Input
                                        name="maxFollowers"
                                        type="number"
                                        placeholder="최대 (명)"
                                        value={maxFollowers}
                                        onChange={(e) => setMaxFollowers(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">비워두시면 제한 없음으로 설정됩니다.</p>
                            </div>
                        </div>

                        {/* New Fields Group 2: Channels */}
                        <div className="space-y-2">
                            <Label>희망 채널 (복수 선택 가능)</Label>
                            <div className="flex flex-wrap gap-2">
                                {CHANNELS.map((channel) => (
                                    <button
                                        key={channel.id}
                                        type="button"
                                        onClick={() => {
                                            if (selectedChannels.includes(channel.id)) {
                                                setSelectedChannels(selectedChannels.filter(c => c !== channel.id))
                                            } else {
                                                setSelectedChannels([...selectedChannels, channel.id])
                                            }
                                        }}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all
                                            ${selectedChannels.includes(channel.id)
                                                ? "bg-slate-900 text-white border-slate-900 font-medium"
                                                : "bg-white text-slate-600 hover:bg-slate-50"
                                            }
                                        `}
                                    >
                                        <span>{channel.icon}</span>
                                        {channel.label}
                                    </button>
                                ))}
                            </div>
                            <input type="hidden" name="channels" value={selectedChannels.join(",")} />
                        </div>

                        {/* New Fields Group 3: Reference & Hashtags */}
                        <div className="space-y-2">
                            <div className="space-y-2">
                                <Label htmlFor="referenceLink">참고 링크 (선택사항)</Label>
                                <Input
                                    id="referenceLink"
                                    name="referenceLink"
                                    value={referenceLink}
                                    onChange={(e) => setReferenceLink(e.target.value)}
                                    placeholder="예: https://example.com/product (레퍼런스 게시물 또는 자사몰 링크)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hashtags">필수 해시태그 가이드</Label>
                                <Input
                                    id="hashtags"
                                    name="hashtags"
                                    value={hashtags}
                                    onChange={(e) => setHashtags(e.target.value)}
                                    placeholder="예: #크레디픽, #제품명, #광고 (쉼표로 구분)"
                                />
                                <p className="text-xs text-muted-foreground">크리에이터가 콘텐츠 업로드 시 포함해야 할 해시태그를 입력해주세요.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>카테고리 (복수 선택 가능)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {POPULAR_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            if (selectedCategory.includes(tag)) {
                                                setSelectedCategory(selectedCategory.filter(t => t !== tag))
                                            } else {
                                                setSelectedCategory([...selectedCategory, tag])
                                            }
                                        }}
                                        className={`
                                text-sm px-3 py-2.5 rounded-md border transition-all duration-200 text-left md:text-center
                                ${selectedCategory.includes(tag)
                                                ? "bg-primary text-primary-foreground border-primary font-medium ring-2 ring-offset-2 ring-primary/20"
                                                : "bg-background hover:bg-muted/50 hover:border-primary/50 text-muted-foreground"
                                            }
                            `}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <input type="hidden" name="category" value={selectedCategory.join(",")} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="target">원하는 크리에이터 스타일</Label>
                            <Input
                                id="target"
                                name="target"
                                value={target}
                                onChange={e => setTarget(e.target.value)}
                                placeholder="예: 감성적인 사진을 잘 찍으시는 분, 영상 편집 퀄리티가 높으신 분"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                콘텐츠 업로드 시기 (예정)
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
                            <div className="grid grid-cols-6 gap-2">
                                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((m) => {
                                    const isSelected = postingMonth === m
                                    return (
                                        <Button
                                            key={`posting-${m}`}
                                            type="button"
                                            variant={isSelected ? "default" : "outline"}
                                            className={`h-10 text-sm ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                                            onClick={() => setPostingMonth(m)}
                                        >
                                            {m}월
                                        </Button>
                                    )
                                })}
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="일 (선택사항)"
                                    className="w-24"
                                    min={1}
                                    max={31}
                                    name="postingDay"
                                    value={postingDay}
                                    onChange={e => setPostingDay(e.target.value)}
                                />
                                <span className="text-sm text-muted-foreground">일에 업로드 희망 (미입력시 '협의'로 표시됩니다)</span>
                            </div>
                            {/* Hidden input to combine year-month for form submission */}
                            <input
                                type="hidden"
                                name="postingDate"
                                value={`${postingYear}-${postingMonth.padStart(2, '0')}-${postingDay || ''}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">캠페인 상세 내용</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="제품의 특장점과 크리에이터에게 요청하고 싶은 가이드라인을 적어주세요.&#10;예: 야간 작업 시 눈이 편안하다는 점을 강조해주세요."
                                className="min-h-[200px] resize-y"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/brand">취소</Link>
                            </Button>
                            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={loading}>
                                {loading ? "저장 중..." : <><Edit2 className="mr-2 h-4 w-4" /> 수정사항 저장하기</>}
                            </Button>
                        </div>
                    </form>

                    {/* Product Load Modal */}
                    <Dialog open={isProductLoadModalOpen} onOpenChange={setIsProductLoadModalOpen}>
                        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>내 브랜드 제품 불러오기</DialogTitle>
                                <DialogDescription>
                                    등록된 제품 정보를 불러와 캠페인 내용을 자동으로 채웁니다.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {brandProducts.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>등록된 제품이 없습니다.</p>
                                        <Button variant="link" asChild className="mt-2">
                                            <Link href="/brand?view=products">제품 등록하러 가기</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {brandProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
                                                onClick={() => handleSelectProduct(product)}
                                            >
                                                <div className="h-12 w-12 rounded-md bg-muted overflow-hidden shrink-0 border">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                            <Package className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <h4 className="font-medium truncate group-hover:text-primary transition-colors">{product.name}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 shrink-0 text-sm text-primary font-medium flex items-center gap-1">
                                                    선택 <Check className="h-3 w-3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsProductLoadModalOpen(false)}>닫기</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>
        </div>
    )
}
