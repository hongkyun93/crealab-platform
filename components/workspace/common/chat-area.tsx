
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatAreaProps {
    className?: string;
}

export function ChatArea({ className }: ChatAreaProps) {
    // Placeholder for real chat integration
    // This will be connected to the existing chat logic later

    return (
        <div className={cn("flex flex-col h-full bg-background/50", className)}>
            {/* Header (Optional, if not handled by layout) */}

            {/* Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
                <div className="flex justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        2026년 2월 14일 협업 시작
                    </span>
                </div>

                {/* Mock Messages */}
                <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="space-y-1">
                        <div className="bg-muted border rounded-2xl rounded-tl-none p-3 shadow-sm text-sm">
                            안녕하세요! 이번 프로젝트 잘 부탁드립니다.
                        </div>
                        <span className="text-[10px] text-muted-foreground pl-1">오전 10:30</span>
                    </div>
                </div>

                <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
                    <div className="space-y-1 text-right">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-3 shadow-sm text-sm text-left">
                            네 반갑습니다! 조건 확인해주시고 확정 부탁드려요 :)
                        </div>
                        <span className="text-[10px] text-muted-foreground pr-1">오전 10:32</span>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <div className="relative flex-1">
                        <Input
                            placeholder="메시지를 입력하세요..."
                            className="pr-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all"
                        />
                        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full text-muted-foreground hover:text-foreground">
                            <Smile className="w-5 h-5" />
                        </Button>
                    </div>
                    <Button size="icon" className="shrink-0 bg-primary hover:bg-primary/90">
                        <Send className="w-4 h-4 ml-0.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
