import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowRight, Layout, MessageSquare, FileText, User } from "lucide-react"

export default function BrandDesignLabPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Brand Experience Design Lab</h1>
                <p className="text-muted-foreground mt-2">
                    브랜드 관점에서의 사용자 경험을 디자인하고 테스트합니다. 실제 레이아웃 컨텍스트에서 컴포넌트 변형을 확인하세요.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/design-lab/brand/moment-cards">
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layout className="h-5 w-5 text-primary" />
                                Moment Cards (10종)
                            </CardTitle>
                            <CardDescription>
                                크리에이터 발견의 핵심인 모먼트 카드 디자인 변형
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted aspect-video rounded-md flex items-center justify-center text-muted-foreground text-sm">
                                Preview
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/design-lab/brand/campaign-cards">
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                Campaign Cards (10종)
                            </CardTitle>
                            <CardDescription>
                                캠페인 관리 및 대시보드 리스트 디자인 변형
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted aspect-video rounded-md flex items-center justify-center text-muted-foreground text-sm">
                                Preview
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/design-lab/brand/chat">
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-green-500" />
                                Chat Interface (10종)
                            </CardTitle>
                            <CardDescription>
                                협업 소통을 위한 메시징 UI 변형
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted aspect-video rounded-md flex items-center justify-center text-muted-foreground text-sm">
                                Preview
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
