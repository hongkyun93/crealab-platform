"use client"

import { useAuth } from '@/components/providers/auth-provider';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { uploadFileViaAPI } from '@/lib/upload';
import { FileText, Loader2, Paperclip, Send, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useWorkspaceStore } from '../hooks/use-workspace-store';

// 허용 MIME 타입 (문서, PDF, 이미지)
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
]
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'gif', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

interface LocalMessage {
    id: string;
    senderId: string;
    receiverId: string;
    workspaceId?: string | null;
    proposalId?: string | null;
    productApplicationId?: string | null;
    content: string;
    timestamp: string;
    read: boolean;
    senderName: string;
    senderAvatar?: string;
    receiverName: string;
    receiverAvatar?: string;
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    fileType?: string | null;
}

function formatRawMessages(data: any[]): LocalMessage[] {
    return data.map((msg: any) => ({
        id: msg.id.toString(),
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        workspaceId: msg.workspace_id ?? null,
        proposalId: msg.proposal_id ?? null,
        productApplicationId: msg.product_application_id ?? null,
        content: msg.content || '',
        timestamp: msg.created_at,
        read: msg.is_read || false,
        senderName: msg.sender?.display_name || 'User',
        senderAvatar: msg.sender?.avatar_url,
        receiverName: msg.receiver?.display_name || 'User',
        receiverAvatar: msg.receiver?.avatar_url,
        fileUrl: msg.file_url ?? null,
        fileName: msg.file_name ?? null,
        fileSize: msg.file_size ?? null,
        fileType: msg.file_type ?? null,
    }))
}

interface ChatAreaProps {
    className?: string;
}

