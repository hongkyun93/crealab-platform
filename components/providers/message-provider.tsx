"use client"

import type { Message, Notification, SubmissionFeedback } from "@/lib/types"
import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { useAuth } from "./auth-provider"

interface MessageContextType {
    messages: Message[]
    notifications: Notification[]
    submissionFeedback: SubmissionFeedback[]
    isLoading: boolean
    sendMessage: (receiverId: string, content: string, file?: { url: string; name: string; size: number; type: string }, workspaceId?: string, projectName?: string) => Promise<void>
    sendNotification: (recipientId: string, content: string, type: string, referenceId?: string) => Promise<void>
    sendSubmissionFeedback: (workspaceId: string | undefined, content: string, videoTimestamp?: number | null) => Promise<void>
    fetchSubmissionFeedback: (workspaceId?: string) => Promise<SubmissionFeedback[]>
    markAsRead: (notificationId: string) => Promise<void>
    refreshMessages: (userId?: string) => Promise<void>
    refreshNotifications: (userId?: string) => Promise<void>
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    const { supabase } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [submissionFeedback, setSubmissionFeedback] = useState<SubmissionFeedback[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const isFetchingMessages = useRef(false)
    const isFetchingNotifications = useRef(false)

    // Fetch messages
    const fetchMessages = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (!id || isFetchingMessages.current) return

        isFetchingMessages.current = true

        try {
            console.log('[MessageProvider] Fetching messages...')

            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!sender_id(id, display_name, avatar_url),
                    receiver:profiles!receiver_id(id, display_name, avatar_url)
                `)
                .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
                .order('created_at', { ascending: true })

            if (error) {
                // Ignore AbortError (happens when component unmounts during fetch)
                if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                    return
                }

                // Handle network errors gracefully
                if (error.message === 'Failed to fetch' || error.message === 'Load failed') {
                    // console.warn('[MessageProvider] Network error fetching messages (likely transient)')
                    return
                }

                console.error('[MessageProvider] Fetch error:', error.message)

                // Handle known error codes gracefully
                if (error.code === '42P01') {
                    console.warn('[MessageProvider] The "messages" table is missing')
                    return
                }
                if (error.code === '42501') {
                    console.warn('[MessageProvider] Permission denied for messages')
                    return
                }

                // For unexpected errors, log details
                console.error('[MessageProvider] Unexpected error:', { code: error.code, details: error.details })
                return
            }

            if (data) {
                const formatted: Message[] = data.map((msg: any) => ({
                    id: msg.id.toString(),
                    senderId: msg.sender_id,
                    receiverId: msg.receiver_id,
                    workspaceId: msg.workspace_id,
                    content: msg.content || '',
                    timestamp: msg.created_at,
                    read: msg.is_read || false,
                    senderName: msg.sender?.display_name || 'User',
                    senderAvatar: msg.sender?.avatar_url,
                    receiverName: msg.receiver?.display_name || 'User',
                    receiverAvatar: msg.receiver?.avatar_url,
                    // File attachment fields
                    fileUrl: msg.file_url,
                    fileName: msg.file_name,
                    fileSize: msg.file_size,
                    fileType: msg.file_type
                }))

                setMessages(formatted)
                console.log('[MessageProvider] Loaded messages:', formatted.length)
            }
        } catch (err) {
            console.error('[MessageProvider] Exception:', err)
        } finally {
            isFetchingMessages.current = false
        }
    }

    // Fetch notifications
    const fetchNotifications = async (targetUserId?: string) => {
        const id = targetUserId || userId
        if (!id || isFetchingNotifications.current) return

        isFetchingNotifications.current = true

        try {
            console.log('[MessageProvider] Fetching notifications...')

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', id)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) {
                // Ignore AbortError (happens when component unmounts during fetch)
                if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                    return
                }

                // Handle network errors gracefully
                if (error.message === 'Failed to fetch' || error.message === 'Load failed') {
                    // console.warn('[MessageProvider] Network error fetching notifications (likely transient)')
                    return
                }

                console.error('[MessageProvider] Notifications error:', error.message)

                // Handle known error codes gracefully
                if (error.code === '42P01') {
                    console.warn('[MessageProvider] The "notifications" table is missing')
                    return
                }
                if (error.code === '42501') {
                    console.warn('[MessageProvider] Permission denied for notifications')
                    return
                }

                // For unexpected errors, log details
                console.error('[MessageProvider] Unexpected error:', { code: error.code, details: error.details })
                return
            }

            if (data) {
                setNotifications(data)
                console.log('[MessageProvider] Loaded notifications:', data.length)
            }
        } catch (err) {
            console.error('[MessageProvider] Exception:', err)
        } finally {
            isFetchingNotifications.current = false
        }
    }

    // Initial load + Realtime subscription (replaces 2-second polling)
    useEffect(() => {
        if (!userId) {
            setMessages([])
            setNotifications([])
            setSubmissionFeedback([])
            setIsLoading(false)
            return
        }

        // Set loading immediately to prevent stale "loaded" state
        setIsLoading(true)
        window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '메시지/알림 불러오는 중...', type: 'loading' } }))

        // Initial load after 500ms to allow page to render first
        const timer = setTimeout(() => {
            Promise.all([
                fetchMessages(userId),
                fetchNotifications(userId)
            ]).finally(() => {
                setIsLoading(false)
                window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '메시지/알림 로드 완료', type: 'success' } }))
            })
        }, 500)

        // [PERF] Realtime subscriptions instead of 2-second polling
        // Only re-fetch when actual DB changes occur (INSERT/UPDATE on relevant rows)
        const messagesChannel = supabase
            .channel(`messages-realtime-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${userId}`
                },
                () => {
                    // Skip fetch if tab is hidden — will catch up on visibility change
                    if (!document.hidden) fetchMessages(userId)
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${userId}`
                },
                () => {
                    if (!document.hidden) fetchMessages(userId)
                }
            )
            .subscribe()

