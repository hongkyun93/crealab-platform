"use client"

import { Button } from "@/components/ui/button"
import { usePlatform } from "@/components/providers/platform-provider"

export default function NotificationsPage() {
    const { notifications, markAsRead } = usePlatform()

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">알림</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    최근 활동 및 업데이트를 확인하세요.
                </p>
            </div>

            <div className="space-y-2">
                {notifications && notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className="p-4 bg-white dark:bg-card border rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                                if (!notif.is_read) {
                                    markAsRead(notif.id)
                                }
                            }}
                        >
                            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notif.is_read ? "bg-gray-300" : "bg-red-500"}`}></div>
                            <div className="flex-1">
                                <p className={`text-sm ${!notif.is_read ? 'font-semibold' : ''}`}>
                                    {notif.content}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(notif.created_at).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            {!notif.is_read && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        markAsRead(notif.id)
                                    }}
                                >
                                    읽음 표시
                                </Button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-20 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-20">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <h3 className="text-lg font-medium">새로운 알림이 없습니다.</h3>
                        <p className="text-sm mt-1">협업 제안이나 메시지가 오면 알려드릴게요.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
