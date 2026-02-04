"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePlatform } from "@/components/providers/platform-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Trash2, Shield, Users, ShoppingBag, Send, Briefcase, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
    const {
        user, events, products, campaigns, brandProposals,
        deleteEvent, deleteProduct, deleteCampaign, deleteBrandProposal,
        isLoading
    } = usePlatform()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("events")

    useEffect(() => {
        if (!isLoading && (!user || user.type !== 'admin')) {
            router.push("/")
        }
    }, [user, isLoading, router])

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>
    if (!user || user.type !== 'admin') return null

    const handleDelete = async (type: string, id: string, name: string) => {
        if (confirm(`정말로 "${name}"을(를) 삭제하시겠습니까?`)) {
            try {
                if (type === 'event') await deleteEvent(id)
                else if (type === 'product') await deleteProduct(id)
                else if (type === 'campaign') await deleteCampaign(id)
                else if (type === 'proposal') await deleteBrandProposal(id)
                alert("삭제되었습니다.")
            } catch (e) {
                alert("삭제 중 오류가 발생했습니다.")
            }
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-10 max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">관리자 패널</h1>
                        <p className="text-muted-foreground">플랫폼의 모든 콘텐츠를 관리하고 중재합니다.</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-background border">
                        <TabsTrigger value="events" className="gap-2"><Users className="h-4 w-4" /> 크리에이터 모먼트 ({events.length})</TabsTrigger>
                        <TabsTrigger value="products" className="gap-2"><ShoppingBag className="h-4 w-4" /> 브랜드 제품 ({products.length})</TabsTrigger>
                        <TabsTrigger value="campaigns" className="gap-2"><Send className="h-4 w-4" /> 브랜드 캠페인 ({campaigns.length})</TabsTrigger>
                        <TabsTrigger value="proposals" className="gap-2"><Briefcase className="h-4 w-4" /> 협업 제안 ({brandProposals.length})</TabsTrigger>
                    </TabsList>

                    {/* Events Tab */}
                    <TabsContent value="events" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                                <Card key={event.id} className="overflow-hidden group">
                                    <div className="p-4 bg-muted/50 border-b flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                {event.influencer[0]}
                                            </div>
                                            <span className="text-sm font-medium">{event.influencer}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                            onClick={() => handleDelete('event', event.id, event.event)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">{event.event}</CardTitle>
                                        <CardDescription className="line-clamp-1">{event.category} | {event.date}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2 italic">"{event.description}"</p>
                                    </CardContent>
                                    <CardFooter className="bg-muted/10 border-t py-2 flex justify-between items-center">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">ID: {event.id.slice(0, 8)}</span>
                                        <Badge variant="outline" className="text-[10px]">{event.targetProduct}</Badge>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Products Tab */}
                    <TabsContent value="products" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => (
                                <Card key={product.id} className="overflow-hidden">
                                    <div className="p-4 bg-muted/50 border-b flex justify-between items-center">
                                        <span className="text-xs font-bold text-primary">{product.brandName}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                            onClick={() => handleDelete('product', product.id, product.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-4 p-4">
                                        <div className="h-20 w-20 rounded-lg border bg-background flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                                            {product.image.startsWith('http') ? <img src={product.image} className="w-full h-full object-cover" /> : product.image}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground">{product.category}</p>
                                            <p className="text-sm font-bold text-emerald-600 mt-1">{product.price.toLocaleString()}원</p>
                                        </div>
                                    </div>
                                    <CardFooter className="bg-muted/10 border-t py-2">
                                        <span className="text-[10px] text-muted-foreground">URL: {product.link.slice(0, 30)}...</span>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Campaigns Tab */}
                    <TabsContent value="campaigns" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {campaigns.map((camp) => (
                                <Card key={camp.id} className="overflow-hidden">
                                    <div className="p-4 bg-muted/50 border-b flex justify-between items-center">
                                        <span className="text-xs font-bold">{camp.brand}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                            onClick={() => handleDelete('campaign', String(camp.id), camp.product)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">{camp.product}</CardTitle>
                                        <CardDescription>{camp.category}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2">{camp.description}</p>
                                        <div className="mt-3 flex gap-2">
                                            <Badge variant="secondary" className="text-[10px]">{camp.budget}</Badge>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/10 border-t py-2">
                                        <span className="text-[10px] text-muted-foreground">ID: {String(camp.id).slice(0, 8)}</span>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Proposals Tab */}
                    <TabsContent value="proposals" className="space-y-4">
                        <div className="grid gap-4">
                            {brandProposals.map((prop) => (
                                <Card key={prop.id} className="flex flex-col md:flex-row overflow-hidden">
                                    <div className="md:w-1/4 bg-muted/30 p-4 border-r flex flex-col justify-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Sender (Brand)</span>
                                            <span className="font-bold text-sm">{prop.brand_name}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Receiver (Creator)</span>
                                            <span className="font-bold text-sm">{prop.influencer_name}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold">{prop.product_name}</h3>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge>{prop.status}</Badge>
                                                    <Badge variant="outline">{prop.product_type}</Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="text-muted-foreground hover:text-red-500 hover:bg-red-50 border-red-100"
                                                onClick={() => handleDelete('proposal', prop.id, `${prop.brand_name} -> ${prop.influencer_name}`)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm bg-muted/20 p-3 rounded italic">"{prop.message}"</p>
                                        <div className="mt-4 text-xs grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-muted-foreground">Compensation: </span>
                                                <span className="font-bold">{prop.compensation_amount}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Created: </span>
                                                <span>{new Date(prop.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
