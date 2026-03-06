import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

// 정식 런칭 시: 이 파일 삭제하고 _content.tsx 를 page.tsx 로 복사
export default function HomePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">

            {/* 헤더 */}
            <header className="border-b px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
                <Link href="/">
                    <Image src="/logo.png" alt="CreadyPick" width={180} height={36} className="h-9 w-auto" priority />
                </Link>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/login">로그인</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/signup">회원가입</Link>
                    </Button>
                </div>
            </header>

            {/* 메인 */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-2xl mx-auto w-full space-y-8">

                {/* 뱃지 */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    크리에이터 × 브랜드 협업 플랫폼
                </div>

                {/* 타이틀 */}
                <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                        협업의 새로운 기준,
                        <br />
                        <span className="text-primary">CreadyPick</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                        크리에이터와 브랜드를 연결하는 스마트한 협업 플랫폼입니다.
                        지금 바로 시작해보세요.
                    </p>
                </div>

                {/* CTA 버튼 */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button size="lg" asChild className="gap-2 h-12 px-8">
                        <Link href="/signup">
                            무료로 시작하기
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="h-12 px-8">
                        <Link href="/login">로그인하기</Link>
                    </Button>
                </div>

                {/* 역할 선택 */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm pt-4">
                    <Link
                        href="/creator"
                        className="p-4 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
                    >
                        <div className="text-2xl mb-2">✨</div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">크리에이터</p>
                        <p className="text-xs text-muted-foreground mt-1">대시보드 바로가기</p>
                    </Link>
                    <Link
                        href="/brand"
                        className="p-4 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-center group"
                    >
                        <div className="text-2xl mb-2">🏢</div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">브랜드</p>
                        <p className="text-xs text-muted-foreground mt-1">대시보드 바로가기</p>
                    </Link>
                </div>
            </main>

            {/* 푸터 */}
            <footer className="border-t py-6 text-center text-xs text-muted-foreground">
                © 2025 CreadyPick. All rights reserved.
            </footer>
        </div>
    )
}
