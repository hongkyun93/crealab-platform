"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function DebugContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")
    const message = searchParams.get("message")

    return (
        <div className="container max-w-lg py-20">
            <Card className="border-red-500/50 shadow-lg">
                <CardHeader className="bg-red-500/10">
                    <CardTitle className="text-red-700">로그인 디버깅 정보</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="p-4 bg-muted rounded-md font-mono text-xs break-all whitespace-pre-wrap">
                        <strong>Error Message:</strong>
                        <div className="mt-2 text-red-600">{message}</div>

                        <div className="my-4 border-t border-dashed" />

                        <strong>Raw Error Object:</strong>
                        <div className="mt-2 text-muted-foreground">{error}</div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        위 에러 내용을 봇에게 알려주세요.
                    </div>

                    <Button asChild className="w-full">
                        <Link href="/login">로그인으로 돌아가기</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default function DebugPage() {
    return (
        <Suspense fallback={<div>Loading debug info...</div>}>
            <DebugContent />
        </Suspense>
    )
}
