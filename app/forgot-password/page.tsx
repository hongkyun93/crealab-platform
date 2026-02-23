"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isSent, setIsSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) {
            setError("이메일을 입력해주세요.")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                setError(error.message)
            } else {
                setIsSent(true)
            }
        } catch (err: any) {
            setError(err.message || "오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
            <SiteHeader />
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">
                            {isSent ? "📧 이메일을 확인해주세요" : "🔑 비밀번호 찾기"}
                        </CardTitle>
                        <CardDescription>
                            {isSent
                                ? "비밀번호 재설정 링크를 발송했습니다."
                                : "가입 시 사용한 이메일 주소를 입력해주세요."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSent ? (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center space-y-4 py-4">
                                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            <strong className="text-foreground">{email}</strong>으로
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            비밀번호 재설정 링크를 보냈습니다.
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-4">
                                            이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => { setIsSent(false); setEmail("") }}
                                    >
                                        <Mail className="mr-2 h-4 w-4" />
                                        다른 이메일로 재발송
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push('/login')}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        로그인으로 돌아가기
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">이메일</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "발송 중..." : "비밀번호 재설정 링크 발송"}
                                </Button>

                                <div className="text-center">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        className="text-sm text-muted-foreground"
                                        onClick={() => router.push('/login')}
                                    >
                                        <ArrowLeft className="mr-1 h-3 w-3" />
                                        로그인으로 돌아가기
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