export function ChatArea({ className }: ChatAreaProps) {
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { sendMessage, user } = useUnifiedProvider();
    const { supabase } = useAuth();

    // ── 로컬 메시지 상태 (워크스페이스 단위로 격리) ──
    const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
    const [isLocalLoading, setIsLocalLoading] = useState(false);

    const [chatMessage, setChatMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Proposal 메타데이터
    const p = proposal as any;
    const isCampaignProposal = p?.type === 'creator_apply' || !!p?.campaignId;
    const isMomentProposal = !!p?.moment_id;
    const proposalIdStr = p?.id?.toString();
    const workspaceId: string | undefined = p?.workspace_id;

    const projectName = useMemo(() => {
        if (!p) return '';
        if (isCampaignProposal) return p.campaignName || p.productName || p.campaign?.title || '캠페인';
        if (isMomentProposal) return p.title || p.moment?.title || '모먼트';
        return p.product_name || p.productName || '제품 제안';
    }, [p, isCampaignProposal, isMomentProposal]);

    // 상대방 user ID
    const otherId: string | undefined = useMemo(() => {
        if (!p || !user?.id) return undefined;
        const brandUserId: string | undefined = p.brand_id || p.brandId || p.campaign?.brand_id;
        const creatorUserId: string | undefined = p.creator_id || p.creatorId;
        if (user.id === brandUserId) return creatorUserId;
        if (user.id === creatorUserId) return brandUserId;
        if (user.role === 'brand') return creatorUserId;
        return brandUserId;
    }, [p, user?.id, user?.role]);

    // ── 메시지 fetch (DB 레벨에서 워크스페이스 단위 격리) ──
    const fetchLocalMessages = useCallback(async () => {
        if (!user?.id) return;
        setIsLocalLoading(true);
        try {
            const SELECT = `
                *,
                sender:profiles!sender_id(id, display_name, avatar_url),
                receiver:profiles!receiver_id(id, display_name, avatar_url)
            `;

            let data: any[] | null = null;

            if (workspaceId) {
                // [1순위] workspace_id로 정확히 격리 — 가장 안전한 방법
                const { data: d } = await supabase
                    .from('messages')
                    .select(SELECT)
                    .eq('workspace_id', workspaceId)
                    .order('created_at', { ascending: true });
                data = d;
            } else if (proposalIdStr && !isMomentProposal && !isCampaignProposal) {
                // [2순위] product_application 전용: proposal_id FK 사용
                const { data: d } = await supabase
                    .from('messages')
                    .select(SELECT)
                    .eq('proposal_id', proposalIdStr)
                    .is('workspace_id', null)
                    .order('created_at', { ascending: true });
                data = d;
            } else if (otherId && user?.id) {
                // [3순위] 레거시 moment/campaign: workspace_id, proposal_id 모두 없는 메시지만
                // sender/receiver pair + 모든 식별자가 null인 것만 표시
                const { data: d } = await supabase
                    .from('messages')
                    .select(SELECT)
                    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
                    .is('workspace_id', null)
                    .is('proposal_id', null)
                    .is('product_application_id', null)
                    .order('created_at', { ascending: true });
                data = d;
            }

            if (data) {
                setLocalMessages(formatRawMessages(data));
            }
        } catch (err) {
            console.error('[ChatArea] fetchLocalMessages error:', err);
        } finally {
            setIsLocalLoading(false);
        }
    }, [workspaceId, proposalIdStr, isMomentProposal, isCampaignProposal, otherId, user?.id, supabase]);

    // ── 초기 로드 + 워크스페이스 단위 Realtime 구독 ──
    useEffect(() => {
        fetchLocalMessages();

        // Realtime: workspace_id 있으면 workspace 채널로 구독
        // 없으면 sender/receiver pair 기반 구독 (레거시)
        if (!workspaceId && !otherId) return;

        const channelName = workspaceId
            ? `workspace-chat-${workspaceId}`
            : `legacy-chat-${[user?.id, otherId].sort().join('-')}`;

        const filter = workspaceId
            ? `workspace_id=eq.${workspaceId}`
            : `receiver_id=eq.${user?.id}`;

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter },
                () => { fetchLocalMessages(); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [workspaceId, otherId, user?.id, fetchLocalMessages, supabase]);

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [localMessages]);

    // 파일 유효성 검사
    const validateFile = useCallback((file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return `파일 크기가 20MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
        }
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
            return `허용되지 않는 파일 형식입니다. PDF, DOC, DOCX, GIF만 업로드 가능합니다.`;
        }
        return null;
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const error = validateFile(file);
        if (error) {
            toast.error(error);
            e.target.value = '';
            return;
        }
        setPendingFile(file);
        e.target.value = '';
    }, [validateFile]);

    const handleSend = async () => {
        const trimmed = chatMessage.trim();
        if ((!trimmed && !pendingFile) || !proposal || isSending || isUploading || !otherId) return;

        const msgContent = trimmed;
        setChatMessage('');

        let uploadedFile: { url: string; name: string; size: number; type: string } | undefined;

        if (pendingFile) {
            setIsUploading(true);
            try {
                const folder = workspaceId || proposalIdStr || 'unknown';
                const publicUrl = await uploadFileViaAPI(pendingFile, 'workspace-files', folder);
                uploadedFile = {
                    url: publicUrl,
                    name: pendingFile.name,
                    size: pendingFile.size,
                    type: pendingFile.type,
                };
                setPendingFile(null);
            } catch (e) {
                toast.error('파일 업로드 중 오류가 발생했습니다.');
                console.error('[ChatArea] Upload exception:', e);
                setChatMessage(msgContent);
                return;
            } finally {
                setIsUploading(false);
            }
        }

        setIsSending(true);
        try {
            await sendMessage(otherId, msgContent, uploadedFile, workspaceId, projectName);
            // 전송 후 로컬 메시지 갱신
            await fetchLocalMessages();
        } catch (e) {
            console.error('[ChatArea] Message send failed:', e);
            setChatMessage(msgContent);
            toast.error('메시지 전송에 실패했습니다.');
        } finally {
            setIsSending(false);
            // re-render(disabled 해제) 이후에 포커스 복원
            setTimeout(() => textareaRef.current?.focus(), 0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            if (isComposing) return;
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    const formatDate = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return '';
        }
    };

    // 날짜별 그룹
    const groupedMessages = useMemo(() => {
        const groups: { date: string; messages: typeof localMessages }[] = [];
        localMessages.forEach((msg) => {
            const date = formatDate(msg.timestamp);
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.date === date) {
                lastGroup.messages.push(msg);
            } else {
                groups.push({ date, messages: [msg] });
            }
        });
        return groups;
    }, [localMessages]);

    const isBusy = isSending || isUploading;

    return (
        <div className={cn('flex flex-col h-full bg-background/50', className)}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/gif"
                onChange={handleFileChange}
            />

            {/* Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
                {isLocalLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : localMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Send className="w-5 h-5 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">대화를 시작해보세요</p>
                        <p className="text-xs mt-1 opacity-60">협업에 관한 내용을 자유롭게 나눠보세요.</p>
                    </div>
                ) : (
                    groupedMessages.map((group) => (
                        <div key={group.date}>
                            {/* Date Separator */}
                            <div className="flex justify-center my-4">
                                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                    {group.date}
                                </span>
                            </div>

                            {/* Messages */}
                            <div className="space-y-3">
                                {group.messages.map((msg) => {
                                    const isMyMessage = msg.senderId === user?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                'flex gap-3 max-w-[80%]',
                                                isMyMessage ? 'ml-auto flex-row-reverse' : ''
                                            )}
                                        >
                                            {/* Avatar (only for other party) */}
                                            {!isMyMessage && (
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                                                    {msg.senderAvatar ? (
                                                        <img
                                                            src={msg.senderAvatar}
                                                            alt={msg.senderName || ''}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">
                                                            {msg.senderName?.[0] || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className={cn('space-y-1', isMyMessage ? 'text-right' : '')}>
                                                {/* Sender name (only for other party) */}
                                                {!isMyMessage && (
                                                    <p className="text-[10px] text-muted-foreground pl-1">
                                                        {msg.senderName}
                                                    </p>
                                                )}

                                                {/* Message bubble */}
                                                <div
                                                    className={cn(
                                                        'rounded-2xl p-3 shadow-sm text-sm whitespace-pre-wrap break-words',
                                                        isMyMessage
                                                            ? 'bg-primary text-primary-foreground rounded-tr-none text-left'
                                                            : 'bg-muted border rounded-tl-none'
                                                    )}
                                                >
                                                    {msg.content}
                                                    {/* File attachment */}
                                                    {msg.fileUrl && (
                                                        <a
                                                            href={msg.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 mt-2 text-xs underline opacity-80 hover:opacity-100"
                                                        >
                                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                                            {msg.fileName || '첨부파일'}
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Timestamp */}
                                                <span
                                                    className={cn(
                                                        'text-[10px] text-muted-foreground',
                                                        isMyMessage ? 'pr-1' : 'pl-1'
                                                    )}
                                                >
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Pending file preview */}
            {pendingFile && (
                <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 bg-muted/60 border border-border/50 rounded-lg text-xs">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="flex-1 truncate font-medium">{pendingFile.name}</span>
                    <span className="text-muted-foreground shrink-0">{(pendingFile.size / 1024).toFixed(0)}KB</span>
                    <button
                        onClick={() => setPendingFile(null)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-background border-t shrink-0">
                <div className="flex items-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground shrink-0 mb-0.5"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isBusy}
                        title="파일 첨부 (PDF, DOC, DOCX, GIF · 20MB 이하)"
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <Textarea
                            ref={textareaRef}
                            placeholder="메시지를 입력하세요..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            rows={1}
                            className="resize-none bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all min-h-[40px] max-h-[120px] py-2.5"
                            style={{ height: 'auto' }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                            }}
                            disabled={isBusy}
                        />
                    </div>
                    <Button
                        size="icon"
                        className="shrink-0 bg-primary hover:bg-primary/90 mb-0.5"
                        onClick={handleSend}
                        disabled={(!chatMessage.trim() && !pendingFile) || isBusy || !otherId}
                    >
                        {isBusy ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 ml-0.5" />
                        )}
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 pl-10">
                    Enter로 전송 · Shift+Enter로 줄바꿈 · 파일첨부: PDF, DOC, DOCX, GIF (20MB 이하)
                </p>
            </div>
        </div>
    );
}
