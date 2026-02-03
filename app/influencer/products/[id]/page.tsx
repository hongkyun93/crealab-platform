"use client"

import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { usePlatform } from "@/components/providers/platform-provider"
import { ArrowLeft, CheckCircle2, DollarSign, Percent, Send } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { products, user, addProposal } = usePlatform()
    const [isOpen, setIsOpen] = useState(false)

    // Form State
    const [cost, setCost] = useState("")
    const [commission, setCommission] = useState("")
    const [message, setMessage] = useState("")

    const productId = Number(params.id)
    const product = products.find(p => p.id === productId)

    if (!product) {
        return <div className="p-8">Product not found</div>
    }

    const handlePropose = () => {
        if (!user) {
            alert("로그인이 필요합니다.")
            return
        }

        addProposal({
            type: "creator_apply",
            dealType: "ad", // Defaulting to ad for now, logic can be refined
            productId: product.id,
            cost: Number(cost),
            commission: Number(commission),
            requestDetails: message,
            status: "applied",
            fromId: user.id,
            toId: product.brandId,
        })

        setIsOpen(false)
        alert("제안이 성공적으로 전송되었습니다! 브랜드의 응답을 기다리세요.")
        router.push("/influencer")
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-5xl px-6 md:px-8">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" asChild>
                    <Link href="/influencer/products">
                        <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로 돌아가기
                    </Link>
                </Button>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Image */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-xl border flex items-center justify-center text-9xl shadow-sm">
                            {product.image}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {/* Mock thumbnails */}
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square bg-white rounded-lg border flex items-center justify-center text-2xl opacity-50 cursor-pointer hover:opacity-100 transition-opacity">
                                    {product.image}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">{product.brandName}</span>
                                <Badge>{product.category}</Badge>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
                            <p className="text-2xl font-bold mb-4">{product.price.toLocaleString()}원</p>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={product.link} target="_blank">
                                    쇼핑몰에서 보기 ↗
                                </Link>
                            </Button>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">✨ 주요 소구 포인트</h3>
                                <div className="bg-white p-4 rounded-lg border text-sm leading-relaxed">
                                    {product.points}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">📸 필수 촬영 컷</h3>
                                <div className="bg-white p-4 rounded-lg border text-sm leading-relaxed">
                                    {product.shots}
                                </div>
                            </div>
                        </div>

                        {/* Proposal Dialog */}
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="w-full text-lg h-14 shadow-lg shadow-primary/20">
                                    <Send className="mr-2 h-5 w-5" /> 브랜드에게 제안 보내기
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>제안서 작성</DialogTitle>
                                    <DialogDescription>
                                        브랜드에게 희망하는 광고비와 수수료를 제안하세요.
                                        <br />
                                        브랜드가 수락하면 상세 조율이 시작됩니다.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cost">희망 광고비 (원)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="cost"
                                                type="number"
                                                placeholder="예: 500000"
                                                className="pl-9"
                                                value={cost}
                                                onChange={(e) => setCost(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">콘텐츠 제작 및 업로드에 대한 비용입니다.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="commission">희망 판매 수수료 (%)</Label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="commission"
                                                type="number"
                                                placeholder="예: 10"
                                                className="pl-9"
                                                max={100}
                                                value={commission}
                                                onChange={(e) => setCommission(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">공동구매 진행 시 발생하는 판매 수익 쉐어 비율입니다.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">함께 보낼 메시지 (선택)</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="간단한 포부나 계획을 적어주세요. 예: 제 팔로워들이 딱 좋아할 제품이에요!"
                                            className="resize-none"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" onClick={handlePropose} className="w-full">
                                        제안 전송하기
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </main>
        </div>
    )
}
