import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Search, Image, MessageSquare, User } from "lucide-react"

export default function CreatorDesignLabPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Creator Experience Design Lab</h1>
                <p className="text-muted-foreground mt-2">
                    크리에이터 관점에서의 사용자 경험을 디자인하고 테스트합니다. 실제 레이아웃 컨텍스트에서 컴포넌트 변형을 확인하세요.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/design-lab/creator/campaign-search">
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" />
                                Campaign Search (10종)
                            </CardTitle>
                            <CardDescription>
                                캠페인 탐색 및 지원 카드 디자인 변형
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted aspect-video rounded-md flex items-center justify-center text-muted-foreground text-sm">
                                Preview
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/design-lab/creator/my-moments">
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="h-5 w-5 text-pink-500" />
                                My Moment Mgmt (10종)
                            </CardTitle>
                            <CardDescription>
                                내 모먼트 관리 및 등록 화면 디자인 변형
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted aspect-video rounded-md flex items-center justify-center text-muted-foreground text-sm">
                                Preview
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/design-lab/creator/chat">
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-green-500" />
                                Chat Interface (Creator)
                            </CardTitle>
                            <CardDescription>
                                크리에이터 시점의 협업 소통 UI
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
