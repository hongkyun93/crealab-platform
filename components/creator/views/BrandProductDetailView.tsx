"use client"

import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { usePlatform } from "@/components/providers/legacy-platform-hook"
import { ArrowLeft, CheckCircle2, DollarSign, Percent, Send, ExternalLink, ImageIcon, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"


interface BrandProductDetailViewProps {
    productId: string
    onBack: () => void
}

export function BrandProductDetailView({ productId, onBack }: BrandProductDetailViewProps) {
    const { products, user, addProposal } = usePlatform()
    const [isOpen, setIsOpen] = useState(false)

    // Form State (Matching ApplyDialog)
    const [instagramHandle, setInstagramHandle] = useState("")
    const [motivation, setMotivation] = useState("")
    const [contentPlan, setContentPlan] = useState("")
    const [portfolioLinks, setPortfolioLinks] = useState("")
    const [insightFile, setInsightFile] = useState<File | null>(null)
    const [desiredCost, setDesiredCost] = useState("")
    const [appealMessage, setAppealMessage] = useState("")

    // AI State
    const [isAIPlanning, setIsAIPlanning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const product = products.find(p => String(p.id) === productId)

    // Pre-fill handle
    useEffect(() => {
        if (user?.handle) {
            setInstagramHandle(user.handle)
        }
    }, [user])

    if (!product) {
        return (
            <div className="container py-20 text-center animate-in fade-in zoom-in-95">
                <div className="mx-auto h-12 w-12 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                </div>
                <h2 className="text-xl font-bold">제품을 찾을 수 없습니다.</h2>
                <Button variant="link" onClick={onBack} className="mt-4">
                    목록으로 돌아가기
                </Button>
            </div>
        )
    }

    const handleGenerateAIPlan = async () => {
        if (!product) return

        setIsAIPlanning(true)
        try {
            const response = await fetch('/api/generate-content-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName: product.name,
                    sellingPoints: product.points || "제품의 일반적인 강점",
                    category: product.category || "기타",
                    requiredShots: product.shots || "자유로운 구도"
                })
            })

            const data = await response.json()
            if (data.result) {
                // If structured data
                if (data.result.motivation && data.result.content_plan) {
                    setMotivation(data.result.motivation)
                    setContentPlan(data.result.content_plan)
                } else if (typeof data.result === 'string') {
                    setContentPlan(data.result)
                }
            }
        } catch (error) {
            console.error("AI Generation Failed:", error)
            alert("AI 기획안 생성에 실패했습니다.")
        } finally {
            setIsAIPlanning(false)
        }
    }

    const handlePropose = async () => {
        if (!user) {
            alert("로그인이 필요합니다.")
            return
        }

        if (!instagramHandle || !motivation || !contentPlan) {
            alert("활동 계정, 지원 동기, 콘텐츠 제작 계획은 필수 입력 항목입니다.")
            return
        }

        setIsSubmitting(true)
        try {
            // Upload Insight File if exists
            let insightUrl = null
            if (insightFile) {
                const supabase = createClient()
                const fileExt = insightFile.name.split('.').pop()
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `insights/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('campaigns') // Reusing campaigns bucket for now
                    .upload(filePath, insightFile)

                if (!uploadError) {
                    const { data } = supabase.storage.from('campaigns').getPublicUrl(filePath)
                    insightUrl = data.publicUrl
                }
            }

            // Pack structured data into a readable message since brand_proposals might not have specific columns
            // This ensures backward compatibility while providing all info.
            const formattedMessage = `
[지원 정보]
- 활동 계정: ${instagramHandle}
- 희망 원고료: ${desiredCost || '제시 없음'}
- 포트폴리오: ${portfolioLinks || '없음'}
- 인사이트 첨부: ${insightUrl ? '첨부됨' : '없음'}

[지원 동기]
${motivation}

[콘텐츠 제작 계획]
${contentPlan}

[추가 메시지]
${appealMessage || '없음'}
            `.trim()

            if (!product.brandId) {
                console.error("Product missing brandId:", product)
                alert("제품 정보에 브랜드 ID가 누락되었습니다.")
                return
            }

            console.log("Submitting proposal for product:", product.id, "Brand:", product.brandId)

            await addProposal({
                type: "creator_apply",
                dealType: "ad",
                productId: product.id,
                cost: desiredCost ? Number(desiredCost.replace(/[^0-9]/g, '')) : 0,
                commission: 0, // Not used in new form
                requestDetails: formattedMessage,
                status: "applied",
                fromId: user.id,
                toId: product.brandId,
                // We pass these purely so valid types don't complain, 
                // but if the DB doesn't have them, they might be ignored by the provider or cause error depending on implementation.
                // The 'addProposal' implementation in provider calls supabase.insert(proposal).
                // If columns don't exist, it might error.
                // Safest bet is relying on 'requestDetails' (mapped to message usually).
                // UPDATED: Now passing structured fields as ProposalProvider supports them.
                motivation: motivation,
                content_plan: contentPlan,
                portfolioLinks: portfolioLinks ? [portfolioLinks] : [], // passing as array
                instagramHandle: instagramHandle,
                insightScreenshot: insightUrl || undefined, // Fix: null -> undefined
            })

            setIsOpen(false)
            alert("제안서가 성공적으로 전송되었습니다.")
            onBack()

        } catch (error) {
            console.error("Proposal Error:", error)
            alert("제안서 전송 중 오류가 발생했습니다.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-muted/30 -mx-6 md:-mx-8 -my-8 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary group" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> 목록으로 돌아가기
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
                            <div className="aspect-square bg-background rounded-lg border border-primary/30 flex items-center justify-center text-2xl overflow-hidden ring-2 ring-primary/20 cursor-pointer">
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
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-primary uppercase tracking-widest">{product.brandName || "브랜드"}</span>
                                <Badge variant="secondary" className="px-2 py-0.5 rounded-full font-medium">{product.category}</Badge>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 leading-tight text-foreground">{product.name}</h1>
                            <div className="flex items-baseline gap-2 mb-6">
                                <p className="text-3xl font-black text-foreground">
                                    {product.price > 0 ? `${product.price.toLocaleString()}원` : "가격 미정"}
                                </p>
                                <span className="text-sm font-medium text-muted-foreground">소비자가</span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button size="lg" className="flex-1 text-lg h-14 shadow-lg shadow-primary/20 font-bold" onClick={() => setIsOpen(true)}>
                                    <Send className="mr-2 h-5 w-5" /> 협업 제안하기
                                </Button>

                                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                    <DialogContent className="sm:max-w-lg h-[90vh] sm:h-auto overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold">협업 제안하기</DialogTitle>
                                            <DialogDescription className="text-xs">
                                                브랜드에게 제안할 지원 정보와 기획안을 작성해주세요.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="grid gap-4 py-4">
                                            {/* Instagram Handle */}
                                            <div className="space-y-2">
                                                <Label htmlFor="handle">활동 계정 (인스타그램 ID) <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="handle"
                                                    value={instagramHandle}
                                                    onChange={(e) => setInstagramHandle(e.target.value)}
                                                    placeholder="@example_id"
                                                />
                                            </div>

                                            {/* Motivation */}
                                            <div className="space-y-2">
                                                <Label htmlFor="motivation">지원 동기 <span className="text-red-500">*</span></Label>
                                                <Textarea
                                                    id="motivation"
                                                    value={motivation}
                                                    onChange={(e) => setMotivation(e.target.value)}
                                                    placeholder="이 제품에 관심을 갖게 된 계기나, 표현하고 싶은 포인트를 적어주세요."
                                                    className="min-h-[100px]"
                                                />
                                            </div>

                                            {/* Content Plan with AI Button */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label htmlFor="contentPlan">콘텐츠 제작 계획 <span className="text-red-500">*</span></Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                        onClick={handleGenerateAIPlan}
                                                        disabled={isAIPlanning}
                                                    >
                                                        {isAIPlanning ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
                                                        AI 기획안 받기
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    id="contentPlan"
                                                    value={contentPlan}
                                                    onChange={(e) => setContentPlan(e.target.value)}
                                                    className="min-h-[150px]"
                                                    placeholder="어떤 컨셉과 흐름(오프닝, 본문, 클로징)으로 영상을 제작할지 구체적으로 작성해주세요."
                                                />
                                            </div>

                                            {/* Portfolio */}
                                            <div className="space-y-2">
                                                <Label htmlFor="portfolio">포트폴리오 링크 (선택)</Label>
                                                <Textarea
                                                    id="portfolio"
                                                    value={portfolioLinks}
                                                    onChange={(e) => setPortfolioLinks(e.target.value)}
                                                    placeholder="관련된 콘텐츠 URL을 줄바꿈으로 구분하여 입력해주세요."
                                                    className="min-h-[80px]"
                                                />
                                            </div>

                                            {/* Insight File */}
                                            <div className="space-y-2">
                                                <Label htmlFor="insight">인사이트 캡처 (선택)</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="insight"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                setInsightFile(e.target.files[0])
                                                            }
                                                        }}
                                                        className="cursor-pointer"
                                                    />
                                                    {insightFile && <span className="text-xs text-emerald-600 font-bold">선택됨</span>}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">계정 도달수나 팔로워 인사이트 캡처를 첨부하면 선정 확률이 높아집니다.</p>
                                            </div>

                                            {/* Cost and Message */}
                                            <div className="space-y-2 border-t pt-2">
                                                <Label htmlFor="cost">희망 원고료 (선택)</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">₩</span>
                                                    <Input
                                                        id="cost"
                                                        type="number"
                                                        value={desiredCost}
                                                        onChange={(e) => setDesiredCost(e.target.value)}
                                                        placeholder="0"
                                                        className="pl-8"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="message">추가 메시지</Label>
                                                <Textarea
                                                    id="message"
                                                    value={appealMessage}
                                                    onChange={(e) => setAppealMessage(e.target.value)}
                                                    className="min-h-[80px]"
                                                    placeholder="기타 브랜드에게 하고 싶은 말이 있다면 적어주세요."
                                                />
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
                                            <Button onClick={handlePropose} disabled={isSubmitting} className="font-bold">
                                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                                제안서 전송
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {product.link && (
                                    <Button variant="outline" size="lg" className="flex-1 h-14 border-2 font-bold" asChild>
                                        <Link href={product.link} target="_blank">
                                            브랜드 몰 가기 <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
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

                            <div className="space-y-2">
                                <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-tight">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> 필수 포함 내용
                                </h3>
                                <div className="bg-background p-4 rounded-xl border border-border/60 text-xs leading-relaxed text-foreground/80 shadow-sm whitespace-pre-wrap">
                                    {product.contentGuide || "브랜드에서 등록한 필수 포함 내용이 없습니다."}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-tight">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> 필수 형식
                                </h3>
                                <div className="bg-background p-4 rounded-xl border border-border/60 text-xs leading-relaxed text-foreground/80 shadow-sm whitespace-pre-wrap">
                                    {product.formatGuide || "브랜드에서 등록한 필수 형식이 없습니다."}
                                </div>
                            </div>
                        </div>

                        {/* Brand Info & Guidelines Card */}
                        {(product.accountTag || product.tags) && (
                            <div className="mt-8 rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <div className="h-6 w-6 text-primary flex items-center justify-center font-bold">@</div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-lg">{product.accountTag || "@brand_official"}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            콘텐츠 업로드 시 계정 태그 필수로 부탁드립니다.
                                        </p>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(product.tags) ? product.tags.map((tag: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="px-3 py-1 bg-muted text-foreground hover:bg-muted/80">
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </Badge>
                                        )) : (product.tags || "").split(' ').map((tag: string, i: number) => tag && (
                                            <Badge key={i} variant="secondary" className="px-3 py-1 bg-muted text-foreground hover:bg-muted/80">
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-xs text-destructive flex gap-2 items-start">
                                        <span className="font-bold shrink-0">*[필수]</span>
                                        <span>[광고] 또는 [협찬] 문구를 콘텐츠 상단(첫줄)에 반드시 기재해주세요. 공정위 문구 누락 시 수정 요청이 있을 수 있습니다.</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
