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
    ExternalLink
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { usePlatform } from "@/components/providers/platform-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
    "🏡 리빙/인테리어", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
    "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
    "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
]

function BrandDashboardContent() {
    const {
        events, user, resetData, isLoading, campaigns, deleteCampaign,
        brandProposals, updateBrandProposal, sendMessage, messages: allMessages,
        updateUser, products, addProduct, deleteProduct, deleteEvent
    } = usePlatform()

    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const initialView = searchParams.get('view') || "discover"
    const [currentView, setCurrentView] = useState(initialView)
    const [sortOrder, setSortOrder] = useState("latest")

    // Filter Query States
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [followerFilter, setFollowerFilter] = useState<string>("all")
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
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Product Upload State
    const [productModalOpen, setProductModalOpen] = useState(false)
    const [newProductName, setNewProductName] = useState("")
    const [newProductPrice, setNewProductPrice] = useState("")
    const [newProductCategory, setNewProductCategory] = useState("")
    const [newProductDescription, setNewProductDescription] = useState("")
    const [newProductImage, setNewProductImage] = useState("")
    const [newProductLink, setNewProductLink] = useState("")
    const [newProductPoints, setNewProductPoints] = useState("")
    const [newProductShots, setNewProductShots] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    // Settings States
    const [editName, setEditName] = useState("")
    const [editWebsite, setEditWebsite] = useState("")
    const [editBio, setEditBio] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (user) {
            setEditName(user.name || "")
            setEditWebsite(user.website || "")
            setEditBio(user.bio || "")
        }
    }, [user])

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
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
                message: message,
                status: 'offered'
            }
            const { data: insertedProposal, error } = await supabase.from('brand_proposals').insert(proposalData).select().single()
            if (error) throw error
            if (insertedProposal) {
                await sendMessage(selectedInfluencer?.influencerId, `협업 제안서가 전송되었습니다.\n[${offerProduct}]`, insertedProposal.id)
            }
            alert(`${selectedInfluencer?.influencer}님에게 제안서가 성공적으로 발송되었습니다!`)
            setProposeModalOpen(false)

            // Refresh the data to show the new proposal immediately
            resetData()
        } catch (error: any) {
            console.error("Proposal Error:", error)
            alert(`제안서 발송에 실패했습니다: ${error?.message || "알 수 없는 오류"}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUploadProduct = async () => {
        if (!newProductName || !newProductCategory) {
            alert("제품명과 카테고리는 필수입니다.")
            return
        }
        setIsUploading(true)
        try {
            await addProduct({
                name: newProductName,
                price: parseInt(newProductPrice) || 0,
                category: newProductCategory,
                description: newProductDescription,
                image: newProductImage || "📦", // Emoji placeholder if no URL
                link: newProductLink,
                points: newProductPoints,
                shots: newProductShots
            })
            setProductModalOpen(false)
            // Clear inputs
            setNewProductName("")
            setNewProductPrice("")
            setNewProductCategory("")
            setNewProductDescription("")
            setNewProductImage("")
            setNewProductLink("")
            setNewProductPoints("")
            setNewProductShots("")
            alert("제품이 성공적으로 등록되었습니다.")
        } catch (e) {
            console.error("Product upload error:", e)
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
                            {filteredEvents.map((item) => (
                                <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-lg border-border/60 bg-background flex flex-col h-full">
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
                                    <CardContent className="space-y-3 flex-1">
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
                                        <Button className="w-full" variant="secondary" onClick={() => handlePropose(item)}>협업 제안</Button>
                                    </CardFooter>
                                </Card>
                            ))}
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
                                        </CardContent>
                                        <CardFooter className="border-t pt-4">
                                            <span className="text-xs font-medium text-emerald-600">진행 중 (지원자 0명)</span>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
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
                                        <Card key={p.id} className="hover:shadow-sm transition-shadow">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-lg font-bold">{p.product_name}</CardTitle>
                                                        <CardDescription>
                                                            {p.influencer_name || "크리에이터"} | {new Date(p.created_at).toLocaleDateString()}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge variant={p.status === 'accepted' ? 'default' : 'secondary'}>
                                                        {p.status === 'offered' ? '대기 중' : p.status === 'accepted' ? '수락됨' : p.status}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardFooter className="border-t py-3 bg-muted/5">
                                                <Button variant="ghost" size="sm" className="gap-2" asChild>
                                                    <Link href="/message"><Bell className="h-4 w-4" /> 채팅방으로 이동</Link>
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
                                                        <Button size="sm" onClick={() => updateBrandProposal(p.id, 'accepted')}>수락</Button>
                                                        <Button size="sm" variant="outline" onClick={() => updateBrandProposal(p.id, 'rejected')}>거절</Button>
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
                                                className="flex-1 h-8 text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
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
            <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>우리 브랜드 제품 등록</DialogTitle>
                        <DialogDescription>
                            크리에이터가 확인하고 제안할 수 있도록 제품 상세 정보를 입력해 주세요.
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
                                <Label htmlFor="op-img">제품 이미지 URL</Label>
                                <Input id="op-img" value={newProductImage} onChange={(e) => setNewProductImage(e.target.value)} placeholder="https://..." />
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
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "제품 등록 완료"}
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
