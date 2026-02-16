"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ChevronDown, Check, User } from "lucide-react"
// ... (imports remain)
import { useTeam } from "@/components/providers/team-provider"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { cn } from "@/lib/utils"

export function TeamSwitcher() {
    const { user } = useUnifiedProvider()
    const { selectedMember, teamMembers, switchToMember, isProxyMode, isLoading } = useTeam()

    // Only show for MCN users
    if (!user || user.role !== 'mcn') {
        return null
    }

    const displayName = isProxyMode ? selectedMember?.profile?.display_name : '본인 계정'
    const displayRole = isProxyMode ? '크리에이터' : 'MCN'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="gap-2 h-9 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                >
                    {isProxyMode && selectedMember?.profile?.avatar_url ? (
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={selectedMember.profile.avatar_url} />
                            <AvatarFallback>{selectedMember.profile.display_name?.[0]}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <Users className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium">{displayName}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    계정 전환
                </DropdownMenuLabel>

                {/* Self (MCN Account) */}
                <DropdownMenuItem
                    onClick={() => switchToMember(null)}
                    className="cursor-pointer"
                >
                    <Check className={cn(
                        "mr-2 h-4 w-4",
                        !isProxyMode ? "opacity-100" : "opacity-0"
                    )} />
                    <User className="mr-2 h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                        <span className="font-medium">본인 계정</span>
                        <span className="text-xs text-muted-foreground">MCN 관리</span>
                    </div>
                </DropdownMenuItem>

                {teamMembers.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            팀 크리에이터 ({teamMembers.length})
                        </DropdownMenuLabel>
                    </>
                )}

                {/* Team Members */}
                {teamMembers.map((member) => (
                    <DropdownMenuItem
                        key={member.id}
                        onClick={() => switchToMember(member.user_id)}
                        className="cursor-pointer"
                    >
                        <Check className={cn(
                            "mr-2 h-4 w-4",
                            selectedMember?.id === member.id ? "opacity-100" : "opacity-0"
                        )} />
                        {member.profile?.avatar_url ? (
                            <Avatar className="mr-2 h-5 w-5">
                                <AvatarImage src={member.profile.avatar_url} />
                                <AvatarFallback>{member.profile.display_name?.[0]}</AvatarFallback>
                            </Avatar>
                        ) : (
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium">{member.profile?.display_name || '이름 없음'}</span>
                            <span className="text-xs text-muted-foreground">
                                {member.profile?.email}
                            </span>
                        </div>
                    </DropdownMenuItem>
                ))}

                {isLoading && (
                    <DropdownMenuItem disabled className="text-center text-sm text-muted-foreground">
                        로딩 중...
                    </DropdownMenuItem>
                )}

                {!isLoading && teamMembers.length === 0 && (
                    <DropdownMenuItem disabled className="text-center text-sm text-muted-foreground">
                        팀 멤버 없음
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
