"use client"

import React from 'react';
import { ProgressBar } from '../common/progress-bar';
import { StageCard } from '../common/stage-card';
import { CtaButton } from '../common/cta-button';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { ConditionsPanel } from '../common/conditions-panel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { Proposal } from '@/lib/types';

import { SmartContractPanel } from '../common/smart-contract-panel';

export function InfoPanel() {
    const currentStage = useWorkspaceStore((state) => state.currentStage);
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { updateBrandProposal, updateMomentProposal } = useUnifiedProvider();

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

        const payload: any = {};

        // Map UI fields to DB columns
        if (updates.price_offer !== undefined) {
            payload.price_offer = updates.price_offer;
            // [COMPAT] Keep compensation_amount in sync as string
            payload.compensation_amount = `${updates.price_offer}`;
        } else if (updates.cost !== undefined) {
            // Fallback for older calls
            payload.price_offer = updates.cost;
            payload.compensation_amount = `${updates.cost}`;
        }
        if (updates.productName !== undefined) payload.product_name = updates.productName; // [FIX] ID-1056 Adding product name mapping
        if (updates.specialTerms !== undefined) payload.special_terms = updates.specialTerms;
        if (updates.dateReceived !== undefined) payload.condition_product_receipt_date = updates.dateReceived;
        if (updates.dateDraft !== undefined) payload.condition_draft_submission_date = updates.dateDraft;
        if (updates.dateDraft !== undefined) payload.condition_draft_submission_date = updates.dateDraft;
        if (updates.dateFinal !== undefined) payload.condition_final_submission_date = updates.dateFinal;
        if (updates.dateUpload !== undefined) payload.condition_upload_date = updates.dateUpload;

        // [Added] Additional Fields (Incentive, Content, Usage)
        if (updates.incentive_detail !== undefined) {
            payload.incentive_detail = updates.incentive_detail;
            payload.has_incentive = updates.has_incentive;
        }
        if (updates.content_type !== undefined) payload.content_type = updates.content_type;
        if (updates.condition_secondary_usage_period !== undefined) payload.condition_secondary_usage_period = updates.condition_secondary_usage_period;

        console.log('[InfoPanel] Saving conditions:', payload);

        // [FIX] ID-1057 Distinguish Moment vs Brand Proposal
        // If it has moment_id (or event_id acting as moment_id), it's a Moment Proposal
        if ((proposal as any).moment_id || (proposal as any).event_id) {
            await updateMomentProposal(proposal.id, payload);
        } else {
            await updateBrandProposal(proposal.id, payload);
        }
    };

    const handleSign = async (role: 'brand' | 'influencer') => {
        if (!proposal?.id) return;

        console.log('[InfoPanel] Signing contract as:', role);
        const updates: any = {
            brand_signature: proposal.brandName || "Brand",
            brand_signed_at: new Date().toISOString(),
        };

        // If influencer already signed, mark as fully signed
        if (proposal.influencer_signature) {
            updates.contract_status = 'signed';
            updates.status = 'accepted'; // Move proposal status to accepted if specific logic requires it
        } else {
            updates.contract_status = 'partial';
        }

        await updateBrandProposal(proposal.id, updates);
        alert("서명이 완료되었습니다.");
    };

    return (
        <div className="flex flex-col h-full">
            {/* 1. Workspace Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-4">
                    {/* Avatar Placeholder */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                        C
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">{proposal?.influencerName || 'Creator Name'}</h2>
                        <p className="text-xs text-muted-foreground">{proposal?.product_name || proposal?.campaignName || '협업 프로젝트'}</p>
                    </div>
                </div>

                {/* 2. Progress Bar */}
                <ProgressBar />
            </div>

            <Separator className="my-2" />

            {/* 3. Next Action Callout (Only for active stage) */}
            <div className="px-6 py-3">
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 block">
                        Action Required
                    </span>
                    <p className="text-sm font-medium text-foreground">
                        {currentStage === 'negotiation' ? '조건을 확정하고 계약서를 발송해주세요.' :
                            currentStage === 'contract' ? '크리에이터의 서명을 기다리고 있습니다.' :
                                currentStage === 'shipping' ? '운송장 번호를 입력해주세요.' :
                                    currentStage === 'content' ? '콘텐츠 초안을 확인해주세요.' :
                                        '모든 단계가 완료되었습니다.'}
                    </p>
                    {/* The original CTA button was here, but the instruction removed it. */}
                </div>
            </div>

            {/* 4. Scrollable Content Area */}
            <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 pb-6">
                    {/* Stage 1: Negotiation (Conditions) */}
                    <StageCard
                        id="negotiation"
                        title="조건 협의 (Conditions)"
                        isCompleted={getStageStatus('negotiation') === 'completed'}
                        isActive={currentStage === 'negotiation'}
                    >
                        <ConditionsPanel
                            userRole="brand"
                            onSave={handleConditionSave}
                        />
                    </StageCard>

                    {/* Stage 2: Contract */}
                    <StageCard
                        id="contract"
                        title="전자 계약서"
                        isActive={currentStage === 'contract'}
                        isCompleted={getStageStatus('contract') === 'completed'}
                        summary="표준 계약서 (자동 생성됨)"
                    >
                        {proposal && (
                            <SmartContractPanel
                                proposal={proposal}
                                userType="brand"
                                onSign={handleSign}
                            />
                        )}
                    </StageCard>

                    {/* Stage 3: Shipping */}
                    <StageCard
                        id="shipping"
                        title="제품 배송"
                        isActive={currentStage === 'shipping'}
                        isCompleted={getStageStatus('shipping') === 'completed'}
                        summary="배송지 정보 및 운송장 번호"
                    >
                        <div className="text-sm text-muted-foreground p-2 text-center bg-muted/20 rounded-lg">
                            계약이 완료되면 배송 정보를 입력할 수 있습니다.
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
                            제품 배송 후 콘텐츠 관리가 시작됩니다.
                        </div>
                    </StageCard>
                </div>
            </ScrollArea>
        </div>
    );
}
