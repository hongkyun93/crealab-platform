"use client"
// Updated: 2026-02-03 20:47 - Force cache invalidation

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { usePlatform } from "@/components/providers/platform-provider"
import { AlertCircle, ArrowRight, Briefcase, UserCircle2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
    const router = useRouter()
    const { login } = usePlatform()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    // We can use same state for both forms since they replace each other
    const [id, setId] = useState("")
    const [password, setPassword] = useState("")

    const handleSocialLogin = async (provider: 'google' | 'kakao', role: 'brand' | 'influencer') => {
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
            if (user.type === "brand") {
                router.push("/brand")
            } else if (user.type === "influencer") {
                router.push("/creator")
            } else if (user.type === "admin") {
                router.push("/admin")
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
                <Tabs defaultValue="creator" className="w-full max-w-md">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="creator">크리에이터</TabsTrigger>
                        <TabsTrigger value="brand">브랜드</TabsTrigger>
                    </TabsList>

                    <TabsContent value="creator">
                        <div className="mb-6 text-center">
                            <Button
                                variant="destructive"
                                size="lg"
                                className="w-full h-12 text-lg font-bold animate-pulse shadow-xl border-2 border-red-500"
                                onClick={() => router.push('/login_test')}
                            >
                                🚀 개발용 로그인 바로가기 (CLICK ME)
                            </Button>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <UserCircle2 className="h-6 w-6 text-indigo-500" />
                                    크리에이터 로그인
                                </CardTitle>
                                <CardDescription>
                                    구글/카카오 로그인 시 3초 만에 회원가입이 완료됩니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="creator-id">아이디</Label>
                                        <Input
                                            id="creator-id"
                                            placeholder="creator1"
                                            value={id}
                                            onChange={(e) => setId(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="creator-pw">비밀번호</Label>
                                        <Input
                                            id="creator-pw"
                                            type="password"
                                            placeholder="1234"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}
                                    <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" disabled={isLoading}>
                                        {isLoading ? "로그인 중..." : "로그인하기"}
                                    </Button>

                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">
                                                Or continue with
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" type="button" onClick={() => handleSocialLogin('google', 'influencer')}>
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
                                        <Button variant="outline" type="button" className="bg-[#FAE100] hover:bg-[#FAE100]/90 text-black border-none" onClick={() => handleSocialLogin('kakao', 'influencer')}>
                                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 3C6.48 3 2 6.48 2 10.77C2 13.56 3.82 16.03 6.62 17.38L5.68 20.91C5.6 21.2 5.92 21.43 6.16 21.28L10.64 18.25C11.08 18.29 11.54 18.32 12 18.32C17.52 18.32 22 14.84 22 10.55C22 6.26 17.52 3 12 3Z" />
                                            </svg>
                                            Kakao
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter>
                                <div className="text-xs text-muted-foreground text-center w-full">
                                    <span className="font-semibold">테스트 계정:</span> creator1 / 1234
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="brand">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Briefcase className="h-6 w-6 text-blue-500" />
                                    브랜드 로그인
                                </CardTitle>
                                <CardDescription>
                                    구글/카카오 로그인 시 3초 만에 회원가입이 완료됩니다.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="brand-id">아이디</Label>
                                        <Input
                                            id="brand-id"
                                            placeholder="brand1"
                                            value={id}
                                            onChange={(e) => setId(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brand-pw">비밀번호</Label>
                                        <Input
                                            id="brand-pw"
                                            type="password"
                                            placeholder="1234"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}
                                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700" disabled={isLoading}>
                                        {isLoading ? "로그인 중..." : "로그인하기"}
                                    </Button>

                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">
                                                Or continue with
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" type="button" onClick={() => handleSocialLogin('google', 'brand')}>
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
                                        <Button variant="outline" type="button" className="bg-[#FAE100] hover:bg-[#FAE100]/90 text-black border-none" onClick={() => handleSocialLogin('kakao', 'brand')}>
                                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 3C6.48 3 2 6.48 2 10.77C2 13.56 3.82 16.03 6.62 17.38L5.68 20.91C5.6 21.2 5.92 21.43 6.16 21.28L10.64 18.25C11.08 18.29 11.54 18.32 12 18.32C17.52 18.32 22 14.84 22 10.55C22 6.26 17.52 3 12 3Z" />
                                            </svg>
                                            Kakao
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter>
                                <div className="text-xs text-muted-foreground text-center w-full">
                                    <span className="font-semibold">테스트 계정:</span> brand1 / 1234
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
