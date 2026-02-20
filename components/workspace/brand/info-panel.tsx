"use client"

import React, { useState } from 'react';
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
import { FileText, CheckCircle2, Package, Truck, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function InfoPanel() {
    const currentStage = useWorkspaceStore((state) => state.currentStage);
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { updateBrandProposal, updateMomentProposal, updateProposal, refreshData } = useUnifiedProvider();
    const [trackingInput, setTrackingInput] = useState('');
    const [isShipping, setIsShipping] = useState(false);

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

        // price_offer: ConditionsPanel sends both price_offer and cost
        if (updates.price_offer !== undefined) {
            payload.price_offer = updates.price_offer;
            payload.compensation_amount = `${updates.price_offer}`;
        } else if (updates.cost !== undefined) {
            payload.price_offer = updates.cost;
            payload.compensation_amount = `${updates.cost}`;
        }

        // product_name: ConditionsPanel sends both product_name and productName
        if (updates.product_name !== undefined) payload.product_name = updates.product_name;
        else if (updates.productName !== undefined) payload.product_name = updates.productName;

        // special_terms: ConditionsPanel sends both special_terms and specialTerms
        if (updates.special_terms !== undefined) payload.special_terms = updates.special_terms;
        else if (updates.specialTerms !== undefined) payload.special_terms = updates.specialTerms;

        // Dates
        if (updates.condition_product_receipt_date !== undefined) payload.condition_product_receipt_date = updates.condition_product_receipt_date;
        else if (updates.dateReceived !== undefined) payload.condition_product_receipt_date = updates.dateReceived;

        if (updates.condition_draft_submission_date !== undefined) payload.condition_draft_submission_date = updates.condition_draft_submission_date;
        else if (updates.dateDraft !== undefined) payload.condition_draft_submission_date = updates.dateDraft;

        if (updates.condition_final_submission_date !== undefined) payload.condition_final_submission_date = updates.condition_final_submission_date;
        else if (updates.dateFinal !== undefined) payload.condition_final_submission_date = updates.dateFinal;

        if (updates.condition_upload_date !== undefined) payload.condition_upload_date = updates.condition_upload_date;
        else if (updates.dateUpload !== undefined) payload.condition_upload_date = updates.dateUpload;

        // Incentive, Content, Usage
        if (updates.incentive_detail !== undefined) payload.incentive_detail = updates.incentive_detail;
        if (updates.has_incentive !== undefined) payload.has_incentive = updates.has_incentive;
        if (updates.content_type !== undefined) payload.content_type = updates.content_type;
        if (updates.condition_secondary_usage_period !== undefined) payload.condition_secondary_usage_period = updates.condition_secondary_usage_period;

        console.log('[InfoPanel] Saving conditions:', payload);

        // [FIX] 3-way proposal type routing
        // 1. moment_id/event_id → moment_proposals
        // 2. campaignId/campaign_id → campaign_applications
        // 3. else → brand_proposals
        let success = false;
        if ((proposal as any).moment_id || (proposal as any).event_id) {
            success = await updateMomentProposal(proposal.id, payload);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, payload);
        } else {
            success = await updateBrandProposal(proposal.id, payload);
        }

        // Immediately update workspace store so brand UI reflects changes without refresh
        if (success) {
            useWorkspaceStore.getState().updateProposal(payload);
        }
    };

    // 브랜드 수락 토글 (chip 클릭)
    const handleToggleConfirm = async (role: 'brand' | 'creator', currentValue: boolean) => {
        if (!proposal?.id) return;
        const newValue = !currentValue;
        const updates: any = { brand_condition_confirmed: newValue };
        let success = false;
        if ((proposal as any).moment_id || (proposal as any).event_id) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateBrandProposal(proposal.id, updates);
        }
        if (success) {
            useWorkspaceStore.getState().updateProposal(updates);

            // 양쪽 다 확정됐으면 즉시 계약 단계로 전환 (progress-bar 즉시 반영)
            const bothConfirmed = newValue && !!proposal.influencer_condition_confirmed;
            if (bothConfirmed) {
                useWorkspaceStore.getState().setCurrentStage('contract');
            }
        }
    };

    const handleSign = async (role: 'brand' | 'creator', signatureData: string) => {
        if (!proposal?.id) return;

        console.log('[InfoPanel] Signing contract as:', role);
        const updates: any = {
            brand_signature: signatureData,
            brand_signed_at: new Date().toISOString(),
        };

        // If influencer already signed, mark as fully signed
        if (proposal.influencer_signature) {
            updates.contract_status = 'signed';
        } else {
            updates.contract_status = 'partial';
        }

        let success = false;
        if ((proposal as any).moment_id || (proposal as any).event_id) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateBrandProposal(proposal.id, updates);
        }

        if (success) {
            useWorkspaceStore.getState().updateProposal(updates);
            // Auto-advance to shipping stage when fully signed
            if (updates.contract_status === 'signed') {
                useWorkspaceStore.getState().setCurrentStage('shipping');
            }
            refreshData(); // Sync archive cards + cross-user data
        }
    };

    const handleSaveContract = async (content: string) => {
        if (!proposal?.id) return;
        const updates: any = { contract_content: content };
        if ((proposal as any).moment_id || (proposal as any).event_id) {
            await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            await updateProposal(proposal.id, updates);
        } else {
            await updateBrandProposal(proposal.id, updates);
        }
    };

    const handleUndoSign = async (role: 'brand' | 'creator') => {
        if (!proposal?.id) return;
        const updates: any = {
            brand_signature: null,
            brand_signed_at: null,
            contract_status: proposal.influencer_signature ? 'partial' : null,
        };
        let success = false;
        if ((proposal as any).moment_id || (proposal as any).event_id) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateBrandProposal(proposal.id, updates);
        }
        if (success) {
            useWorkspaceStore.getState().updateProposal(updates);
            refreshData(); // Sync archive cards + cross-user data
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* 1. Workspace Header */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-4">
                    {/* Creator Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary overflow-hidden">
                        {(proposal?.influencerAvatar || (proposal as any)?.influencer_avatar) ? (
                            <img src={proposal?.influencerAvatar || (proposal as any)?.influencer_avatar} alt="Creator" className="w-full h-full object-cover" />
                        ) : (
                            (proposal?.influencerName?.[0] || 'C')
                        )}
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
                                        : '표준 계약서 (자동 생성됨)'
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
                        summary={proposal?.delivery_status === 'delivered' ? '✅ 수령 완료' : proposal?.delivery_status === 'shipped' ? '📦 발송됨 · 수령 대기' : '배송지 정보 및 운송장 번호'}
                    >
                        <div className="space-y-4">
                            {/* Creator Shipping Info (read-only) */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">크리에이터 배송지</span>
                                </div>
                                {proposal?.shipping_name ? (
                                    <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground text-xs">받는 사람</span>
                                            <span className="font-medium">{proposal.shipping_name}</span>
                                        </div>
                                        {(proposal as any).shipping_phone && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground text-xs">연락처</span>
                                                <span>{(proposal as any).shipping_phone}</span>
                                            </div>
                                        )}
                                        {(proposal as any).shipping_address && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground text-xs">주소</span>
                                                <span className="text-right max-w-[180px]">{(proposal as any).shipping_address}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 text-center">
                                        크리에이터가 배송지를 아직 입력하지 않았습니다.
                                    </div>
                                )}
                            </div>

                            {/* Tracking Number + Status */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">운송장 번호</span>
                                    {proposal?.delivery_status && (
                                        <Badge variant="outline" className={`text-[10px] h-5 ml-auto ${proposal.delivery_status === 'delivered' ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20' :
                                            proposal.delivery_status === 'shipped' ? 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20' :
                                                'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                                            }`}>
                                            {proposal.delivery_status === 'delivered' ? '수령 완료' :
                                                proposal.delivery_status === 'shipped' ? '발송됨' : '대기중'}
                                        </Badge>
                                    )}
                                </div>

                                {proposal?.delivery_status === 'shipped' || proposal?.delivery_status === 'delivered' ? (
                                    <div className="bg-muted/30 rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">운송장</span>
                                            <span className="font-mono text-sm font-medium">{proposal.tracking_number}</span>
                                        </div>
                                        {proposal.delivery_status === 'delivered' && (
                                            <div className="flex items-center gap-1.5 mt-2 text-emerald-600 text-xs">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                크리에이터가 수령을 완료했습니다
                                            </div>
                                        )}
                                        {proposal.delivery_status === 'shipped' && (
                                            <div className="text-xs text-muted-foreground mt-2">
                                                크리에이터 수령 대기 중...
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            value={trackingInput}
                                            onChange={(e) => setTrackingInput(e.target.value)}
                                            placeholder="운송장 번호 입력"
                                            className="text-sm h-9"
                                        />
                                        <Button
                                            size="sm"
                                            className="h-9 shrink-0"
                                            disabled={!trackingInput.trim() || isShipping}
                                            onClick={async () => {
                                                if (!proposal?.id || !trackingInput.trim()) return;
                                                setIsShipping(true);
                                                try {
                                                    const updates: any = { tracking_number: trackingInput.trim(), delivery_status: 'shipped' };
                                                    let success = false;
                                                    if ((proposal as any).moment_id || (proposal as any).event_id) {
                                                        success = await updateMomentProposal(proposal.id, updates);
                                                    } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
                                                        success = await updateProposal(proposal.id, updates);
                                                    } else {
                                                        success = await updateBrandProposal(proposal.id, updates);
                                                    }
                                                    if (success) {
                                                        useWorkspaceStore.getState().updateProposal(updates);
                                                        toast.success('발송 정보가 등록되었습니다.');
                                                        setTrackingInput('');
                                                        refreshData(); // Sync archive cards + cross-user data
                                                    }
                                                } catch (e) {
                                                    console.error('Shipping update failed:', e);
                                                    toast.error('오류가 발생했습니다.');
                                                } finally {
                                                    setIsShipping(false);
                                                }
                                            }}
                                        >
                                            {isShipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4 mr-1" />}
                                            발송
                                        </Button>
                                    </div>
                                )}
                            </div>
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
