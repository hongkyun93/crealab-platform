
import React, { useState, useEffect, useRef } from 'react';
import { ProgressBar } from '../common/progress-bar';
import { StageCard } from '../common/stage-card';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ConditionsPanel } from '../common/conditions-panel';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { SmartContractPanel } from '../common/smart-contract-panel';
import { FileText, CheckCircle2, MapPin, Truck, Package, Loader2, Pencil, User, Upload, Download, Video, Eye } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { validateContentFile, formatFileSize, isVideo } from '@/lib/utils/file-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function CreatorInfoPanel() {
    const currentStage = useWorkspaceStore((state) => state.currentStage);
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { updateProposal, updateMomentProposal, updateBrandProposal, sendNotification, user, refreshData } = useUnifiedProvider();

    // Helper to determine stage status
    const getStageStatus = (stageId: string) => {
        const stages = ['negotiation', 'contract', 'shipping', 'content', 'completed'];
        const currentIndex = stages.indexOf(currentStage);
        const stageIndex = stages.indexOf(stageId);

        if (stageIndex < currentIndex) return 'completed';
        if (stageIndex === currentIndex) return 'active';
        return 'pending';
    };

    // Shipping state
    const [shipName, setShipName] = useState('');
    const [shipPhone, setShipPhone] = useState('');
    const [shipAddress, setShipAddress] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingShip, setIsSavingShip] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // Content upload state
    const { supabase } = useAuth();
    const draftInputRef = useRef<HTMLInputElement>(null);
    const finalInputRef = useRef<HTMLInputElement>(null);
    const cleanInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadTarget, setUploadTarget] = useState<'draft' | 'final' | 'clean'>('draft');

    // Pre-fill from proposal data or user profile
    useEffect(() => {
        if (proposal?.receiver_name) {
            setShipName(proposal.receiver_name);
            setShipPhone((proposal as any).shipping_phone || '');
            setShipAddress((proposal as any).shipping_address || '');
        } else if (user) {
            setShipName(user.name || '');
            setShipPhone(user.phone || '');
            setShipAddress(user.address || '');
        }
    }, [proposal?.receiver_name, user]);

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
        else if (updates.product_name !== undefined) payload.product_name = updates.product_name;
        if (updates.specialTerms !== undefined) payload.special_terms = updates.specialTerms;
        else if (updates.special_terms !== undefined) payload.special_terms = updates.special_terms;

        // Dates — check snake_case first (conditions-panel sends snake_case), then camelCase
        if (updates.condition_product_receipt_date !== undefined) payload.condition_product_receipt_date = updates.condition_product_receipt_date;
        else if (updates.dateReceived !== undefined) payload.condition_product_receipt_date = updates.dateReceived;

        if (updates.condition_draft_submission_date !== undefined) payload.condition_draft_submission_date = updates.condition_draft_submission_date;
        else if (updates.dateDraft !== undefined) payload.condition_draft_submission_date = updates.dateDraft;

        if (updates.condition_final_submission_date !== undefined) payload.condition_final_submission_date = updates.condition_final_submission_date;
        else if (updates.dateFinal !== undefined) payload.condition_final_submission_date = updates.dateFinal;

        if (updates.condition_upload_date !== undefined) payload.condition_upload_date = updates.condition_upload_date;
        else if (updates.dateUpload !== undefined) payload.condition_upload_date = updates.dateUpload;

        // Additional Fields
        if (updates.incentive_detail !== undefined) {
            payload.incentive_detail = updates.incentive_detail;
            payload.has_incentive = updates.has_incentive;
        }
        if ((updates as any).channel_name !== undefined) payload.channel_name = (updates as any).channel_name;
        if ((updates as any).channel_subtype !== undefined) payload.channel_subtype = (updates as any).channel_subtype;
        if (updates.condition_secondary_usage_period !== undefined) payload.condition_secondary_usage_period = updates.condition_secondary_usage_period;
        if ((updates as any).secondary_usage_fee !== undefined) payload.secondary_usage_fee = (updates as any).secondary_usage_fee;
        if (updates.product_type !== undefined) payload.product_type = updates.product_type;

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
            // Auto-advance to shipping stage when fully signed
            if (updates.contract_status === 'signed') {
                useWorkspaceStore.getState().setCurrentStage('shipping');
            }
            refreshData(); // Sync archive cards + cross-user data
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
            refreshData(); // Sync archive cards + cross-user data
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
                        summary={proposal?.delivery_status === 'delivered' ? '✅ 수령 완료' : proposal?.delivery_status === 'shipped' ? '📦 배송 중 · 수령 확인 필요' : '배송 현황 및 수령 확인'}
                    >
                        <div className="space-y-4">
                            {/* Shipping Address Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">배송지 정보</span>
                                    {proposal?.receiver_name && !isEditing && proposal?.delivery_status !== 'shipped' && proposal?.delivery_status !== 'delivered' && (
                                        <button onClick={() => setIsEditing(true)} className="ml-auto text-muted-foreground hover:text-foreground">
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Show form if no shipping info saved yet, or editing */}
                                {(!proposal?.receiver_name || isEditing) && proposal?.delivery_status !== 'shipped' && proposal?.delivery_status !== 'delivered' ? (
                                    <div className="space-y-2">
                                        {/* Load from profile button */}
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 py-1.5 px-2 rounded-md border border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                            onClick={() => {
                                                if (user) {
                                                    setShipName(user.name || '');
                                                    setShipPhone(user.phone || '');
                                                    setShipAddress(user.address || '');
                                                }
                                            }}
                                        >
                                            <User className="h-3 w-3" />
                                            프로필에서 불러오기
                                        </button>
                                        <div>
                                            <Label className="text-xs">받는 사람</Label>
                                            <Input value={shipName} onChange={(e) => setShipName(e.target.value)} placeholder="홍길동" className="h-8 text-sm mt-1" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">연락처</Label>
                                            <Input value={shipPhone} onChange={(e) => setShipPhone(e.target.value)} placeholder="010-0000-0000" className="h-8 text-sm mt-1" />
                                        </div>
                                        <div>
                                            <Label className="text-xs">주소</Label>
                                            <Input value={shipAddress} onChange={(e) => setShipAddress(e.target.value)} placeholder="도로명 주소 입력" className="h-8 text-sm mt-1" />
                                        </div>
                                        <div className="flex gap-2">
                                            {isEditing && (
                                                <Button variant="outline" size="sm" className="h-8 flex-1" onClick={() => setIsEditing(false)}>취소</Button>
                                            )}
                                            <Button
                                                size="sm"
                                                className="h-8 flex-1"
                                                disabled={!shipName.trim() || !shipPhone.trim() || !shipAddress.trim() || isSavingShip}
                                                onClick={async () => {
                                                    if (!proposal?.id) return;
                                                    setIsSavingShip(true);
                                                    try {
                                                        const updates: any = {
                                                            receiver_name: shipName.trim(),
                                                            shipping_phone: shipPhone.trim(),
                                                            shipping_address: shipAddress.trim(),
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
                                                            toast.success('배송지가 저장되었습니다.');
                                                            setIsEditing(false);
                                                            refreshData(); // Sync archive cards + brand sees shipping
                                                        }
                                                    } catch (e) {
                                                        console.error('Shipping save failed:', e);
                                                        toast.error('저장 중 오류가 발생했습니다.');
                                                    } finally {
                                                        setIsSavingShip(false);
                                                    }
                                                }}
                                            >
                                                {isSavingShip ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                                배송지 저장
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground text-xs">받는 사람</span>
                                            <span className="font-medium">{proposal?.receiver_name}</span>
                                        </div>
                                        {(proposal as any)?.shipping_phone && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground text-xs">연락처</span>
                                                <span>{(proposal as any).shipping_phone}</span>
                                            </div>
                                        )}
                                        {(proposal as any)?.shipping_address && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground text-xs">주소</span>
                                                <span className="text-right max-w-[180px]">{(proposal as any).shipping_address}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Tracking + Delivery Status */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">배송 현황</span>
                                    {proposal?.delivery_status && (
                                        <Badge variant="outline" className={`text-[10px] h-5 ml-auto ${proposal.delivery_status === 'delivered' ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20' :
                                            proposal.delivery_status === 'shipped' ? 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20' :
                                                'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                                            }`}>
                                            {proposal.delivery_status === 'delivered' ? '수령 완료' :
                                                proposal.delivery_status === 'shipped' ? '배송 중' : '발송 대기'}
                                        </Badge>
                                    )}
                                </div>

                                {proposal?.delivery_status === 'delivered' ? (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                            <CheckCircle2 className="h-4 w-4" />
                                            수령 완료
                                        </div>
                                        {proposal.tracking_number && (
                                            <div className="text-xs text-muted-foreground mt-1">운송장: {proposal.tracking_number}</div>
                                        )}
                                    </div>
                                ) : proposal?.delivery_status === 'shipped' ? (
                                    <div className="space-y-2">
                                        <div className="bg-muted/30 rounded-lg p-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-muted-foreground">운송장 번호</span>
                                                <span className="font-mono text-sm font-medium">{proposal.tracking_number}</span>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full h-9"
                                            disabled={isConfirming}
                                            onClick={async () => {
                                                if (!proposal?.id) return;
                                                setIsConfirming(true);
                                                try {
                                                    const updates: any = { delivery_status: 'delivered' };
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
                                                        useWorkspaceStore.getState().setCurrentStage('content');
                                                        toast.success('수령이 확인되었습니다. 콘텐츠 제작을 시작하세요!');
                                                        refreshData(); // Sync archive cards + cross-user data

                                                        // Notify brand
                                                        const brandId = (proposal as any).brand_id || (proposal as any).brandId || (proposal as any).campaign?.brand_id;
                                                        if (brandId) {
                                                            try {
                                                                await sendNotification(brandId, `${user?.name || '크리에이터'}님이 제품을 수령했습니다.`, 'delivery_confirmed', proposal.id?.toString());
                                                            } catch (notifErr) {
                                                                console.warn('Notification failed:', notifErr);
                                                            }
                                                        }
                                                    }
                                                } catch (e) {
                                                    console.error('Delivery confirm failed:', e);
                                                    toast.error('오류가 발생했습니다.');
                                                } finally {
                                                    setIsConfirming(false);
                                                }
                                            }}
                                        >
                                            {isConfirming ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Package className="h-4 w-4 mr-1" />}
                                            수령 확인
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 text-center">
                                        브랜드가 제품을 발송하면 운송장 번호가 여기에 표시됩니다.
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
                        summary={
                            proposal?.content_submission_status === 'approved' ? '✅ 초안 승인됨 · 최종본 제출'
                                : proposal?.content_submission_status === 'revision_requested' ? '🔄 수정 요청됨'
                                    : (proposal?.content_submission_file_url || (proposal as any)?.content_submission_url) ? '📎 초안 제출됨 · 리뷰 대기'
                                        : '콘텐츠 제출 및 피드백'
                        }
                    >
                        <div className="space-y-4">
                            {/* Draft Upload Phase */}
                            {proposal?.content_submission_status !== 'approved' && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Video className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs font-semibold text-muted-foreground">초안 제출</span>
                                        {proposal?.content_submission_status && (
                                            <Badge variant="outline" className={`text-[10px] h-5 ml-auto ${proposal.content_submission_status === 'submitted' ? 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20' :
                                                proposal.content_submission_status === 'revision_requested' ? 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20' :
                                                    'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
                                                }`}>
                                                {proposal.content_submission_status === 'submitted' ? '리뷰 대기' :
                                                    proposal.content_submission_status === 'revision_requested' ? '수정 요청' : '승인됨'}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Current draft preview */}
                                    {(proposal?.content_submission_file_url || proposal?.content_submission_url) && (
                                        <div className="bg-muted/30 rounded-lg p-3 mb-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Video className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs">v{proposal.content_submission_version || 1.0}</span>
                                                </div>
                                                <a href={proposal.content_submission_file_url || proposal.content_submission_url} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline flex items-center gap-1">
                                                    <Eye className="h-3 w-3" /> 미리보기
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload button — show if no draft yet, or revision requested (both systems) */}
                                    {(!proposal?.content_submission_file_url && !proposal?.content_submission_url ||
                                        proposal?.content_submission_status === 'revision_requested' ||
                                        !!(proposal as any)?.content_revision_requested_at) && (
                                            <div>
                                                <input ref={draftInputRef} type="file" className="hidden"
                                                    accept="video/mp4,video/quicktime,video/webm,image/*,application/pdf"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file || !proposal?.id) return;
                                                        const v = validateContentFile(file);
                                                        if (!v.valid) { toast.error(v.error!); return; }
                                                        setUploadTarget('draft');
                                                        setIsUploading(true); setUploadProgress(0);
                                                        try {
                                                            const { data: { session } } = await supabase.auth.getSession();
                                                            const ext = file.name.split('.').pop();
                                                            const filePath = `content/${proposal.id}/draft.${ext}`;
                                                            const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/submissions/${filePath}`;
                                                            const fileUrl: string = await new Promise((resolve, reject) => {
                                                                const xhr = new XMLHttpRequest();
                                                                xhr.upload.addEventListener('progress', (ev) => {
                                                                    if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
                                                                });
                                                                xhr.addEventListener('load', () => {
                                                                    if (xhr.status >= 200 && xhr.status < 300) {
                                                                        const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(filePath);
                                                                        resolve(publicUrl);
                                                                    } else reject(new Error(`업로드 실패 (${xhr.status})`));
                                                                });
                                                                xhr.addEventListener('error', () => reject(new Error('네트워크 오류')));
                                                                xhr.open('POST', url);
                                                                xhr.setRequestHeader('Authorization', `Bearer ${session?.access_token}`);
                                                                xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                                                                xhr.setRequestHeader('x-upsert', 'true');
                                                                xhr.send(file);
                                                            });
                                                            const ver = (proposal.content_submission_version || 0.9);
                                                            const nextVer = parseFloat((ver + 0.1).toFixed(1));
                                                            const isRevision = !!(proposal as any)?.content_revision_requested_at
                                                                || proposal?.content_submission_status === 'revision_requested';
                                                            const updates: any = {
                                                                content_submission_file_url: fileUrl,
                                                                content_submission_status: 'submitted',
                                                                content_submission_date: new Date().toISOString(),
                                                                content_submission_version: nextVer,
                                                                // 수정 업로드 시 revision gate 닫기
                                                                ...(isRevision ? { content_revision_requested_at: null } : {}),
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
                                                                refreshData();
                                                                toast.success(`초안 v${nextVer} 제출 완료!`);
                                                                const brandId = (proposal as any).brand_id || (proposal as any).brandId;
                                                                if (brandId) sendNotification(brandId, `${user?.name || '크리에이터'}님이 콘텐츠 초안을 제출했습니다.`, 'content_submission', proposal.id?.toString());
                                                            }
                                                        } catch (err: any) {
                                                            console.error('Draft upload failed:', err);
                                                            toast.error(err.message || '업로드 실패');
                                                        } finally {
                                                            setIsUploading(false); setUploadProgress(0);
                                                            if (draftInputRef.current) draftInputRef.current.value = '';
                                                        }
                                                    }}
                                                />
                                                {isUploading && uploadTarget === 'draft' ? (
                                                    <div className="space-y-2">
                                                        <div className="w-full bg-muted h-2 rounded-full">
                                                            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground text-center">{uploadProgress}% 업로드 중...</p>
                                                    </div>
                                                ) : (
                                                    <Button className="w-full" variant="outline" onClick={() => draftInputRef.current?.click()}>
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        {proposal?.content_submission_status === 'revision_requested' ? '수정본 업로드' : '초안 업로드'}
                                                    </Button>
                                                )}
                                                <p className="text-[10px] text-muted-foreground mt-1 text-center">MP4, MOV, WebM, 이미지, PDF (최대 500MB)</p>
                                            </div>
                                        )}

                                    {/* Waiting for review */}
                                    {(proposal?.content_submission_file_url || proposal?.content_submission_url) && proposal?.content_submission_status === 'submitted' && (
                                        <div className="text-xs text-muted-foreground text-center bg-muted/20 rounded-lg p-2">
                                            브랜드의 리뷰를 기다리고 있습니다...
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Final + Clean Upload Phase — after approval */}
                            {proposal?.content_submission_status === 'approved' && (
                                <div className="space-y-3">
                                    <div className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center font-medium">
                                        ✅ 초안이 승인되었습니다! 최종본과 클린본을 제출해주세요.
                                    </div>

                                    {/* Final version slot */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-muted-foreground">📹 최종본</span>
                                            <span className="text-[10px] text-muted-foreground">(자막/효과 포함)</span>
                                        </div>
                                        {proposal?.content_final_url ? (
                                            <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                <span className="text-xs flex-1">최종본 업로드 완료</span>
                                                <a href={proposal.content_final_url} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline">보기</a>
                                            </div>
                                        ) : (
                                            <div>
                                                <input ref={finalInputRef} type="file" className="hidden"
                                                    accept="video/mp4,video/quicktime,video/webm,image/*,application/pdf"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file || !proposal?.id) return;
                                                        const v = validateContentFile(file);
                                                        if (!v.valid) { toast.error(v.error!); return; }
                                                        setUploadTarget('final'); setIsUploading(true); setUploadProgress(0);
                                                        try {
                                                            const { data: { session } } = await supabase.auth.getSession();
                                                            const ext = file.name.split('.').pop();
                                                            const filePath = `content/${proposal.id}/final.${ext}`;
                                                            const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/submissions/${filePath}`;
                                                            const fileUrl: string = await new Promise((resolve, reject) => {
                                                                const xhr = new XMLHttpRequest();
                                                                xhr.upload.addEventListener('progress', (ev) => {
                                                                    if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
                                                                });
                                                                xhr.addEventListener('load', () => {
                                                                    if (xhr.status >= 200 && xhr.status < 300) {
                                                                        const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(filePath);
                                                                        resolve(publicUrl);
                                                                    } else reject(new Error(`업로드 실패 (${xhr.status})`));
                                                                });
                                                                xhr.addEventListener('error', () => reject(new Error('네트워크 오류')));
                                                                xhr.open('POST', url);
                                                                xhr.setRequestHeader('Authorization', `Bearer ${session?.access_token}`);
                                                                xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                                                                xhr.setRequestHeader('x-upsert', 'true');
                                                                xhr.send(file);
                                                            });
                                                            const updates: any = { content_final_url: fileUrl };
                                                            let success = false;
                                                            if ((proposal as any).moment_id || (proposal as any).momentId) success = await updateMomentProposal(proposal.id, updates);
                                                            else if ((proposal as any).campaignId || (proposal as any).campaign_id) success = await updateProposal(proposal.id, updates);
                                                            else success = await updateBrandProposal(proposal.id, updates);
                                                            if (success) { useWorkspaceStore.getState().updateProposal(updates); refreshData(); toast.success('최종본 업로드 완료!'); }
                                                        } catch (err: any) { toast.error(err.message || '업로드 실패'); }
                                                        finally { setIsUploading(false); setUploadProgress(0); if (finalInputRef.current) finalInputRef.current.value = ''; }
                                                    }}
                                                />
                                                {isUploading && uploadTarget === 'final' ? (
                                                    <div className="space-y-1">
                                                        <div className="w-full bg-muted h-2 rounded-full"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>
                                                        <p className="text-xs text-muted-foreground text-center">{uploadProgress}%</p>
                                                    </div>
                                                ) : (
                                                    <Button variant="outline" size="sm" className="w-full h-8" onClick={() => finalInputRef.current?.click()}>
                                                        <Upload className="h-3 w-3 mr-1" /> 최종본 업로드
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Clean version slot */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-muted-foreground">🎬 클린본</span>
                                            <span className="text-[10px] text-muted-foreground">(2차 활용용 원본)</span>
                                        </div>
                                        {proposal?.content_clean_url ? (
                                            <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                <span className="text-xs flex-1">클린본 업로드 완료</span>
                                                <a href={proposal.content_clean_url} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline">보기</a>
                                            </div>
                                        ) : (
                                            <div>
                                                <input ref={cleanInputRef} type="file" className="hidden"
                                                    accept="video/mp4,video/quicktime,video/webm,image/*,application/pdf"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file || !proposal?.id) return;
                                                        const v = validateContentFile(file);
                                                        if (!v.valid) { toast.error(v.error!); return; }
                                                        setUploadTarget('clean'); setIsUploading(true); setUploadProgress(0);
                                                        try {
                                                            const { data: { session } } = await supabase.auth.getSession();
                                                            const ext = file.name.split('.').pop();
                                                            const filePath = `content/${proposal.id}/clean.${ext}`;
                                                            const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/submissions/${filePath}`;
                                                            const fileUrl: string = await new Promise((resolve, reject) => {
                                                                const xhr = new XMLHttpRequest();
                                                                xhr.upload.addEventListener('progress', (ev) => {
                                                                    if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
                                                                });
                                                                xhr.addEventListener('load', () => {
                                                                    if (xhr.status >= 200 && xhr.status < 300) {
                                                                        const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(filePath);
                                                                        resolve(publicUrl);
                                                                    } else reject(new Error(`업로드 실패 (${xhr.status})`));
                                                                });
                                                                xhr.addEventListener('error', () => reject(new Error('네트워크 오류')));
                                                                xhr.open('POST', url);
                                                                xhr.setRequestHeader('Authorization', `Bearer ${session?.access_token}`);
                                                                xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                                                                xhr.setRequestHeader('x-upsert', 'true');
                                                                xhr.send(file);
                                                            });
                                                            const updates: any = { content_clean_url: fileUrl };
                                                            let success = false;
                                                            if ((proposal as any).moment_id || (proposal as any).momentId) success = await updateMomentProposal(proposal.id, updates);
                                                            else if ((proposal as any).campaignId || (proposal as any).campaign_id) success = await updateProposal(proposal.id, updates);
                                                            else success = await updateBrandProposal(proposal.id, updates);
                                                            if (success) { useWorkspaceStore.getState().updateProposal(updates); refreshData(); toast.success('클린본 업로드 완료!'); }
                                                        } catch (err: any) { toast.error(err.message || '업로드 실패'); }
                                                        finally { setIsUploading(false); setUploadProgress(0); if (cleanInputRef.current) cleanInputRef.current.value = ''; }
                                                    }}
                                                />
                                                {isUploading && uploadTarget === 'clean' ? (
                                                    <div className="space-y-1">
                                                        <div className="w-full bg-muted h-2 rounded-full"><div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>
                                                        <p className="text-xs text-muted-foreground text-center">{uploadProgress}%</p>
                                                    </div>
                                                ) : (
                                                    <Button variant="outline" size="sm" className="w-full h-8" onClick={() => cleanInputRef.current?.click()}>
                                                        <Upload className="h-3 w-3 mr-1" /> 클린본 업로드
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </StageCard>
                </div>
            </ScrollArea >
        </div >
    );
}
