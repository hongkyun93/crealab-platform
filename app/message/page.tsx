"use client"

import { SiteHeader } from "@/components/site-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MoreVertical, Paperclip, Search, Send, Phone, Video, BadgeCheck } from "lucide-react"
import { useState, useRef, useEffect, useMemo } from "react"
import { usePlatform, MOCK_INFLUENCER_USER } from "@/components/providers/platform-provider"

export default function MessagePage() {
    const { user, messages: allMessages, sendMessage, brandProposals } = usePlatform()
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
    const [messageInput, setMessageInput] = useState("")
    const [isComposing, setIsComposing] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const displayUser = user || MOCK_INFLUENCER_USER

    // Helper to render Proposal Card in Chat
    const renderProposalCard = (proposalId: string) => {
        const proposal = brandProposals?.find(p => p.id === proposalId)
        if (!proposal) return null

        return (
            <Card className="mt-2 border-primary/20 bg-primary/5 p-4 space-y-3 max-w-sm shadow-sm group hover:border-primary/40 transition-all text-foreground text-left">
                <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">COLLABORATION PROPOSAL</span>
                    <BadgeCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">{proposal.product_name}</h4>
                    <p className="text-[11px] text-muted-foreground">{proposal.product_type === 'gift' ? '제품 협찬' : '제품 대여'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/50 p-2 rounded">
                    <div>
                        <p className="text-muted-foreground">제시 원고료</p>
                        <p className="font-bold text-emerald-600 font-mono">{proposal.compensation_amount}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">희망 채널</p>
                        <p className="font-medium">{proposal.content_type}</p>
                    </div>
                </div>
                <div className="bg-white/80 p-2 rounded text-[11px] text-muted-foreground italic line-clamp-2">
                    "{proposal.message}"
                </div>
                <Button variant="outline" size="sm" className="w-full text-[10px] h-7 font-bold border-primary/30 text-primary hover:bg-primary/10">
                    상태: {proposal.status === 'accepted' ? '수락됨' : '제안됨'}
                </Button>
            </Card>
        )
    }

    // Compute threads from messages
    const threads = useMemo(() => {
        if (!displayUser) return []
        const groups: Record<string, {
            id: string,
            user: string,
            avatar: string,
            lastMessage: string,
            time: string,
            messages: any[],
            unread: number,
            online: boolean,
            handle: string
        }> = {}

        allMessages.forEach(msg => {
            const isMe = msg.senderId === displayUser.id
            const otherId = isMe ? msg.receiverId : msg.senderId
            const otherName = isMe ? msg.receiverName : msg.senderName
            const otherAvatar = isMe ? msg.receiverAvatar : msg.senderAvatar

            if (!groups[otherId]) {
                groups[otherId] = {
                    id: otherId,
                    user: otherName || "사용자",
                    avatar: otherAvatar || "",
                    lastMessage: msg.content,
                    time: msg.timestamp,
                    messages: [],
                    unread: 0,
                    online: false, // In real app, this would come from presence
                    handle: "" // Could fetch from profile if needed
                }
            }
            groups[otherId].messages.push(msg)

            // Update last message if this one is newer
            if (new Date(msg.timestamp) >= new Date(groups[otherId].time)) {
                groups[otherId].lastMessage = msg.content
                groups[otherId].time = msg.timestamp
                // Update names if available (helpful if some messages have them and some don't)
                if (otherName) groups[otherId].user = otherName
                if (otherAvatar) groups[otherId].avatar = otherAvatar
            }
        })

        return Object.values(groups).sort((a, b) =>
            new Date(b.time).getTime() - new Date(a.time).getTime()
        )
    }, [allMessages, displayUser])

    // Set initial active thread if none selected
    useEffect(() => {
        if (!activeThreadId && threads.length > 0) {
            setActiveThreadId(threads[0].id)
        }
    }, [threads, activeThreadId])

    const activeThread = threads.find(t => t.id === activeThreadId)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [activeThread?.messages])

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeThreadId || isSending) return

        setIsSending(true)
        const content = messageInput
        setMessageInput("") // Optimistic clear

        try {
            await sendMessage(activeThreadId, content)
        } catch (e) {
            console.error("Failed to send message:", e)
            setMessageInput(content) // Restore on error
        } finally {
            setIsSending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Don't send if still composing Korean or already sending
        if (e.key === "Enter" && !e.shiftKey && !isComposing && !isSending) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const formatTime = (isoString: string) => {
        const date = new Date(isoString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return "방금 전"
        if (diffMins < 60) return `${diffMins}분 전`
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}시간 전`
        return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
    }

    const formatDetailedTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SiteHeader />
            <div className="flex-1 container max-w-[1920px] py-6 px-4 md:px-8 h-[calc(100vh-3.5rem)]">
                <div className="grid grid-cols-12 h-full gap-6 bg-card rounded-xl border shadow-sm overflow-hidden">

                    {/* Sidebar / Thread List */}
                    <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r flex flex-col bg-muted/10">
                        <div className="p-4 border-b">
                            <h2 className="font-semibold text-lg mb-4 px-2">메시지</h2>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="검색..."
                                    className="pl-9 bg-background/50 border-muted-foreground/20"
                                />
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="flex flex-col p-2 gap-1">
                                {threads.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                        메시지가 없습니다.
                                    </div>
                                ) : (
                                    threads.map((thread) => (
                                        <button
                                            key={thread.id}
                                            onClick={() => setActiveThreadId(thread.id)}
                                            className={`flex items-start gap-3 p-3 rounded-lg text-left transition-all ${activeThreadId === thread.id
                                                ? "bg-primary/10 hover:bg-primary/15"
                                                : "hover:bg-muted"
                                                }`}
                                        >
                                            <div className="relative">
                                                <Avatar className="h-10 w-10 border border-border/50">
                                                    {thread.avatar ? (
                                                        <AvatarImage src={thread.avatar} />
                                                    ) : (
                                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                            {thread.user[0]}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                {thread.online && (
                                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`font-medium truncate ${activeThreadId === thread.id ? "text-primary" : "text-foreground"}`}>
                                                        {thread.user}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                                        {formatTime(thread.time)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate font-normal">
                                                    {thread.lastMessage}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Chat Window */}
                    <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col bg-background">
                        {activeThread ? (
                            <>
                                {/* Chat Header */}
                                <div className="h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar className="h-9 w-9 border">
                                                {activeThread.avatar ? (
                                                    <AvatarImage src={activeThread.avatar} />
                                                ) : (
                                                    <AvatarFallback>{activeThread.user[0]}</AvatarFallback>
                                                )}
                                            </Avatar>
                                            {activeThread.online && (
                                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{activeThread.user}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                                    대화 중
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Video className="h-4 w-4" />
                                        </Button>
                                        <Separator orientation="vertical" className="h-4 mx-1" />
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Message List */}
                                <ScrollArea className="flex-1 p-6 bg-muted/5">
                                    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                                        {activeThread.messages.map((msg, index) => {
                                            const isMe = msg.senderId === displayUser.id

                                            return (
                                                <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                                    {!isMe && (
                                                        <Avatar className="h-8 w-8 mt-1 border">
                                                            {activeThread.avatar ? (
                                                                <AvatarImage src={activeThread.avatar} />
                                                            ) : (
                                                                <AvatarFallback>{activeThread.user[0]}</AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                    )}
                                                    <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                                                        <div
                                                            className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe
                                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                                : "bg-white dark:bg-muted/50 border rounded-tl-none"
                                                                }`}
                                                        >
                                                            {msg.content}
                                                            {msg.proposalId && renderProposalCard(msg.proposalId)}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                                            {formatDetailedTime(msg.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <div ref={scrollRef} />
                                    </div>
                                </ScrollArea>

                                {/* Input Area */}
                                <div className="p-4 border-t bg-background">
                                    <div className="flex items-end gap-2 max-w-3xl mx-auto bg-muted/30 p-2 rounded-xl border focus-within:ring-1 focus-within:ring-ring transition-all">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground shrink-0 rounded-lg hover:bg-muted">
                                            <Paperclip className="h-4 w-4" />
                                        </Button>
                                        <div className="flex-1 py-1.5">
                                            <textarea
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onCompositionStart={() => setIsComposing(true)}
                                                onCompositionEnd={() => setIsComposing(false)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="메시지를 입력하세요... (Enter로 전송)"
                                                className="w-full bg-transparent border-none focus:outline-none text-sm resize-none max-h-32 min-h-[24px] placeholder:text-muted-foreground/70"
                                                rows={1}
                                                style={{ height: 'auto', minHeight: '24px' }}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLTextAreaElement
                                                    target.style.height = 'auto'
                                                    target.style.height = `${Math.min(target.scrollHeight, 128)}px`
                                                }}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!messageInput.trim() || isSending}
                                            size="icon"
                                            className="h-9 w-9 shrink-0 rounded-lg transition-all"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                <div className="p-4 rounded-full bg-muted mb-4">
                                    <Send className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <p>대화 상대를 선택해주세요</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
