"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { toast } from 'sonner';

interface ChatAreaProps {
    className?: string;
}

export function ChatArea({ className }: ChatAreaProps) {
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { messages, sendMessage, user } = useUnifiedProvider();

    const [chatMessage, setChatMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Determine proposal type
    // campaign_application: type === 'creator_apply' or has campaignId
    // brand_proposal: type === 'brand_offer', has brand_id + influencer_id, NO moment_id
    // moment_proposal: has moment_id (merged into brandProposals array but different table)
    const p = proposal as any;
    const isCampaignProposal = p?.type === 'creator_apply' || !!p?.campaignId;
    const isMomentProposal = !!p?.moment_id;
    const proposalIdStr = p?.id?.toString();
    const workspaceId: string | undefined = p?.workspace_id; // [Workspaces]

    // Determine the OTHER party's user ID.
    // The workspace store proposal always has brand_id (UUID of brand user) and influencer_id (UUID of creator).
    // If current user is the brand → other party is influencer_id.
    // If current user is the creator → other party is brand_id.
    // For campaign_application: brandId (camelCase) = brand user ID, influencerId = creator user ID.
    const otherId: string | undefined = useMemo(() => {
        if (!p || !user?.id) return undefined;

        const brandUserId: string | undefined =
            p.brand_id || p.brandId || p.campaign?.brand_id;
        const influencerUserId: string | undefined =
            p.influencer_id || p.influencerId;

        // If current user is the brand, the other party is the influencer
        if (user.id === brandUserId) return influencerUserId;
        // If current user is the influencer, the other party is the brand
        if (user.id === influencerUserId) return brandUserId;

        // Fallback: try to determine from role
        if (user.role === 'brand') return influencerUserId;
        return brandUserId;
    }, [p, user?.id, user?.role]);

    // Filter messages: match by sender/receiver pair AND proposal ID.
    // This ensures that even if the same brand and creator have multiple proposals,
    // each workspace chat shows only messages belonging to that specific proposal.
    const filteredMessages = useMemo(() => {
        // [Guard] If no proposal ID is resolved yet, show nothing to prevent cross-workspace leakage
        if (!user?.id || !otherId || !proposalIdStr) return [];

        return messages.filter((msg) => {
            const senderReceiverMatch =
                (msg.senderId === user.id && msg.receiverId === otherId) ||
                (msg.senderId === otherId && msg.receiverId === user.id);

            if (!senderReceiverMatch) return false;

            // [Primary] workspace_id isolation (new messages)
            if (workspaceId && msg.workspaceId) {
                return msg.workspaceId === workspaceId;
            }

            // [Secondary] proposal_id / brand_proposal_id isolation (legacy messages)
            // Try both columns — proposalIdStr may refer to either proposal type
            if (msg.proposalId) return msg.proposalId === proposalIdStr;
            if (msg.brandProposalId) return msg.brandProposalId === proposalIdStr;

            // [Last resort] If message has no proposal/workspace identifier at all,
            // exclude it to prevent cross-workspace leakage.
            return false;
        });
    }, [messages, user?.id, otherId, isCampaignProposal, isMomentProposal, proposalIdStr, workspaceId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredMessages]);

    const handleSend = async () => {
        if (!chatMessage.trim() || !proposal || isSending || !otherId) return;

        const msgContent = chatMessage;
        setChatMessage('');
        setIsSending(true);

        try {
            // [Workspaces] Send with workspaceId for unified message isolation.
            // workspaceId is stored in messages.workspace_id (no FK constraint → no violation).
            // Old FK columns (proposal_id, brand_proposal_id) are intentionally NOT used
            // to avoid 23503 FK violation on campaign/moment proposal IDs.
            await sendMessage(otherId, msgContent, undefined, undefined, undefined, workspaceId);
        } catch (e) {
            console.error('[ChatArea] Message send failed:', e);
            setChatMessage(msgContent);
            toast.error('메시지 전송에 실패했습니다.');
        } finally {
            setIsSending(false);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
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

    return (
        <div className={cn('flex flex-col h-full bg-background/50', className)}>
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
                                                            className="block mt-2 text-xs underline opacity-80 hover:opacity-100"
                                                        >
                                                            📎 {msg.fileName || '첨부파일'}
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

            {/* Input Area */}
            <div className="p-4 bg-background border-t shrink-0">
                <div className="flex items-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground shrink-0 mb-0.5"
                        disabled
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
                            rows={1}
                            className="resize-none bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all min-h-[40px] max-h-[120px] py-2.5"
                            style={{ height: 'auto' }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                            }}
                        />
                    </div>
                    <Button
                        size="icon"
                        className="shrink-0 bg-primary hover:bg-primary/90 mb-0.5"
                        onClick={handleSend}
                        disabled={!chatMessage.trim() || isSending || !otherId}
                    >
                        {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 ml-0.5" />
                        )}
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 pl-10">
                    Enter로 전송 · Shift+Enter로 줄바꿈
                </p>
            </div>
        </div>
    );
}
