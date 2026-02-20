
import React from 'react';
import { ProgressBar } from '../common/progress-bar';
import { StageCard } from '../common/stage-card';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ConditionsPanel } from '../common/conditions-panel';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { SmartContractPanel } from '../common/smart-contract-panel';
import { FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CreatorInfoPanel() {
    const currentStage = useWorkspaceStore((state) => state.currentStage);
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { updateProposal, updateMomentProposal, updateBrandProposal, sendNotification, user } = useUnifiedProvider();

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

        // [FIX] Full Symmetric Mapping (matching Brand InfoPanel)
        if (updates.price_offer !== undefined) {
            payload.price_offer = updates.price_offer;
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

        // [FIX] 3-way proposal type routing
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            await updateMomentProposal(proposal.id, payload);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            await updateProposal(proposal.id, payload);
        } else {
            await updateBrandProposal(proposal.id, payload);
        }
    };

    // 크리에이터 수락 토글 (chip 클릭)
    const handleToggleConfirm = async (role: 'brand' | 'creator', currentValue: boolean) => {
        if (!proposal?.id) return;
        const newValue = !currentValue;
        const updates: any = { influencer_condition_confirmed: newValue };
        let success = false;
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateBrandProposal(proposal.id, updates);
        }
        if (success) {
            useWorkspaceStore.getState().updateProposal(updates);

            // 양쪽 다 확정됐으면 즉시 계약 단계로 전환
            const bothConfirmed = newValue && !!proposal.brand_condition_confirmed;
            if (bothConfirmed) {
                useWorkspaceStore.getState().setCurrentStage('contract');
            }

            // ⚠️ 수락 시에만 브랜드에게 알림
            if (newValue) {
                try {
                    const brandId = (proposal as any).brand_id ||
                        (proposal as any).brandId ||
                        (proposal as any).campaign?.brand_id;
                    const creatorName = user?.name || '크리에이터';
                    if (brandId) {
                        await sendNotification(
                            brandId,
                            `${creatorName}님이 조건을 수락했습니다. 계약서를 작성해주세요.`,
                            'condition_confirmed',
                            proposal.id?.toString()
                        );
                    }
                } catch (notifErr) {
                    console.warn('알림 발송 실패 (무시):', notifErr);
                }
            }
        }
    };

    // 크리에이터 전자서명
    const handleSign = async (role: 'brand' | 'creator', signatureData: string) => {
        if (!proposal?.id) return;

        const updates: any = {
            influencer_signature: signatureData,
            influencer_signed_at: new Date().toISOString(),
        };

        // If brand already signed, mark as fully signed
        if (proposal.brand_signature) {
            updates.contract_status = 'signed';
        } else {
            updates.contract_status = 'partial';
        }

        let success = false;
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateBrandProposal(proposal.id, updates);
        }

        if (success) {
            useWorkspaceStore.getState().updateProposal(updates);
        }
    };

    // 계약서 내용 저장
    const handleSaveContract = async (content: string) => {
        if (!proposal?.id) return;
        const updates: any = { contract_content: content };
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            await updateProposal(proposal.id, updates);
        } else {
            await updateBrandProposal(proposal.id, updates);
        }
    };

    // 크리에이터 서명 취소
    const handleUndoSign = async (role: 'brand' | 'creator') => {
        if (!proposal?.id) return;
        const updates: any = {
            influencer_signature: null,
            influencer_signed_at: null,
            contract_status: proposal.brand_signature ? 'partial' : null,
        };
        let success = false;
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateBrandProposal(proposal.id, updates);
        }
        if (success) {
            useWorkspaceStore.getState().updateProposal(updates);
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

            {/* 3. Next Action Callout */}
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
                            readonly={true}
                            onSave={handleConditionSave}
                            onToggleConfirm={handleToggleConfirm}
                        />
                    </StageCard>

                    {/* Stage 2: Contract */}
                    <StageCard
                        id="contract"
                        title="전자 계약서"
                        isActive={currentStage === 'contract'}
                        isCompleted={getStageStatus('contract') === 'completed'}
                        summary={
                            proposal?.brand_signature && proposal?.influencer_signature
                                ? '✅ 양측 서명 완료'
                                : proposal?.brand_signature
                                    ? '✍️ 브랜드 서명 완료 · 크리에이터 대기 중'
                                    : proposal?.influencer_signature
                                        ? '✍️ 크리에이터 서명 완료 · 브랜드 대기 중'
                                        : '표준 광고 계약서 서명'
                        }
                    >
                        <div className="space-y-3">
                            {/* Signature status tabs (non-clickable) */}
                            <div className="grid grid-cols-2 gap-2 select-none">
                                <div className={`flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-lg border cursor-default ${proposal?.brand_signature ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40' : 'bg-muted/50 text-muted-foreground border-border'}`}>
                                    {proposal?.brand_signature ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5 rounded-full border-2 border-current inline-block" />}
                                    브랜드 {proposal?.brand_signature ? '서명완료' : '미서명'}
                                </div>
                                <div className={`flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-lg border cursor-default ${proposal?.influencer_signature ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40' : 'bg-muted/50 text-muted-foreground border-border'}`}>
                                    {proposal?.influencer_signature ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5 rounded-full border-2 border-current inline-block" />}
                                    크리에이터 {proposal?.influencer_signature ? '서명완료' : '미서명'}
                                </div>
                            </div>
                            {/* Toggle button to open contract in main area */}
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => useWorkspaceStore.getState().setContractViewOpen(true)}
                            >
                                <FileText className="h-4 w-4 mr-2" /> 전자 계약서 열기
                            </Button>
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
