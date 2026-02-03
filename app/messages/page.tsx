"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// import { ScrollArea } from "@/components/ui/scroll-area" 
// import { Separator } from "@/components/ui/separator" 
import { usePlatform } from "@/components/providers/platform-provider"
import { Send, User as UserIcon, MoreVertical, Phone, Video } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

export default function MessagesPage() {
    const { user, messages, sendMessage, isLoading } = usePlatform()
    const router = useRouter()
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [isLoading, user, router])

    // Get unique conversation partners
    const conversations = Array.from(new Set(
        messages
            .filter(m => m.senderId === user?.id || m.receiverId === user?.id)
            .flatMap(m => [m.senderId, m.receiverId])
            .filter(id => id !== user?.id)
    )).map(id => {
        // Mocking user detail lookup since we don't have a global user list map yet
        // In a real app we'd fetch user details. Here we assume some names based on ID or defaults
        return {
            id,
            name: id === "brand1" ? "SAMSUNG" : id === "creator1" ? "김세라" : id,
            avatar: id === "brand1" ? "S" : id === "creator1" ? "김" : "?"
        }
    })

    // If no conversation selected and there are conversations, select the first one
    useEffect(() => {
        if (!selectedUserId && conversations.length > 0) {
            setSelectedUserId(conversations[0].id)
        }
    }, [conversations, selectedUserId])

    // Filter messages for selected conversation
    const currentMessages = messages.filter(
        m => (m.senderId === user?.id && m.receiverId === selectedUserId) ||
            (m.senderId === selectedUserId && m.receiverId === user?.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [currentMessages, selectedUserId])

    const handleSend = () => {
        if (!newMessage.trim() || !selectedUserId) return
        sendMessage(selectedUserId, newMessage)
        setNewMessage("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>
    if (!user) return null

    return (
        <div className="flex flex-col h-screen bg-muted/30">
            <SiteHeader />
            <div className="flex-1 container max-w-6xl py-6 px-4 md:px-6 grid md:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-80px)]">

                {/* Sidebar: Conversations List */}
                <Card className="flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold text-lg">메시지</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {conversations.length === 0 ? (
                            <div className="text-center text-muted-foreground p-8 text-sm">
                                대화 목록이 없습니다.
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedUserId(conv.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${selectedUserId === conv.id ? "bg-secondary" : "hover:bg-muted"
                                        }`}
                                >
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        {conv.avatar}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-medium truncate">{conv.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {/* Show last message preview here if desired */}
                                            대화하기
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                {/* Main: Chat Window */}
                <Card className="flex flex-col h-full overflow-hidden">
                    {selectedUserId ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        {conversations.find(c => c.id === selectedUserId)?.avatar || "?"}
                                    </div>
                                    <div>
                                        <div className="font-semibold">
                                            {conversations.find(c => c.id === selectedUserId)?.name || selectedUserId}
                                        </div>
                                        <div className="text-xs text-green-500 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            온라인
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost"><Phone className="h-4 w-4" /></Button>
                                    <Button size="icon" variant="ghost"><Video className="h-4 w-4" /></Button>
                                    <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-zinc-900/50" ref={scrollRef}>
                                {currentMessages.map(m => {
                                    const isMe = m.senderId === user.id
                                    return (
                                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-white dark:bg-card border rounded-tl-none'
                                                }`}>
                                                {m.content}
                                                <div className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-background border-t">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="메시지를 입력하세요..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSend} size="icon">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Send className="h-8 w-8 opacity-50" />
                            </div>
                            <p>대화 상대를 선택하거나 새로운 제안을 보내보세요.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
