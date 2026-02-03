"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, User, BadgeCheck, MessageCircle, Share2, MapPin, Package, Send } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { usePlatform } from "@/components/providers/platform-provider"
import { useEffect, useState } from "react"
import { InfluencerEvent } from "@/components/providers/platform-provider"

export default function EventDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { events, user, sendNotification, sendMessage } = usePlatform()
    const [event, setEvent] = useState<InfluencerEvent | null>(null)

    useEffect(() => {
        if (params.id) {
            const found = events.find(e => e.id === Number(params.id))
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
        if (confirm(`${event?.influencer}님에게 협업 제안을 보내시겠습니까?`)) {
            const brandName = user.name || "어떤 브랜드"
            // Start conversation with a message
            sendMessage(
                "creator1", // Hardcoded target for mock
                `안녕하세요, ${event?.influencer}님! [${brandName}] 브랜드 담당자입니다. '${event?.event}' 이벤트를 보고 제안 드립니다. 자세한 내용을 이야기 나누고 싶습니다.`
            )
            // Also send notification for visibility
            sendNotification(
                "creator1",
                `[${brandName}]님이 협업 제안을 보냈습니다. 메시지를 확인해보세요!`
            )
            alert("제안서가 발송되었습니다! 채팅방으로 이동합니다.")
            router.push("/messages")
        }
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-muted/30">
                <SiteHeader />
                <main className="container py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">이벤트를 찾을 수 없습니다.</h1>
                    <Button asChild>
                        <Link href="/brand">돌아가기</Link>
                    </Button>
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
                        <Card className="overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                                <div className="text-6xl">{event.avatar}</div>
                            </div>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-lg">{event.influencer}</span>
                                            {event.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                                        </div>
                                        <p className="text-muted-foreground">{event.handle}</p>
                                    </div>
                                    <div className="px-3 py-1 bg-secondary rounded-full text-xs font-semibold">
                                        {event.category}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h1 className="text-2xl font-bold mb-4">{event.event}</h1>
                                    <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-xl border mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                            <Package className="h-4 w-4" />
                                            희망 협찬 제품
                                        </div>
                                        <p className="text-sm">{event.targetProduct}</p>
                                    </div>
                                    <div className="space-y-1 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
                                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                            <Calendar className="h-4 w-4" />
                                            이벤트 날짜
                                        </div>
                                        <p className="text-sm">{event.eventDate}</p>
                                    </div>
                                    <div className="space-y-1 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
                                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                            <Send className="h-4 w-4" />
                                            업로드 예정
                                        </div>
                                        <p className="text-sm">{event.postingDate}</p>
                                    </div>
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
                                        <p className="text-xs text-muted-foreground">이벤트 일정</p>
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
        </div>
    )
}
