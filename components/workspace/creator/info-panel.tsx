
import React from 'react';
import { ProgressBar } from '../common/progress-bar';
import { StageCard } from '../common/stage-card';
import { CtaButton } from '../common/cta-button';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ConditionsPanel } from '../common/conditions-panel';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { Proposal } from '@/lib/types';

export function CreatorInfoPanel() {
    const currentStage = useWorkspaceStore((state) => state.currentStage);
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { updateProposal, updateMomentProposal } = useUnifiedProvider();

    // Helper to determine stage status
    const getStageStatus = (stageId: string) => {
        const stages = ['negotiation', 'contract', 'shipping', 'content', 'completed'];
        const currentIndex = stages.indexOf(currentStage);
        const stageIndex = stages.indexOf(stageId);

        if (stageIndex < currentIndex) return 'completed';
        if (stageIndex === currentIndex) return 'active';
        return 'pending';
    };

    const handleConditionSave = async (updates: any) => {
        if (!proposal?.id) return;

        // Creator might only really edit 'specialTerms' or negotiate
        // We map what we can, assuming using generic updateProposal
        const payload: any = {};


        // [FIX] Full Symmetric Mapping (matching Brand InfoPanel)
        if (updates.price_offer !== undefined) {
            payload.price_offer = updates.price_offer;
            // [COMPAT] Keep compensation_amount in sync as string
            payload.compensation_amount = `${updates.price_offer}`;
        } else if (updates.cost !== undefined) {
            payload.price_offer = updates.cost;
            payload.compensation_amount = `${updates.cost}`;
        }
        if (updates.productName !== undefined) payload.product_name = updates.productName;
        if (updates.specialTerms !== undefined) payload.special_terms = updates.specialTerms;

        // Dates
        if (updates.dateReceived !== undefined) payload.condition_product_receipt_date = updates.dateReceived;
        if (updates.dateDraft !== undefined) payload.condition_draft_submission_date = updates.dateDraft;
        if (updates.dateFinal !== undefined) payload.condition_final_submission_date = updates.dateFinal;
        if (updates.dateUpload !== undefined) payload.condition_upload_date = updates.dateUpload;

        // Additional Fields
        if (updates.incentive_detail !== undefined) {
            payload.incentive_detail = updates.incentive_detail;
            payload.has_incentive = updates.has_incentive;
        }
        if (updates.content_type !== undefined) payload.content_type = updates.content_type;
        if (updates.condition_secondary_usage_period !== undefined) payload.condition_secondary_usage_period = updates.condition_secondary_usage_period;

        // [FIX] ID-1057 Distinguish Moment Proposal
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            await updateMomentProposal(proposal.id, payload);
        } else {
            await updateProposal(proposal.id, payload);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* 1. Workspace Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-4">
                    {/* Brand Avatar Placeholder */}
                    <div className="w-12 h-12 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-lg font-bold text-indigo-700 overflow-hidden">
                        {(proposal?.brandAvatar || proposal?.brand_avatar) ? (
                            <img src={proposal.brandAvatar || proposal.brand_avatar} alt="Brand" className="w-full h-full object-cover" />
                        ) : (
                            (proposal?.brandName?.[0] || proposal?.brand_name?.[0] || 'B')
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">{proposal?.brandName || proposal?.brand_name || 'Brand Name'}</h2>
                        <p className="text-xs text-muted-foreground">{proposal?.productName || proposal?.product_name || proposal?.campaignName || 'Project Name'}</p>
                    </div>
                </div>

                {/* 2. Progress Bar */}
                <ProgressBar />
            </div>

            <Separator className="my-2" />

            {/* 3. Next Action Callout (Only for active stage) */}
            <div className="px-6 py-3">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100/50 rounded-full -mr-8 -mt-8" />
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 block">
                        Action Required
                    </span>
                    <p className="text-sm font-medium text-foreground">
                        {currentStage === 'negotiation' ? '조건을 확인하고 협의를 진행해주세요.' :
                            currentStage === 'contract' ? '계약서를 확인하고 서명해주세요.' :
                                currentStage === 'shipping' ? '배송을 기다리고 있습니다.' :
                                    currentStage === 'content' ? '콘텐츠를 제작하고 업로드해주세요.' :
                                        '모든 단계가 완료되었습니다.'}
                    </p>
                </div>
            </div>

            {/* 4. Stage Cards List (Scrollable) */}
            <ScrollArea className="flex-1 px-6 pb-6">
                <div className="space-y-4 py-2">
                    {/* Stage 1: Negotiation */}
                    <StageCard
                        id="negotiation"
                        title="조건 협의 (Conditions)"
                        isCompleted={getStageStatus('negotiation') === 'completed'}
                        isActive={currentStage === 'negotiation'}
                    >
                        <ConditionsPanel
                            userRole="creator"
                            readonly={true} // Creator usually read-only unless negotiated
                            onSave={handleConditionSave} // Pass just in case logic changes
                        />
                    </StageCard>

                    {/* Stage 2: Contract */}
                    <StageCard
                        id="contract"
                        title="전자 계약서"
                        isActive={currentStage === 'contract'}
                        isCompleted={getStageStatus('contract') === 'completed'}
                        summary="표준 광고 계약서 서명"
                    >
                        <div className="text-sm text-muted-foreground p-2 text-center bg-muted/20 rounded-lg">
                            조건 확정 후 계약서를 확인하고 서명합니다.
                        </div>
                    </StageCard>

                    {/* Stage 3: Shipping */}
                    <StageCard
                        id="shipping"
                        title="제품 배송"
                        isActive={currentStage === 'shipping'}
                        isCompleted={getStageStatus('shipping') === 'completed'}
                        summary="배송 현황 및 수령 확인"
                    >
                        <div className="text-sm text-muted-foreground p-2 text-center bg-muted/20 rounded-lg">
                            운송장 번호를 확인하고 제품 수령을 완료합니다.
                        </div>
                    </StageCard>

                    {/* Stage 4: Content */}
                    <StageCard
                        id="content"
                        title="콘텐츠 관리"
                        isActive={currentStage === 'content'}
                        isCompleted={getStageStatus('content') === 'completed'}
                        summary="콘텐츠 제출 및 피드백"
                    >
                        <div className="text-sm text-muted-foreground p-2 text-center bg-muted/20 rounded-lg">
                            제작 가이드에 맞춰 콘텐츠를 제출합니다.
                        </div>
                    </StageCard>
                </div>
            </ScrollArea>
        </div>
    );
}
