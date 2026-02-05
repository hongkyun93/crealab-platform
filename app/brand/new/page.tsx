"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Megaphone, Plus } from "lucide-react"
import Link from "next/link"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { usePlatform } from "@/components/providers/platform-provider"

import { createCampaign } from "@/app/actions/campaign"

export default function NewCampaignPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string[]>([])

    const POPULAR_TAGS = [
        "✈️ 여행", "💄 뷰티", "👗 패션", "🍽️ 맛집",
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
            router.push("/brand")
        }
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
                            <h1 className="text-2xl font-bold tracking-tight">새 캠페인 등록하기</h1>
                            <p className="text-muted-foreground">
                                크리에이터에게 제안할 제품이나 브랜딩 캠페인을 등록하세요.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border bg-card p-6 shadow-sm md:p-8">
                        <div className="space-y-2">
                            <Label htmlFor="product">제품/서비스명</Label>
                            <Input
                                id="product"
                                name="product"
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

                        <div className="space-y-2">
                            <Label htmlFor="description">캠페인 상세 내용</Label>
                            <Textarea
                                id="description"
                                name="description"
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
                                {loading ? "등록 중..." : <><Plus className="mr-2 h-4 w-4" /> 캠페인 등록하기</>}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
