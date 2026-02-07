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
            setTimeout(() => reject(new Error("로그인 요청 시간 초과 (10초)")), 10000)
        )
        const loginPromise = supabase.auth.signInWithPassword(payload)
        return Promise.race([loginPromise, timeoutPromise]) as Promise<{ data: any; error: any }>
    }

    const handleLogin = async (email: string, roleName: string) => {
        console.log(`[Login] Starting login for ${roleName} (${email})`)
        setLoading(roleName)
        try {
            console.log(`[Login] Attempting password 'password'...`)
            // Priority 1: 'password'
            let { data, error } = await loginWithTimeout({
                email,
                password: "password",
            })

            if (error) {
                console.warn(`[Login] 'password' failed:`, error.message)
                console.log(`[Login] Trying '12341234'...`)
                // Priority 2: '12341234'
                const res2 = await loginWithTimeout({
                    email,
                    password: "12341234",
                })
                error = res2.error
                data = res2.data

                if (error) {
                    console.warn(`[Login] '12341234' failed:`, error.message)
                    console.log(`[Login] Trying '1234'...`)
                    // Priority 3: '1234'
                    const res3 = await loginWithTimeout({
                        email,
                        password: "1234",
                    })
                    error = res3.error
                    data = res3.data
                }
            }

            if (error) {
                console.error(`[Login] All password attempts failed for ${email}`)
                throw error
            }

            console.log(`[Login] Success! Logged in as ${roleName}`, data.user?.id)

            // Refetch to ensure session is active before redirect
            await supabase.auth.refreshSession() // Explicit refresh

            // Redirect based on role logic
            if (roleName === "Kim Sumin") {
                console.log(`[Login] Redirecting to /creator...`)
                router.push("/creator")
            } else if (roleName === "Voib") {
                console.log(`[Login] Redirecting to /brand...`)
                router.push("/brand")
            } else if (roleName === "Admin") {
                console.log(`[Login] Redirecting to /admin...`)
                router.push("/admin")
            } else {
                console.log(`[Login] Redirecting to refresh...`)
                router.refresh()
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
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold h-16 text-lg"
                    onClick={() => handleLogin('admin@creadypick.com', 'Admin')} // Placeholder admin email
                    disabled={!!loading}
                >
                    {loading === 'Admin' ? '로그인 중...' : '👮 관리자로 로그인'}
                </Button>
            </div>

            <div className="mt-8 text-sm text-slate-500">
                * 비밀번호는 `password`, `12341234`, `1234` 순서로 자동 시도합니다.
            </div>
            <div className="mt-4 text-xs text-slate-400">
                Note: Original Login Page backed up to <code>app/login/page.original.tsx</code>
            </div>
        </div>
    )
}
