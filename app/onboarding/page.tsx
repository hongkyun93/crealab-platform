"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/components/providers/auth-provider"

type UserRole = 'brand' | 'creator' | 'mcn' | 'agency'

export default function OnboardingPage() {
    const router = useRouter()
    const { user, refreshSession } = useAuth()
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role)
    }

    const handleSubmit = async () => {
        if (!selectedRole || !user) return

        setIsLoading(true)
        try {
            // Update profile with selected role AND mark onboarding as completed
            const { error } = await supabase
                .from('profiles')
                .update({
                    role: selectedRole,
                    onboarding_completed: true, // ⭐ Mark onboarding as completed
                    // Map old user_type for backward compatibility if needed
                    user_type: selectedRole === 'brand' || selectedRole === 'agency' || selectedRole === 'mcn' ? 'brand' : 'creator'
                })
                .eq('id', user.id)

            if (error) throw error

            console.log('[Onboarding] Role selected:', selectedRole, '- Onboarding completed!')

            // Refresh session to update context
            await refreshSession()

            // Redirect based on role
            if (selectedRole === 'brand' || selectedRole === 'agency') {
                router.push('/brand')
            } else if (selectedRole === 'mcn') {
                router.push('/creator') // MCN uses creator dashboard
            } else {
                router.push('/creator')
            }
        } catch (error) {
            console.error('Error updating role:', error)
            alert('역할 설정 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="max-w-4xl w-full p-8 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">환영합니다! 어떤 역할로 가입하시겠습니까?</h1>
                    <p className="text-gray-500">서비스 이용을 위해 역할을 선택해주세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Creator Role */}
                    <div
                        className={`cursor-pointer p-6 border-2 rounded-xl transition-all hover:border-black dark:hover:border-white ${selectedRole === 'creator' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200'}`}
                        onClick={() => handleRoleSelect('creator')}
                    >
                        <div className="text-4xl mb-4">🎬</div>
                        <h3 className="text-xl font-bold mb-2">Creator</h3>
                        <p className="text-sm text-gray-500">콘텐츠를 제작하고<br />브랜드와 협업합니다.</p>
                    </div>

                    {/* Brand Role */}
                    <div
                        className={`cursor-pointer p-6 border-2 rounded-xl transition-all hover:border-black dark:hover:border-white ${selectedRole === 'brand' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200'}`}
                        onClick={() => handleRoleSelect('brand')}
                    >
                        <div className="text-4xl mb-4">🏢</div>
                        <h3 className="text-xl font-bold mb-2">Brand</h3>
                        <p className="text-sm text-gray-500">캠페인을 생성하고<br />크리에이터를 모집합니다.</p>
                    </div>

                    {/* MCN Role */}
                    <div
                        className={`cursor-pointer p-6 border-2 rounded-xl transition-all hover:border-black dark:hover:border-white ${selectedRole === 'mcn' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200'}`}
                        onClick={() => handleRoleSelect('mcn')}
                    >
                        <div className="text-4xl mb-4">🏭</div>
                        <h3 className="text-xl font-bold mb-2">MCN</h3>
                        <p className="text-sm text-gray-500">소속 크리에이터를<br />관리하고 지원합니다.</p>
                    </div>

                    {/* Agency Role */}
                    <div
                        className={`cursor-pointer p-6 border-2 rounded-xl transition-all hover:border-black dark:hover:border-white ${selectedRole === 'agency' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200'}`}
                        onClick={() => handleRoleSelect('agency')}
                    >
                        <div className="text-4xl mb-4">💼</div>
                        <h3 className="text-xl font-bold mb-2">Agency</h3>
                        <p className="text-sm text-gray-500">다양한 브랜드의<br />마케팅을 대행합니다.</p>
                    </div>
                </div>

                <div className="flex justify-center pt-8">
                    <Button
                        size="lg"
                        className="w-full max-w-sm text-lg h-12"
                        disabled={!selectedRole || isLoading}
                        onClick={handleSubmit}
                    >
                        {isLoading ? '설정 중...' : '시작하기'}
                    </Button>
                </div>
            </Card>
        </div>
    )
}
