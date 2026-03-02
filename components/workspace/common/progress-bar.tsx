
import { cn } from '@/lib/utils';
import { Check, CreditCard } from 'lucide-react';
import React from 'react';
import { useWorkspaceStore } from '../hooks/use-workspace-store';

const STAGES = [
    { id: 'negotiation', label: '조건협의' },
    { id: 'contract', label: '계약서' },
    { id: 'shipping', label: '제품발송' },
    { id: 'content', label: '콘텐츠' },
    { id: 'settlement', label: '정산' },
    { id: 'final_complete', label: '최종완료' },
] as const;

export function ProgressBar() {
    const currentStage = useWorkspaceStore((state) => state.currentStage);
    const proposal = useWorkspaceStore((state) => state.proposal);

    const currentStepIndex = STAGES.findIndex((s) => s.id === currentStage);

    // 결제 마이크로 도트: 계약서 서명 완료 + 결제 미확인일 때만 표시
    const isFullySigned = !!(proposal?.brand_signature && proposal?.creator_signature);
    const isPaid = !!(proposal as any)?.payment_confirmed_at;
    const showPaymentDot = isFullySigned && !isPaid;

    return (
        <div className="w-full flex items-center justify-between px-2 py-4">
            {STAGES.map((stage, index) => {
                const isCompleted = index < currentStepIndex || currentStage === 'final_complete';
                const isCurrent = stage.id === currentStage;

                return (
                    <React.Fragment key={stage.id}>
                        <div className="flex flex-col items-center relative z-10 w-full">
                            {/* Connecting Line */}
                            {index !== 0 && (
                                <div
                                    className={cn(
                                        'absolute top-3 right-[50%] w-full h-[2px] -z-10',
                                        index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                                    )}
                                />
                            )}

                            {/* Dot/Icon */}
                            <div
                                className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                                    isCompleted
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : isCurrent
                                            ? 'bg-background border-primary ring-4 ring-primary/20'
                                            : 'bg-muted border-muted-foreground/30'
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-3 h-3" />
                                ) : (
                                    <div
                                        className={cn(
                                            'w-2 h-2 rounded-full',
                                            isCurrent ? 'bg-primary' : 'bg-muted-foreground/30'
                                        )}
                                    />
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    'text-[10px] mt-2 font-medium transition-colors duration-300',
                                    isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'
                                )}
                            >
                                {stage.label}
                            </span>
                        </div>

                        {/* ── 결제 마이크로 도트: 계약서(index=1)와 제품발송(index=2) 사이 ── */}
                        {index === 1 && showPaymentDot && (
                            <div className="flex flex-col items-center shrink-0 mx-1 z-10 relative">
                                {/* 연결선 위에 오버레이되는 작은 도트 */}
                                <div className="relative flex items-center justify-center">
                                    {/* pulse ring */}
                                    <span className="absolute w-4 h-4 rounded-full bg-orange-400/30 animate-ping" />
                                    <div
                                        className="w-3 h-3 rounded-full bg-orange-500 border-2 border-orange-300 flex items-center justify-center shadow-sm shadow-orange-300"
                                        title="결제 대기 중"
                                    >
                                        <CreditCard className="w-1.5 h-1.5 text-white" />
                                    </div>
                                </div>
                                <span className="text-[8px] mt-1.5 font-bold text-orange-500 whitespace-nowrap">결제</span>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
