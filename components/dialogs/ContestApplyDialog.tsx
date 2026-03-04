import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trophy, AlertCircle, Instagram, Youtube, Video } from "lucide-react"

interface ContestApplyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    contestTitle: string;
    forbiddenRules?: string[];
    onApply: (data: { channel: string; appealMessage: string; instagramId: string }) => Promise<void>;
    maintenancePeriod?: number;
    defaultInstagramId?: string;
}

export function ContestApplyDialog({
    isOpen,
    onClose,
    contestTitle,
    forbiddenRules = [],
    onApply,
    maintenancePeriod = 60,
    defaultInstagramId = ""
}: ContestApplyDialogProps) {
    const [agreed1, setAgreed1] = useState(false);
    const [agreed2, setAgreed2] = useState(false);
    const [agreed3, setAgreed3] = useState(false);
    const [dynamicAgreements, setDynamicAgreements] = useState<boolean[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [channel, setChannel] = useState<string>("");
    const [instagramId, setInstagramId] = useState("");
    const [appealMessage, setAppealMessage] = useState("");
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAgreed1(false);
            setAgreed2(false);
            setAgreed3(false);
            setDynamicAgreements(new Array(forbiddenRules.length).fill(false));
            setChannel("");
            setInstagramId(defaultInstagramId);
            setAppealMessage("");
            setHasScrolledToBottom(forbiddenRules.length === 0);
        }
    }, [isOpen, forbiddenRules.length, defaultInstagramId]);

    const allStaticAgreed = agreed1 && agreed2 && agreed3;
    const allDynamicAgreed = forbiddenRules.length === 0 || dynamicAgreements.every(Boolean);
    const allAgreed = allStaticAgreed && allDynamicAgreed;
    const isFormValid = allAgreed && channel !== "" && instagramId.trim().length > 0 && appealMessage.trim().length > 0;

    const handleApply = async () => {
        if (!isFormValid) return;
        setIsSubmitting(true);
        try {
            await onApply({ channel, appealMessage, instagramId });
            onClose();
        } catch (error: any) {
            console.error("Apply failed - Detailed Error:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                stack: error.stack,
                error
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleDynamicAgreement = (index: number, checked: boolean) => {
        setDynamicAgreements(prev => {
            const next = [...prev];
            next[index] = checked;
            return next;
        });
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 5) {
            setHasScrolledToBottom(true);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Trophy className="w-5 h-5 text-primary" />
                        콘테스트 참가 신청
                    </DialogTitle>
                    <DialogDescription>
                        {contestTitle} 콘테스트에 지원하기 전 아래 필수 사항에 동의해주세요.
                    </DialogDescription>
                </DialogHeader>

                {/* Form Section */}
                <div className="space-y-6 my-2">
                    {/* Instagram ID */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-800">
                            내 인스타그램 아이디 (@제외) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">@</span>
                            <input
                                type="text"
                                placeholder="instaname"
                                className="w-full pl-7 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                value={instagramId}
                                onChange={(e) => setInstagramId(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400">※ 브랜드가 크리에이터님의 프로필을 확인할 때 지원 정보와 함께 노출됩니다.</p>
                    </div>

                    {/* Channel Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-800">
                            주 활동 플랫폼 <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                type="button"
                                variant={channel === 'Instagram' ? 'default' : 'outline'}
                                className={`flex items-center gap-2 h-10 ${channel === 'Instagram' ? 'bg-pink-600 hover:bg-pink-700 text-white' : ''}`}
                                onClick={() => setChannel('Instagram')}
                            >
                                <Instagram className="w-4 h-4" /> 인스타그램
                            </Button>
                            <Button
                                type="button"
                                variant={channel === 'TikTok' ? 'default' : 'outline'}
                                className={`flex items-center gap-2 h-10 ${channel === 'TikTok' ? 'bg-black hover:bg-zinc-800 text-white' : ''}`}
                                onClick={() => setChannel('TikTok')}
                            >
                                <Video className="w-4 h-4" /> 틱톡
                            </Button>
                            <Button
                                type="button"
                                variant={channel === 'YouTube' ? 'default' : 'outline'}
                                className={`flex items-center gap-2 h-10 ${channel === 'YouTube' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                                onClick={() => setChannel('YouTube')}
                            >
                                <Youtube className="w-4 h-4" /> 유튜브
                            </Button>
                        </div>
                    </div>

                    {/* Appeal Message */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-800">
                            지원 코멘트 <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            placeholder="브랜드에게 전달하고 싶은 나의 영상 컨셉이나 각오를 적어주세요. (최대 100자)"
                            className="resize-none h-20 text-sm"
                            maxLength={100}
                            value={appealMessage}
                            onChange={(e) => setAppealMessage(e.target.value)}
                        />
                        <div className="text-right text-[10px] text-muted-foreground">
                            {appealMessage.length} / 100
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg my-2 space-y-4 border border-slate-100 mt-4">
                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="agree-1"
                            checked={agreed1}
                            onCheckedChange={(c) => setAgreed1(c as boolean)}
                            className="mt-0.5"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="agree-1" className="text-sm font-semibold text-slate-800 cursor-pointer">
                                영상 원본 및 2차 가공 마케팅 활용 동의
                            </Label>
                            <p className="text-xs text-slate-500">
                                선발 및 시상 여부와 관계없이 제출된 영상은 브랜드의 마케팅 용도로 2차 가공 및 활용될 수 있습니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="agree-2"
                            checked={agreed2}
                            onCheckedChange={(c) => setAgreed2(c as boolean)}
                            className="mt-0.5"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="agree-2" className="text-sm font-semibold text-red-600 cursor-pointer">
                                영상 유지 정책 동의 (필수 {maintenancePeriod}일)
                            </Label>
                            <p className="text-xs text-slate-500">
                                게시 후 최소 {maintenancePeriod}일 동안 영상을 유지해야 하며, 무단 삭제 시 리워드 환수 및 향후 참여 제한에 동의합니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="agree-3"
                            checked={agreed3}
                            onCheckedChange={(c) => setAgreed3(c as boolean)}
                            className="mt-0.5"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="agree-3" className="text-sm font-semibold text-red-600 cursor-pointer">
                                무단 불참(노쇼) 패널티 안내
                            </Label>
                            <p className="text-xs text-slate-500">
                                선발 후 기한 내 영상을 제출하지 않는 경우, 향후 크레디픽 플랫폼 이용 및 다른 캠페인 참여에 불이익이 발생할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>

                {forbiddenRules.length > 0 && (
                    <div className="bg-red-50/50 p-4 rounded-lg my-2 space-y-3 border border-red-100 relative">
                        <Label className="text-sm font-bold text-red-700 block text-center mb-1">
                            🔥 브랜드 절대 금지/주의 사항
                        </Label>
                        {!hasScrolledToBottom && (
                            <p className="text-[10px] text-center text-red-500 font-medium pb-2 border-b border-red-100">
                                전체 내용을 끝까지 스크롤하여 숙지해야 동의할 수 있습니다.
                            </p>
                        )}
                        <div
                            className="max-h-[120px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-red-200"
                            onScroll={handleScroll}
                            ref={(el) => {
                                if (el && !hasScrolledToBottom) {
                                    // 내용이 짧아서 스크롤이 생기지 않는 경우 자동으로 true 처리
                                    if (el.scrollHeight <= el.clientHeight) {
                                        setHasScrolledToBottom(true);
                                    }
                                }
                            }}
                        >
                            {forbiddenRules.map((rule, idx) => (
                                <div key={idx} className={`flex items-start space-x-3 p-2 rounded-md ${hasScrolledToBottom ? 'bg-white' : 'bg-slate-50 opacity-60'}`}>
                                    <Checkbox
                                        id={`dynamic-agree-${idx}`}
                                        checked={dynamicAgreements[idx] || false}
                                        onCheckedChange={(c) => toggleDynamicAgreement(idx, c as boolean)}
                                        disabled={!hasScrolledToBottom}
                                        className="mt-0.5 border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor={`dynamic-agree-${idx}`} className={`text-sm font-medium ${hasScrolledToBottom ? 'text-slate-800 cursor-pointer' : 'text-slate-500 cursor-not-allowed'} leading-tight`}>
                                            {rule}
                                        </Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!isFormValid && (
                    <div className="flex items-center gap-2 text-amber-600 text-xs font-medium bg-amber-50 p-2 rounded-md">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        플랫폼 선택, 지원 코멘트 작성 및 필수 항목에 모두 동의해야 지원이 가능합니다.
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>취소</Button>
                    <Button
                        onClick={handleApply}
                        disabled={!isFormValid || isSubmitting}
                        className="bg-primary shadow-sm"
                    >
                        {isSubmitting ? "지원 중..." : "동의하고 지원하기"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
