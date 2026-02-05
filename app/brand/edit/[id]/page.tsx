"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Edit2, Plus, Send } from "lucide-react"
import Link from "next/link"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { usePlatform } from "@/components/providers/platform-provider"

import { updateCampaign } from "@/app/actions/campaign"

export default function EditCampaignPage() {
    const router = useRouter()
    const { id } = useParams()
    const { campaigns, isLoading, user } = usePlatform()

    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)

    // Form States
    const [productName, setProductName] = useState("")
    const [budget, setBudget] = useState("")
    const [target, setTarget] = useState("")
    const [description, setDescription] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string[]>([])
    const [customTags, setCustomTags] = useState("")

    // Date Picker State
    const [postingYear, setPostingYear] = useState("2026")
    const [postingMonth, setPostingMonth] = useState("3")
    const [postingDay, setPostingDay] = useState("")

    const POPULAR_TAGS = [
        "✈️ 여행", "💄 뷰티", "👗 패션", "🍽️ 맛집",
        "🏡 리빙/인테리어", "💍 웨딩/결혼", "🏋️ 헬스/운동", "🥗 다이어트", "👶 육아",
        "🐶 반려동물", "💻 테크/IT", "🎮 게임", "📚 도서/자기계발",
        "🎨 취미/DIY", "🎓 교육/강의", "🎬 영화/문화", "💰 재테크"
    ]

    useEffect(() => {
        if (!isLoading && campaigns.length > 0) {
            const campaign = campaigns.find(c => c.id.toString() === id || c.id === id)

            if (campaign) {
                // Parse Data
                setProductName(campaign.product)

                // Try to parse details from description if they follow the format
                const descMap: any = {}
                const lines = campaign.description.split('\n')
                let currentKey = 'detail'

                // Simple parser for the format we saved
                const extractValue = (text: string, marker: string) => {
                    const match = text.match(new RegExp(`\\[${marker}\\] (.*)`))
                    return match ? match[1] : null
                }

                // If description contains our formatted markers
                if (campaign.description.includes('[카테고리]')) {
                    // Extract parts
                    const catPart = campaign.description.match(/\[카테고리\] (.*?)(?=\n|$)/)?.[1]
                    const budPart = campaign.description.match(/\[제공 혜택\] (.*?)(?=\n|$)/)?.[1]
                    const tarPart = campaign.description.match(/\[원하는 크리에이터\] (.*?)(?=\n|$)/)?.[1]
                    const detailPart = campaign.description.split('[상세 내용]\n')[1] || campaign.description

                    if (catPart) setSelectedCategory(catPart.split(',').map(s => s.trim()))
                    if (budPart) setBudget(budPart)
                    if (tarPart) setTarget(tarPart)
                    setDescription(detailPart.trim())
                } else {
                    // Fallback or Structured Data (New way)
                    setDescription(campaign.description)
                    setBudget(campaign.budget || extractValue(campaign.description, '제공 혜택') || campaign.budget)
                    setTarget(campaign.target || extractValue(campaign.description, '원하는 크리에이터') || campaign.target)
                    setSelectedCategory(campaign.category ? campaign.category.split(',') : (extractValue(campaign.description, '카테고리')?.split(',') || []))
                }

                if (campaign.postingDate) {
                    const [y, m, d] = campaign.postingDate.split('-')
                    if (y) setPostingYear(y)
                    if (m) setPostingMonth(parseInt(m).toString()) // remove leading zero
                    if (d) setPostingDay(d)
                }
            } else {
                // Not found locally? might need to reload or it doesn't exist
                if (!isLoading) {
                    // Could redirect or show error
                }
            }
            setInitializing(false)
        }
    }, [campaigns, id, isLoading])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await updateCampaign(id as string, formData)

        if (result?.error) {
            alert(result.error)
            setLoading(false)
        } else {
            alert("캠페인이 성공적으로 수정되었습니다!")
            router.push("/brand")
        }
    }

    if (initializing && isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-8 flex items-center gap-4">
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

                    <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border bg-card p-6 shadow-sm md:p-8">
                        <div className="space-y-2">
                            <Label htmlFor="product">제품/서비스명</Label>
                            <Input
                                id="product"
                                name="product"
                                value={productName}
                                onChange={e => setProductName(e.target.value)}
                                placeholder="예: 2024년형 스마트 모니터램프"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget">제공 혜택</Label>
                            <Input
                                id="budget"
                                name="budget"
                                value={budget}
                                onChange={e => setBudget(e.target.value)}
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
                                value={customTags}
                                onChange={e => setCustomTags(e.target.value)}
                                placeholder="추가하고 싶은 태그가 있다면 입력해주세요 (예: #신제품 #런칭)"
                            />
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
                                onChange={e => setDescription(e.target.value)}
                                placeholder="제품의 특장점과 크리에이터에게 요청하고 싶은 가이드라인을 적어주세요."
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
                </div>
            </main>
        </div>
    )
}
