"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Package, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePlatform } from "@/components/providers/platform-provider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function NewProductPage() {
    const router = useRouter()
    const { addProduct, user } = usePlatform()

    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [link, setLink] = useState("")
    const [points, setPoints] = useState("")
    const [shots, setShots] = useState("")
    const [category, setCategory] = useState("테크")

    const handleSubmit = () => {
        if (!name || !price || !points) {
            alert("필수 정보를 입력해주세요.")
            return
        }

        addProduct({
            name,
            price: parseInt(price),
            image: "📦", // Placeholder
            link,
            points,
            shots,
            category
        })

        alert("제품이 등록되었습니다!")
        router.push("/brand")
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-8">
                        <Button variant="ghost" size="sm" asChild className="mb-4">
                            <Link href="/brand">
                                <ArrowLeft className="mr-2 h-4 w-4" /> 돌아가기
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">우리 제품 등록하기</h1>
                        <p className="text-muted-foreground mt-2">
                            크리에이터들이 보고 제안할 수 있도록 제품의 매력을 어필해주세요.
                        </p>
                    </div>

                    <div className="space-y-8 rounded-xl border bg-card p-6 shadow-sm md:p-8">
                        <div className="space-y-4">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                기본 정보
                            </h2>

                            <div className="grid gap-2">
                                <Label htmlFor="name">제품명</Label>
                                <Input
                                    id="name"
                                    placeholder="예: 갤럭시 워치 6 클래식"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">판매가 (원)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="459000"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>카테고리</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="카테고리 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="테크">테크 / 가전</SelectItem>
                                            <SelectItem value="패션">패션 / 잡화</SelectItem>
                                            <SelectItem value="뷰티">뷰티 / 화장품</SelectItem>
                                            <SelectItem value="푸드">푸드 / 맛집</SelectItem>
                                            <SelectItem value="리빙">리빙 / 인테리어</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="link">제품 상세페이지 링크 (URL)</Label>
                                <Input
                                    id="link"
                                    placeholder="https://"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <Plus className="h-5 w-5 text-primary" />
                                협업 가이드
                            </h2>

                            <div className="grid gap-2">
                                <Label htmlFor="points">소구 포인트 (강조하고 싶은 점)</Label>
                                <Textarea
                                    id="points"
                                    placeholder="예: 1. 기존 모델 대비 20% 얇아진 베젤 2. 강화된 수면 코칭 기능"
                                    className="min-h-[100px]"
                                    value={points}
                                    onChange={(e) => setPoints(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="shots">필수 촬영 컷 (원하는 연출)</Label>
                                <Textarea
                                    id="shots"
                                    placeholder="예: 1. 시계를 착용하고 운동하는 모습 2. 수면 측정 결과 화면 클로즈업"
                                    className="min-h-[100px]"
                                    value={shots}
                                    onChange={(e) => setShots(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button size="lg" className="w-full" onClick={handleSubmit}>
                                제품 등록 완료
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
