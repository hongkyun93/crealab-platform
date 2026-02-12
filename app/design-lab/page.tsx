import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Briefcase, User, Box, ArrowRight } from "lucide-react"

export default function DesignLabEntry() {
    return (
        <div className="container mx-auto py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Design System Laboratory</h1>
                <p className="text-xl text-muted-foreground">
                    실제 애플리케이션 컨텍스트에서 UI/UX를 테스트하고 검증하는 공간입니다.<br />
                    사용자 페르소나를 선택하여 시작하세요.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Brand Persona */}
                <Link href="/design-lab/brand" className="group">
                    <Card className="h-full border-2 hover:border-primary hover:shadow-lg transition-all">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <CardTitle className="text-2xl">Brand View</CardTitle>
                            <CardDescription>브랜드 광고주 경험 디자인</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> 크리에이터 탐색 (Moment Cards)</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> 캠페인 관리 리스트</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> 협업 워크스페이스</li>
                            </ul>
                            <Button className="w-full mt-4" variant="outline">
                                브랜드 랩 입장하기 <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </Link>

                {/* Creator Persona */}
                <Link href="/design-lab/creator" className="group">
                    <Card className="h-full border-2 hover:border-sidebar-primary hover:shadow-lg transition-all">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <User className="w-8 h-8" />
                            </div>
                            <CardTitle className="text-2xl">Creator View</CardTitle>
                            <CardDescription>인플루언서 크리에이터 경험 디자인</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-pink-400 rounded-full" /> 캠페인 찾기 (Campaign Cards)</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-pink-400 rounded-full" /> 내 모먼트 관리</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-pink-400 rounded-full" /> 수익 및 정산 관리</li>
                            </ul>
                            <Button className="w-full mt-4" variant="outline">
                                크리에이터 랩 입장하기 <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">
                    System Version: V2.1 (Live Context Integration)
                </p>
            </div>
        </div>
    )
}
