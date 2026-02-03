"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Lock, Trash2 } from "lucide-react"
import { useState } from "react"
import { usePlatform } from "@/components/providers/platform-provider"

export default function AdminPage() {
    const { campaigns, deleteCampaign, events, deleteEvent } = usePlatform()

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    // Admin Password (Hardcoded for prototype)
    const ADMIN_PASSWORD = "admin"

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true)
            setError("")
        } else {
            setError("비밀번호가 올바르지 않습니다.")
        }
    }

    const handleDeleteCampaign = (id: number) => {
        if (confirm("정말로 이 캠페인을 삭제하시겠습니까?")) {
            deleteCampaign(id)
        }
    }

    const handleDeleteEvent = (id: number) => {
        if (confirm("정말로 이 이벤트를 삭제하시겠습니까?")) {
            deleteEvent(id)
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-muted/30">
                <SiteHeader />
                <main className="container flex items-center justify-center py-20 min-h-[80vh]">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">관리자 로그인</CardTitle>
                            <CardDescription className="text-center">
                                콘텐츠 관리를 위해 비밀번호를 입력하세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">비밀번호</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            className="pl-9"
                                            placeholder="관리자 비밀번호"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}
                                <Button type="submit" className="w-full">
                                    로그인
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
                        <p className="text-muted-foreground">
                            전체 캠페인 및 이벤트를 관리하고 삭제할 수 있습니다.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
                        로그아웃
                    </Button>
                </div>

                <Tabs defaultValue="campaigns" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="campaigns">캠페인 관리 ({campaigns.length})</TabsTrigger>
                        <TabsTrigger value="events">이벤트 관리 ({events.length})</TabsTrigger>
                    </TabsList>

                    {/* Campaigns Tab */}
                    <TabsContent value="campaigns">
                        <div className="grid gap-4">
                            {campaigns.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    등록된 캠페인이 없습니다.
                                </div>
                            ) : (
                                campaigns.map((campaign) => (
                                    <Card key={campaign.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg">{campaign.product}</span>
                                                <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                    {campaign.brand}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>카테고리: {campaign.category}</p>
                                                <p>예산: {campaign.budget}</p>
                                                <p className="text-xs text-muted-foreground/60">{campaign.date} 등록됨</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteCampaign(campaign.id)}
                                            className="ml-auto md:ml-0 gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" /> 삭제
                                        </Button>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Events Tab */}
                    <TabsContent value="events">
                        <div className="grid gap-4">
                            {events.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    등록된 이벤트가 없습니다.
                                </div>
                            ) : (
                                events.map((event) => (
                                    <Card key={event.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg">{event.event}</span>
                                                {event.verified && (
                                                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>작성자: {event.influencer} ({event.handle})</p>
                                                <p>일정: {event.date} | 카테고리: {event.category}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {event.tags.map(tag => (
                                                        <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="ml-auto md:ml-0 gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" /> 삭제
                                        </Button>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
