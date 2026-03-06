import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, Bell, Building2, CheckCircle2, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useNotificationRouter } from "@/hooks/use-notification-router"
import React, { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export const NotificationsView = React.memo(function NotificationsView() {
    const { notifications, markAsRead, refreshData } = useUnifiedProvider() as any
    const router = useRouter()
    const { routeNotification } = useNotificationRouter()
    const [notificationFilter, setNotificationFilter] = useState<'all' | 'action' | 'update' | 'message'>('action')
    const [acceptingId, setAcceptingId] = useState<string | null>(null)

    const handleAcceptTeamInvite = async (e: React.MouseEvent, notifId: string) => {
        e.stopPropagation()
        setAcceptingId(notifId)
        try {
            const supabase = createClient()
            const { data, error } = await supabase.rpc('accept_team_invite', { notification_id: notifId })
            if (error) throw error
            const result = data as any
            if (result.success) {
                toast.success(result.message)
                await refreshData()
            } else {
                toast.error(result.message)
            }
        } catch (err: any) {
            toast.error(err.message || '수락 중 오류가 발생했습니다.')
        } finally {
            setAcceptingId(null)
        }
    }

    const getCreatorNotificationStyle = (type: string) => {
        const actionTypes = ['contract_negotiating', 'content_revision', 'proposal_update', 'application_received', 'shipping_address_saved', 'shipping_started', 'condition_confirmed', 'team_invite']
        const successTypes = ['contract_signed', 'proposal_accepted', 'collaboration_complete', 'collaboration_final_complete', 'content_approved', 'payment_confirmed', 'settlement_paid', 'delivery_confirmed']

        if (type === 'team_invite') {
            return { icon: <Building2 className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-50/50 dark:bg-indigo-900/10", border: "border-l-4 border-indigo-500" }
        } else if (actionTypes.includes(type)) {
            return { icon: <AlertCircle className="w-5 h-5 text-red-500" />, bg: "bg-red-50/50 dark:bg-red-900/10", border: "border-l-4 border-red-500" }
        } else if (successTypes.includes(type)) {
            return { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, bg: "bg-green-50/50 dark:bg-green-900/10", border: "border-l-4 border-green-500" }
        }
        return { icon: <MessageSquare className="w-5 h-5 text-muted-foreground" />, bg: "bg-transparent", border: "border-l-4 border-transparent" }
    }

    const creatorActionTypes = [
        'proposal_received', 'moment_proposal',
        'proposal_update', 'contract_signed', 'shipping_started',
        'delivery_confirmed', 'content_revision', 'content_approved',
        'collaboration_complete', 'team_invite'
    ];

    const isCreatorAction = (type: string) => creatorActionTypes.includes(type);
    const isCreatorMessage = (type: string) => ['new_message', 'feedback_received'].includes(type);

    const filteredNotifs = [...(notifications || [])]
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .filter(n => {
            if (notificationFilter === 'all') return true;
            if (notificationFilter === 'action') return isCreatorAction(n.type);
            if (notificationFilter === 'message') return isCreatorMessage(n.type);
            if (notificationFilter === 'update') return !isCreatorAction(n.type) && !isCreatorMessage(n.type);
            return true;
        })

    const unreadActionCount = (notifications || []).filter((n: any) => isCreatorAction(n.type) && !n.is_read).length;
    const unreadMessageCount = (notifications || []).filter((n: any) => isCreatorMessage(n.type) && !n.is_read).length;
    const unreadUpdateCount = (notifications || []).filter((n: any) => !isCreatorAction(n.type) && !isCreatorMessage(n.type) && !n.is_read).length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Bell className="h-7 w-7 text-primary" /> 알림 센터
                </h1>
                <p className="text-sm text-muted-foreground mt-1">브랜드와의 협업 진행 상황을 실시간으로 확인하세요.</p>
            </div>

            <div className="flex border-b text-sm font-medium mb-4">
                <button
                    onClick={() => setNotificationFilter('action')}
                    className={`flex-1 py-3 text-center transition-colors relative ${notificationFilter === 'action' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    할 일 {unreadActionCount > 0 && <span className="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadActionCount}</span>}
                    {notificationFilter === 'action' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => setNotificationFilter('update')}
                    className={`flex-1 py-3 text-center transition-colors relative ${notificationFilter === 'update' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    업데이트 {unreadUpdateCount > 0 && <span className="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadUpdateCount}</span>}
                    {notificationFilter === 'update' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => setNotificationFilter('message')}
                    className={`flex-1 py-3 text-center transition-colors relative ${notificationFilter === 'message' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    메시지 {unreadMessageCount > 0 && <span className="ml-1 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadMessageCount}</span>}
                    {notificationFilter === 'message' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => setNotificationFilter('all')}
                    className={`flex-1 py-3 text-center transition-colors relative ${notificationFilter === 'all' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    전체보기
                    {notificationFilter === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                </button>
            </div>

            <div className="space-y-3">
                {filteredNotifs.length > 0 ? (
                    filteredNotifs.map((notif: any) => {
                        const style = getCreatorNotificationStyle(notif.type)
                        const isTeamInvite = notif.type === 'team_invite' && !notif.is_read
                        return (
                            <div
                                key={notif.id}
                                className={`p-4 bg-card rounded-2xl flex items-start gap-4 transition-all group ${!notif.is_read ? 'ring-2 ring-primary/20' : 'border opacity-70'} ${style.bg} ${style.border} ${!isTeamInvite ? 'cursor-pointer hover:shadow-md' : ''}`}
                                onClick={() => !isTeamInvite && routeNotification(notif)}
                            >
                                <div className="mt-1 shrink-0">
                                    {style.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!notif.is_read ? 'font-bold text-foreground' : 'font-medium'} ${!isTeamInvite ? 'group-hover:text-primary transition-colors' : ''}`}>{notif.content}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                                    {/* MCN 팀 초대 수락 버튼 */}
                                    {isTeamInvite && (
                                        <Button
                                            size="sm"
                                            className="mt-3 h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                                            onClick={(e) => handleAcceptTeamInvite(e, notif.id)}
                                            disabled={acceptingId === notif.id}
                                        >
                                            {acceptingId === notif.id ? '처리 중...' : '✅ 팀 합류 수락하기'}
                                        </Button>
                                    )}
                                </div>
                                {!notif.is_read && (
                                    <div className="shrink-0 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                        <Bell className="w-10 h-10 mx-auto opacity-20 mb-4" />
                        새로운 알림이 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
})
