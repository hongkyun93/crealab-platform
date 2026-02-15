"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTeam } from "@/components/providers/team-provider"
import { Users, ChevronRight } from "lucide-react"

export function TeamMembersCard() {
    const { teamMembers, isLoading, switchToMember } = useTeam()

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        소속 크리에이터
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">로딩 중...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    소속 크리에이터 ({teamMembers.length}명)
                </CardTitle>
            </CardHeader>
            <CardContent>
                {teamMembers.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            아직 소속 크리에이터가 없습니다
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            초대 링크를 통해 크리에이터를 초대하세요
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() => switchToMember(member.user_id)}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={member.profile?.avatar_url || ''} />
                                        <AvatarFallback>{member.profile?.display_name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{member.profile?.display_name || member.profile?.email || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {member.profile?.instagram_handle ? `@${member.profile.instagram_handle}` : (member.profile?.email || '')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {member.role}
                                    </Badge>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
