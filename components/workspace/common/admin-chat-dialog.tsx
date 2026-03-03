"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { MessageSquare } from "lucide-react"
import { ChatArea } from "./chat-area"

interface AdminChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    adminId: string | undefined;
}

export function AdminChatDialog({ open, onOpenChange, adminId }: AdminChatDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[80vh] min-h-[500px] max-h-[800px] flex flex-col p-0 overflow-hidden bg-background gap-0 border-border/50 shadow-2xl">
                <DialogHeader className="p-4 sm:p-5 border-b bg-muted/30 shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                            고객센터 1:1 문의
                            <DialogDescription className="text-xs mt-0.5 font-normal">
                                관리자가 확인 후 답변해 드립니다. 업무 시간에 따라 답변이 지연될 수 있습니다.
                            </DialogDescription>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative">
                    {!adminId ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                            <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                            <p className="text-sm font-medium">관리자 계정 정보를 불러올 수 없습니다.</p>
                            <p className="text-xs mt-1">잠시 후 다시 시도하거나 이메일(admin@creadypick.com)로 문의해주세요.</p>
                        </div>
                    ) : (
                        <ChatArea className="h-full bg-transparent" overrideOtherId={adminId} isAdminChat={true} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
