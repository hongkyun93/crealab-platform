import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"

interface AIPlanModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    planContent: string
}

export function AIPlanModal({ isOpen, onOpenChange, planContent }: AIPlanModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" /> AI 기획안
                    </DialogTitle>
                    <DialogDescription>
                        AI가 제안하는 캠페인 콘텐츠 기획안입니다. 참고하여 어필 메시지를 작성해보세요.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    <Textarea
                        value={planContent}
                        readOnly
                        className="min-h-[250px] bg-gray-50 border-gray-200 text-gray-800"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>닫기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
