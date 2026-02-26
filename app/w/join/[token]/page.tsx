"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { BrandName } from "@/components/ui/brand-name"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ArrowRight, Building2, Sparkles } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function MagicLinkJoinPage({ params }: { params: { token: string } }) {
    const { token } = params
    const { user, isInitialized } = useAuth()
    const router = useRouter()

    const [status, setStatus] = useState<'checking' | 'needs_login' | 'validating' | 'success' | 'error'>('checking')
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        if (!isInitialized) return

        if (!user) {
            setStatus('needs_login')
            return
        }

        // User is logged in, attempt to validate the token
        validateToken()
    }, [user, isInitialized])

    const validateToken = async () => {
        setStatus('validating')
        try {
            const res = await fetch("/api/workspace/magic-link/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "검증에 실패했습니다.")
            }

            setStatus('success')
            toast.success("워크스페이스에 참여했습니다!")

            // Redirect to brand workspace
            setTimeout(() => {
                window.location.href = `/brand?view=workspace`
            }, 1500)

        } catch (error: any) {
            console.error("Validation error:", error)
            setStatus('error')
            setErrorMessage(error.message)
        }
    }

    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        setStatus('checking') // Show loading state
        try {
            const supabase = createClient()
            const redirectUrl = `${window.location.origin}/auth/callback?role_type=brand&next=/w/join/${token}`

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            })

            if (error) throw error
        } catch (err: any) {
            toast.error(err.message || "로그인 요청에 실패했습니다.")
            setStatus('needs_login')
        }
    }

    if (!isInitialized || status === 'checking') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-violet-600 to-purple-600 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:14px_24px]" />
                    <Sparkles className="h-12 w-12 text-white/50" />
                </div>

                <div className="p-8 pb-10 space-y-6 text-center">
                    <div className="-mt-14 mx-auto w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900 flex items-center justify-center text-violet-600">
                        <Building2 className="h-8 w-8" />
                    </div>

                    {status === 'success' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-bold text-green-600">환영합니다!</h2>
                            <p className="text-muted-foreground text-sm">
                                워크스페이스 참여가 완료되었습니다.<br />
                                잠시 후 대시보드로 이동합니다.
                            </p>
                            <Loader2 className="h-6 w-6 animate-spin text-green-600 mx-auto mt-4" />
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-bold text-red-600">참여할 수 없습니다</h2>
                            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900/50 p-3 rounded-lg text-sm">
                                {errorMessage}
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push('/')}
                            >
                                홈으로 돌아가기
                            </Button>
                        </div>
                    )}

                    {status === 'validating' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">초대 정보 확인 중...</h2>
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        </div>
                    )}

                    {status === 'needs_login' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">비공개 워크스페이스 초대</h2>
                                <p className="text-muted-foreground text-sm">
                                    <BrandName /> 크리에이터 협업 공간으로<br />
                                    초대받으셨습니다. 3초만에 가입 및 입장이 완료됩니다.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button
                                    onClick={() => handleSocialLogin('kakao')}
                                    className="w-full h-12 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#000000] font-medium text-[15px] flex items-center justify-center gap-2 shadow-sm relative overflow-hidden group border-0"
                                >
                                    <div className="w-6 h-6 flex items-center justify-center bg-black/5 rounded-md transition-colors group-hover:bg-black/10">
                                        <Image src="/kakao-icon.svg" alt="Kakao" width={18} height={18} />
                                    </div>
                                    <span className="flex-1 text-center font-semibold">카카오로 1초 만에 시작하기</span>
                                </Button>
                                <Button
                                    onClick={() => handleSocialLogin('google')}
                                    variant="outline"
                                    className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 font-medium text-[15px] flex items-center justify-center gap-2 shadow-sm relative overflow-hidden group border-slate-200 dark:bg-transparent dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                                >
                                    <div className="w-6 h-6 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-md transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-700">
                                        <Image src="/google-icon.svg" alt="Google" width={18} height={18} />
                                    </div>
                                    <span className="flex-1 text-center font-semibold text-slate-900 dark:text-slate-100">Google로 시작하기</span>
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground pt-4 border-t">
                                로그인 시 기존 계정(있을 경우)과 연결되거나,<br />
                                <strong>브랜드 파트너</strong>로 자동 신규 가입됩니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
