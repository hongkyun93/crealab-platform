"use client"

import { SiteHeader } from "@/components/site-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MoreVertical, Paperclip, Search, Send, Phone, Video } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { usePlatform } from "@/components/providers/platform-provider"

// Mock Data
const THREADS = [
    {
        id: "1",
        user: "미술관 가는 길",
        handle: "@art_museum_road",
        avatar: "🎨",
        lastMessage: "네, 제안주신 내용 확인했습니다! 긍정적으로 검토 중입니다.",
        time: "방금 전",
        unread: 2,
        online: true,
        status: "accepted" // proposal status
    },
    {
        id: "2",
        user: "테크 리뷰어 지니",
        handle: "@genie_tech",
        avatar: "💻",
        lastMessage: "제품 배송은 언제쯤 가능할까요?",
        time: "1시간 전",
        unread: 0,
        online: false,
        status: "negotiating"
    },
    {
        id: "3",
        user: "데일리 뷰티",
        handle: "@daily_beauty",
        avatar: "💄",
        lastMessage: "안녕하세요! 협업 제안 감사드립니다.",
        time: "어제",
        unread: 0,
        online: false,
        status: "pending"
    }
]

const INITIAL_MESSAGES = [
    {
        id: "sys-1",
        sender: "system",
        text: "협업 제안이 수락되었습니다. 대화를 시작해보세요!",
        time: "2026. 08. 14 10:00"
    },
    {
        id: "m-1",
        sender: "me",
        text: "안녕하세요 작가님! 저희 브랜드 제안 수락해주셔서 감사합니다.",
        time: "10:05"
    },
    {
        id: "m-2",
        sender: "them",
        text: "안녕하세요! 보내주신 갤럭시 워치6 제품 구성이 마음에 들어서 진행해보고 싶었어요.",
        time: "10:12"
    },
    {
        id: "m-3",
        sender: "me",
        text: "네 감사합니다 :) 제품은 다음주 월요일에 발송 드릴 예정입니다. 혹시 주소지 변경 필요하신가요?",
        time: "10:15"
    },
    {
        id: "m-4",
        sender: "them",
        text: "아니요, 기존 프로필 주소지로 보내주시면 됩니다!",
        time: "10:18"
    },
    {
        id: "m-5",
        sender: "them",
        text: "네, 제안주신 내용 확인했습니다! 긍정적으로 검토 중입니다.",
        time: "방금 전"
    }
]

export default function MessagePage() {
    const { user } = usePlatform()
    const [activeThreadId, setActiveThreadId] = useState("1")
    const [messageInput, setMessageInput] = useState("")
    const [messages, setMessages] = useState(INITIAL_MESSAGES)
    const scrollRef = useRef<HTMLDivElement>(null)

    const activeThread = THREADS.find(t => t.id === activeThreadId)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSendMessage = () => {
        if (!messageInput.trim()) return

        const newMessage = {
            id: `m-${Date.now()}`,
            sender: "me",
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setMessages([...messages, newMessage])
        setMessageInput("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
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
                                    placeholder="크리에이터 검색..."
                                    className="pl-9 bg-background/50 border-muted-foreground/20"
                                />
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="flex flex-col p-2 gap-1">
                                {THREADS.map((thread) => (
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
                                                <AvatarFallback className="bg-background">{thread.avatar}</AvatarFallback>
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
                                                <span className="text-xs text-muted-foreground shrink-0 ml-2">{thread.time}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate font-normal">
                                                {thread.lastMessage}
                                            </p>
                                        </div>
                                        {thread.unread > 0 && (
                                            <div className="self-center">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                                    {thread.unread}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Chat Window */}
                    <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col bg-background">
                        {/* Chat Header */}
                        {activeThread ? (
                            <>
                                <div className="h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarFallback>{activeThread.avatar}</AvatarFallback>
                                            </Avatar>
                                            {activeThread.online && (
                                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{activeThread.user}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                                    협업 진행중
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{activeThread.handle}</span>
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
                                        {messages.map((msg, index) => {
                                            const isMe = msg.sender === "me"
                                            const isSystem = msg.sender === "system"

                                            if (isSystem) {
                                                return (
                                                    <div key={msg.id} className="flex justify-center my-4">
                                                        <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full border">
                                                            {msg.text}
                                                        </span>
                                                    </div>
                                                )
                                            }

                                            return (
                                                <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                                    {!isMe && (
                                                        <Avatar className="h-8 w-8 mt-1 border">
                                                            <AvatarFallback>{activeThread.avatar}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                                                        <div
                                                            className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe
                                                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                                                    : "bg-white dark:bg-muted/50 border rounded-tl-none"
                                                                }`}
                                                        >
                                                            {msg.text}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                                            {msg.time}
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
                                                onKeyDown={handleKeyDown}
                                                placeholder="메시지를 입력하세요... (Enter로 전송)"
                                                className="w-full bg-transparent border-none focus:outline-none text-sm resize-none max-h-32 min-h-[20px] placeholder:text-muted-foreground/70"
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
                                            disabled={!messageInput.trim()}
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
                                    <MoreVertical className="h-8 w-8 text-muted-foreground/50" />
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
