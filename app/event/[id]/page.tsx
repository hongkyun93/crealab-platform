"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, User, BadgeCheck, MessageCircle, Share2, MapPin, Package, Send, SearchX } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { usePlatform } from "@/components/providers/platform-provider"
import { useEffect, useState } from "react"
import { InfluencerEvent } from "@/components/providers/platform-provider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function EventDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { events, user, sendNotification, supabase } = usePlatform()
    const [event, setEvent] = useState<InfluencerEvent | null>(null)
    const [showProposalDialog, setShowProposalDialog] = useState(false)

    // Proposal form state
    const [productName, setProductName] = useState("")
    const [productType, setProductType] = useState<"gift" | "loan">("gift")
    const [compensationAmount, setCompensationAmount] = useState("")
    const [hasIncentive, setHasIncentive] = useState(false)
    const [incentiveDetail, setIncentiveDetail] = useState("")
    const [contentType, setContentType] = useState("")
    const [proposalMessage, setProposalMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (params.id) {
            const found = events.find(e => String(e.id) === String(params.id))
            if (found) {
                setEvent(found)
            }
        }
    }, [params.id, events])

    const handlePropose = () => {
        if (!user) {
            router.push("/login")
            return
        }
        setShowProposalDialog(true)
    }

    const handleSubmitProposal = async () => {
        if (!user || !event) return

        if (!productName || !proposalMessage) {
            alert("제품명과 제안 메시지는 필수입니다.")
            return
        }

        setIsSubmitting(true)
        try {
            const { data, error } = await supabase
                .from('brand_proposals')
                .insert({
                    brand_id: user.id,
                    influencer_id: event.influencerId,
                    product_name: productName,
                    product_type: productType,
                    compensation_amount: compensationAmount || null,
                    has_incentive: hasIncentive,
                    incentive_detail: hasIncentive ? incentiveDetail : null,
                    content_type: contentType || null,
                    message: proposalMessage,
                    status: 'offered'
                })

            if (error) {
                console.error('Error creating proposal:', error)
                alert('제안서 저장 중 오류가 발생했습니다.')
                return
            }

            sendNotification(
                event.influencerId,
                `[${user.name}]님이 협업 제안을 보냈습니다!`
            )

            alert("제안서가 성공적으로 발송되었습니다!")
            setShowProposalDialog(false)

            // Reset form
            setProductName("")
            setCompensationAmount("")
            setHasIncentive(false)
            setIncentiveDetail("")
            setContentType("")
            setProposalMessage("")

        } catch (error) {
            console.error('Error submitting proposal:', error)
            alert('제안서 발송 중 오류가 발생했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-muted/30">
                <SiteHeader />
                <main className="container flex flex-col items-center justify-center py-24 px-4 text-center">
                    <Card className="w-full max-w-md p-8 shadow-lg border-dashed">
                        <div className="flex flex-col items-center gap-6">
                            <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center">
                                <SearchX className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold tracking-tight">모먼트를 찾을 수 없습니다</h1>
                                <p className="text-sm text-muted-foreground break-keep">
                                    요청하신 페이지가 삭제되었거나, 잘못된 주소로 접속하셨습니다.<br />
                                    입력하신 주소를 다시 한번 확인해주세요.
                                </p>
                            </div>
                            <div className="flex w-full gap-2 pt-2">
                                <Button variant="outline" className="flex-1" asChild>
                                    <Link href="/" onClick={() => router.back()}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> 뒤로 가기
                                    </Link>
                                </Button>
                                <Button className="flex-1" asChild>
                                    <Link href="/brand">
                                        목록으로 <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-4xl px-4 mx-auto">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="gap-2">
                        <Link href="/brand">
                            <ArrowLeft className="h-4 w-4" /> 목록으로
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                    {/* Main Content */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-lg">
                                            {event.influencer[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{event.influencer}</h3>
                                                {event.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{event.handle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">팔로워</p>
                                        <p className="font-bold">{event.followers?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-3">
                                        {event.category}
                                    </span>
                                    <h1 className="text-3xl font-bold mb-4">{event.event}</h1>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">모먼트 일정</p>
                                        <p className="font-semibold">{event.eventDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">콘텐츠 업로드</p>
                                        <p className="font-semibold">{event.postingDate}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Package className="h-4 w-4" /> 희망 제품
                                    </p>
                                    <p className="text-muted-foreground">{event.targetProduct}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 border rounded-full text-sm text-muted-foreground">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Action */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>일정 및 액션</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">모먼트 일정</p>
                                        <p className="font-semibold">{event.date}</p>
                                    </div>
                                </div>
                                <div className="pt-2 space-y-2">
                                    <Button className="w-full gap-2" size="lg" onClick={handlePropose}>
                                        <MessageCircle className="h-5 w-5" /> 협업 제안하기
                                    </Button>
                                    <Button variant="outline" className="w-full gap-2" onClick={() => alert("링크가 복사되었습니다!")}>
                                        <Share2 className="h-4 w-4" /> 공유하기
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Proposal Dialog */}
            <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>협업 제안서 작성</DialogTitle>
                        <DialogDescription>
                            {event.influencer}님에게 보낼 제안서를 작성해주세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Product Name */}
                        <div className="space-y-2">
                            <Label htmlFor="productName">제품명 *</Label>
                            <Input
                                id="productName"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="예: 프리미엄 스킨케어 세트"
                            />
                        </div>

                        {/* Product Type */}
                        <div className="space-y-2">
                            <Label>제품 제공 방식 *</Label>
                            <RadioGroup value={productType} onValueChange={(v) => setProductType(v as "gift" | "loan")}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="gift" id="gift" />
                                    <Label htmlFor="gift" className="font-normal cursor-pointer">증정 (제품 제공)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="loan" id="loan" />
                                    <Label htmlFor="loan" className="font-normal cursor-pointer">대여 (반납 필요)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Compensation */}
                        <div className="space-y-2">
                            <Label htmlFor="compensation">보상 금액 (선택)</Label>
                            <Input
                                id="compensation"
                                value={compensationAmount}
                                onChange={(e) => setCompensationAmount(e.target.value)}
                                placeholder="예: 100만원"
                            />
                        </div>

                        {/* Incentive */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="incentive"
                                    checked={hasIncentive}
                                    onCheckedChange={(checked) => setHasIncentive(checked as boolean)}
                                />
                                <Label htmlFor="incentive" className="font-normal cursor-pointer">
                                    성과 인센티브 제공
                                </Label>
                            </div>
                            {hasIncentive && (
                                <Textarea
                                    value={incentiveDetail}
                                    onChange={(e) => setIncentiveDetail(e.target.value)}
                                    placeholder="인센티브 상세 내용을 입력하세요 (예: 조회수 10만 달성 시 추가 50만원)"
                                    rows={3}
                                />
                            )}
                        </div>

                        {/* Content Type */}
                        <div className="space-y-2">
                            <Label htmlFor="contentType">희망 콘텐츠 형식 (선택)</Label>
                            <Input
                                id="contentType"
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value)}
                                placeholder="예: 인스타그램 릴스, 유튜브 쇼츠"
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label htmlFor="message">제안 메시지 *</Label>
                            <Textarea
                                id="message"
                                value={proposalMessage}
                                onChange={(e) => setProposalMessage(e.target.value)}
                                placeholder="크리에이터에게 전달할 메시지를 작성해주세요."
                                rows={5}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowProposalDialog(false)} disabled={isSubmitting}>
                            취소
                        </Button>
                        <Button onClick={handleSubmitProposal} disabled={isSubmitting}>
                            {isSubmitting ? "발송 중..." : "제안서 발송"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
