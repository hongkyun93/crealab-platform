"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { MOCK_INFLUENCER_USER } from "@/components/providers/legacy-platform-hook"
import { useTeam } from "@/components/providers/team-provider"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { SiteHeader } from "@/components/site-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFileUpload } from "@/lib/hooks/use-file-upload"
import { formatFileSize, isImage } from "@/lib/utils/file-validation"
import { BadgeCheck, Download, FileText, MoreVertical, Paperclip, Phone, Search, Send, Video, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

export default function MessagePage() {
    const { user, messages: allMessages, sendMessage, brandProposals } = useUnifiedProvider()
    const { supabase } = useAuth()
    const { teamMembers, currentTeam } = useTeam()
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
    const [messageInput, setMessageInput] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [isComposing, setIsComposing] = useState(false)
    const [activeTab, setActiveTab] = useState<'all' | 'team'>('all')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { uploadFile, uploading } = useFileUpload()

    // 대화내용 검색
    const [chatSearchOpen, setChatSearchOpen] = useState(false)
    const [chatSearchQuery, setChatSearchQuery] = useState('')

    const displayUser = user || MOCK_INFLUENCER_USER

    // Determine if user is MCN or creator in a team
    const isMCN = user?.role === 'mcn'
    const isCreatorInTeam = !!(currentTeam && user?.role === 'creator')
    const showTeamTab = isMCN || isCreatorInTeam

    // Calculate team member IDs for filtering
    const teamMemberIds = useMemo(() => {
        if (!user) return []

        if (isMCN && teamMembers && teamMembers.length > 0) {
            // MCN: show team members (creators)
            const ids = teamMembers.map(m => m.user_id)
            return ids
        }

        if (isCreatorInTeam && teamMembers && currentTeam) {
            // Creator: show MCN owner (find owner from team_members)
            const owner = teamMembers.find(m => m.role === 'owner')
            return owner ? [owner.user_id] : []
        }

        return []
    }, [isMCN, isCreatorInTeam, teamMembers, currentTeam, user])

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
                        <p className="font-medium">{(proposal as any).channel_name || '미정'}</p>
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

        // [Workspaces] workspace 협업 메시지(workspace_id 있음)는 일반 DM 목록에서 제외
        const dmMessages = allMessages.filter(msg => !msg.workspaceId)
        dmMessages.forEach(msg => {
            const isMe = msg.senderId === displayUser.id
            const otherId = isMe ? msg.receiverId : msg.senderId
            const otherName = isMe ? msg.receiverName : msg.senderName
            const otherAvatar = isMe ? msg.receiverAvatar : msg.senderAvatar
            const pId = msg.proposalId ? msg.proposalId.toString() : 'general'

            // Unique key for each thread: other user + proposal ID
            const threadKey = `${otherId}-${pId}`

            if (!groups[threadKey]) {
                const proposal = msg.proposalId ? brandProposals?.find(p => p.id?.toString() === msg.proposalId?.toString()) : null
                const proposalSuffix = proposal ? ` (${proposal.product_name})` : ""

                groups[threadKey] = {
                    id: threadKey, // Use key as thread ID
                    user: (otherName || "사용자") + proposalSuffix,
                    avatar: otherAvatar || "",
                    lastMessage: msg.content,
                    time: msg.timestamp,
                    messages: [],
                    unread: 0,
                    online: false,
                    handle: ""
                }
            }
            groups[threadKey].messages.push(msg)

            if (new Date(msg.timestamp) >= new Date(groups[threadKey].time)) {
                groups[threadKey].lastMessage = msg.content
                groups[threadKey].time = msg.timestamp
                if (otherName && !msg.proposalId) { // Only update name from message if it's general, or if name is provided
                    // Actually let's keep the user name stable but add proposal suffix
                }
            }
        })

        let result = Object.values(groups)

        // Filter by team members if "team" tab is active
        if (activeTab === 'team' && teamMemberIds.length > 0) {
            result = result.filter(thread => {
                // Extract otherId from threadKey (format: "userId-proposalId")
                // Use lastIndexOf to handle UUIDs which contain hyphens
                const lastDashIndex = thread.id.lastIndexOf('-')
                const otherId = lastDashIndex > 0 ? thread.id.substring(0, lastDashIndex) : thread.id
                const match = teamMemberIds.includes(otherId)
                return match
            })
        }

        // Add team members with no conversation history (only for MCN in team tab)
        if (activeTab === 'team' && isMCN && teamMembers) {
            teamMembers.forEach(member => {
                const existingThread = result.find(t => t.id.startsWith(member.user_id))
                if (!existingThread) {
                    result.push({
                        id: `${member.user_id}-general`,
                        user: member.profile?.display_name || '팀원',
                        avatar: member.profile?.avatar_url || '',
                        lastMessage: '대화를 시작해보세요',
                        time: new Date().toISOString(),
                        messages: [],
                        unread: 0,
                        online: false,
                        handle: ''
                    })
                }
            })
        }

        return result.sort((a, b) =>
            new Date(b.time).getTime() - new Date(a.time).getTime()
        )
    }, [allMessages, displayUser, activeTab, teamMemberIds, isMCN, teamMembers, brandProposals])

    // Set initial active thread if none selected
    useEffect(() => {
        if (!activeThreadId && threads.length > 0) {
            setActiveThreadId(threads[0].id)
        }
    }, [threads, activeThreadId])

    const activeThread = threads.find(t => t.id === activeThreadId)

    // Auto-scroll chat to bottom (only chat area, not page)
    useEffect(() => {
        if (scrollRef.current) {
            // Use scrollIntoView with block: 'nearest' to prevent page scroll
            scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
        }
    }, [activeThread?.messages])

    const handleSendMessage = async () => {
        if ((!messageInput.trim() && !selectedFile) || !activeThreadId || isSending) return

        // Guest users cannot send messages
        if (!user) {
            toast.error("메시지를 보내려면 먼저 로그인해 주세요.")
            return
        }

        setIsSending(true)
        const content = messageInput
        const fileToUpload = selectedFile
        setMessageInput("") // Optimistic clear
        setSelectedFile(null) // Clear file

        // Reset textarea height to prevent invisible line breaks after send
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = '24px'
        }

        try {
            // Upload file first if exists
            let uploadedFile: { url: string; name: string; size: number; type: string } | undefined
            if (fileToUpload) {
                uploadedFile = await uploadFile(fileToUpload)
            }

            // activeThreadId is "otherId-pId"
            const lastDashIndex = activeThreadId.lastIndexOf('-')
            const toUserId = activeThreadId.substring(0, lastDashIndex)
            const pIdStr = activeThreadId.substring(lastDashIndex + 1)
            const pId = pIdStr === 'general' ? undefined : pIdStr

            await sendMessage(toUserId, content, uploadedFile, pId)
        } catch (e) {
            console.error("Failed to send message:", e)
            setMessageInput(content) // Restore on error
            setSelectedFile(fileToUpload) // Restore file
        } finally {
            setIsSending(false)
            // re-render(disabled 해제) 이후에 포커스 복원
            setTimeout(() => textareaRef.current?.focus(), 0)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Don't send if still composing Korean or already sending
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
        // Reset input so same file can be selected again if removed
        e.target.value = ''
    }

    // Get file URL from Supabase Storage
    const getStorageUrl = (path: string) => {
        const { data } = supabase.storage.from('message-files').getPublicUrl(path)
        return data.publicUrl
    }

    // Download file
    const downloadFile = async (path: string, filename: string) => {
        try {
            const { data, error } = await supabase.storage.from('message-files').download(path)
            if (error) throw error

            const url = URL.createObjectURL(data)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('[Download] Error:', err)
            toast.error('파일 다운로드에 실패했습니다.')
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
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <SiteHeader />
            <div className="flex-1 container max-w-[1920px] py-6 px-4 md:px-8 overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
                <div className="grid grid-cols-12 h-full gap-6 bg-card rounded-xl border shadow-sm overflow-hidden">

                    {/* Sidebar / Thread List */}
                    <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r flex flex-col bg-muted/10">
                        <div className="p-4 border-b">
                            <h2 className="font-semibold text-lg mb-4 px-2">메시지</h2>

                            {/* Tab Switcher for MCN/Creator Team Messages */}
                            {showTeamTab && (
                                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'team')} className="mb-4">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="all">모든 메시지</TabsTrigger>
                                        <TabsTrigger value="team">
                                            {isMCN ? '팀 메시지' : 'MCN 메시지'}
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            )}

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

                    {/* Main Chat Area */}
                    <div className="col-span-12 md:col-span-5 lg:col-span-6 flex flex-col h-full overflow-hidden">
                        {activeThread ? (
                            <>
                                {/* Chat Header */}
                                <div className="border-b p-4 flex items-center justify-between bg-card">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                                            <AvatarImage src={activeThread.avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {activeThread.user.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-sm">{activeThread.user}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium border border-emerald-500/20">
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

                                {/* 대화내용 검색바 - 항상 표시 */}
                                <div className="px-4 py-2 border-b bg-muted/10 flex items-center gap-2">
                                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <input
                                        placeholder="대화내용 검색..."
                                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                                        value={chatSearchQuery}
                                        onChange={e => setChatSearchQuery(e.target.value)}
                                    />
                                    {chatSearchQuery && (
                                        <>
                                            <span className="text-xs text-muted-foreground shrink-0 font-medium">
                                                {activeThread?.messages.filter(m => (m.content || '').toLowerCase().includes(chatSearchQuery.toLowerCase())).length || 0}건
                                            </span>
                                            <button onClick={() => setChatSearchQuery('')} className="text-muted-foreground hover:text-foreground">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Message List */}
                                <ScrollArea className="flex-1 p-6 bg-muted/5">
                                    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                                        {(chatSearchQuery
                                            ? activeThread.messages.filter(m => m.content?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                                            : activeThread.messages
                                        ).map((msg, index) => {
                                            const isMe = msg.senderId === displayUser.id
                                            const highlight = !!(chatSearchQuery && msg.content?.toLowerCase().includes(chatSearchQuery.toLowerCase()))

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
                                                        {msg.content && (
                                                            <div
                                                                className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe
                                                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                                                    : "bg-white dark:bg-muted/50 border rounded-tl-none"
                                                                    } ${highlight ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}
                                                            >
                                                                {msg.content}
                                                                {msg.proposalId && renderProposalCard(msg.proposalId)}
                                                            </div>
                                                        )}

                                                        {/* File Attachment */}
                                                        {msg.fileUrl && msg.fileName && (
                                                            <div className={`mt-2 ${msg.content ? '' : ''}`}>
                                                                {msg.fileType && isImage(msg.fileType) ? (
                                                                    // Image preview
                                                                    <img
                                                                        src={getStorageUrl(msg.fileUrl)}
                                                                        alt={msg.fileName}
                                                                        className="max-w-xs rounded-lg border shadow-sm cursor-pointer"
                                                                        onClick={() => window.open(getStorageUrl(msg.fileUrl), '_blank')}
                                                                    />
                                                                ) : (
                                                                    // File download card
                                                                    <Card className={`p-3 max-w-xs ${isMe ? 'bg-primary/10' : 'bg-muted/50'}`}>
                                                                        <div className="flex items-center gap-3">
                                                                            <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium truncate">
                                                                                    {msg.fileName}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    {msg.fileSize && formatFileSize(msg.fileSize)}
                                                                                </p>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="h-8 w-8 p-0"
                                                                                onClick={() => downloadFile(msg.fileUrl!, msg.fileName!)}
                                                                            >
                                                                                <Download className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </Card>
                                                                )}
                                                            </div>
                                                        )}

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
                                    {!user ? (
                                        <div className="max-w-3xl mx-auto">
                                            <div className="bg-muted/50 border-2 border-dashed rounded-xl p-4 text-center">
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    메시지를 보내려면 로그인이 필요합니다
                                                </p>
                                                <Button size="sm" asChild>
                                                    <a href="/login">로그인하기</a>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-w-3xl mx-auto space-y-2">
                                            {/* File Preview */}
                                            {selectedFile && (
                                                <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3 border">
                                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatFileSize(selectedFile.size)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() => setSelectedFile(null)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Message Input */}
                                            <div className="flex items-end gap-2 bg-muted/30 p-2 rounded-xl border focus-within:ring-1 focus-within:ring-ring transition-all">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                                                    onChange={handleFileSelect}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground shrink-0 rounded-lg hover:bg-muted"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploading}
                                                >
                                                    <Paperclip className="h-4 w-4" />
                                                </Button>
                                                <div className="flex-1 py-1.5">
                                                    <textarea
                                                        ref={textareaRef}
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
                                                    disabled={(!messageInput.trim() && !selectedFile) || isSending || uploading}
                                                    size="icon"
                                                    className="h-9 w-9 shrink-0 rounded-lg transition-all"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
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

                    {/* Right Sidebar - File Gallery & Search */}
                    {activeThreadId && activeThread && (
                        <div className="col-span-12 md:col-span-3 lg:col-span-3 border-l bg-muted/5 flex flex-col overflow-hidden">
                            <Tabs defaultValue="files" className="h-full flex flex-col">
                                <div className="border-b p-4 pb-0">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="files">파일</TabsTrigger>
                                        <TabsTrigger value="search">검색</TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Files Tab */}
                                <div className="flex-1 overflow-hidden">
                                    <ScrollArea className="h-full">
                                        <div className="p-4 space-y-2">
                                            <h4 className="text-xs font-semibold text-muted-foreground mb-3">주고받은 파일</h4>
                                            {activeThread.messages.filter(msg => msg.fileUrl).length > 0 ? (
                                                activeThread.messages
                                                    .filter(msg => msg.fileUrl)
                                                    .reverse() // Show newest first
                                                    .map(msg => (
                                                        <Card
                                                            key={msg.id}
                                                            className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                                            onClick={() => {
                                                                if (msg.fileType && isImage(msg.fileType)) {
                                                                    window.open(getStorageUrl(msg.fileUrl!), '_blank')
                                                                } else {
                                                                    downloadFile(msg.fileUrl!, msg.fileName!)
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {msg.fileType && isImage(msg.fileType) ? (
                                                                    <img
                                                                        src={getStorageUrl(msg.fileUrl!)}
                                                                        className="w-12 h-12 object-cover rounded"
                                                                        alt={msg.fileName}
                                                                    />
                                                                ) : (
                                                                    <FileText className="h-12 w-12 text-muted-foreground" />
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">
                                                                        {msg.fileName}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {msg.fileSize && formatFileSize(msg.fileSize)} • {formatTime(msg.timestamp)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">파일이 없습니다</p>
                                                    <p className="text-xs mt-1">대화에서 주고받은 파일이 여기에 표시됩니다</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>

                                {/* Search Tab */}
                                <div className="flex-1 overflow-hidden hidden data-[state=active]:block">
                                    <div className="p-4 space-y-4 h-full flex flex-col">
                                        <div>
                                            <Input
                                                placeholder="대화 내용 검색..."
                                                className="w-full"
                                            />
                                        </div>
                                        <ScrollArea className="flex-1">
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">검색 키워드를 입력하세요</p>
                                                <p className="text-xs mt-1">대화 내용에서 검색합니다</p>
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </Tabs>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}
