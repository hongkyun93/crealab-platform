"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Megaphone, Plus, Send, Package, Check } from "lucide-react"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { usePlatform } from "@/components/providers/platform-provider"
import { createCampaign } from "@/app/actions/campaign"

export default function NewCampaignPage() {
    const router = useRouter()
    const { refreshData, products, user } = usePlatform()
    const [loading, setLoading] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string[]>([])
    const [postingYear, setPostingYear] = useState("2026")
    const [postingMonth, setPostingMonth] = useState("3")

    // Controlled inputs for Product Loading feature
    const [productTitle, setProductTitle] = useState("")
    const [description, setDescription] = useState("")

    // Product Load Modal State
    const [isProductLoadModalOpen, setIsProductLoadModalOpen] = useState(false)

    // Filter brand products
    const brandProducts = products.filter(p => p.brandId === user?.id)

    const POPULAR_TAGS = [
        "✈️ 여행", "💄 뷰티", "💊 건강", "💉 시술/병원", "👗 패션", "🍽️ 맛집",
        "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
        "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
        "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
    ]

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await createCampaign(formData)

        if (result?.error) {
            alert(result.error)
            setLoading(false)
        } else {
            alert("캠페인이 성공적으로 등록되었습니다!")
            await refreshData()
            router.push("/brand?view=dashboard")
        }
    }

    const handleSelectProduct = (product: any) => {
        if (!confirm(`'${product.name}' 정보를 불러오시겠습니까?\n기존에 입력된 내용은 덮어씌워집니다.`)) return

        setProductTitle(product.name)

        // Construct description from product details
        let desc = product.description || ""
        if (product.points) desc += `\n\n[소구 포인트]\n${product.points}`
        if (product.contentGuide) desc += `\n\n[콘텐츠 가이드]\n${product.contentGuide}`
        if (product.formatGuide) desc += `\n\n[포맷 가이드]\n${product.formatGuide}`
        if (product.shots) desc += `\n\n[필수 촬영 컷]\n${product.shots}`

        setDescription(desc)

        // Try to match category
        if (product.category && POPULAR_TAGS.some(t => t.includes(product.category))) {
            // Find full tag string that contains the category keyword
            const matchedTag = POPULAR_TAGS.find(t => t.includes(product.category))
            if (matchedTag && !selectedCategory.includes(matchedTag)) {
                setSelectedCategory(prev => [...prev, matchedTag])
            }
        }

        setIsProductLoadModalOpen(false)
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-8 flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/brand?view=dashboard">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">새 캠페인 등록하기</h1>
                            <p className="text-muted-foreground">
                                크리에이터에게 제안할 제품이나 브랜딩 캠페인을 등록하세요.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border bg-card p-6 shadow-sm md:p-8">
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
                            <Label htmlFor="budget">제공 혜택</Label>
                            <Input
                                id="budget"
                                name="budget"
                                placeholder="예: 제품 제공 + 원고료 30만원"
                                required
                            />
                        </div>

                        <div className="space-y-3">
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
                            <Label htmlFor="tags">직접 입력 태그</Label>
                            <Input
                                id="tags"
                                name="tags"
                                placeholder="추가하고 싶은 태그가 있다면 입력해주세요 (예: #신제품 #런칭)"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="target">원하는 크리에이터 스타일</Label>
                            <Input
                                id="target"
                                name="target"
                                placeholder="예: 감성적인 사진을 잘 찍으시는 분, 영상 편집 퀄리티가 높으신 분"
                            />
                        </div>

                        <div className="space-y-4">
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
                                />
                                <span className="text-sm text-muted-foreground">일에 업로드 희망 (미입력시 '협의'로 표시됩니다)</span>
                            </div>
                            {/* Hidden input to combine year-month for form submission */}
                            <input
                                type="hidden"
                                name="postingDate"
                                value={`${postingYear}-${postingMonth.padStart(2, '0')}`}
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
                                <Link href="/brand?view=dashboard">취소</Link>
                            </Button>
                            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={loading}>
                                {loading ? "등록 중..." : <><Plus className="mr-2 h-4 w-4" /> 캠페인 등록하기</>}
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
                                                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 shrink-0">
                                                    선택 <Check className="ml-1 h-3 w-3" />
                                                </Button>
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
