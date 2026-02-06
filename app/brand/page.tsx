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
    FileText,
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
    Star,
    Briefcase
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
        switchRole, proposals, updateCampaignStatus
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

    // Collaboration Workspace State
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatProposal, setChatProposal] = useState<any>(null)
    const [chatMessage, setChatMessage] = useState("")
    const [generatedContract, setGeneratedContract] = useState("")
    const [isGeneratingContract, setIsGeneratingContract] = useState(false)

    const handleGenerateContract = async () => {
        if (!chatProposal || !user) return

        setIsGeneratingContract(true)
        try {
            const influencerId = chatProposal.influencer_id || chatProposal.influencerId
            const influencerMessages = allMessages.filter(m => m.proposalId?.toString() === chatProposal.id?.toString())

            const response = await fetch('/api/generate-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: influencerMessages,
                    proposal: chatProposal,
                    brandName: user.display_name || user.name || "브랜드",
                    influencerName: chatProposal.influencer_name || chatProposal.influencerName || "크리에이터"
                })
            })

            const data = await response.json()
            if (data.result) {
                setGeneratedContract(data.result)
            } else {
                alert("계약서 생성에 실패했습니다: " + (data.error || "알 수 없는 오류"))
            }
        } catch (e) {
            console.error(e)
            alert("계약서 생성 중 오류가 발생했습니다.")
        } finally {
            setIsGeneratingContract(false)
        }
    }

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || !chatProposal || !user || isSendingMessage) return

        const receiverId = chatProposal.influencer_id || chatProposal.influencerId || chatProposal.influencer?.id

        if (!receiverId) {
            alert("수신자를 찾을 수 없습니다.")
            return
        }

        const msgContent = chatMessage
        setChatMessage("")
        setIsSendingMessage(true)

        try {
            await sendMessage(receiverId, msgContent, chatProposal.id?.toString())
        } catch (e) {
            console.error("Message send failed:", e)
            setChatMessage(msgContent)
        } finally {
            setIsSendingMessage(false)
        }
    }

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
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | number | null>(null)

    // Product Upload State
    const [productModalOpen, setProductModalOpen] = useState(false)
    const [editingProductId, setEditingProductId] = useState<string | null>(null)
    const [newProductName, setNewProductName] = useState("")
    const [newProductPrice, setNewProductPrice] = useState("")
    const [newProductCategory, setNewProductCategory] = useState("")
    const [newProductDescription, setNewProductDescription] = useState("")
    const [isFullContractOpen, setIsFullContractOpen] = useState(false)
    const [isSendingMessage, setIsSendingMessage] = useState(false)
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
        } else if (key === "growing") {
            setMinFollowers("100000")
            setMaxFollowers("300000")
        } else if (key === "mid") {
            setMinFollowers("300000")
            setMaxFollowers("500000")
        } else if (key === "macro") {
            setMinFollowers("500000")
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
                                            { k: "growing", l: "그로잉 (10~30만)" },
                                            { k: "mid", l: "미드 (30~50만)" },
                                            { k: "macro", l: "매크로 (50~100만)" },
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
                                            <Star className="h-3.5 w-3.5 text-yellow-500" fill={statusFilter === "favorites" ? "currentColor" : "none"} />
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
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg overflow-hidden">
                                                    {item.avatar && item.avatar.startsWith('http') ? (
                                                        <img src={item.avatar} alt={item.influencer} className="h-full w-full object-cover" />
                                                    ) : (
                                                        item.avatar
                                                    )}
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
                                                <h3 className="font-bold text-base line-clamp-2 mb-2">{item.event}</h3>

                                                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-3 bg-muted/30 p-2 rounded-lg">
                                                    {item.targetProduct && (
                                                        <div className="flex items-center gap-2">
                                                            <Gift className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                            <span className="font-medium">희망제품:</span>
                                                            <span className="truncate flex-1">{item.targetProduct}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                        <span className="font-medium">모먼트일:</span> {item.eventDate || "미정"}
                                                    </div>
                                                    {item.postingDate && (
                                                        <div className="flex items-center gap-2">
                                                            <Send className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                            <span className="font-medium">예상업로드:</span> {item.postingDate}
                                                        </div>
                                                    )}
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
                const selectedCampaign = myCampaigns.find(c => c.id === selectedCampaignId)
                const campaignProposals = proposals.filter(p => p.campaignId === selectedCampaign?.id && p.type === 'creator_apply')

                // Detail View
                if (selectedCampaignId && selectedCampaign) {
                    return (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedCampaignId(null)} className="gap-1 pl-0 hover:bg-transparent hover:text-primary">
                                    <ArrowRight className="h-4 w-4 rotate-180" /> 목록으로 돌아가기
                                </Button>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]">
                                {/* Left: Campaign Detail Card */}
                                <Card className="h-fit">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <Badge variant="outline" className="w-fit">{selectedCampaign.category}</Badge>
                                                <CardTitle className="text-2xl font-bold">{selectedCampaign.product}</CardTitle>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/brand/edit/${selectedCampaign.id}`}>수정하기</Link>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Description Box */}
                                        <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
                                            <h4 className="text-sm font-bold text-muted-foreground mb-3">상세 내용</h4>
                                            <p className="whitespace-pre-wrap leading-relaxed text-sm">
                                                {selectedCampaign.description}
                                            </p>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-4 rounded-xl">
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-muted-foreground">일정</span>
                                                <p className="font-medium text-sm">{selectedCampaign.eventDate || "미정"}</p>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-muted-foreground">모집 대상</span>
                                                <p className="font-medium text-sm">{selectedCampaign.target || "전체"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-muted-foreground">제공 혜택</span>
                                                <p className="font-bold text-emerald-600 text-sm">{selectedCampaign.budget || "협의"}</p>
                                            </div>
                                            {selectedCampaign.postingDate && (
                                                <div className="space-y-1 md:col-span-2">
                                                    <span className="text-xs font-bold text-muted-foreground">업로드 일정</span>
                                                    <p className="font-medium text-sm">{selectedCampaign.postingDate}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Right: Proposals */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 font-bold text-lg">
                                        <Package className="h-5 w-5" /> 도착한 제안
                                    </div>

                                    <div className="bg-muted/10 rounded-xl border min-h-[400px] p-4">
                                        {campaignProposals.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 py-10">
                                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                                    <Bell className="h-5 w-5 opacity-30" />
                                                </div>
                                                <p className="text-sm">이 캠페인에 도착한 제안이 아직 없습니다.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {campaignProposals.map((p: any) => (
                                                    <Card key={p.id} className="overflow-hidden hover:shadow-md transition-all border-l-4 border-l-primary">
                                                        <CardHeader className="p-4 pb-2">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold overflow-hidden">
                                                                        {p.influencerAvatar ? <img src={p.influencerAvatar} alt="" className="w-full h-full object-cover" /> : p.influencerName?.[0]}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-sm">{p.influencerName}</div>
                                                                        <div className="text-[10px] text-muted-foreground">{new Date(p.date).toLocaleDateString()}</div>
                                                                    </div>
                                                                </div>
                                                                <Badge variant={p.status === 'accepted' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                                                    {p.status === 'accepted' ? '수락됨' : '대기중'}
                                                                </Badge>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="p-4 pt-2 space-y-2">
                                                            <div className="bg-muted/30 p-2.5 rounded text-xs text-foreground/80 italic leading-relaxed">
                                                                "{p.message}"
                                                            </div>
                                                            <div className="flex justify-between items-center text-xs pt-1">
                                                                <span className="text-muted-foreground">희망 비용</span>
                                                                <span className="font-bold text-emerald-600">{p.cost ? `${p.cost.toLocaleString()}원` : "협의"}</span>
                                                            </div>
                                                        </CardContent>
                                                        <CardFooter className="p-2 bg-muted/5 grid grid-cols-2 gap-2">
                                                            {p.status !== 'accepted' && (
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                                                    onClick={async () => {
                                                                        if (confirm('수락하시겠습니까?')) {
                                                                            const { updateApplicationStatus } = await import('@/app/actions/proposal')
                                                                            await updateApplicationStatus(p.id.toString(), 'accepted')
                                                                            alert('수락되었습니다')
                                                                            window.location.reload()
                                                                        }
                                                                    }}
                                                                >
                                                                    수락
                                                                </Button>
                                                            )}
                                                            <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                                                                <Link href="/message">채팅</Link>
                                                            </Button>
                                                        </CardFooter>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                // List View
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">내 캠페인 관리</h1>
                                <p className="text-muted-foreground mt-1">등록하신 캠페인 공고를 관리하고 지원자를 확인하세요.</p>
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
                                <Button asChild className="mt-4"><Link href="/brand/new">캠페인 등록하기</Link></Button>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {myCampaigns.map((c) => {
                                    const appCount = proposals.filter(p => p.campaignId === c.id && p.type === 'creator_apply').length
                                    return (
                                        <Card
                                            key={c.id}
                                            className="group hover:shadow-md transition-all cursor-pointer border-border/60"
                                            onClick={() => setSelectedCampaignId(c.id)}
                                        >
                                            <div className="flex flex-col md:flex-row">
                                                {/* Main Content */}
                                                <div className="flex-1 p-6">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Badge variant="outline" className="text-xs font-normal">{c.category}</Badge>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'active' ? 'text-emerald-600 bg-emerald-100' : 'text-gray-500 bg-gray-100'}`}>
                                                            {c.status === 'active' ? '● 모집중' : '● 마감됨'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground ml-auto md:hidden">{new Date(c.date).toLocaleDateString()}</span>
                                                    </div>

                                                    <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{c.product}</h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-bold text-foreground">제공 혜택</div>
                                                            <div className="text-emerald-600 font-bold">{c.budget || "협의"}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-bold text-foreground">모집 대상</div>
                                                            <div>{c.target || "전체"}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-bold text-foreground">상세 내용</div>
                                                            <div className="line-clamp-1 text-xs">{c.description}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Action Area */}
                                                <div className="border-t md:border-t-0 md:border-l p-4 md:w-48 bg-muted/5 flex flex-row md:flex-col items-center justify-between md:justify-center gap-2">
                                                    <div className="text-center">
                                                        <div className="text-xs text-muted-foreground mb-1">도착한 제안</div>
                                                        <div className={`text-xl font-bold ${appCount > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                                            {appCount}개
                                                        </div>
                                                    </div>

                                                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-primary">
                                                        확인하기 <ArrowRight className="h-3 w-3" />
                                                    </Button>

                                                    <div className="flex gap-1 mt-2" onClick={e => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" asChild>
                                                            <Link href={`/brand/edit/${c.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => deleteCampaign(c.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`h-7 px-2 text-xs ${c.status === 'active' ? 'text-red-500 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                if (confirm(c.status === 'active' ? "캠페인을 마감하시겠습니까? 더 이상 지원을 받을 수 없습니다." : "캠페인을 다시 진행하시겠습니까?")) {
                                                                    updateCampaignStatus(c.id, c.status === 'active' ? 'closed' : 'active')
                                                                }
                                                            }}
                                                        >
                                                            {c.status === 'active' ? '마감하기' : '진행하기'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )

            case "proposals":
                // 브랜드가 보낸 제안 (인플루언서 초대)
                const sentProposals = brandProposals.filter(p => p.brand_id === user?.id)
                // 크리에이터가 지원한 캠페인 지원서
                const myReceivedProposals = proposals.filter(p => p.type === 'creator_apply')

                const handleAppStatusUpdate = async (id: string | number, status: 'accepted' | 'rejected' | 'hold') => {
                    if (confirm(`이 지원서를 ${status === 'accepted' ? '수락' : status === 'hold' ? '보류' : '거절'}하시겠습니까?`)) {
                        try {
                            const { updateApplicationStatus } = await import('@/app/actions/proposal')
                            const result = await updateApplicationStatus(id.toString(), status)
                            if (result.error) alert(result.error)
                            else {
                                alert("상태가 변경되었습니다.")
                                window.location.reload()
                            }
                        } catch (err) {
                            alert("상태 변경 중 오류가 발생했습니다.")
                        }
                    }
                }

                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex flex-col gap-4">
                            <h1 className="text-3xl font-bold tracking-tight">협업 워크스페이스</h1>
                            <p className="text-muted-foreground">크리에이터와 진행 중인 모든 제안과 지원서를 한눈에 관리하세요.</p>
                        </div>

                        <Tabs defaultValue="received" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 lg:max-w-md">
                                <TabsTrigger value="received">받은 지원서 ({myReceivedProposals.length})</TabsTrigger>
                                <TabsTrigger value="sent">보낸 협업 제안 ({sentProposals.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="received" className="space-y-4 mt-6">
                                {myReceivedProposals.length === 0 ? (
                                    <Card className="p-12 text-center text-muted-foreground border-dashed bg-muted/20">받은 지원서가 없습니다.</Card>
                                ) : (
                                    myReceivedProposals.map((p: any) => (
                                        <Card key={p.id} className={`border-l-4 hover:shadow-sm transition-shadow ${p.status === 'accepted' ? 'border-l-emerald-500' :
                                            p.status === 'hold' ? 'border-l-amber-500' :
                                                p.status === 'rejected' ? 'border-l-red-500' : 'border-l-primary'
                                            }`}>
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-3">
                                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                                                            {p.influencerAvatar ? (
                                                                <img src={p.influencerAvatar} alt={p.influencerName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center font-bold text-lg">
                                                                    {p.influencerName?.[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg font-bold">
                                                                {p.productName || p.campaignName}
                                                                {p.status === 'applied' && <Badge className="ml-2 bg-primary/10 text-primary border-none text-[10px]">NEW 지원</Badge>}
                                                                {p.status === 'hold' && <Badge className="ml-2 bg-amber-100 text-amber-700 border-none text-[10px]">보류 중</Badge>}
                                                            </CardTitle>
                                                            <CardDescription>
                                                                <span className="font-bold text-foreground">{p.influencerName}</span> 크리에이터 | {new Date(p.date).toLocaleDateString()}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {p.status !== 'accepted' && (
                                                            <Button size="sm" onClick={() => handleAppStatusUpdate(p.id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700">수락</Button>
                                                        )}
                                                        {p.status !== 'hold' && (
                                                            <Button size="sm" variant="outline" onClick={() => handleAppStatusUpdate(p.id, 'hold')} className="text-amber-600 border-amber-200 hover:bg-amber-50">보류</Button>
                                                        )}
                                                        {p.status !== 'rejected' && (
                                                            <Button size="sm" variant="outline" onClick={() => handleAppStatusUpdate(p.id, 'rejected')} className="text-red-500 border-red-200 hover:bg-red-50">거절</Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-3 px-6">
                                                <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
                                                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">지원 메시지</p>
                                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed italic">
                                                        "{p.message}"
                                                    </p>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="border-t py-3 bg-muted/5">
                                                <div className="flex justify-between w-full items-center">
                                                    <div className="text-xs text-muted-foreground">
                                                        희망 원고료: <span className="font-bold text-foreground">{p.cost ? `${p.cost.toLocaleString()}원` : "제시 예산 따름"}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs" onClick={() => {
                                                            setChatProposal(p)
                                                            setIsChatOpen(true)
                                                        }}>
                                                            <Briefcase className="h-3.5 w-3.5" /> 협업 워크스페이스
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}
                            </TabsContent>

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
                                                <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs" onClick={() => {
                                                    setChatProposal(p)
                                                    setIsChatOpen(true)
                                                }}>
                                                    <Briefcase className="h-3.5 w-3.5" /> 협업 워크스페이스
                                                </Button>
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
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/message"><Bell className="mr-2 h-4 w-4" /> 메시지 센터</Link>
                            </Button>
                            <Button
                                variant={currentView === "proposals" ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setCurrentView("proposals")}
                            >
                                <Briefcase className="mr-2 h-4 w-4" /> 협업 워크스페이스
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

            {/* Deal Room Dialog (Copied & Adapted from Creator) */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent className="sm:max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl">
                    <div className="flex h-full">
                        {/* Left Sidebar: Deal Status & Workflow */}
                        <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                            <div className="p-6 border-b border-slate-200 bg-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-lg">
                                        {chatProposal?.influencer_name?.[0] || chatProposal?.influencerName?.[0] || "C"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{chatProposal?.influencer_name || chatProposal?.influencerName}</h3>
                                        <p className="text-xs text-muted-foreground">{chatProposal?.product_name || chatProposal?.campaignName}</p>
                                    </div>
                                </div>
                                <span className="text-muted-foreground">상태</span>
                                <Badge variant="outline" className={`
                                        ${chatProposal?.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                        chatProposal?.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                            'bg-indigo-50 text-indigo-600 border-indigo-200'}
                                    `}>
                                    {chatProposal?.status === 'accepted' ? '진행 중' :
                                        chatProposal?.status === 'rejected' ? '거절됨' :
                                            chatProposal?.status === 'pending' ? '보류 중' : '검토 중'}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">진행 단계</div>
                            {[
                                { step: 1, label: "조건 조율 및 확정", status: chatProposal?.status === 'accepted' ? 'done' : 'current', date: "2024.02.04" },
                                { step: 2, label: "계약서 발송 및 서명", status: chatProposal?.status === 'accepted' ? 'current' : 'locked', date: chatProposal?.status === 'accepted' ? "진행 중" : "" },
                                { step: 3, label: "제품 발송/제공", status: "locked" },
                                { step: 4, label: "콘텐츠 초안 검토", status: "locked" },
                                { step: 5, label: "최종 콘텐츠 업로드", status: "locked" },
                                { step: 6, label: "성과 분석 및 정산", status: "locked" }
                            ].map((step) => (
                                <div key={step.step} className={`
                                        group flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all
                                        ${step.status === 'done' ? 'text-slate-700 bg-white shadow-sm border border-slate-100' :
                                        step.status === 'current' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm ring-1 ring-indigo-200' :
                                            'text-slate-400 hover:bg-slate-100/50'}
                                    `}>
                                    <div className={`
                                            h-6 w-6 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold transition-colors
                                            ${step.status === 'done' ? 'bg-emerald-500 text-white' :
                                            step.status === 'current' ? 'bg-indigo-600 text-white' :
                                                'bg-slate-200 text-slate-500'}
                                        `}>
                                        {step.status === 'done' ? <BadgeCheck className="h-3.5 w-3.5" /> : step.step}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="truncate">{step.label}</div>
                                        {step.date && <div className="text-[10px] font-normal opacity-70 mt-0.5">{step.date}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-200">
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-600">
                                    <Info className="h-3.5 w-3.5" /> MD's Tip
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    크리에이터에게 <strong>계약서</strong>를 먼저 발송해주세요. 서명이 완료되면 제품 발송 단계로 넘어갑니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content: Tabs */}
                    <Tabs defaultValue="chat" className="flex-1 flex flex-col min-w-0 bg-white">
                        <div className="px-6 py-4 border-b border-gray-100 shrink-0 flex flex-row items-center justify-between">
                            <div>
                                <DialogTitle className="text-lg">협업 워크스페이스</DialogTitle>
                                <DialogDescription>{chatProposal?.influencer_name || chatProposal?.influencerName}님과의 협업 공간</DialogDescription>
                            </div>
                            <TabsList className="grid w-[300px] grid-cols-3">
                                <TabsTrigger value="chat">소통</TabsTrigger>
                                <TabsTrigger value="contract">계약 관리</TabsTrigger>
                                <TabsTrigger value="work">결과물 관리</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 m-0 data-[state=active]:flex">
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
                                {/* Proposal Detail Box */}
                                {chatProposal && (
                                    <div className="mb-6 p-5 bg-white border border-primary/20 rounded-2xl shadow-sm">
                                        <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-2">
                                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                                <BadgeCheck className="h-5 w-5" /> 진행 단계
                                            </h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm bg-indigo-100 text-indigo-700`}>
                                                {chatProposal.status || '진행 중'}
                                            </span>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-xs italic leading-relaxed whitespace-pre-wrap text-foreground/80 bg-muted/20 p-3 rounded">
                                                "{chatProposal.message}"
                                            </p>
                                            <div className="text-xs text-muted-foreground text-right border-t pt-2">
                                                희망 원고료: <span className="font-bold text-black">{chatProposal.cost ? `${parseInt(chatProposal.cost).toLocaleString()}원` : chatProposal.compensation_amount || '협의'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Messages */}
                                {allMessages
                                    .filter(m => m.proposalId?.toString() === chatProposal?.id?.toString())
                                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                    .map((msg, idx) => (
                                        <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${msg.senderId === user?.id
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-white border text-foreground rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                                <span className="block text-[10px] opacity-70 mt-1">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <div className="p-4 border-t bg-white">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="메시지를 입력하세요..."
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button onClick={handleSendMessage}>전송</Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Contract Tab */}
                        <TabsContent value="contract" className="flex-1 overflow-y-auto p-6 bg-slate-50 data-[state=active]:flex flex-col items-center justify-center">
                            <div className="w-full max-w-2xl bg-white p-10 rounded-xl shadow-sm border border-slate-200">
                                <div className="text-center mb-8">
                                    <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">표준 계약서 발송</h3>
                                    <p className="text-slate-500 mt-2">협의된 내용을 바탕으로 계약서를 생성하고 발송합니다.<br />크리에이터가 서명하면 계약이 체결됩니다.</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center px-1">
                                        <h4 className="text-sm font-bold text-slate-700">계약서 초안</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-indigo-600 gap-1.5 h-7 hover:text-indigo-700 hover:bg-indigo-50"
                                            onClick={handleGenerateContract}
                                            disabled={isGeneratingContract}
                                        >
                                            {isGeneratingContract ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Settings className="h-3.5 w-3.5" />}
                                            AI로 대화 기반 초안 작성
                                        </Button>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed font-mono min-h-[200px] overflow-y-auto max-h-[400px] whitespace-pre-wrap">
                                        {generatedContract || (
                                            <>
                                                제 1조 [목적]<br />
                                                본 계약은 '갑'(브랜드)과 '을'(크리에이터)간의...<br />
                                                <br />
                                                제 2조 [원고료]<br />
                                                금 <strong>{chatProposal?.cost ? parseInt(chatProposal.cost).toLocaleString() : chatProposal?.compensation_amount || '0'}원</strong>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-center mt-2">
                                        <Button variant="link" size="sm" className="text-xs text-muted-foreground underline" onClick={() => setIsFullContractOpen(true)}>
                                            (전체 계약서 내용 보기)
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-12 text-lg font-bold bg-black hover:bg-slate-800"
                                    onClick={() => alert("표준 계약서가 크리에이터에게 발송되었습니다.")}
                                >
                                    <Send className="mr-2 h-5 w-5" /> 계약서 생성 및 발송하기
                                </Button>
                            </div>
                        </TabsContent>

                        {/* Work Tab */}
                        <TabsContent value="work" className="flex-1 overflow-y-auto p-6 bg-slate-50 data-[state=active]:flex flex-col items-center justify-center">
                            <div className="w-full max-w-2xl text-center">
                                <div className="border border-slate-200 rounded-2xl p-12 bg-white">
                                    <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <Package className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">제출된 결과물 없음</h3>
                                    <p className="text-slate-500 mt-2 mb-6">아직 크리에이터가 결과물을 업로드하지 않았습니다.<br />결과물이 제출되면 알림을 보내드립니다.</p>
                                    <Button variant="outline" onClick={() => alert("크리에이터에게 결과물 제출을 요청했습니다.")}>제출 요청하기</Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                </DialogContent>
            </Dialog>

            {/* Full Contract Viewer Dialog */}
            <Dialog open={isFullContractOpen} onOpenChange={setIsFullContractOpen}>
                <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-6 overflow-hidden">
                    <DialogHeader className="mb-4">
                        <DialogTitle>표준 광고 협업 계약서</DialogTitle>
                        <DialogDescription>작성된 계약서의 전체 내용입니다.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 rounded-xl border border-slate-200 font-mono text-sm whitespace-pre-wrap">
                        {generatedContract || `제 1조 [목적]
본 계약은 '갑'(${user?.name || '브랜드'})과 '을'(${chatProposal?.influencer_name || '크리에이터'})간의 콘텐츠 제작 및 홍보 업무에 관한 제반 사항을 규정함을 목적으로 한다.

제 2조 [원고료 및 지급]
1. '갑'은 '을'에게 콘텐츠 제작의 대가로 금 ${chatProposal?.cost ? parseInt(chatProposal.cost).toLocaleString() : chatProposal?.compensation_amount || '0'}원을 지급한다.
2. 지급 시기는 콘텐츠 업로드 후 30일 이내로 한다.

제 3조 [콘텐츠 제작]
'을'은 '갑'의 가이드를 준수하여 고품질의 콘텐츠를 제작하며, 합의된 일정 내에 업로드한다.

... (중략) ...

상기 내용을 확인하였으며, 계약에 동의합니다.`}
                    </div>
                    <DialogFooter className="mt-6">
                        <Button onClick={() => setIsFullContractOpen(false)}>닫기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div >
    )
}

export default function BrandDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <BrandDashboardContent />
        </Suspense>
    )
}
