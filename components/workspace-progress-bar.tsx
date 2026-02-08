
import React from 'react';
import { cn } from "@/lib/utils";

type Props = {
    status?: string | null;
    contract_status?: string | null;
    delivery_status?: string | null;
    content_submission_status?: string | null;
    className?: string; // Allow custom classNames
};

export function WorkspaceProgressBar({ status, contract_status, delivery_status, content_submission_status, className }: Props) {
    // Define steps
    const steps = [
        { id: 1, label: "매칭 완료" },
        { id: 2, label: "조건 조율" },
        { id: 3, label: "계약 체결" },
        { id: 4, label: "제품 배송" },
        { id: 5, label: "콘텐츠 제출" },
        { id: 6, label: "최종 완료" },
    ];

    // Determine current step index based on logic
    let currentStepIndex = 0; // Default to step 1 (Matched)

    // Step 2: Negotiation
    if (['negotiating', 'accepted', 'signed', 'shipped', 'started', 'completed'].includes(status || '')) {
        currentStepIndex = 1;
    }

    // Step 3: Contract Signed
    if (contract_status === 'signed' || ['signed', 'shipped', 'started', 'completed'].includes(status || '')) {
        currentStepIndex = 2;
    }

    // Step 4: Shipping
    if (delivery_status === 'shipped' || delivery_status === 'delivered' || ['completed'].includes(status || '')) {
        currentStepIndex = 3;
    }

    // Step 5: Content Submitted
    if (content_submission_status === 'submitted' || content_submission_status === 'approved' || ['completed'].includes(status || '')) {
        currentStepIndex = 4;
    }

    // Step 6: Completed
    if (status === 'completed') {
        currentStepIndex = 5;
    }

    return (
        <div className={cn("w-full max-w-xl transition-all", className)}>
            <div className="flex justify-between mb-2">
                {steps.map((step, idx) => {
                    // Logic for specific active/done colors based on the hardcoded reference
                    let status = 'pending';
                    if (idx < currentStepIndex) {
                        status = 'done';
                    } else if (idx === currentStepIndex) {
                        status = 'active';
                    }

                    // Specific override for completion
                    if (status === 'completed' || (currentStepIndex === 5 && idx === 5)) {
                        status = 'done';
                    }

                    const colorClass = status === 'done' ? 'text-emerald-600' : status === 'active' ? 'text-amber-500' : 'text-slate-400';
                    const barClass = status === 'done' ? 'bg-emerald-500' : status === 'active' ? 'bg-amber-400' : 'bg-slate-200';

                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1 gap-1.5 min-w-0">
                            <span
                                className={cn(
                                    "text-[10px] md:text-[11px] font-bold transition-colors truncate w-full text-center",
                                    colorClass
                                )}
                            >
                                {step.label}
                            </span>
                            <div
                                className={cn(
                                    "h-1.5 w-[90%] rounded-full transition-all",
                                    barClass
                                )}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
