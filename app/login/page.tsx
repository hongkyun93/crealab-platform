"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginTestPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    // Helper for timeout
    const loginWithTimeout = async (payload: any) => {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("로그인 요청 시간 초과 (30초) - 연결 상태를 확인해주세요.")), 30000)
        )
        const loginPromise = supabase.auth.signInWithPassword(payload)
        return Promise.race([loginPromise, timeoutPromise]) as Promise<{ data: any; error: any }>
    }

    const handleLogin = async (email: string, roleName: string) => {
        console.log(`[Login] Starting login for ${roleName} (${email})`)
        setLoading(roleName)
        try {
            console.log(`[Login] Attempting password '12341234'...`)
            const { data, error } = await loginWithTimeout({
                email,
                password: "12341234",
            })

            console.log(`[Login] Success! Logged in as ${roleName}`, data.user?.id)

            // Refetch to ensure session is active before redirect
            await supabase.auth.refreshSession() // Explicit refresh

            // Redirect based on role logic
            if (roleName === "Kim Sumin") {
                console.log(`[Login] Redirecting to /creator...`)
                window.location.href = "/creator"
            } else if (roleName === "Voib" || roleName === "365mc") {
                console.log(`[Login] Redirecting to /brand...`)
                window.location.href = "/brand"
            } else if (roleName === "Admin") {
                console.log(`[Login] Redirecting to /admin...`)
                window.location.href = "/admin"
            } else {
                console.log(`[Login] Redirecting to reload...`)
                window.location.reload()
            }
        } catch (e: any) {
            console.error(`[Login] Exception caught:`, e)
            alert(`로그인 실패: ${e.message}`)
        } finally {
            console.log(`[Login] Finally block executed. Clearing loading state.`)
            setLoading(null)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-100 p-4">
            <h1 className="text-2xl font-bold mb-8">🛠️ 개발용 로그인 바로가기</h1>

            <div className="grid gap-4 w-full max-w-md">
                <Button
                    size="lg"
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold h-16 text-lg"
                    onClick={() => handleLogin('soomin@love.com', 'Kim Sumin')}
                    disabled={!!loading}
                >
                    {loading === 'Kim Sumin' ? '로그인 중...' : '👩‍🎤 김수민으로 로그인 (크리에이터)'}
                </Button>

                <Button
                    size="lg"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-16 text-lg"
                    onClick={() => handleLogin('voib@brand.com', 'Voib')}
                    disabled={!!loading}
                >
                    {loading === 'Voib' ? '로그인 중...' : '🏢 보이브로 로그인 (브랜드)'}
                </Button>

                <Button
                    size="lg"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-16 text-lg"
                    onClick={() => handleLogin('365mc@brand.com', '365mc')}
                    disabled={!!loading}
                >
                    {loading === '365mc' ? '로그인 중...' : '🏥 365mc로 로그인 (브랜드)'}
                </Button>

                <Button
                    size="lg"
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold h-16 text-lg"
                    onClick={() => handleLogin('admin@creadypick.com', 'Admin')} // Placeholder admin email
                    disabled={!!loading}
                >
                    {loading === 'Admin' ? '로그인 중...' : '👮 관리자로 로그인'}
                </Button>
            </div>

            <div className="mt-8 text-sm text-slate-500">
                * 비밀번호는 `12341234`로 자동 시도합니다.
            </div>
            <div className="mt-4 text-xs text-slate-400">
                Note: Original Login Page backed up to <code>app/login/page.original.tsx</code>
            </div>
        </div>
    )
}
