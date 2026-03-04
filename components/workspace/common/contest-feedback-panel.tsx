import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, MessageSquare } from "lucide-react"

interface ContestFeedbackPanelProps {
    feedbackCount: number;
    maxLimit?: number;
    onSendFeedback: () => void;
    onApprove: () => void;
}

export function ContestFeedbackPanel({
    feedbackCount,
    maxLimit = 2,
    onSendFeedback,
    onApprove
}: ContestFeedbackPanelProps) {
    const remaining = maxLimit - feedbackCount;
    const isLocked = remaining <= 0;

    return (
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    영상 피드백 요청
                </h4>
                <div className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    잔여 횟수: <span className={isLocked ? "text-red-500" : "text-primary"}>{remaining}</span> / {maxLimit}회
                </div>
            </div>

            <p className="text-sm text-slate-500">
                광고 콘테스트의 피드백은 최대 2회까지만 가능합니다. 신중하게 의견을 전달해주세요.
            </p>

            {isLocked && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    더 이상 피드백을 요청할 수 없습니다. (제한 초과)
                </div>
            )}

            <div className="flex gap-2 pt-2">
                <Button
                    variant="outline"
                    className="flex-1"
                    disabled={isLocked}
                    onClick={onSendFeedback}
                >
                    피드백 작성하기
                </Button>
                <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={onApprove}
                >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    최종 승인하기
                </Button>
            </div>
        </div>
    )
}
