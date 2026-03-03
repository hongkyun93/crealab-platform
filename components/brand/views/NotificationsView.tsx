import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { AlertCircle, Bell, CheckCircle2, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useNotificationRouter } from "@/hooks/use-notification-router"
import React, { useState } from "react"

export const NotificationsView = React.memo(function NotificationsView() {
    const { notifications, markAsRead, supabase } = useUnifiedProvider() as any
    const router = useRouter()
    const { routeNotification } = useNotificationRouter()
    const [notificationFilter, setNotificationFilter] = useState<'all' | 'action' | 'update' | 'message'>('action')

    const getBrandNotificationStyle = (type: string) => {
        const actionTypes = ['contract_negotiating', 'content_revision', 'proposal_update', 'application_received', 'shipping_address_saved', 'shipping_started', 'condition_confirmed']
        const successTypes = ['contract_signed', 'proposal_accepted', 'collaboration_complete', 'collaboration_final_complete', 'content_approved', 'payment_confirmed', 'settlement_paid', 'delivery_confirmed']

        if (actionTypes.includes(type)) {
            return { icon: <AlertCircle className="w-5 h-5 text-red-500" />, bg: "bg-red-50/50 dark:bg-red-900/10", border: "border-l-4 border-red-500", ring: "ring-2 ring-red-500/20" }
        } else if (successTypes.includes(type)) {
            return { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, bg: "bg-green-50/50 dark:bg-green-900/10", border: "border-l-4 border-green-500", ring: "ring-2 ring-green-500/20" }
        }
        return { icon: <MessageSquare className="w-5 h-5 text-muted-foreground" />, bg: "bg-transparent", border: "border-l-4 border-transparent", ring: "ring-2 ring-primary/20" }
    }

    const brandActionTypes = [
        'application_received', 'application_updated',
        'contract_negotiating', 'shipping_address_saved',
        'performance_submitted', 'condition_confirmed'
    ];

    const isBrandAction = (type: string) => brandActionTypes.includes(type);
    const isBrandMessage = (type: string) => ['new_message', 'feedback_received'].includes(type);

    const filteredNotifications = [...(notifications || [])]
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .filter(n => {
            if (notificationFilter === 'all') return true;
            if (notificationFilter === 'action') return isBrandAction(n.type);
            if (notificationFilter === 'message') return isBrandMessage(n.type);
            if (notificationFilter === 'update') return !isBrandAction(n.type) && !isBrandMessage(n.type);
            return true;
        })

    const unreadActionCount = (notifications || []).filter((n: any) => isBrandAction(n.type) && !n.is_read).length;
    const unreadMessageCount = (notifications || []).filter((n: any) => isBrandMessage(n.type) && !n.is_read).length;
    const unreadUpdateCount = (notifications || []).filter((n: any) => !isBrandAction(n.type) && !isBrandMessage(n.type) && !n.is_read).length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
                        <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-primary" /> 알림 센터
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">캠페인 지원 및 협업 진행 상황을 실시간으로 확인하세요.</p>
                </div>
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

            {filteredNotifications.length === 0 ? (
                <Card className="p-20 text-center border-dashed bg-muted/30/50 rounded-[40px] border-2">
                    <Bell className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                    <h3 className="text-xl font-bold text-foreground">새로운 알림이 없습니다.</h3>
                    <p className="text-sm text-muted-foreground/70 mt-2">해당 탭에 표시할 주요 업데이트가 없습니다.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications.map((n: any) => {
                        const style = getBrandNotificationStyle(n.type)
                        return (
                            <div
                                key={n.id}
                                className={`p-4 bg-card rounded-2xl flex items-start gap-4 cursor-pointer hover:shadow-md transition-all group ${!n.is_read ? 'ring-2 ring-primary/20' : 'border opacity-70'} ${style.bg} ${style.border}`}
                                onClick={() => routeNotification(n)}
                            >
                                <div className="mt-1 shrink-0">
                                    {style.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm group-hover:text-primary transition-colors ${!n.is_read ? 'font-bold text-foreground' : 'font-medium'}`}>{n.content}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                                </div>
                                {!n.is_read && (
                                    <div className="shrink-0 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
})
