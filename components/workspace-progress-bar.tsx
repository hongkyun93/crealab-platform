
import { cn } from "@/lib/utils";
import React from 'react';

type Props = {
    status?: string | null;
    contract_status?: string | null;
    delivery_status?: string | null;
    content_submission_status?: string | null;
    payment_confirmed_at?: string | null;
    brand_signature?: string | null;
    influencer_signature?: string | null;
    className?: string;
};

export function WorkspaceProgressBar({ status, contract_status, delivery_status, content_submission_status, payment_confirmed_at, brand_signature, influencer_signature, className }: Props) {
    const steps = [
        { id: 1, label: "제안 됨" },
        { id: 2, label: "조건 조율" },
        { id: 3, label: "계약 체결" },
        { id: 4, label: "제품 배송" },
        { id: 5, label: "콘텐츠 제출" },
        { id: 6, label: "최종 완료" },
    ];

    let currentStepIndex = 0;

    if (['negotiating', 'accepted', 'signed', 'shipped', 'started', 'completed', 'confirmed'].includes(status || '')) {
        currentStepIndex = 1;
    }
    if (contract_status === 'signed' || ['signed', 'shipped', 'started', 'completed'].includes(status || '')) {
        currentStepIndex = 2; // 계약 체결
    }
    if (delivery_status === 'shipped' || delivery_status === 'delivered' || ['completed'].includes(status || '')) {
        currentStepIndex = 3; // 제품 배송
    }
    if (content_submission_status === 'submitted' || content_submission_status === 'approved' || ['completed'].includes(status || '')) {
        currentStepIndex = 4; // 콘텐츠 제출
    }
    if (status === 'completed') {
        currentStepIndex = 5; // 최종 완료
    }

    // 결제 마이크로 도트: 양측 서명 완료 + 결제 미확인
    const isFullySigned = !!(brand_signature && influencer_signature);
    const isPaid = !!payment_confirmed_at;
    const showPaymentDot = isFullySigned && !isPaid;

    return (
        <div className={cn("w-full max-w-xl transition-all", className)}>
            <div className="flex justify-between mb-2 items-end">
                {steps.map((step, idx) => {
                    let stepStatus = 'pending';
                    if (idx < currentStepIndex) stepStatus = 'done';
                    else if (idx === currentStepIndex) stepStatus = 'active';
                    if (status === 'completed' || (currentStepIndex === 5 && idx === 5)) stepStatus = 'done';

                    const colorClass = stepStatus === 'done' ? 'text-emerald-600' : stepStatus === 'active' ? 'text-amber-500' : 'text-slate-400';
                    const barClass = stepStatus === 'done' ? 'bg-emerald-500' : stepStatus === 'active' ? 'bg-amber-400' : 'bg-slate-200';

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center flex-1 gap-1.5 min-w-0">
                                <span className={cn("text-[10px] md:text-[11px] font-bold transition-colors truncate w-full text-center", colorClass)}>
                                    {step.label}
                                </span>
                                <div className={cn("h-1.5 w-[90%] rounded-full transition-all", barClass)} />
                            </div>

                            {/* 결제 도트: 계약 체결(idx=2)과 제품 배송(idx=3) 사이 */}
                            {idx === 2 && showPaymentDot && (
                                <div className="flex flex-col items-center shrink-0 mx-0.5 pb-0.5">
                                    <span className="text-[8px] font-bold text-orange-500 mb-0.5">결제</span>
                                    <div className="relative flex items-center justify-center">
                                        <span className="absolute w-3 h-3 rounded-full bg-orange-400/40 animate-ping" />
                                        <div className="w-2 h-2 rounded-full bg-orange-500 border border-orange-300 z-10" />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
