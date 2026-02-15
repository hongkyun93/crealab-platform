"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/providers/auth-provider"
import { Loader2, Users, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function JoinTeamPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isInitialized, login, supabase } = useAuth()
    // const supabase = createClient() // Removed local volatile instance

    const code = params.code as string

    const [isLoading, setIsLoading] = useState(true)
    const [isValid, setIsValid] = useState(false)
    const [teamInfo, setTeamInfo] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [isJoining, setIsJoining] = useState(false)

    // Check invitation validity
    useEffect(() => {
        const checkInvitation = async () => {
            if (!code) return

            setIsLoading(true)
            try {
                // 1. Fetch invitation
                const { data: invite, error: inviteError } = await supabase
                    .from('team_invitations')
                    .select('*, profiles:created_by(id, display_name, email, avatar_url)') // Assuming created_by is the MCN user
                    .eq('invite_code', code)
                    .single()

                if (inviteError || !invite) {
                    setError("유효하지 않거나 만료된 초대 링크입니다.")
                    setIsValid(false)
                    return
                }

                // 2. Check expiration
                if (new Date(invite.expires_at) < new Date()) {
                    setError("이미 만료된 초대 링크입니다.")
                    setIsValid(false)
                    return
                }

                // 3. Set Team Info
                // Assuming team_id corresponds to the MCN's profile ID if they are the owner
                // Or we fetch team profile if 'teams' table exists. 
                // Based on previous analysis, MCN User ID often acts as Team ID.
                // Let's use the profile of the creator (MCN) as the Team Name source.

                const mcnProfile = invite.profiles
                setTeamInfo({
                    id: invite.team_id,
                    name: mcnProfile?.display_name || mcnProfile?.email || "Unknown Team",
                    owner: mcnProfile?.display_name,
                    avatar: mcnProfile?.avatar_url
                })
                setIsValid(true)

            } catch (err) {
                console.error("Invitation Check Error:", err)
                setError("치명적인 오류가 발생했습니다.")
            } finally {
                setIsLoading(false)
            }
        }

        checkInvitation()
    }, [code, supabase])

    const handleJoin = async () => {
        if (!user) {
            // Store return URL and redirect to login
            const returnUrl = `/join/${code}`
            // router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`) 
            // Better: Just redirect to login, user can come back if they remember. 
            // Ideally auth-provider handles returnUrl.
            router.push('/login')
            toast.error("먼저 로그인해주세요.")
            return
        }

        if (user.type !== 'creator') {
            // Optional: Allow only creators? Or anyone?
            // MCN joining another MCN? Probably not.
            if (user.type === 'mcn' || user.type === 'brand') {
                toast.error("크리에이터 계정만 팀에 합류할 수 있습니다.")
                return
            }
        }

        setIsJoining(true)
        try {
            // 1. Check if already a member is handled by RPC or we can keep it for UI feedback speed.
            // RPC handles it, but let's keep the UI check if we want immediate feedback before calling RPC?
            // Actually, RPC is better. Let's remove the manual check to reduce round trips and rely on RPC.
            // RPC throws error or returns success: false?
            // My RPC returns jsonb but raises exception on failure? 
            // Wait, I implemented "RETURN jsonb... 'Already a member'" for existing member.
            // And RAISE EXCEPTION for invalid code.

            // Attempting to join... RPC will return success: true even if already member (with message).
            // Let's rely on RPC.

            // 2. Join via RPC (Secure)
            const { data, error: joinError } = await supabase.rpc('join_team_with_code', {
                code: code
            })

            if (joinError) throw joinError

            const result = data as any
            if (result?.message === 'Already a member') {
                toast.info("이미 이 팀의 멤버입니다.")
            } else {
                toast.success(`${teamInfo.name} 팀에 합류했습니다!`)
            }

            // 3. Redirect
            router.push('/creator')

        } catch (err: any) {
            console.error("Join Error:", err)
            toast.error("팀 합류 중 오류가 발생했습니다: " + err.message)
        } finally {
            setIsJoining(false)
        }
    }

    if (isLoading || !isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 sm:border">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">팀 합류하기</CardTitle>
                    <CardDescription>
                        {isValid
                            ? `${teamInfo?.name} 팀에서 초대가 도착했습니다.`
                            : "초대 링크를 확인해주세요."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {error ? (
                        <div className="bg-destructive/10 p-4 rounded-lg flex items-center gap-3 text-destructive">
                            <XCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-background border rounded-xl p-6 text-center">
                                {teamInfo?.avatar && (
                                    <img
                                        src={teamInfo.avatar}
                                        alt={teamInfo.name}
                                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-border"
                                    />
                                )}
                                <h3 className="font-bold text-xl">{teamInfo?.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">MCN / Agency</p>
                            </div>

                            {!user && (
                                <div className="text-center text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                                    팀에 합류하려면 먼저 로그인이 필요합니다.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    {isValid && !error && (
                        <Button
                            className="w-full h-12 text-lg font-medium"
                            size="lg"
                            onClick={handleJoin}
                            disabled={isJoining}
                        >
                            {isJoining ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    처리 중...
                                </>
                            ) : user ? (
                                "팀 합류하기"
                            ) : (
                                "로그인하고 합류하기"
                            )}
                        </Button>
                    )}
                    {(error || !isValid) && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push('/')}
                        >
                            홈으로 돌아가기
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
