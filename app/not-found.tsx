"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Search } from "lucide-react"

export default function NotFound() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">

            {/* 배경 장식 */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-48 -left-48 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
            </div>

            {/* 컨텐츠 */}
            <div
                className={`relative z-10 flex flex-col items-center text-center max-w-lg transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
                {/* 로고 */}
                <Link href="/" className="mb-10">
                    <Image
                        src="/logo.png"
                        alt="CreadyPick"
                        width={180}
                        height={36}
                        className="h-9 w-auto opacity-90 hover:opacity-100 transition-opacity"
                        priority
                    />
                </Link>

                {/* 404 숫자 */}
                <div className="relative mb-6">
                    <span
                        className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter text-transparent bg-clip-text"
                        style={{
                            backgroundImage: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.4) 100%)',
                        }}
                    >
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="h-12 w-12 sm:h-16 sm:w-16 text-primary/20" strokeWidth={1.5} />
                    </div>
                </div>

                {/* 메시지 */}
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                    페이지를 찾을 수 없어요
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-10 max-w-sm">
                    찾으시는 페이지가 이동했거나 삭제됐을 수 있습니다.
                    <br />
                    URL을 다시 확인하거나 홈으로 돌아가보세요.
                </p>

                {/* 버튼 */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        className="gap-2 sm:w-auto w-full"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        이전 페이지
                    </Button>
                    <Button
                        asChild
                        className="gap-2 sm:w-auto w-full"
                    >
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            홈으로 돌아가기
                        </Link>
                    </Button>
                </div>

                {/* 하단 링크 */}
                <div className="mt-12 flex items-center gap-4 text-xs text-muted-foreground">
                    <Link href="/brand" className="hover:text-foreground transition-colors">브랜드</Link>
                    <span>·</span>
                    <Link href="/creator" className="hover:text-foreground transition-colors">크리에이터</Link>
                    <span>·</span>
                    <Link href="/services" className="hover:text-foreground transition-colors">서비스 소개</Link>
                </div>
            </div>
        </div>
    )
}
