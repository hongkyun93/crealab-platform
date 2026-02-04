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
import { ArrowLeft, CheckCircle2, DollarSign, Percent, Send, ExternalLink, Package } from "lucide-react"
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

    const productId = params.id as string
    const product = products.find(p => String(p.id) === productId)

    if (!product) {
        return (
            <div className="min-h-screen bg-muted/30">
                <SiteHeader />
                <div className="container py-20 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                    <h2 className="text-xl font-bold">제품을 찾을 수 없습니다.</h2>
                    <Button variant="link" asChild className="mt-4">
                        <Link href="/influencer/products">목록으로 돌아가기</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const handlePropose = () => {
        if (!user) {
            alert("로그인이 필요합니다.")
            return
        }

        addProposal({
            type: "creator_apply",
            dealType: "ad", // Defaulting to ad for now, logic can be refined
            productId: product.id, // Now using string ID from the updated type
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
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary group" asChild>
                    <Link href="/influencer/products">
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> 목록으로 돌아가기
                    </Link>
                </Button>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left: Image Container */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-background rounded-2xl border border-border/60 flex items-center justify-center text-9xl shadow-sm overflow-hidden relative">
                            {product.image.startsWith('http') ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{product.image}</span>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {/* Mock thumbnails or additional images if we had them */}
                            <div className="aspect-square bg-background rounded-lg border border-primary/30 flex items-center justify-center text-2xl overflow-hidden ring-2 ring-primary/20">
                                {product.image.startsWith('http') ? <img src={product.image} alt="thumb" className="w-full h-full object-cover" /> : product.image}
                            </div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="aspect-square bg-muted/50 rounded-lg border border-border/40 flex items-center justify-center text-2xl opacity-40 cursor-not-allowed">
                                    {product.image.startsWith('http') ? <ImageIcon className="h-6 w-6 text-muted-foreground" /> : product.image}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info Section */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-primary uppercase tracking-widest">{product.brandName}</span>
                                <Badge variant="secondary" className="px-2 py-0.5 rounded-full font-medium">{product.category}</Badge>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 leading-tight text-foreground">{product.name}</h1>
                            <p className="text-3xl font-black text-foreground mb-6">
                                {product.price > 0 ? `${product.price.toLocaleString()}원` : "가격 미정"}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="lg" className="flex-1 text-lg h-14 shadow-lg shadow-primary/20 font-bold">
                                            <Send className="mr-2 h-5 w-5" /> 협업 제안하기
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold">협업 제안서 작성</DialogTitle>
                                            <DialogDescription>
                                                브랜드에게 희망하는 광고비와 수수료를 제안하세요. 세부 사항은 나중에 채팅으로 조율 가능합니다.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-5 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cost" className="font-bold">희망 광고비 (원)</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="cost"
                                                        type="number"
                                                        placeholder="예: 500,000"
                                                        className="pl-9 h-11"
                                                        value={cost}
                                                        onChange={(e) => setCost(e.target.value)}
                                                    />
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">콘텐츠 1회 제작 및 업로드에 대한 고정 비용입니다.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="commission" className="font-bold">희망 판매 수수료 (%)</Label>
                                                <div className="relative">
                                                    <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="commission"
                                                        type="number"
                                                        placeholder="예: 10"
                                                        className="pl-9 h-11"
                                                        max={100}
                                                        value={commission}
                                                        onChange={(e) => setCommission(e.target.value)}
                                                    />
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">공동구매 진행 시 발생하는 매출에 대한 배분 비율입니다.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="message" className="font-bold">전달 메시지</Label>
                                                <Textarea
                                                    id="message"
                                                    placeholder="제품에 대한 관심도나 제작하고 싶은 콘텐츠 컨셉을 자유롭게 적어주세요."
                                                    className="resize-none min-h-[100px]"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button type="button" onClick={handlePropose} className="w-full h-12 text-base font-bold">
                                                제안 전송하기
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Button variant="outline" size="lg" className="flex-1 h-14 border-2 font-bold" asChild>
                                    <Link href={product.link} target="_blank">
                                        브랜드 몰 가기 <ExternalLink className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <Separator className="bg-border/60" />

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <div className="h-6 w-1 bg-primary rounded-full" /> ✨ 주요 소구 포인트
                                </h3>
                                <div className="bg-background p-5 rounded-xl border border-border/60 text-sm leading-relaxed text-foreground/80 shadow-sm whitespace-pre-wrap">
                                    {product.points || "브랜드에서 등록한 소구 포인트가 없습니다."}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <div className="h-6 w-1 bg-primary rounded-full" /> 📸 필수 촬영 컷
                                </h3>
                                <div className="bg-background p-5 rounded-xl border border-border/60 text-sm leading-relaxed text-foreground/80 shadow-sm whitespace-pre-wrap">
                                    {product.shots || "브랜드에서 등록한 필수 촬영 가이드가 없습니다."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function ImageIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
    )
}
