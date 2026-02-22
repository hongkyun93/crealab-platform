"use client"

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Loader2, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

// 허용 MIME 타입 (문서, PDF, GIF만)
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/gif',
]
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface ChatAreaProps {
    className?: string;
}

export function ChatArea({ className }: ChatAreaProps) {
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { messages, sendMessage, user } = useUnifiedProvider();
    const { supabase } = useAuth();

    const [chatMessage, setChatMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    // 한국어 IME 조합 중 여부 (조합 중 Enter 전송 방지)
    const [isComposing, setIsComposing] = useState(false);
    // 첨부 파일 상태
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Determine proposal type
    const p = proposal as any;
    const isCampaignProposal = p?.type === 'creator_apply' || !!p?.campaignId;
    const isMomentProposal = !!p?.moment_id;
    const proposalIdStr = p?.id?.toString();
    const workspaceId: string | undefined = p?.workspace_id;

    // Determine the OTHER party's user ID
    const otherId: string | undefined = useMemo(() => {
        if (!p || !user?.id) return undefined;

        const brandUserId: string | undefined =
            p.brand_id || p.brandId || p.campaign?.brand_id;
        const influencerUserId: string | undefined =
            p.influencer_id || p.influencerId;

        if (user.id === brandUserId) return influencerUserId;
        if (user.id === influencerUserId) return brandUserId;
        if (user.role === 'brand') return influencerUserId;
        return brandUserId;
    }, [p, user?.id, user?.role]);

    // Filter messages: match by sender/receiver pair AND proposal ID.
    // Guard: proposalIdStr 없으면 빈 배열 반환 → 크로스 워크스테이션 누출 방지
    const filteredMessages = useMemo(() => {
        if (!user?.id || !otherId || !proposalIdStr) return [];

        return messages.filter((msg) => {
            const senderReceiverMatch =
                (msg.senderId === user.id && msg.receiverId === otherId) ||
                (msg.senderId === otherId && msg.receiverId === user.id);

            if (!senderReceiverMatch) return false;

            // [1순위] workspace_id로 격리 (신규 메시지 — 모든 proposal 타입 공통)
            if (workspaceId && msg.workspaceId) {
                return msg.workspaceId === workspaceId;
            }

            // [2순위] legacy 메시지: proposal_id 또는 brand_proposal_id로 매칭
            if (msg.proposalId) return msg.proposalId === proposalIdStr;
            if (msg.productApplicationId) return msg.productApplicationId === proposalIdStr;

            // [차단] proposal/workspace 식별자 없는 메시지 — 누출 방지
            return false;
        });
    }, [messages, user?.id, otherId, isCampaignProposal, isMomentProposal, proposalIdStr, workspaceId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredMessages]);

    // 파일 유효성 검사
    const validateFile = useCallback((file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return `파일 크기가 5MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
        }
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
            return `허용되지 않는 파일 형식입니다. PDF, DOC, DOCX, GIF만 업로드 가능합니다.`;
        }
        return null;
    }, []);

    // 파일 선택 핸들러
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
        e.target.value = ''; // 동일 파일 재선택 허용
    }, [validateFile]);

    // 파일 업로드 → 메시지 전송
    const handleSend = async () => {
        const trimmed = chatMessage.trim();
        if ((!trimmed && !pendingFile) || !proposal || isSending || isUploading || !otherId) return;

        const msgContent = trimmed;
        setChatMessage('');

        let uploadedFile: { url: string; name: string; size: number; type: string } | undefined;

        if (pendingFile) {
            setIsUploading(true);
            try {
                // Supabase Storage: workspace-files 버킷
                const folder = workspaceId || proposalIdStr || 'unknown';
                // 파일명에서 공백/특수문자 제거 (Storage key 안전하게)
                const safeFileName = `${Date.now()}_${pendingFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
                const path = `${folder}/${safeFileName}`;

                const { data, error } = await supabase.storage
                    .from('workspace-files')
                    .upload(path, pendingFile, { upsert: false });

                if (error) {
                    toast.error('파일 업로드에 실패했습니다.');
                    console.error('[ChatArea] Upload error:', error);
                    setChatMessage(msgContent); // 메시지 복원
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('workspace-files')
                    .getPublicUrl(path);

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
            // workspaceId를 기본 격리 키로 전송 (모든 proposal 타입 공통)
            await sendMessage(otherId, msgContent, uploadedFile, undefined, undefined, workspaceId);
        } catch (e) {
            console.error('[ChatArea] Message send failed:', e);
            setChatMessage(msgContent);
            toast.error('메시지 전송에 실패했습니다.');
        } finally {
            setIsSending(false);
            textareaRef.current?.focus();
        }
    };

    // 한국어 IME 버그 방지:
    // - onCompositionStart/End 로 조합 중 상태 추적
    // - isComposing 중에는 Enter 전송 차단
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // isComposing: 한국어 조합 중 (예: 'ㅎ' + Enter 시 전송 방지)
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

    // Group messages by date
    const groupedMessages = useMemo(() => {
        const groups: { date: string; messages: typeof filteredMessages }[] = [];
        filteredMessages.forEach((msg) => {
            const date = formatDate(msg.timestamp);
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.date === date) {
                lastGroup.messages.push(msg);
            } else {
                groups.push({ date, messages: [msg] });
            }
        });
        return groups;
    }, [filteredMessages]);

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
                {filteredMessages.length === 0 ? (
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

                            {/* Messages in this date group */}
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
                        title="파일 첨부 (PDF, DOC, DOCX, GIF · 5MB 이하)"
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
                            // 한국어 IME 조합 중 상태 추적 — 조합 완료 전 Enter 전송 방지
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
                    Enter로 전송 · Shift+Enter로 줄바꿈 · 파일첨부: PDF, DOC, DOCX, GIF (5MB 이하)
                </p>
            </div>
        </div>
    );
}
