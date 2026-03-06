"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useTeam } from "@/components/providers/team-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, Search, UserPlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function InviteLinkGenerator() {
    const { user } = useAuth()
    const { currentTeam } = useTeam()
    const supabase = createClient()

    const [searchEmail, setSearchEmail] = useState('')
    const [searchResult, setSearchResult] = useState<any | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [isSendingInvite, setIsSendingInvite] = useState(false)

    const handleSearch = async () => {
        if (!searchEmail.trim()) { toast.error('이메일을 입력해주세요.'); return }
        setIsSearching(true)
        setSearchResult(null)
        try {
            const { data, error } = await supabase.rpc('search_creator_by_email', { search_email: searchEmail.trim() })
            if (error) throw error
            const result = data as any
            if (result.success) setSearchResult(result)
            else toast.error(result.message || '해당 이메일로 가입된 크리에이터를 찾을 수 없습니다.')
        } catch (err: any) {
            toast.error(err.message || '검색 중 오류가 발생했습니다.')
        } finally {
            setIsSearching(false)
        }
    }

    const handleSendInvite = async () => {
        if (!searchResult?.user_id) return
        setIsSendingInvite(true)
        try {
            const { data, error } = await supabase.rpc('send_team_invite_notification', { target_user_id: searchResult.user_id })
            if (error) throw error
            const result = data as any
            if (result.success) {
                toast.success(result.message || '초대 알림을 전송했습니다!')
                setSearchEmail('')
                setSearchResult(null)
            } else {
                toast.error(result.message || '초대 발송에 실패했습니다.')
            }
        } catch (err: any) {
            toast.error(err.message || '초대 발송 중 오류가 발생했습니다.')
        } finally {
            setIsSendingInvite(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    크리에이터 초대
                </CardTitle>
                <CardDescription>
                    이메일로 크리에이터를 검색하고 앱 내 알림으로 초대하세요. (자동으로 크리에이터 권한이 부여됩니다)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 이메일 검색 */}
                <div className="flex gap-2">
                    <Input
                        type="email"
                        placeholder="크리에이터 이메일 입력"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={isSearching}
                        variant="outline"
                        className="shrink-0"
                    >
                        {isSearching
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Search className="h-4 w-4" />}
                        검색
                    </Button>
                </div>

                {/* 검색 결과 */}
                {searchResult && (
                    <div className="border rounded-xl p-4 flex items-center gap-4 bg-muted/30">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                            {searchResult.avatar_url
                                ? <img src={searchResult.avatar_url} alt="" className="w-full h-full object-cover" />
                                : (searchResult.display_name?.[0] || '?')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{searchResult.display_name || '이름 없음'}</p>
                            <p className="text-xs text-muted-foreground">{searchResult.email}</p>
                            {searchResult.current_team_name && (
                                <p className="text-xs text-amber-600 mt-0.5">현재 소속: {searchResult.current_team_name}</p>
                            )}
                        </div>
                        <Button
                            onClick={handleSendInvite}
                            disabled={isSendingInvite}
                            size="sm"
                            className="shrink-0"
                        >
                            {isSendingInvite
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                : <Mail className="h-3.5 w-3.5 mr-1" />}
                            초대 알림 보내기
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
