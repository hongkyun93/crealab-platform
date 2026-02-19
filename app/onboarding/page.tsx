"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/components/providers/auth-provider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Mail, Check, Building2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

type UserRole = 'brand' | 'creator' | 'mcn' | 'agency'

interface Invitation {
    id: string
    team_name: string
    role: string
    created_at: string
}

export default function OnboardingPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [step, setStep] = useState<1 | 2>(1)
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [teamName, setTeamName] = useState("")
    const [isCheckingInvites, setIsCheckingInvites] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        if (selectedRole === 'mcn' || selectedRole === 'agency') {
            checkInvitations()
        }
    }, [selectedRole])

    const checkInvitations = async () => {
        setIsCheckingInvites(true)
        try {
            // Set a timeout of 5 seconds to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), 5000)
            )

            const rpcPromise = supabase.rpc('get_my_invitations')

            const { data, error } = await Promise.race([rpcPromise, timeoutPromise]) as any

            if (error) throw error
            setInvitations(data || [])
        } catch (error) {
            console.error("Failed to fetch invitations:", error)
            // Optional: toast.error("초대 목록을 불러오지 못했습니다.")
        } finally {
            setIsCheckingInvites(false)
        }
    }

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role)
        if (role === 'brand' || role === 'creator') {
            // Creators and Brands SKIP team setup
            completeOnboarding(role)
        } else {
            // Only MCN/Agency goes to Step 2 (Team Setup)
            setStep(2)
        }
    }

    const completeOnboarding = async (role: UserRole) => {
        if (!user) return
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    role: role,
                    onboarding_completed: true,
                })
                .eq('id', user.id)

            if (error) throw error

            toast.success("환영합니다!")

            // window.location.href 사용: 전체 페이지 로드로 proxy.ts가 최신 DB role을 올바르게 읽음
            // router.push는 클라이언트 사이드 이동이라 쿠키 갱신 전 proxy가 role=null로 읽을 수 있음
            window.location.href = role === 'brand' ? '/brand' : '/creator'
        } catch (error) {
            console.error('Error updating role:', error)
            toast.error('오류가 발생했습니다.')
            setIsLoading(false)
        }
    }

    const handleAcceptInvite = async (inviteId: string) => {
        if (!user || !selectedRole) return
        setIsLoading(true)
        try {
            // 1. Set Role First
            await supabase.from('profiles').update({ role: selectedRole, onboarding_completed: true }).eq('id', user.id)

            // 2. Accept Invite
            const { error } = await supabase.rpc('accept_invitation', { invitation_id: inviteId })
            if (error) throw error

            toast.success("팀에 합류했습니다!")
            window.location.href = '/creator'
        } catch (error) {
            console.error('Invite accept error:', error)
            toast.error('초대 수락 실패')
            setIsLoading(false)
        }
    }

    const handleCreateTeam = async () => {
        if (!user || !selectedRole || !teamName.trim()) return
        setIsLoading(true)
        try {
            // 1. Set Role
            await supabase.from('profiles').update({ role: selectedRole, onboarding_completed: true }).eq('id', user.id)

            // 2. Create Team
            // Note: The 'handle_new_team' trigger automatically adds the creator as 'owner' in team_members
            const slug = teamName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000)
            const { data: team, error: teamError } = await supabase
                .from('teams')
                .insert({
                    name: teamName,
                    slug: slug,
                    // created_by is automatically set to auth.uid() by default value
                })
                .select()
                .single()

            if (teamError) throw teamError

            toast.success("팀을 생성했습니다!")
            window.location.href = '/creator'
        } catch (error) {
            console.error('Team creation error:', error)
            toast.error('팀 생성 실패')
            setIsLoading(false)
        }
    }

    const handleSkipTeam = async () => {
        if (!selectedRole) return
        // Just set role and finish. User will be teamless.
        completeOnboarding(selectedRole)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="max-w-4xl w-full p-8 space-y-8">
                {step === 1 && (
                    <>
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold">환영합니다! 어떤 역할로 가입하시겠습니까?</h1>
                            <p className="text-gray-500">서비스 이용을 위해 역할을 선택해주세요.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Creator Role */}
                            <div
                                className={`cursor-pointer p-6 border-2 rounded-xl transition-all hover:border-black dark:hover:border-white ${selectedRole === 'creator' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                onClick={() => handleRoleSelect('creator')}
                            >
                                <div className="text-4xl mb-4">🎬</div>
                                <h3 className="text-xl font-bold mb-2">Creator</h3>
                                <p className="text-sm text-muted-foreground">콘텐츠를 제작하고<br />브랜드와 협업합니다.</p>
                            </div>

                            {/* Brand Role */}
                            <div
                                className={`cursor-pointer p-6 border-2 rounded-xl transition-all hover:border-black dark:hover:border-white ${selectedRole === 'brand' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                onClick={() => handleRoleSelect('brand')}
                            >
                                <div className="text-4xl mb-4">🏢</div>
                                <h3 className="text-xl font-bold mb-2">Brand</h3>
                                <p className="text-sm text-muted-foreground">캠페인을 생성하고<br />크리에이터를 모집합니다.</p>
                            </div>

                            {/* MCN Role */}
                            <div
                                className={`cursor-pointer p-6 border-2 rounded-xl transition-all hover:border-black dark:hover:border-white ${selectedRole === 'mcn' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                onClick={() => handleRoleSelect('mcn')}
                            >
                                <div className="text-4xl mb-4">🏭</div>
                                <h3 className="text-xl font-bold mb-2">MCN</h3>
                                <p className="text-sm text-muted-foreground">소속 크리에이터를<br />관리하고 지원합니다.</p>
                            </div>

                            {/* Agency Role */}
                            <div
                                className={`cursor-pointer p-6 border-2 rounded-xl transition-all hover:border-black dark:hover:border-white ${selectedRole === 'agency' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                onClick={() => handleRoleSelect('agency')}
                            >
                                <div className="text-4xl mb-4">💼</div>
                                <h3 className="text-xl font-bold mb-2">Agency</h3>
                                <p className="text-sm text-muted-foreground">다양한 브랜드의<br />마케팅을 대행합니다.</p>
                            </div>
                        </div>
                    </>
                )}

                {step === 2 && (selectedRole === 'mcn' || selectedRole === 'agency') && (
                    <div className="max-w-md mx-auto space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold">조직(Team) 설정</h2>
                            <p className="text-muted-foreground">함께 일할 팀을 찾거나 새로 만드세요.</p>
                        </div>

                        {/* Invitation Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Mail className="w-4 h-4" /> 받은 초대
                            </h3>
                            {isCheckingInvites ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : invitations.length > 0 ? (
                                <div className="space-y-3">
                                    {invitations.map(invite => (
                                        <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                            <div>
                                                <p className="font-medium text-lg">{invite.team_name}</p>
                                                <p className="text-sm text-muted-foreground">초대받은 역할: {invite.role}</p>
                                            </div>
                                            <Button onClick={() => handleAcceptInvite(invite.id)} disabled={isLoading}>
                                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '수락 및 합류'}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                                    도착한 초대가 없습니다.
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">배경이 없으신가요?</span>
                            </div>
                        </div>

                        {/* Create Team Section */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> 새 조직 만들기
                            </h3>
                            <div className="space-y-3">
                                <Label htmlFor="team-name">조직 이름</Label>
                                <Input
                                    id="team-name"
                                    placeholder="예: 샌드박스 네트워크"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                />
                                <Button
                                    className="w-full"
                                    onClick={handleCreateTeam}
                                    disabled={!teamName.trim() || isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    팀 생성하고 시작하기
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">또는</span>
                            </div>
                        </div>

                        {/* Skip Section */}
                        <div className="text-center">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={handleSkipTeam}>
                                지금은 건너뛰기 (나중에 합류) <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
