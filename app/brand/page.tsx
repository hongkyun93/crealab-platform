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
import {
    BadgeCheck,
    Calendar,
    Filter,
    MapPin,
    Settings,
    Package,
    Send,
    X,
    Trash2,
    Pencil,
    Search,
    Bell,
    Plus,
    ArrowRight,
    Loader2,
    Globe,
    Info,
    ShoppingBag,
    Image as ImageIcon,
    ExternalLink,
    Upload,
    Gift,
    Star
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useEffect, useState, Suspense, useRef } from "react"
import { usePlatform, MOCK_BRAND_USER } from "@/components/providers/platform-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

const POPULAR_TAGS = [
    "✈️ 여행", "💄 뷰티", "👗 패션", "🍽️ 맛집",
    "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

function BrandDashboardContent() {
    const {
        events, user, resetData, isLoading, campaigns, deleteCampaign,
        brandProposals, updateBrandProposal, deleteBrandProposal, sendMessage, messages: allMessages,
        updateUser, products, addProduct, updateProduct, deleteProduct, deleteEvent, supabase, createBrandProposal,
        switchRole
    } = usePlatform()

    const displayUser = user || MOCK_BRAND_USER


    const router = useRouter()
    const searchParams = useSearchParams()

    const initialView = searchParams.get('view') || "discover"
    const [currentView, setCurrentView] = useState(initialView)
    const [sortOrder, setSortOrder] = useState("latest")

    // Filter Query States
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [followerFilter, setFollowerFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all") // all, upcoming, past, favorites
    const [minFollowers, setMinFollowers] = useState<string>("")
    const [maxFollowers, setMaxFollowers] = useState<string>("")
    const [favoriteEvents, setFavoriteEvents] = useState<Set<string>>(new Set())

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
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Product Upload State
    const [productModalOpen, setProductModalOpen] = useState(false)
    const [editingProductId, setEditingProductId] = useState<string | null>(null)
    const [newProductName, setNewProductName] = useState("")
    const [newProductPrice, setNewProductPrice] = useState("")
    const [newProductCategory, setNewProductCategory] = useState("")
    const [newProductDescription, setNewProductDescription] = useState("")
    const [newProductImage, setNewProductImage] = useState("")
    const [newProductLink, setNewProductLink] = useState("")
    const [newProductPoints, setNewProductPoints] = useState("")
    const [newProductShots, setNewProductShots] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [isImageUploading, setIsImageUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [productSearchQuery, setProductSearchQuery] = useState("")

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.brandName?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearchQuery.toLowerCase())
    ) || []

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 300MB limit check
        if (file.size > 300 * 1024 * 1024) {
            alert("파일 크기는 300MB 이하여야 합니다.")
            return
        }

        setIsImageUploading(true)
        console.log('[handleImageUpload] Starting upload for file:', file.name, 'size:', file.size)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `products/${fileName}`

            console.log('[handleImageUpload] Target path:', filePath)

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                console.error('[handleImageUpload] Supabase Storage Error:', error)
                throw error
            }

            console.log('[handleImageUpload] Upload successful, getting public URL...')
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            console.log('[handleImageUpload] Public URL:', publicUrl)
            setNewProductImage(publicUrl)
        } catch (error: any) {
            console.error('[handleImageUpload] Exception:', error)
            alert(`이미지 업로드 실패: ${error.message || "알 수 없는 오류"}`)
        } finally {
            setIsImageUploading(false)
        }
    }

    // Settings States
    const [editName, setEditName] = useState("")
    const [editWebsite, setEditWebsite] = useState("")
    const [editBio, setEditBio] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (displayUser) {
            setEditName(displayUser.name || "")
            setEditWebsite(displayUser.website || "")
            setEditBio(displayUser.bio || "")
        }
    }, [displayUser])

    useEffect(() => {
        if (!isLoading && !user) {
            // router.push('/login') // Guest browsing allowed
        } else if (user && user.type === 'influencer' && user.id !== 'guest_influencer') {
            router.push('/creator')
        }
    }, [user, router, isLoading])

    // Sync view with URL
    useEffect(() => {
        const view = searchParams.get('view')
        if (view && view !== currentView) {
            setCurrentView(view)
        }
    }, [searchParams, currentView])

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
        setFollowerFilter("custom")
    }

    const getFilteredAndSortedEvents = () => {
        let result = [...events]
        if (selectedTag) {
            result = result.filter(e =>
                e.category === selectedTag ||
                e.tags.some(t => t.includes(selectedTag) || selectedTag.includes(t))
            )
        }
        if (statusFilter === "upcoming") {
            result = result.filter(e => e.status !== 'completed')
        } else if (statusFilter === "past") {
            result = result.filter(e => e.status === 'completed')
        } else if (statusFilter === "favorites") {
            result = result.filter(e => favoriteEvents.has(e.id))
        }
        if (minFollowers !== "" || maxFollowers !== "") {
            const min = minFollowers === "" ? 0 : parseInt(minFollowers)
            const max = maxFollowers === "" ? Infinity : parseInt(maxFollowers)
            result = result.filter(e => {
                const count = e.followers || 0
                return count >= min && count <= max
            })
        }
        if (sortOrder === "deadline") result.reverse()
        else if (sortOrder === "match") result.sort(() => Math.random() - 0.5)
        else if (sortOrder === "verified") result = result.filter(e => e.verified)
        else if (sortOrder === "followers_high") result.sort((a, b) => (b.followers || 0) - (a.followers || 0))
        if (sortOrder === "latest") result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        return result
    }

    const handlePropose = (influencer: any) => {
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
        // Prevent duplicate submissions
        if (isSubmitting) return

        if (!user) {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.")
            return
        }

        if (!offerProduct || !compensation || !contentType) {
            alert("필수 항목을 모두 입력해주세요.")
            return
        }
        setIsSubmitting(true)
        try {
            const proposalData = {
                brand_id: user?.id,
                influencer_id: selectedInfluencer?.influencerId,
                product_name: offerProduct,
                product_type: productType,
                compensation_amount: compensation,
                has_incentive: hasIncentive,
                incentive_detail: incentiveDetail,
                event_id: selectedInfluencer?.id,
                content_type: contentType,
                message: message
            }

            // Optional: Remove fields that might not exist in schema if needed
            // But we created createBrandProposal to handle it more safely

            // Use the provider function instead of direct supabase call
            let insertedProposal;
            try {
                insertedProposal = await createBrandProposal(proposalData);
            } catch (err: any) {
                console.warn("Retrying proposal submit...", err)
                if (err?.code === '42703' || err?.message?.includes('column')) {
                    const fallbackData: any = { ...proposalData }
                    delete fallbackData.event_id
                    delete fallbackData.has_incentive
                    delete fallbackData.incentive_detail
                    insertedProposal = await createBrandProposal(fallbackData);
                } else {
                    throw err;
                }
            }

            if (insertedProposal) {
                await sendMessage(selectedInfluencer?.influencerId, `협업 제안서가 전송되었습니다.\n[${offerProduct}]`, insertedProposal.id)
            }
            alert(`${selectedInfluencer?.influencer}님에게 제안서가 성공적으로 발송되었습니다!`)
            setProposeModalOpen(false)

            // Refresh the data to show the new proposal immediately
            resetData()
        } catch (error: any) {
            console.error("Proposal Error:", error)

            // Helpful error message for Schema/Table issues
            if (error?.code === '42703') { // undefined_column
                alert(`제안서 발송 실패: 데이터베이스 스키마와 일치하지 않는 필드가 있습니다.\n(${error.message})`)
            } else if (error?.code === '23503') { // foreign_key_violation
                alert(`제안서 발송 실패: 참조 데이터 오류 (이벤트 또는 사용자 ID가 유효하지 않음)\n(${error.message})`)
            } else {
                alert(`제안서 발송에 실패했습니다: ${error?.message || "알 수 없는 오류"}`)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditProduct = (product: any) => {
        setEditingProductId(product.id)
        setNewProductName(product.name)
        setNewProductPrice(product.price?.toString() || "")
        setNewProductCategory(product.category)
        setNewProductDescription(product.description || "")
        // Remove emoji if present so user can input URL cleanly
        setNewProductImage(product.image === "📦" ? "" : (product.image || ""))
        setNewProductLink(product.link || "")
        setNewProductPoints(product.points || "")
        setNewProductShots(product.shots || "")
        setProductModalOpen(true)
    }


    const handleUploadProduct = async () => {
        // Prevent duplicate submissions or submitting while image is still uploading
        if (isUploading) return
        if (isImageUploading) {
            alert("이미지 업로드가 아직 완료되지 않았습니다. 잠시만 기다려주세요.")
            return
        }

        if (!newProductName || !newProductCategory) {
            alert("제품명과 카테고리는 필수입니다.")
            return
        }

        console.log('[handleUploadProduct] Starting upload for:', newProductName)
        setIsUploading(true)

        try {
            const isEditing = !!editingProductId
            const cleanImage = newProductImage.replace('📦', '').trim()

            const productData = {
                name: newProductName,
                price: parseInt(newProductPrice) || 0,
                category: newProductCategory,
                description: newProductDescription,
                image: cleanImage || "📦",
                link: newProductLink,
                points: newProductPoints,
                shots: newProductShots
            }

            console.log('[handleUploadProduct] Product data prepared:', productData)

            if (editingProductId) {
                await updateProduct(editingProductId, productData)
            } else {
                await addProduct(productData)
            }

            // Clear inputs
            setNewProductName("")
            setNewProductPrice("")
            setNewProductCategory("")
            setNewProductDescription("")
            setNewProductImage("")
            setNewProductLink("")
            setNewProductPoints("")
            setNewProductShots("")
            setEditingProductId(null)

            setProductModalOpen(false)
            console.log('[handleUploadProduct] Success!')
            alert(isEditing ? "제품이 성공적으로 수정되었습니다!" : "제품이 성공적으로 등록되었습니다!")
        } catch (e: any) {
            console.error("[handleUploadProduct] Exception:", e)
            alert(`제품 ${editingProductId ? '수정' : '등록'} 실패: ${e?.message || "알 수 없는 오류"}`)
        } finally {
            setIsUploading(false)
        }
    }

    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            await updateUser({
                name: editName,
                website: editWebsite,
                bio: editBio
            })
            alert("프로필 정보가 저장되었습니다.")
        } catch (e: any) {
            console.error("Save profile error:", e)
            alert("저장 중 오류가 발생했습니다.")
        } finally {
            setIsSaving(false)
        }
    }

    const filteredEvents = getFilteredAndSortedEvents()
    const myCampaigns = user?.type === 'admin' ? campaigns : campaigns.filter(c => c.brandId === user?.id)
    const mySentProposals = user?.type === 'admin' ? brandProposals : brandProposals.filter(p => p.brand_id === user?.id)
    const myProducts = user?.type === 'admin' ? products : products.filter(p => p.brandId === user?.id)

    const renderContent = () => {
        switch (currentView) {
            case "discover":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">모먼트 검색</h1>
                                <p className="text-muted-foreground mt-1">우리 브랜드와 딱 맞는 모먼트를 가진 크리에이터를 찾아보세요.</p>
                            </div>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <Filter className="h-4 w-4" />
                                            {sortOrder === "latest" ? "최신 등록순" : sortOrder === "followers_high" ? "팔로워 많은순" : "정렬"}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>정렬 기준</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                                            <DropdownMenuRadioItem value="latest">최신 등록순</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="followers_high">팔로워 많은순</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="verified">인증된 크리에이터</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Filters */}
                        <Card className="bg-background/50 backdrop-blur-sm">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                                    <span className="text-sm font-semibold w-24">팔로워 규모</span>
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
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 md:items-start">
                                    <span className="text-sm font-semibold w-24 pt-2">모먼트 상태</span>
                                    <div className="flex flex-wrap gap-2 flex-1">
                                        <Button
                                            variant={statusFilter === "all" ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilter("all")}
                                        >
                                            전체보기
                                        </Button>
                                        <Button
                                            variant={statusFilter === "upcoming" ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilter("upcoming")}
                                        >
                                            다가오는 모먼트
                                        </Button>
                                        <Button
                                            variant={statusFilter === "past" ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilter("past")}
                                        >
                                            지나간 모먼트
                                        </Button>
                                        <Button
                                            variant={statusFilter === "favorites" ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setStatusFilter("favorites")}
                                            className="gap-1.5"
                                        >
                                            <Star className="h-3.5 w-3.5" fill={statusFilter === "favorites" ? "currentColor" : "none"} />
                                            즐겨찾기만 보기
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 md:items-start pt-2 border-t border-border/40">
                                    <span className="text-sm font-semibold w-24 pt-2">전문 분야</span>
                                    <div className="flex flex-wrap gap-2 flex-1">
                                        <Button
                                            variant={selectedTag === null ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setSelectedTag(null)}
                                        >
                                            전체
                                        </Button>
                                        {POPULAR_TAGS.map(tag => (
                                            <Button
                                                key={tag}
                                                variant={selectedTag === tag ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                                className={selectedTag === tag ? 'bg-primary/10 text-primary' : ''}
                                            >
                                                {tag}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredEvents.map((item) => {
                                const isFavorite = favoriteEvents.has(item.id)
                                return (
                                    <Link key={item.id} href={`/event/${item.id}`} className="block group">
                                        <Card className="overflow-hidden transition-all hover:shadow-lg border-border/60 bg-background flex flex-col h-full cursor-pointer relative">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const newFavorites = new Set(favoriteEvents);
                                                    if (isFavorite) {
                                                        newFavorites.delete(item.id);
                                                    } else {
                                                        newFavorites.add(item.id);
                                                    }
                                                    setFavoriteEvents(newFavorites);
                                                }}
                                            >
                                                <Star
                                                    className={`h-4 w-4 transition-colors ${isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                                                    fill={isFavorite ? 'currentColor' : 'none'}
                                                />
                                            </Button>
                                            <CardHeader className="pb-3 flex-row gap-3 items-start space-y-0">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                                                    {item.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold truncate">{item.influencer}</h4>
                                                        {user?.type === 'admin' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-red-500 rounded-full"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (confirm("정말로 이 모먼트를 삭제하시겠습니까?")) {
                                                                        deleteEvent(item.id).catch(() => alert("삭제에 실패했습니다."));
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">{item.handle}</p>
                                                    <span className="text-[10px] font-medium bg-secondary/50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                                        {(item.followers || 0).toLocaleString()} 팔로워
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3 flex-1 relative">
                                                {item.status === 'completed' && (
                                                    <div className="absolute top-0 right-4 transform -translate-y-1/2">
                                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                                            지나간 모먼트
                                                        </span>
                                                    </div>
                                                )}
                                                <h3 className="font-bold text-base line-clamp-2">{item.event}</h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" /> {item.eventDate}
                                                </div>
                                                <p className="text-sm text-foreground/70 line-clamp-3">{item.description}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.tags.slice(0, 3).map(t => (
                                                        <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{t}</span>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-4 border-t">
                                                <Button
                                                    className="w-full"
                                                    variant="secondary"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handlePropose(item);
                                                    }}
                                                >
                                                    협업 제안
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )
            case "my-campaigns":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">내 캠페인 관리</h1>
                                <p className="text-muted-foreground mt-1">등록하신 캠페인 공고를 통해 크리에이터를 모집하세요.</p>
                            </div>
                            <Button asChild className="gap-2">
                                <Link href="/brand/new"><Plus className="h-4 w-4" /> 새 캠페인 등록</Link>
                            </Button>
                        </div>
                        {myCampaigns.length === 0 ? (
                            <Card className="p-12 text-center border-dashed">
                                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-bold">등록된 캠페인이 없습니다.</h3>
                                <p className="text-muted-foreground mb-6">첫 캠페인을 등록하고 모집을 시작해보세요!</p>
                                <Button asChild><Link href="/brand/new">캠페인 등록하기</Link></Button>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {myCampaigns.map((c) => (
                                    <Card key={c.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg font-bold">{c.product}</CardTitle>
                                                    <CardDescription>{c.category} • {c.date}</CardDescription>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" asChild><Link href={`/brand/edit/${c.id}`}><Pencil className="h-4 w-4" /></Link></Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteCampaign(c.id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                                            <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-primary/70" />
                                                    <span className="font-medium">일정:</span> {c.eventDate || "미정"}
                                                </div>
                                                {c.postingDate && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Send className="h-3.5 w-3.5 text-primary/70" />
                                                        <span className="font-medium">업로드:</span> {c.postingDate}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <Gift className="h-3.5 w-3.5 text-primary/70" />
                                                    <span className="font-medium">희망제품:</span> {c.targetProduct || "미정"}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="border-t pt-4">
                                            <span className="text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                                모집 중
                                            </span>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )
                        }
                    </div >
                )
            case "proposals":
                const myReceivedProposals = brandProposals.filter(p => p.brand_id === user?.id && p.status === 'applied')
                const sentProposals = brandProposals.filter(p => p.brand_id === user?.id && p.status !== 'applied')

                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4">
                            <h1 className="text-3xl font-bold tracking-tight">협업 제안 관리</h1>
                            <p className="text-muted-foreground">크리에이터와 진행 중인 모든 제안을 한눈에 관리하세요.</p>
                        </div>

                        <Tabs defaultValue="sent" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 lg:max-w-md">
                                <TabsTrigger value="sent">보낸 제안 ({sentProposals.length})</TabsTrigger>
                                <TabsTrigger value="received">받은 지원 ({myReceivedProposals.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="sent" className="space-y-4 mt-6">
                                {sentProposals.length === 0 ? (
                                    <Card className="p-12 text-center text-muted-foreground border-dashed bg-muted/20">보낸 제안서가 없습니다.</Card>
                                ) : (
                                    sentProposals.map((p: any) => (
                                        <Card key={p.id} className="hover:shadow-md transition-all border-border/60">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                                                            {p.influencer_name?.[0] || "C"}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg font-bold">{p.product_name}</CardTitle>
                                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                                <span className="font-medium text-foreground">{p.influencer_name || "크리에이터"}</span>
                                                                <span className="text-muted-foreground">|</span>
                                                                <span>{new Date(p.created_at).toLocaleDateString()}</span>
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <Badge variant={p.status === 'accepted' ? 'default' : 'secondary'} className={p.status === 'accepted' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                                            {p.status === 'offered' ? '제안 보냄' : p.status === 'accepted' ? '수락됨' : p.status === 'pending' ? '보류 중' : p.status}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-full"
                                                            onClick={() => {
                                                                if (confirm("정말로 이 제안서를 삭제하시겠습니까?")) {
                                                                    deleteBrandProposal(p.id).catch(() => alert("삭제에 실패했습니다."));
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardFooter className="border-t py-3 bg-muted/5 flex justify-between items-center">
                                                <div className="text-xs text-muted-foreground italic truncate max-w-[60%]">
                                                    "{p.message}"
                                                </div>
                                                <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs" asChild>
                                                    <Link href="/message"><Bell className="h-3.5 w-3.5" /> 채팅방으로 이동</Link>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="received" className="space-y-4 mt-6">
                                {myReceivedProposals.length === 0 ? (
                                    <Card className="p-12 text-center text-muted-foreground border-dashed bg-muted/20">받은 지원서가 없습니다.</Card>
                                ) : (
                                    myReceivedProposals.map((p: any) => (
                                        <Card key={p.id} className="border-l-4 border-l-primary hover:shadow-sm transition-shadow">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-lg font-bold">{p.product_name} <Badge className="ml-2 bg-primary/10 text-primary border-none text-[10px]">NEW 지원</Badge></CardTitle>
                                                        <CardDescription>
                                                            {p.influencer_name || "크리에이터"} | {new Date(p.created_at).toLocaleDateString()}
                                                        </CardDescription>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => updateBrandProposal(p.id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700">수락</Button>
                                                        <Button size="sm" variant="outline" onClick={() => updateBrandProposal(p.id, 'rejected')} className="text-red-500 border-red-200 hover:bg-red-50">거절</Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-full"
                                                            onClick={() => {
                                                                if (confirm("정말로 이 지원서를 삭제하시겠습니까?")) {
                                                                    deleteBrandProposal(p.id).catch(() => alert("삭제에 실패했습니다."));
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-3 italic text-sm text-foreground/80 bg-primary/5 p-4 rounded-md mx-6 mb-4">
                                                "{p.message}"
                                            </CardContent>
                                            <CardFooter className="border-t py-3 bg-muted/5">
                                                <div className="flex justify-between w-full items-center">
                                                    <div className="text-xs text-muted-foreground">
                                                        희망 광고비: <span className="font-bold text-foreground">{p.compensation_amount}</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="gap-2" asChild>
                                                        <Link href="/message"><Bell className="h-4 w-4" /> 채팅방으로 이동</Link>
                                                    </Button>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )
            case "my-products":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">내 브랜드 제품</h1>
                                <p className="text-muted-foreground mt-1">크리에이터들이 제안하거나 살펴볼 수 있는 우리 브랜드의 제품군입니다.</p>
                            </div>
                            <Button className="gap-2" onClick={() => setProductModalOpen(true)}>
                                <Plus className="h-4 w-4" /> 제품 등록하기
                            </Button>
                        </div>

                        {myProducts.length === 0 ? (
                            <Card className="p-12 text-center border-dashed">
                                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-bold">등록된 제품이 없습니다.</h3>
                                <p className="text-muted-foreground mb-6">제품을 등록하면 크리에이터들이 협업 제안 시 참고할 수 있습니다.</p>
                                <Button onClick={() => setProductModalOpen(true)}>제품 등록하기</Button>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {myProducts.map((p) => (
                                    <Card key={p.id} className="overflow-hidden flex flex-col h-full border-border/60 hover:shadow-md transition-all">
                                        <div className="aspect-square bg-muted flex items-center justify-center text-4xl relative group">
                                            {p.image.startsWith('http') ? (
                                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{p.image}</span>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                                                    <ImageIcon className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{p.category}</span>
                                                    <CardTitle className="text-lg font-bold mt-0.5 line-clamp-1">{p.name}</CardTitle>
                                                </div>
                                                <span className="text-sm font-bold text-foreground shrink-0">{p.price > 0 ? `${p.price.toLocaleString()}원` : "가격 미정"}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 pb-4">
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                                {p.description || "등록된 상세 설명이 없습니다."}
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground w-16 shrink-0 uppercase">Key Points</span>
                                                    <span className="text-xs text-foreground line-clamp-1">{p.points || "-"}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground w-16 shrink-0 uppercase">Required</span>
                                                    <span className="text-xs text-foreground line-clamp-1">{p.shots || "-"}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="border-t pt-4 bg-muted/10 flex gap-2">
                                            <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs gap-1" asChild>
                                                <a href={p.link} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3" /> 웹사이트
                                                </a>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => handleEditProduct(p)}
                                            >
                                                <Pencil className="h-3 w-3" /> 수정
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    if (confirm("정말로 이 제품을 삭제하시겠습니까?")) {
                                                        deleteProduct(p.id).catch(() => alert("삭제에 실패했습니다."));
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" /> 삭제
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )
            case "discover-products":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">브랜드 제품 둘러보기</h1>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    다른 브랜드의 제품을 둘러보고 협업 아이디어를 얻어보세요.
                                </p>
                            </div>
                            <div className="flex w-full max-w-sm items-center space-x-2">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="브랜드, 제품명 검색"
                                        className="pl-9"
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <Card className="p-20 text-center border-dashed bg-muted/20">
                                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">검색 결과가 없습니다.</h3>
                            </Card>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <Card key={product.id} className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 bg-background border-border/60 group">
                                        <div className="aspect-square bg-muted flex items-center justify-center text-6xl overflow-hidden relative">
                                            {product.image?.startsWith('http') ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            ) : (
                                                <span className="transition-transform group-hover:scale-125">{product.image || "📦"}</span>
                                            )}
                                        </div>
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-primary uppercase tracking-tight truncate max-w-[120px]">{product.brandName || "브랜드"}</span>
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-medium">{product.category}</Badge>
                                            </div>
                                            <CardTitle className="text-sm font-bold line-clamp-2 leading-tight h-10">
                                                {product.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-1">
                                            <p className="font-extrabold text-lg text-foreground">
                                                {product.price > 0 ? `${product.price.toLocaleString()}원` : "가격 미정"}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 text-[10px] font-bold text-muted-foreground uppercase flex items-center border-t mt-2 pt-3">
                                            {product.link && (
                                                <a
                                                    href={product.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline flex items-center gap-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    제품 보기 <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )
            case "settings":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <h1 className="text-3xl font-bold tracking-tight">브랜드 설정</h1>
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle>브랜드 프로필</CardTitle>
                                <CardDescription>크리에이터에게 보여질 브랜드 정보를 관리합니다.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="b-name">브랜드명</Label>
                                    <Input id="b-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="b-web">공식 웹사이트</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="b-web" className="pl-9" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="https://" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="b-bio">브랜드 소개</Label>
                                    <Textarea id="b-bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="브랜드의 비전과 가치를 설명해주세요." className="min-h-[120px]" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveProfile} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "저장하기"}
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card className="max-w-2xl border-red-100 bg-red-50/10 mt-6">
                            <CardHeader>
                                <CardTitle className="text-red-600 flex items-center gap-2">
                                    계정 유형 전환
                                </CardTitle>
                                <CardDescription>
                                    크리에이터 계정으로 전환하시겠습니까? 계정 유형을 변경하면 크리에이터 전용 대시보드를 사용하게 됩니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground mb-4">
                                    * 전환 후에도 브랜드 정보는 유지되지만, 대시보드 인터페이스가 크리에이터용으로 변경됩니다.
                                </p>
                                <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                    onClick={async () => {
                                        if (confirm("정말로 크리에이터 계정으로 전환하시겠습니까?")) {
                                            await switchRole('influencer');
                                        }
                                    }}
                                >
                                    크리에이터 계정으로 전환하기
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )
            default:
                return null
        }
    }

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar */}
                    <aside className="hidden lg:flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2 py-4 border-b">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xl overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    user?.name?.[0] || "B"
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-bold truncate">{user?.name || "브랜드"}</h2>
                                <p className="text-xs text-muted-foreground truncate">{user?.type === 'brand' ? '브랜드 계정' : user?.type}</p>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            <Button
                                variant={currentView === "discover" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("discover")}
                            >
                                <Search className="mr-2 h-4 w-4" /> 모먼트 검색
                            </Button>
                            <Button
                                variant={currentView === "my-campaigns" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("my-campaigns")}
                            >
                                <Package className="mr-2 h-4 w-4" /> 내 캠페인
                            </Button>
                            <Button
                                variant={currentView === "my-products" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("my-products")}
                            >
                                <ShoppingBag className="mr-2 h-4 w-4" /> 내 브랜드 제품
                            </Button>
                            <Button
                                variant={currentView === "discover-products" ? "secondary" : "ghost"}
                                className="w-full justify-start text-primary font-medium"
                                onClick={() => setCurrentView("discover-products")}
                            >
                                <ShoppingBag className="mr-2 h-4 w-4" /> 브랜드 제품 둘러보기
                            </Button>
                            <Button
                                variant={currentView === "proposals" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("proposals")}
                            >
                                <Send className="mr-2 h-4 w-4" /> 보낸 제안서
                            </Button>
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/message"><Bell className="mr-2 h-4 w-4" /> 메시지 센터</Link>
                            </Button>
                            <div className="my-2 border-t" />
                            <Button
                                variant={currentView === "settings" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("settings")}
                            >
                                <Settings className="mr-2 h-4 w-4" /> 브랜드 설정
                            </Button>
                        </nav>

                        {/* Quick Action */}
                        <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                                <Info className="h-3 w-3" /> 빠른 등록
                            </h4>
                            <p className="text-[10px] text-muted-foreground mb-3">새로운 캠페인을 등록하고 최고의 크리에이터를 만나보세요.</p>
                            <Button size="sm" className="w-full text-xs h-8" asChild>
                                <Link href="/brand/new">공고 올리기</Link>
                            </Button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {renderContent()}
                    </div>
                </div>
            </main>

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
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="p-product" className="text-right pt-2 text-xs font-bold">제품명</Label>
                            <div className="col-span-3 space-y-2">
                                <Input id="p-product" value={offerProduct} onChange={(e) => setOfferProduct(e.target.value)} placeholder="브랜드 제품명" />
                                <RadioGroup value={productType} onValueChange={setProductType} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="gift" id="r-gift" />
                                        <Label htmlFor="r-gift" className="text-xs font-normal">제품 제공</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="loan" id="r-loan" />
                                        <Label htmlFor="r-loan" className="text-xs font-normal">제품 대여</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="p-pay" className="text-right pt-2 text-xs font-bold">원고료</Label>
                            <div className="col-span-3 space-y-2">
                                <Input id="p-pay" value={compensation} onChange={(e) => setCompensation(e.target.value)} placeholder="0원 (또는 협의)" />
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="p-inc" checked={hasIncentive} onCheckedChange={(c) => setHasIncentive(c as boolean)} />
                                    <Label htmlFor="p-inc" className="text-xs">성과급(인센티브) 협의 가능</Label>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="p-type" className="text-right text-xs font-bold">희망 채널</Label>
                            <Select value={contentType} onValueChange={setContentType}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="콘텐츠 형태 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reels">인스타그램 릴스</SelectItem>
                                    <SelectItem value="shorts">유튜브 쇼츠</SelectItem>
                                    <SelectItem value="post">이미지 피드</SelectItem>
                                    <SelectItem value="blog">블로그 리뷰</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <Label htmlFor="p-msg" className="text-right pt-2 text-xs font-bold">전달 메시지</Label>
                            <Textarea id="p-msg" value={message} onChange={(e) => setMessage(e.target.value)} className="col-span-3 min-h-[100px]" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProposeModalOpen(false)}>취소</Button>
                        <Button onClick={submitProposal} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "제안서 전송"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Product Upload Modal */}
            <Dialog open={productModalOpen} onOpenChange={(open) => {
                setProductModalOpen(open)
                if (!open) {
                    // Reset form when closing
                    setEditingProductId(null)
                    setNewProductName("")
                    setNewProductPrice("")
                    setNewProductCategory("")
                    setNewProductDescription("")
                    setNewProductImage("")
                    setNewProductLink("")
                    setNewProductPoints("")
                    setNewProductShots("")
                }
            }}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingProductId ? "제품 수정" : "우리 브랜드 제품 등록"}</DialogTitle>
                        <DialogDescription>
                            {editingProductId ? "제품 정보를 수정해주세요." : "크리에이터가 확인하고 제안할 수 있도록 제품 상세 정보를 입력해 주세요."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="op-name">제품명 <span className="text-red-500">*</span></Label>
                                <Input id="op-name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="예: 시그니처 수분 크림" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="op-cat">카테고리 <span className="text-red-500">*</span></Label>
                                    <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                                        <SelectTrigger id="op-cat">
                                            <SelectValue placeholder="카테고리 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="뷰티">💄 뷰티</SelectItem>
                                            <SelectItem value="패션">👗 패션</SelectItem>
                                            <SelectItem value="푸드">🍽️ 푸드</SelectItem>
                                            <SelectItem value="테크">💻 테크</SelectItem>
                                            <SelectItem value="리빙">🏡 리빙</SelectItem>
                                            <SelectItem value="취미">🎨 취미</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="op-price">판매가 (원)</Label>
                                    <Input id="op-price" type="number" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} placeholder="0" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-img">제품 이미지 (300MB 이하)</Label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isImageUploading}
                                        className="w-full"
                                    >
                                        {isImageUploading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Upload className="mr-2 h-4 w-4" />
                                        )}
                                        {isImageUploading ? "업로드 중..." : "이미지 업로드"}
                                    </Button>
                                    {newProductImage && newProductImage !== "📦" && (
                                        <div className="h-10 w-10 relative bg-muted rounded overflow-hidden shrink-0 border">
                                            <img src={newProductImage} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                {/* Hidden input to keep value synced if needed, represented by state newProductImage */}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-link">브랜드 몰 링크</Label>
                                <Input id="op-link" value={newProductLink} onChange={(e) => setNewProductLink(e.target.value)} placeholder="https://..." />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="op-desc">제품 상세 설명</Label>
                                <Textarea id="op-desc" value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} placeholder="제품의 핵심 특징을 요약해주세요." className="min-h-[80px]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-pts">제품 소구 포인트 (Selling Points)</Label>
                                <Textarea id="op-pts" value={newProductPoints} onChange={(e) => setNewProductPoints(e.target.value)} placeholder="크리에이터가 강조해주길 원하는 장점" className="min-h-[80px]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="op-shot">필수 촬영 컷 (Required Shots)</Label>
                                <Textarea id="op-shot" value={newProductShots} onChange={(e) => setNewProductShots(e.target.value)} placeholder="예: 언박싱 장면, 얼굴 근접 샷 1회 이상" className="min-h-[80px]" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProductModalOpen(false)}>취소</Button>
                        <Button onClick={handleUploadProduct} disabled={isUploading}>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingProductId ? "수정 완료" : "제품 등록 완료"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function BrandDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <BrandDashboardContent />
        </Suspense>
    )
}
