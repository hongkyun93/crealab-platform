"use client"

import { useEffect, useState } from "react"
import { useTeam } from "@/components/providers/team-provider"
import { TeamMember, TeamInvitation, TeamRole } from "@/lib/types/team"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Settings, Users, Mail, Loader2, X, ArrowLeft } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"


export default function TeamSettingsPage() {
    const { user } = useUnifiedProvider()
    const router = useRouter()
    const { currentTeam, createTeam, fetchTeamMembers, updateMemberRole, removeMember, inviteMember, fetchInvitations, cancelInvitation } = useTeam()
    const supabase = createClient()
    const [members, setMembers] = useState<TeamMember[]>([])
    const [invitations, setInvitations] = useState<TeamInvitation[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null)

    // Create Team Form State
    const [teamName, setTeamName] = useState("")
    const [teamSlug, setTeamSlug] = useState("")

    // Invite Member Form State
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviteRole, setInviteRole] = useState<TeamRole>("member")

    // Load members and invitations
    useEffect(() => {
        if (currentTeam) {
            loadTeamData()
        }
    }, [currentTeam])

    // [Access Control] Redirect creators away from team settings
    // Creators should not be able to manage teams
    useEffect(() => {
        // Use a small timeout to allow user data to populate
        const timer = setTimeout(() => {
            if (user?.role === 'creator') {
                router.replace('/creator')
                toast.error("권한이 없습니다.")
            }
        }, 100)
        return () => clearTimeout(timer)
    }, [user, router])

    const loadTeamData = async () => {
        if (!currentTeam) return

        setIsLoading(true)
        const [membersData, invitationsData] = await Promise.all([
            fetchTeamMembers(currentTeam.id),
            fetchInvitations(currentTeam.id)
        ])
        setMembers(membersData)
        setInvitations(invitationsData)
        setIsLoading(false)
    }

    const handleCreateTeam = async () => {
        if (!teamName || !teamSlug) {
            alert("팀 이름과 슬러그를 입력해주세요.")
            return
        }

        const newTeam = await createTeam(teamName, teamSlug)
        if (newTeam) {
            alert("팀이 생성되었습니다!")
            setTeamName("")
            setTeamSlug("")
        } else {
            alert("팀 생성에 실패했습니다.")
        }
    }

    const handleInviteMember = async () => {
        if (!currentTeam || !inviteEmail) {
            alert("이메일을 입력해주세요.")
            return
        }

        const success = await inviteMember(currentTeam.id, inviteEmail, inviteRole)
        if (success) {
            alert("초대를 보냈습니다!")
            setInviteEmail("")
            loadTeamData()
        } else {
            alert("초대에 실패했습니다.")
        }
    }

    const handleUpdateRole = async (memberId: string, newRole: TeamRole) => {
        console.log('[UI DEBUG] handleUpdateRole called with:', { memberId, newRole })
        console.log('[UI DEBUG] Current members:', members)

        const success = await updateMemberRole(memberId, newRole)
        if (success) {
            alert("역할이 변경되었습니다!")
            loadTeamData()
        } else {
            alert("역할 변경에 실패했습니다.")
        }
    }

    const handleRemoveMemberClick = (memberId: string) => {
        setMemberToDelete(memberId)
    }

    const confirmRemoveMember = async () => {
        if (!memberToDelete) return

        const success = await removeMember(memberToDelete)
        if (success) {
            alert("멤버가 제거되었습니다!")
            loadTeamData()
        } else {
            alert("멤버 제거에 실패했습니다.")
        }
        setMemberToDelete(null)
    }

    const handleCancelInvitation = async (invitationId: string) => {
        const success = await cancelInvitation(invitationId)
        if (success) {
            alert("초대가 취소되었습니다!")
            loadTeamData()
        } else {
            alert("초대 취소에 실패했습니다.")
        }
    }

    // Determine default tab
    const defaultTab = currentTeam ? "members" : "create"

    return (
        <div className="container max-w-5xl mx-auto py-10 space-y-8">


            <div>
                <Button variant="outline" className="gap-2 mb-4" onClick={() => window.location.href = '/creator'}>
                    <ArrowLeft className="h-4 w-4" />
                    MCN 관리로 돌아가기
                </Button>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">팀 관리</h1>
                        <p className="text-muted-foreground mt-2">
                            {currentTeam ? `${currentTeam.name} 팀의 설정과 멤버를 관리합니다.` : "팀을 선택하거나 새로 만드세요."}
                        </p>
                    </div>
                    {currentTeam && (
                        <Badge variant="outline" className="px-4 py-1 text-sm">
                            {currentTeam.slug}
                        </Badge>
                    )}
                </div>
            </div>

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                    <TabsTrigger value="members" disabled={!currentTeam}>멤버 관리</TabsTrigger>
                    <TabsTrigger value="create">새 팀 만들기</TabsTrigger>
                </TabsList>

                {/* MEMBERS TAB */}
                <TabsContent value="members" className="space-y-6 mt-6">
                    {/* Invite Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                멤버 초대
                            </CardTitle>
                            <CardDescription>
                                새로운 멤버를 팀에 초대하고 역할을 부여하세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="grid gap-2 flex-1 w-full">
                                    <Label htmlFor="email">이메일 주소</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="colleague@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2 w-full md:w-[200px]">
                                    <Label htmlFor="role">역할</Label>
                                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="member">Member (일반)</SelectItem>
                                            <SelectItem value="employee">Employee (직원)</SelectItem>
                                            <SelectItem value="creator">Creator (크리에이터)</SelectItem>
                                            <SelectItem value="manager">Manager (관리자)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button onClick={handleInviteMember} className="flex-1 md:flex-none" variant="outline">
                                        초대 링크 보내기
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            if (!inviteEmail) {
                                                toast.error("이메일을 입력해주세요")
                                                return
                                            }

                                            try {
                                                const { data, error } = await supabase.rpc('add_team_member_direct', {
                                                    target_email: inviteEmail,
                                                    target_role: inviteRole
                                                })

                                                if (error) throw error

                                                const result = data as any
                                                if (result.success) {
                                                    toast.success(result.message || "팀원이 추가되었습니다!")
                                                    setInviteEmail("")
                                                    loadTeamData()
                                                } else {
                                                    toast.error(result.message || "추가 실패")
                                                }
                                            } catch (err: any) {
                                                console.error('Direct add error:', err)
                                                toast.error("팀원 추가 중 오류가 발생했습니다")
                                            }
                                        }}
                                        disabled={!inviteEmail}
                                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                                    >
                                        바로 추가 ⚡
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Team Members List */}
                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    팀 멤버 ({members.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {members.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarImage src={member.profile?.avatar_url || ""} />
                                                        <AvatarFallback>{member.profile?.display_name?.[0] || "?"}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{member.profile?.display_name || "이름 없음"}</p>
                                                        <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={member.role}
                                                        onValueChange={(v) => handleUpdateRole(member.id, v as TeamRole)}
                                                        disabled={member.role === 'owner'}
                                                    >
                                                        <SelectTrigger className="w-[110px] h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="owner">Owner</SelectItem>
                                                            <SelectItem value="manager">Manager</SelectItem>
                                                            <SelectItem value="employee">Employee</SelectItem>
                                                            <SelectItem value="creator">Creator</SelectItem>
                                                            <SelectItem value="member">Member</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    {member.role !== 'owner' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleRemoveMemberClick(member.id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pending Invitations */}
                        {invitations.length > 0 && (
                            <Card className="col-span-1 md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-600">
                                        <Mail className="h-5 w-5" />
                                        대기 중인 초대 ({invitations.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {invitations.map((invitation) => (
                                            <div key={invitation.id} className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{invitation.email}</span>
                                                    <span className="text-xs text-muted-foreground uppercase">{invitation.role}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-white"
                                                        onClick={() => {
                                                            const link = `${window.location.origin}/join/${invitation.invite_code || invitation.id}` // Fallback to ID if code missing (legacy)
                                                            navigator.clipboard.writeText(link)
                                                            toast.success("초대 링크가 복사되었습니다.")
                                                        }}
                                                    >
                                                        링크 복사
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleCancelInvitation(invitation.id)}
                                                    >
                                                        취소
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* CREATE TEAM TAB */}
                <TabsContent value="create" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>새로운 팀 만들기</CardTitle>
                            <CardDescription>
                                MCN, 에이전시, 또는 새로운 프로젝트 팀을 만들어 멤버들을 관리하세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="team-name">팀 이름</Label>
                                <Input
                                    id="team-name"
                                    value={teamName}
                                    onChange={(e) => {
                                        setTeamName(e.target.value)
                                        setTeamSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                                    }}
                                    placeholder="예: 크리에이터랩 MCN"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="team-slug">팀 식별자 (URL Slug)</Label>
                                <Input
                                    id="team-slug"
                                    value={teamSlug}
                                    onChange={(e) => setTeamSlug(e.target.value)}
                                    placeholder="예: creator-lab-mcn"
                                />
                                <p className="text-xs text-muted-foreground">영문, 숫자, 하이픈(-)만 사용 가능합니다.</p>
                            </div>
                            <Button onClick={handleCreateTeam} className="w-full">
                                팀 생성하기
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>멤버를 제거하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 해당 멤버는 팀에서 즉시 제거되며 접근 권한을 잃게 됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMemberToDelete(null)}>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRemoveMember} className="bg-red-600 hover:bg-red-700">
                            제거하기
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
