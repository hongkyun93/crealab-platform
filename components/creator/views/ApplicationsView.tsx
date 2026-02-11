import Link from "next/link"
import { ChevronRight, Megaphone, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ApplicationsViewProps {
    outboundApplications: any[]
    setCurrentView: (view: string) => void
    handleOpenDetails: (app: any, type: string) => void
}

export function ApplicationsView({
    outboundApplications,
    setCurrentView,
    handleOpenDetails
}: ApplicationsViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="gap-2">
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    돌아가기
                </Button>
                <h1 className="text-2xl font-bold">내 캠페인 아카이브</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {outboundApplications.length > 0 ? (
                    outboundApplications.map((app: any) => (
                        <Card key={app.id} className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500" onClick={() => handleOpenDetails(app, 'campaign')}>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                                            <Megaphone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold">{app.campaignName || app.brand_name || "캠페인"}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()} 지원</div>
                                        </div>
                                    </div>
                                    <Badge className="bg-blue-600">지원완료</Badge>
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{app.productName || "제품 정보 없음"}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        희망비용: {app.cost ? `${app.cost.toLocaleString()}원` : '미입력'}
                                    </p>
                                </div>
                                <Button className="w-full h-8 text-xs" variant="outline">지원서 확인</Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                        지원한 캠페인이 없습니다.
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-4">
                <Button asChild>
                    <Link href="/creator/products">
                        <Search className="mr-2 h-4 w-4" /> 새로운 캠페인 찾기
                    </Link>
                </Button>
            </div>
        </div>
    )
}
