"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        // Supabase sends recovery token via hash fragment or handles it through onAuthStateChange
        const supabase = createClient()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsReady(true)
            }
        })

        // Also check if we already have a session (page might have loaded with recovery token already processed)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsReady(true)
            }
        })

        // Timeout: if no recovery event within 5 seconds, show error
        const timer = setTimeout(() => {
            setIsReady(prev => {
                if (!prev) setError("유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 시도해주세요.")
                return prev
            })
        }, 5000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timer)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password.length < 8) {
            setError("비밀번호는 8자 이상이어야 합니다.")
            return
        }
        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({ password })

            if (error) {
                setError(error.message)
            } else {
                setIsSuccess(true)
                // Auto redirect after 3 seconds
                setTimeout(() => router.push('/login'), 3000)
            }
        } catch (err: any) {
            setError(err.message || "오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <SiteHeader />
            <main className="flex items-center justify-center px-4 py-24">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">
                            {isSuccess ? "✅ 비밀번호가 변경되었습니다" : "🔐 새 비밀번호 설정"}
                        </CardTitle>
                        <CardDescription>
                            {isSuccess
                                ? "잠시 후 로그인 페이지로 이동합니다."
                                : "새로운 비밀번호를 입력해주세요."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSuccess ? (
                            <div className="flex flex-col items-center space-y-4 py-4">
                                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    새 비밀번호로 로그인해주세요.
                                </p>
                                <Button onClick={() => router.push('/login')}>
                                    로그인하기
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">새 비밀번호</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="8자 이상 입력"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading || !isReady}
                                            autoFocus
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">비밀번호 확인</Label>
                                    <Input
                                        id="confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="비밀번호를 다시 입력"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isLoading || !isReady}
                                    />
                                </div>

                                {/* Password strength indicator */}
                                {password.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-red-400'}`} />
                                            <div className={`h-1 flex-1 rounded ${password.length >= 12 ? 'bg-green-500' : 'bg-muted'}`} />
                                            <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-muted'}`} />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {password.length < 8 ? "8자 이상 입력해주세요" : password.length < 12 ? "적절한 비밀번호입니다" : "강력한 비밀번호입니다"}
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={isLoading || !isReady}>
                                    {isLoading ? "변경 중..." : !isReady ? "링크 확인 중..." : "비밀번호 변경"}
                                </Button>

                                {!isReady && !error && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        이메일 링크를 통해 접속해야 합니다.
                                    </p>
                                )}
                            </form>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
