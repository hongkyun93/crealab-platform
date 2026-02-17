"use client"
// Updated: 2026-02-03 20:47 - Force cache invalidation

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { AlertCircle, ArrowRight, Briefcase, UserCircle2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
    const router = useRouter()
    const { login } = useUnifiedProvider()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    // We can use same state for both forms since they replace each other
    const [id, setId] = useState("")
    const [password, setPassword] = useState("")

    const handleSocialLogin = async (provider: 'google' | 'kakao', role: 'brand' | 'creator') => {
        setIsLoading(true)
        setError("")
        try {
            const supabase = createClient()
            const redirectUrl = `${window.location.origin}/auth/callback?role_type=${role}`

            console.log('[OAuth Debug] Starting Social Login...', { provider, role, redirectUrl })

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })

            console.log('[OAuth Debug] signInWithOAuth returned:', { data, error })

            if (error) {
                console.error('[OAuth Error] signInWithOAuth error:', error)
                setError(error.message)
                setIsLoading(false)
            } else if (data?.url) {
                console.log('[OAuth Debug] Success! Redirecting to:', data.url)
                // The browser should redirect automatically, but we can log the URL
            } else {
                console.log('[OAuth Debug] No error but no redirect URL either.')
                setIsLoading(false)
            }
        } catch (err: any) {
            console.error('[OAuth Exception] Caught exception:', err)
            setError(err.message || "알 수 없는 오류가 발생했습니다.")
            setIsLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const user = await login(id, password)

            // Redirect based on user type
            // Redirect based on user type using window.location.href to force a hard reload
            // This prevents "stuck" loading states caused by client-side router waiting for heavy dashboard data
            if (user.role === 'brand') {
                router.push('/brand')
            } else if (user.role === 'mcn') {
                router.push('/creator') // MCN goes to creator dashboard
            } else if (user.role === 'agency') {
                router.push('/brand') // Agency goes to brand dashboard
            } else {
                router.push('/creator')
            }
        } catch (err: any) {
            setError(err.message || "로그인에 실패했습니다.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container flex items-center justify-center py-20 min-h-[80vh]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Briefcase className="h-6 w-6 text-primary" />
                            로그인
                        </CardTitle>
                        <CardDescription>
                            이메일 또는 소셜 계정으로 로그인하세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>


                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">비밀번호</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {error && (
                                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {/* Quick Dev Login Buttons */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="space-y-2 p-3 bg-muted rounded-lg border-2 border-dashed">
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">⚡ 빠른 로그인 (개발용)</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setId('creator1@creadypick.com')
                                                setPassword('12341234')
                                            }}
                                        >
                                            크리에이터
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setId('employee1@creadypick.com')
                                                setPassword('12341234')
                                            }}
                                        >
                                            직원
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => {
                                                setId('voib@brand.com')
                                                setPassword('12341234')
                                            }}
                                        >
                                            브랜드
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                                {isLoading ? "로그인 중..." : "로그인하기"}
                            </Button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        또는 소셜 계정으로 로그인
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" type="button" onClick={() => handleSocialLogin('google', 'creator')}>
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </Button>
                                <Button variant="outline" type="button" className="bg-[#FAE100] hover:bg-[#FAE100]/90 text-black border-none" onClick={() => handleSocialLogin('kakao', 'creator')}>
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 3C6.48 3 2 6.48 2 10.77C2 13.56 3.82 16.03 6.62 17.38L5.68 20.91C5.6 21.2 5.92 21.43 6.16 21.28L10.64 18.25C11.08 18.29 11.54 18.32 12 18.32C17.52 18.32 22 14.84 22 10.55C22 6.26 17.52 3 12 3Z" />
                                    </svg>
                                    Kakao
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 border-t pt-6">
                        <div className="text-center text-sm text-muted-foreground">
                            계정이 없으신가요?{" "}
                            <Button variant="link" className="p-0 h-auto font-semibold text-primary" onClick={() => router.push('/signup')}>
                                회원가입하기
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </main>
        </div>
    )
}