        const notificationsChannel = supabase
            .channel(`notifications-realtime-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${userId}`
                },
                () => {
                    if (!document.hidden) fetchNotifications(userId)
                }
            )
            .subscribe()

        // Catch up when tab becomes visible again
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchMessages(userId)
                fetchNotifications(userId)
            }
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            clearTimeout(timer)
            supabase.removeChannel(messagesChannel)
            supabase.removeChannel(notificationsChannel)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [userId])

    // Send message
    const sendMessage = async (
        receiverId: string,
        content: string,
        file?: { url: string; name: string; size: number; type: string },
        workspaceId?: string,
        projectName?: string
    ) => {
        if (!userId) {
            throw new Error('User ID required')
        }

        try {
            console.log('[MessageProvider] Sending message:', { receiverId, workspaceId, hasFile: !!file })

            const { error, status, statusText } = await supabase
                .from('messages')
                .insert({
                    sender_id: userId,
                    receiver_id: receiverId,
                    workspace_id: workspaceId || null,
                    content: content || '',
                    file_url: file?.url ?? null,
                    file_name: file?.name ?? null,
                    file_size: file?.size ?? null,
                    file_type: file?.type ?? null,
                    is_read: false
                })

            if (error) {
                const detail = `code=${error.code} msg=${error.message} hint=${error.hint} details=${error.details} http=${status} ${statusText}`
                console.error('[MessageProvider] Send error detail:', detail, JSON.stringify(error))
                throw new Error(detail)
            }

            // 🔔 new_message 알림은 DB 트리거(notify_user_on_message)에서 자동 발송 처리됨.
            // (클라이언트 수동 발송 시 중복 생성 문제가 있어 제거됨)

            await fetchMessages(userId)
            console.log('[MessageProvider] Message sent OK')
        } catch (error: any) {
            console.error('[MessageProvider] Send error:', error?.message || JSON.stringify(error))
            throw error
        }

    }


    // Send notification
    const sendNotification = async (recipientId: string, content: string, type: string, referenceId?: string) => {
        try {
            console.log('[MessageProvider] Sending notification:', { recipientId, type, content })

            const { error } = await supabase
                .from('notifications')
                .insert({
                    recipient_id: recipientId,
                    sender_id: userId,
                    type,     // 타입 코드 (e.g. 'proposal_update')
                    content,  // 사람이 읽는 문장 (e.g. '조건 협의가 완료되었습니다.')
                    reference_id: referenceId,
                    is_read: false
                })

            if (error) {
                console.error('[MessageProvider] Notification error:', error)
                throw error
            }

            console.log('[MessageProvider] Notification sent')
        } catch (error: any) {
            console.error('[MessageProvider] Notification error:', error)
            throw error
        }
    }

    // Send submission feedback
    const sendSubmissionFeedback = async (workspaceId: string | undefined, content: string, videoTimestamp?: number | null) => {
        if (!userId) {
            throw new Error('User ID required')
        }

        try {
            console.log('[MessageProvider] Sending feedback:', { workspaceId, videoTimestamp })

            // 10초 타임아웃: Supabase 연결 불가 시 promise가 영원히 pending 되는 현상 방지
            const makeTimeout = () => new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('피드백 전송 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.')), 10000)
            )

            const basePayload: any = {
                sender_id: userId,
                content,
            }
            if (workspaceId) basePayload.workspace_id = workspaceId;

            // videoTimestamp가 실제 값이 있는 경우에만 컬럼 포함
            const payloadWithTs = videoTimestamp != null
                ? { ...basePayload, video_timestamp_seconds: videoTimestamp }
                : basePayload

            const { error } = await Promise.race([
                supabase.from('submission_feedback').insert(payloadWithTs),
                makeTimeout()
            ]) as { error: any }

            if (error) {
                // 42703 = column does not exist (migration not applied yet)
                // → 타임스탬프 필드 제거 후 재시도 → plain text feedback은 항상 저장
                if (error.code === '42703' && videoTimestamp != null) {
                    console.warn('[MessageProvider] video_timestamp_seconds column missing, retrying without timestamp')
                    const { error: retryError } = await Promise.race([
                        supabase.from('submission_feedback').insert(basePayload),
                        makeTimeout()
                    ]) as { error: any }
                    if (retryError) {
                        console.error('[MessageProvider] Retry also failed:', retryError)
                        throw retryError
                    }
                    console.log('[MessageProvider] Feedback sent (without timestamp — run migration to enable bookmarks)')
                    return
                }

                // If the error is an infinite timeout caused by undefined payloads, log exact details
                console.error('[MessageProvider] Feedback Error Payload Details:', { payloadWithTs, errorCode: error.code })
                throw error
            }

            console.log('[MessageProvider] Feedback sent')
        } catch (error: any) {
            console.error('[MessageProvider] Feedback error:', error)
            throw error
        }
    }

    // Fetch submission feedback
    const fetchSubmissionFeedback = async (workspaceId?: string): Promise<SubmissionFeedback[]> => {
        try {
            console.log('[MessageProvider] Fetching feedback:', { workspaceId })

            let query = supabase
                .from('submission_feedback')
                .select(`
                    *,
                    sender:profiles!sender_id(display_name, avatar_url)
                `)
                .order('created_at', { ascending: true })

            if (!workspaceId) {
                console.warn('[MessageProvider] Missing workspaceId for feedback fetch')
                return []
            }

            query = query.eq('workspace_id', workspaceId)

            const { data, error } = await query

            if (error) {
                // Ignore AbortError or network failure during unmount/reload
                if (error.code === undefined && (error.message === 'Failed to fetch' || error.message === 'Load failed')) {
                    return []
                }

                // Ignore empty or codeless error objects (aborted/cancelled Supabase requests)
                if (Object.keys(error).length === 0 || (!error.code && !error.message)) {
                    // Suppress empty object error logs `[MessageProvider] Feedback fetch error: {}`
                    return []
                }

                console.error('[MessageProvider] Feedback fetch error:', JSON.stringify(error))
                return []
            }

            if (data) {
                const feedback: SubmissionFeedback[] = data.map((f: any) => ({
                    id: f.id,
                    workspace_id: f.workspace_id,
                    sender_id: f.sender_id,
                    content: f.content,
                    created_at: f.created_at,
                    sender_name: f.sender?.display_name,
                    sender_avatar: f.sender?.avatar_url,
                    video_timestamp_seconds: f.video_timestamp_seconds ?? null
                }))

                setSubmissionFeedback(feedback)
                return feedback
            }

            return []
        } catch (err) {
            console.error('[MessageProvider] Exception:', err)
            return []
        }
    }

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)

            if (error) {
                console.error('[MessageProvider] Mark read error:', error)
                return
            }

            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            ))
        } catch (error: any) {
            console.error('[MessageProvider] Mark read error:', error)
        }
    }

    return (
        <MessageContext.Provider value={{
            messages,
            notifications,
            submissionFeedback,
            isLoading,
            sendMessage,
            sendNotification,
            sendSubmissionFeedback,
            fetchSubmissionFeedback,
            markAsRead,
            refreshMessages: fetchMessages,
            refreshNotifications: fetchNotifications
        }}>
            {children}
        </MessageContext.Provider>
    )
}

export function useMessages() {
    const context = useContext(MessageContext)
    if (!context) {
        throw new Error('useMessages must be used within MessageProvider')
    }
    return context
}
