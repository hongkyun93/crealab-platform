"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginTestPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleLogin = async (email: string, roleName: string) => {
        setLoading(roleName)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password: "12341234",
            })

            if (error) {
                throw error
            }

            console.log(`[LoginTest] Success! Logged in as ${roleName}`)

            // Redirect based on role logic
            if (roleName === "Kim Sumin") {
                window.location.href = "/creator"
            } else if (roleName === "Voib") {
                window.location.href = "/brand"
            } else if (roleName === "Admin") {
                window.location.href = "/admin"
            } else {
                window.location.reload()
            }
        } catch (e: any) {
            alert(`로그인 실패: ${e.message}`)
        } finally {
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
                * 비밀번호는 `12341234`로 자동 시도합니다.
            </div>
        </div>
    )
}
