"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ErrorDetails() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    if (!error) return null

    return (
        <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600 font-mono break-all">
            {error}
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
            <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-6 rounded-lg border bg-card p-8 text-center shadow-lg">
                <div className="rounded-full bg-red-100 p-3">
                    <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    로그인 오류
                </h1>
                <div className="text-muted-foreground">
                    <p>인증 과정에서 문제가 발생했습니다.</p>
                    <Suspense fallback={<div>Loading error details...</div>}>
                        <ErrorDetails />
                    </Suspense>
                    <p className="mt-2 text-sm">잠시 후 다시 시도해주시거나, 관리자에게 문의해주세요.</p>
                </div>
                <div className="flex gap-4">
                    <Button asChild variant="outline">
                        <Link href="/">홈으로</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/login">로그인 다시 시도</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
