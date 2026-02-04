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
                        <Link href="/creator/products">목록으로 돌아가기</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const handlePropose = async () => {
        if (!user) {
            alert("로그인이 필요합니다.")
            return
        }

        await addProposal({
            type: "creator_apply",
            dealType: "ad",
            productId: product.id,
            cost: Number(cost),
            commission: Number(commission),
            requestDetails: message,
            status: "applied",
            fromId: user.id,
            toId: product.brandId,
        })

        setIsOpen(false)
        router.push("/creator")
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-5xl px-6 md:px-8">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary group" asChild>
                    <Link href="/creator/products">
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
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold">협업 제안하기</DialogTitle>
                                            <DialogDescription className="text-xs">
                                                브랜드에게 제안할 협업 조건을 입력해주세요.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="flex flex-col gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="cost" className="text-right text-xs font-bold">광고비</Label>
                                                <div className="col-span-3 relative">
                                                    <DollarSign className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input id="cost" type="number" placeholder="0" className="pl-9 h-9 text-sm" value={cost} onChange={(e) => setCost(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="commission" className="text-right text-xs font-bold">수수료</Label>
                                                <div className="col-span-3 relative">
                                                    <Percent className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input id="commission" type="number" placeholder="0" className="pl-9 h-9 text-sm" value={commission} onChange={(e) => setCommission(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 items-start gap-4">
                                                <Label htmlFor="message" className="text-right pt-2 text-xs font-bold">메시지</Label>
                                                <Textarea id="message" placeholder="제작하고 싶은 콘텐츠의 방향성을 설명해주세요." className="col-span-3 min-h-[100px] text-sm" value={message} onChange={(e) => setMessage(e.target.value)} />
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>취소</Button>
                                            <Button size="sm" onClick={handlePropose} className="font-bold">제안서 전송</Button>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-tight">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> 주요 소구 포인트
                                </h3>
                                <div className="bg-background p-4 rounded-xl border border-border/60 text-xs leading-relaxed text-foreground/80 shadow-sm whitespace-pre-wrap">
                                    {product.points || "브랜드에서 등록한 소구 포인트가 없습니다."}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-tight">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> 필수 촬영 컷
                                </h3>
                                <div className="bg-background p-4 rounded-xl border border-border/60 text-xs leading-relaxed text-foreground/80 shadow-sm whitespace-pre-wrap">
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
