
import { cn } from "@/lib/utils";
import { computeWorkspaceStage, WorkspaceStage } from "@/lib/compute-workspace-stage";
import { useWorkspaceStore } from "@/components/workspace/hooks/use-workspace-store";
import React, { useEffect } from 'react';

type Props = {
    proposal: any;
    className?: string;
};

const STAGE_ORDER: WorkspaceStage[] = ['negotiation', 'contract', 'shipping', 'content', 'settlement', 'final_complete'];

const STEPS = [
    { id: 'negotiation' as WorkspaceStage, label: '조건협의' },
    { id: 'contract' as WorkspaceStage, label: '계약 체결' },
    { id: 'shipping' as WorkspaceStage, label: '제품 배송' },
    { id: 'content' as WorkspaceStage, label: '콘텐츠' },
    { id: 'settlement' as WorkspaceStage, label: '정산' },
    { id: 'final_complete' as WorkspaceStage, label: '최종 완료' },
];

export function WorkspaceProgressBar({ proposal, className }: Props) {
    const stageMap = useWorkspaceStore((s) => s.stageMap);
    const setStageMap = useWorkspaceStore((s) => s.setStageMap);

    const proposalId = proposal?.id;

    // 카드가 렌더링될 때마다 stageMap에 등록
    useEffect(() => {
        if (!proposalId) return;
        const stage = computeWorkspaceStage(proposal);
        setStageMap({ [proposalId]: stage });
    }, [proposalId, proposal?.status, proposal?.contract_status, proposal?.delivery_status,
        proposal?.content_submission_status, proposal?.payment_confirmed_at,
        proposal?.brand_signature, proposal?.creator_signature]); // eslint-disable-line

    const currentStage = stageMap[proposalId] ?? computeWorkspaceStage(proposal);
    const currentIndex = STAGE_ORDER.indexOf(currentStage);

    // 결제 도트: 계약 체결 완료 + 결제 미확인
    const isFullySigned = !!(proposal?.brand_signature && proposal?.creator_signature);
    const isPaid = !!proposal?.payment_confirmed_at;
    const showPaymentDot = isFullySigned && !isPaid;

    return (
        <div className={cn("w-full max-w-xl transition-all", className)}>
            <div className="flex justify-between mb-2 items-end">
                {STEPS.map((step, idx) => {
                    const stepIndex = STAGE_ORDER.indexOf(step.id);
                    const isDone = stepIndex < currentIndex || currentStage === 'final_complete';
                    const isActive = stepIndex === currentIndex && currentStage !== 'final_complete';

                    const colorClass = isDone ? 'text-emerald-600'
                        : isActive ? 'text-amber-500'
                            : 'text-slate-400';
                    const barClass = isDone ? 'bg-emerald-500'
                        : isActive ? 'bg-amber-400'
                            : 'bg-slate-200';

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center flex-1 gap-1.5 min-w-0">
                                <span className={cn("text-[10px] md:text-[11px] font-bold transition-colors truncate w-full text-center", colorClass)}>
                                    {step.label}
                                </span>
                                <div className={cn("h-1.5 w-[90%] rounded-full transition-all", barClass)} />
                            </div>

                            {/* 결제 도트: 계약 체결(idx=1)과 제품 배송(idx=2) 사이 */}
                            {idx === 1 && showPaymentDot && (
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
