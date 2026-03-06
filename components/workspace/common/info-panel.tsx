
import { useAuth } from '@/components/providers/auth-provider';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { validateContentFile } from '@/lib/utils/file-validation';
import { BarChart3, CheckCircle2, Eye, FileText, Instagram, Loader2, MapPin, Package, Pencil, Sparkles, Truck, Upload, User, Video, MessageSquare, Download } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { compressVideo } from '@/lib/video-compressor';
import { ConditionsPanel } from '../common/conditions-panel';
import { ProgressBar } from '../common/progress-bar';
import { StageCard } from '../common/stage-card';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { AdminChatDialog } from '../common/admin-chat-dialog';

export function InfoPanel({ userRole }: { userRole: 'brand' | 'creator' }) {
    const currentStage = useWorkspaceStore((state) => state.currentStage);
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { updateProposal, updateMomentProposal, updateProductApplication, sendNotification, user, refreshData, adminId } = useUnifiedProvider();

    // Helper to determine stage status
    const getStageStatus = (stageId: string) => {
        const stages = ['negotiation', 'contract', 'shipping', 'content', 'settlement', 'final_complete'];
        const currentIndex = stages.indexOf(currentStage);
        const stageIndex = stages.indexOf(stageId);

        if (stageIndex < currentIndex) return 'completed';
        if (stageIndex === currentIndex) return 'active';
        return 'pending';
    };

    const [adminChatOpen, setAdminChatOpen] = useState(false);

    // Shipping state
    const [shipName, setShipName] = useState('');
    const [shipPhone, setShipPhone] = useState('');
    const [shipAddress, setShipAddress] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingShip, setIsSavingShip] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [trackingInput, setTrackingInput] = useState('');
    const [isShipping, setIsShipping] = useState(false);

    // Content upload state
    const { supabase } = useAuth();
    const draftInputRef = useRef<HTMLInputElement>(null);
    const finalInputRef = useRef<HTMLInputElement>(null);
    const cleanInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadTarget, setUploadTarget] = useState<'draft' | 'final' | 'clean'>('draft');

    // 성과 제출 상태
    const insightFileRef = useRef<HTMLInputElement>(null);
    const [insightPreview, setInsightPreview] = useState<string | null>(null);
    const [insightFile, setInsightFile] = useState<File | null>(null);
    const [insightResult, setInsightResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmittingPerf, setIsSubmittingPerf] = useState(false);
    const [perfSubmitted, setPerfSubmitted] = useState<any>(null);
    const [perfLoading, setPerfLoading] = useState(false);

    // [콘테스트] SNS 최종 게시 링크 제출
    const [contestSnsLink, setContestSnsLink] = useState('');
    const [isSavingSnsLink, setIsSavingSnsLink] = useState(false);

    // [콘테스트] 일정 타임라인 데이터
    const [contestSchedule, setContestSchedule] = useState<any>(null);

    // [콘테스트] 일정 fetch
    useEffect(() => {
        const contestId = (proposal as any)?.contest_id;
        if (!contestId || (proposal as any)?.type !== 'contest') return;
        supabase
            .from('ad_contests')
            .select('title, recruit_end_date, winner_announce_date, award_start_date, application_end_date')
            .eq('id', contestId)
            .single()
            .then(({ data }) => { if (data) setContestSchedule(data); });
    }, [(proposal as any)?.contest_id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Instagram 자동 성과 수집 상태
    const [igTab, setIgTab] = useState<'instagram' | 'screenshot'>('instagram');
    const [igMediaList, setIgMediaList] = useState<any[]>([]);
    const [igMediaLoading, setIgMediaLoading] = useState(false);
    const [igSelectedMedia, setIgSelectedMedia] = useState<any>(null);
    const [igFetchingInsights, setIgFetchingInsights] = useState(false);

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

    // 관리자가 입금 확인하면 자동으로 shipping 단계로 전환
    useEffect(() => {
        const paid = !!(proposal as any)?.payment_confirmed_at;
        const stage = useWorkspaceStore.getState().currentStage;
        if (paid && stage === 'contract') {
            useWorkspaceStore.getState().setCurrentStage('shipping');
        }
    }, [(proposal as any)?.payment_confirmed_at]);

    // settlement 단계 진입 시 기존 성과 데이터 조회
    useEffect(() => {
        if (currentStage !== 'settlement' || !proposal?.id) return;
        const proposalType = (proposal as any).moment_id || (proposal as any).moment_id
            ? 'moment_proposal'
            : (proposal as any).campaignId || (proposal as any).campaign_id
                ? 'campaign_application'
                : 'product_application';
        const fetchPerf = async () => {
            setPerfLoading(true);
            try {
                const { data } = await supabase
                    .from('campaign_performance')
                    .select('*')
                    .eq('proposal_type', proposalType)
                    .eq('proposal_id', proposal!.id.toString())
                    .maybeSingle();
                setPerfSubmitted(data || null);
            } finally {
                setPerfLoading(false);
            }
        };
        fetchPerf();
    }, [currentStage, proposal?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Instagram 게시물 목록 불러오기
    const handleFetchIgMedia = async () => {
        if (!user?.id) return;
        setIgMediaLoading(true);
        try {
            const res = await fetch(`/api/instagram/media?userId=${user.id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '게시물을 불러오지 못했습니다.');
            setIgMediaList(data.data || []);
        } catch (err: any) {
            toast.error(err.message);
            setIgTab('screenshot');
        } finally {
            setIgMediaLoading(false);
        }
    };

    // Instagram 인사이트 기반 성과 제출
    const handleSubmitWithIg = async () => {
        if (!igSelectedMedia || !proposal?.id || !user?.id) return;
        setIgFetchingInsights(true);
        try {
            const proposalType = (proposal as any).moment_id || (proposal as any).moment_id
                ? 'moment_proposal'
                : (proposal as any).campaignId || (proposal as any).campaign_id
                    ? 'campaign_application'
                    : 'product_application';
            const brandId = (proposal as any).brand_id || (proposal as any).brandId;
            const priceOffer = (proposal as any).price_offer || 0;
            const res = await fetch('/api/instagram/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mediaId: igSelectedMedia.id,
                    userId: user.id,
                    proposalType,
                    proposalId: proposal.id.toString(),
                    brandId,
                    priceOffer,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '성과 제출 실패');
            setPerfSubmitted(data.data);
            // 성과 제출 완료 → status는 settlement 유지, 브랜드에게 알림만 발송
            // (브랜드가 PerformanceDialog에서 최종완료 버튼을 눌러야 completed로 변경됨)
            const targetBrandId = brandId || (proposal as any).campaign?.brand_id;
            const actionUrl = `/brand?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
            if (targetBrandId) {
                sendNotification(
                    targetBrandId,
                    '크리에이터가 성과를 제출했습니다! 확인 후 최종완료 처리해주세요.',
                    'performance_submitted',
                    proposal.id?.toString(),
                    actionUrl,
                    { target_tab: 'performance' }
                );
            }
            toast.success('Instagram 인사이트 기반 성과 제출 완료! 🎉');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIgFetchingInsights(false);
        }
    };

    const handleInsightAnalyze = async () => {
        if (!insightFile) return;
        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('image', insightFile);
            const res = await fetch('/api/analyze-insight', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.error) { toast.error(data.error); return; }
            setInsightResult(data);
            toast.success('AI 분석 완료!');
        } catch {
            toast.error('분석 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmitPerformance = async () => {
        if (!insightResult || !proposal?.id || !user?.id) return;
        setIsSubmittingPerf(true);
        try {
            // 1. 스크린샷 Storage 업로드
            let screenshotUrl: string | null = null;
            if (insightFile) {
                const { data: { session } } = await supabase.auth.getSession();
                const ext = insightFile.name.split('.').pop() || 'jpg';
                const filePath = `performance/${proposal.id.toString()}/screenshot.${ext}`;
                const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/submissions/${filePath}`;
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) resolve();
                        else reject(new Error(`업로드 실패 (${xhr.status})`));
                    });
                    xhr.addEventListener('error', () => reject(new Error('네트워크 오류')));
                    xhr.open('POST', uploadUrl);
                    xhr.setRequestHeader('Authorization', `Bearer ${session?.access_token}`);
                    xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
                    xhr.setRequestHeader('x-upsert', 'true');
                    xhr.send(insightFile);
                });
                const { data: { publicUrl } } = supabase.storage.from('submissions').getPublicUrl(filePath);
                screenshotUrl = publicUrl;
            }

            // 2. 수치 추출
            const metrics = insightResult?.extracted?.metrics || {};
            const likes = metrics.likes || 0;
            const comments = metrics.comments || 0;
            const shares = metrics.shares || 0;
            const saves = metrics.saves || 0;
            const reach = metrics.reach || 0;
            const totalEngagement = likes + comments + shares + saves;
            const priceOffer = (proposal as any).price_offer || 0;
            const engagementRate = reach > 0 ? parseFloat(((totalEngagement / reach) * 100).toFixed(2)) : 0;
            const cpe = totalEngagement > 0 ? parseFloat((priceOffer / totalEngagement).toFixed(2)) : null;
            const cpr = reach > 0 ? parseFloat((priceOffer / reach).toFixed(2)) : null;

            const proposalType = (proposal as any).moment_id || (proposal as any).moment_id
                ? 'moment_proposal'
                : (proposal as any).campaignId || (proposal as any).campaign_id
                    ? 'campaign_application'
                    : 'product_application';

            const brandId = (proposal as any).brand_id || (proposal as any).brandId;

            // 3. campaign_performance INSERT
            const { data, error } = await supabase
                .from('campaign_performance')
                .insert({
                    proposal_type: proposalType,
                    proposal_id: proposal.id.toString(),
                    creator_id: user.id,
                    brand_id: brandId,
                    views: metrics.views || null,
                    likes: likes || null,
                    comments: comments || null,
                    shares: shares || null,
                    saves: saves || null,
                    reach: reach || null,
                    engagement_rate: engagementRate,
                    cpe,
                    cpr,
                    screenshot_url: screenshotUrl,
                    submitted_by: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            setPerfSubmitted(data);
            // 성과 제출 완료 → status는 settlement 유지, 브랜드에게 알림만 발송
            // (브랜드가 PerformanceDialog에서 최종완료 버튼을 눌러야 completed로 변경됨)
            const brandId2 = (proposal as any).brand_id || (proposal as any).brandId || (proposal as any).campaign?.brand_id;
            const actionUrl = `/brand?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
            if (brandId2) {
                sendNotification(
                    brandId2,
                    '크리에이터가 성과를 제출했습니다! 확인 후 최종완료 처리해주세요.',
                    'performance_submitted',
                    proposal.id?.toString(),
                    actionUrl,
                    { target_tab: 'performance' }
                );
            }
            toast.success('성과 데이터가 제출되었습니다! 브랜드 확인 후 최종 완료됩니다. 🎉');
        } catch (err: any) {
            toast.error(err.message || '제출 중 오류가 발생했습니다.');
        } finally {
            setIsSubmittingPerf(false);
        }
    };

    const handleConditionSave = async (updates: any) => {
        if (!proposal?.id) return;

        const payload: any = {};

        // [FIX] Full Symmetric Mapping (matching Brand InfoPanel)
        if (updates.price_offer !== undefined) {
            payload.price_offer = updates.price_offer;
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

        // [FIX] 4-way proposal type routing (moment / campaign / contest / product)
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            await updateMomentProposal(proposal.id, payload);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            await updateProposal(proposal.id, payload);
        } else if ((proposal as any).type === 'contest') {
            await updateProposal(proposal.id, payload);
        } else {
            await updateProductApplication(proposal.id, payload);
        }
    };

    // 크리에이터/브랜드 수락 토글 (chip 클릭)
    const handleToggleConfirm = async (role: 'brand' | 'creator', currentValue: boolean) => {
        if (!proposal?.id) return;
        const newValue = !currentValue;
        const updates: any = {};
        if (role === 'brand') {
            updates.brand_condition_confirmed = newValue;
        } else {
            updates.creator_condition_confirmed = newValue;
        }
        let success = false;
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else if ((proposal as any).type === 'contest') {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateProductApplication(proposal.id, updates);
        }
        if (success) {
            // DB 기반 Source of Truth 업데이트
            const updatedProposal = { ...proposal, ...updates };
            useWorkspaceStore.getState().updateProposal(updates);

            // 알림 발송 로직은 유지하되, UI 제어(setCurrentStage)는 제거
            // 상태 전환은 computeWorkspaceStage 등 데이터 파이프라인이 자동 처리하도록 위임.
            const brandOk = role === 'brand' ? newValue : !!updatedProposal.brand_condition_confirmed;
            const creatorOk = role === 'creator' ? newValue : !!updatedProposal.creator_condition_confirmed;
            const bothConfirmed = brandOk && creatorOk;

            // 🔔 알림 전송 로직
            try {
                const brandId = (proposal as any).brand_id ||
                    (proposal as any).brandId ||
                    (proposal as any).campaign?.brand_id;
                const creatorName = user?.name || '크리에이터';
                if (brandId) {
                    const msg = bothConfirmed
                        ? `양측 모두 조건을 확정하여 계약 단계로 이동합니다.`
                        : newValue
                            ? `${creatorName}님이 조건을 수락했습니다. 브랜드님의 확정이 필요합니다.`
                            : `${creatorName}님이 조건 수락을 취소했습니다.`;
                    const actionUrl = `/brand?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
                    await sendNotification(
                        brandId,
                        msg,
                        'condition_confirmed',
                        proposal.id?.toString(),
                        actionUrl,
                        { target_tab: bothConfirmed ? 'contract' : 'negotiation' }
                    );
                }
            } catch (notifErr) {
                console.warn('조건 확정 알림 발송 실패:', notifErr);
            }
        } else {
            toast.error('조건 상태를 변경하지 못했습니다. (서버 오류)');
        }

    };



    return (
        <div className="flex flex-col h-full">
            {/* 1. Workspace Header (Desktop Only, Mobile uses Layout Header) */}
            <div className="p-6 pb-2 hidden md:block">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary overflow-hidden">
                        {userRole === 'brand' ? (
                            (proposal?.creatorAvatar || (proposal as any)?.creator_avatar) ? (
                                <img src={proposal?.creatorAvatar || (proposal as any)?.creator_avatar} alt="Creator" className="w-full h-full object-cover" />
                            ) : (
                                (proposal?.creatorName?.[0] || (proposal as any)?.creator_name?.[0] || 'C')
                            )
                        ) : (
                            (proposal?.brandAvatar || proposal?.brand_avatar) ? (
                                <img src={proposal.brandAvatar || proposal.brand_avatar} alt="Brand" className="w-full h-full object-cover" />
                            ) : (
                                (proposal?.brandName?.[0] || proposal?.brand_name?.[0] || 'B')
                            )
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">
                            {userRole === 'brand'
                                ? (proposal?.creatorName || (proposal as any)?.creator_name || (proposal as any)?.influencer?.display_name || (proposal as any)?.influencer?.name || '크리에이터')
                                : (proposal?.brandName || proposal?.brand_name || 'Brand Name')
                            }
                        </h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{proposal?.target_name || 'Project Name'}</span>
                            <span className="font-mono text-[9px] text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded">
                                관리번호 : #{String((proposal as any)?.workspace_id || proposal?.id || '').replace(/-/g, '').slice(-6).toUpperCase()}
                            </span>
                        </p>
                    </div>
                </div>

                {/* 2. Progress Bar */}
                <ProgressBar />
            </div>

            <Separator className="my-2 hidden md:block" />

            {/* 3. Next Action Callout */}
            <div className="px-6 py-3">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100/50 dark:bg-indigo-800/20 rounded-full -mr-8 -mt-8" />
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 block">
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

            {/* [4-B] 콘테스트 일정 타임라인 배너 */}
            {(proposal as any)?.type === 'contest' && contestSchedule && (() => {
                const now = new Date();
                const phases = [
                    { label: '지원 마감', date: contestSchedule.application_end_date || contestSchedule.recruit_end_date },
                    { label: '수상자 발표', date: contestSchedule.winner_announce_date },
                    { label: '콘텐츠 업로드', date: contestSchedule.award_start_date },
                ].filter(p => p.date);
                if (phases.length === 0) return null;
                const fmt = (d: string) => { try { const dt = new Date(d); return `${dt.getMonth() + 1}/${dt.getDate()}`; } catch { return d; } };
                const isPast = (d: string) => new Date(d) < now;
                const isNear = (d: string) => { const diff = new Date(d).getTime() - now.getTime(); return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; };
                return (
                    <div className="mx-4 mb-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-[10px] font-bold text-amber-700 mb-2">🏆 {contestSchedule.title || '콘테스트'} 일정</p>
                        <div className="flex items-center">
                            {phases.map((phase, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center min-w-0">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${isPast(phase.date) ? 'bg-slate-400' : isNear(phase.date) ? 'bg-amber-500 animate-pulse' : 'bg-amber-300'}`}>{i + 1}</div>
                                        <p className={`text-[9px] font-semibold mt-0.5 text-center ${isNear(phase.date) ? 'text-amber-600' : isPast(phase.date) ? 'text-slate-400' : 'text-slate-600'}`}>{phase.label}</p>
                                        <p className={`text-[9px] font-bold ${isPast(phase.date) ? 'text-slate-400' : 'text-amber-600'}`}>{fmt(phase.date)}</p>
                                    </div>
                                    {i < phases.length - 1 && <div className={`flex-1 h-[1.5px] mb-5 mx-1 ${isPast(phase.date) ? 'bg-slate-300' : 'bg-amber-200'}`} />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                );
            })()}

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
                            userRole={userRole}
                            readonly={userRole === 'creator'}
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
                            proposal?.brand_signature && proposal?.creator_signature
                                ? '✅ 양측 서명 완료'
                                : proposal?.brand_signature
                                    ? '✍️ 브랜드 서명 완료 · 크리에이터 대기 중'
                                    : proposal?.creator_signature
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
                                <div className={`flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-lg border cursor-default ${proposal?.creator_signature ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/40' : 'bg-muted/50 text-muted-foreground border-border'}`}>
                                    {proposal?.creator_signature ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5 rounded-full border-2 border-current inline-block" />}
                                    크리에이터 {proposal?.creator_signature ? '서명완료' : '미서명'}
                                </div>
                            </div>
                            {/* Toggle button to open contract in main area */}
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => {
                                    if (window.innerWidth < 768) {
                                        toast.info("전자 계약서는 PC 환경에서만 확인 및 서명이 가능합니다.", {
                                            duration: 4000,
                                            icon: '💻',
                                        });
                                        return;
                                    }
                                    useWorkspaceStore.getState().setContractViewOpen(true);
                                }}
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
                                    {/* Show Edit Button only for Creator */}
                                    {proposal?.receiver_name && !isEditing && userRole === 'creator' && proposal?.delivery_status !== 'shipped' && proposal?.delivery_status !== 'delivered' && (
                                        <button onClick={() => setIsEditing(true)} className="ml-auto text-muted-foreground hover:text-foreground">
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Show form if Creator is editing or hasn't saved yet */}
                                {userRole === 'creator' && (!proposal?.receiver_name || isEditing) && proposal?.delivery_status !== 'shipped' && proposal?.delivery_status !== 'delivered' ? (
                                    <div className="space-y-2">
                                        {/* Load from profile button */}
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 py-1.5 px-2 rounded-md border border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                            onClick={() => {
                                                if (user) {
                                                    setShipName(user.shippingName || user.legalName || user.name || '');
                                                    setShipPhone(user.shippingPhone || user.phone || '');
                                                    setShipAddress(user.shippingAddress || user.legalAddress || user.address || '');
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
                                                        } else if ((proposal as any).type === 'contest') {
                                                            success = await updateProposal(proposal.id, updates);
                                                        } else {
                                                            success = await updateProductApplication(proposal.id, updates);
                                                        }
                                                        if (success) {
                                                            useWorkspaceStore.getState().updateProposal(updates);
                                                            toast.success('배송지가 저장되었습니다.');
                                                            setIsEditing(false);
                                                            refreshData(); // Sync archive cards + brand sees shipping

                                                            // 🔔 브랜드에게 배송지 저장 알림
                                                            try {
                                                                const brandId = (proposal as any).brand_id ||
                                                                    (proposal as any).brandId ||
                                                                    (proposal as any).campaign?.brand_id;
                                                                const creatorName = user?.name || '크리에이터';
                                                                if (brandId) {
                                                                    const actionUrl = `/brand?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
                                                                    await sendNotification(
                                                                        brandId,
                                                                        `${creatorName}님이 배송지 정보를 등록했습니다. 이제 제품을 발송해주세요.`,
                                                                        'shipping_address_saved',
                                                                        proposal.id?.toString(),
                                                                        actionUrl,
                                                                        { target_tab: 'shipping' }
                                                                    );
                                                                }
                                                            } catch (notifErr) {
                                                                console.warn('배송지 알림 실패 (무시):', notifErr);
                                                            }
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
                                ) : !proposal?.receiver_name ? (
                                    <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 text-center">
                                        {userRole === 'brand'
                                            ? '크리에이터가 배송지 정보를 입력하기를 기다리는 중입니다.'
                                            : '제품을 받을 배송지 정보를 입력해주세요.'}
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

                                {/* Delivery Status Info / Tracking Register */}
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
                                            {userRole === 'brand' && (
                                                <div className="text-xs text-muted-foreground mt-2">
                                                    크리에이터 수령 대기 중...
                                                </div>
                                            )}
                                        </div>
                                        {userRole === 'creator' && (
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
                                                        } else if ((proposal as any).type === 'contest') {
                                                            success = await updateProposal(proposal.id, updates);
                                                        } else {
                                                            success = await updateProductApplication(proposal.id, updates);
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
                                                                    const actionUrl = `/brand?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
                                                                    await sendNotification(
                                                                        brandId,
                                                                        `${user?.name || '크리에이터'}님이 제품을 수령했습니다.`,
                                                                        'delivery_confirmed',
                                                                        proposal.id?.toString(),
                                                                        actionUrl,
                                                                        { target_tab: 'shipping' }
                                                                    );
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
                                        )}
                                    </div>
                                ) : userRole === 'brand' && proposal?.receiver_name ? (
                                    <div className="flex gap-2">
                                        <Input
                                            value={trackingInput}
                                            onChange={(e) => setTrackingInput(e.target.value)}
                                            placeholder="운송장 번호 입력"
                                            className="text-sm h-9"
                                        />
                                        <Button
                                            size="sm"
                                            className="h-9 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                                            disabled={!trackingInput.trim() || isShipping}
                                            onClick={async () => {
                                                if (!proposal?.id || !trackingInput.trim()) return;
                                                setIsShipping(true);
                                                try {
                                                    const updates: any = { tracking_number: trackingInput.trim(), delivery_status: 'shipped' };
                                                    let success = false;
                                                    if ((proposal as any).moment_id || (proposal as any).momentId) {
                                                        success = await updateMomentProposal(proposal.id, updates);
                                                    } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
                                                        success = await updateProposal(proposal.id, updates);
                                                    } else if ((proposal as any).type === 'contest') {
                                                        success = await updateProposal(proposal.id, updates);
                                                    } else {
                                                        success = await updateProductApplication(proposal.id, updates);
                                                    }
                                                    if (success) {
                                                        useWorkspaceStore.getState().updateProposal(updates);
                                                        toast.success('발송 정보가 등록되었습니다.');
                                                        setTrackingInput('');
                                                        refreshData(); // Sync archive cards + cross-user data

                                                        // Notify Creator
                                                        try {
                                                            const creatorId = (proposal as any).creator_id;
                                                            if (creatorId) {
                                                                const actionUrl = `/creator?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
                                                                await sendNotification(
                                                                    creatorId,
                                                                    `제품이 발송되었습니다. 운송장 번호: ${trackingInput.trim()}`,
                                                                    'product_shipped',
                                                                    proposal.id?.toString(),
                                                                    actionUrl,
                                                                    { target_tab: 'shipping' }
                                                                );
                                                            }
                                                        } catch (notifErr) {
                                                            console.warn('배송 발송 알림 실패 (무시):', notifErr);
                                                        }
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
                                ) : (
                                    <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 text-center">
                                        {userRole === 'brand'
                                            ? '크리에이터의 배송지 정보가 아직 등록되지 않았습니다.'
                                            : '브랜드가 제품을 발송하면 운송장 번호가 여기에 표시됩니다.'}
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
                                        {/* [4-A] 수정 요청 횟수 배지 */}
                                        {(proposal as any)?.content_submission_version > 1 && (
                                            <span className="ml-1 text-[10px] font-bold text-amber-600 bg-amber-100 border border-amber-200 rounded-full px-1.5 py-0.5">
                                                수정 {((proposal as any)?.content_submission_version || 1) - 1}회
                                            </span>
                                        )}
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

                                    {/* Upload button — show if no draft yet, or revision requested, ONLY FOR CREATOR */}
                                    {userRole === 'creator' && (!proposal?.content_submission_file_url && !proposal?.content_submission_url ||
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

                                                            let uploadFile = file;
                                                            if (file.type.startsWith('video/')) {
                                                                toast.info("동영상을 최적화하고 있습니다. 잠시만 기다려주세요...");
                                                                uploadFile = await compressVideo(file, (p) => {
                                                                    setUploadProgress(Math.round(p * 50));
                                                                });
                                                            }

                                                            const ext = uploadFile.name.split('.').pop() || 'mp4';
                                                            const filePath = `content/${proposal.id}/draft_${Date.now()}.${ext}`;
                                                            const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/submissions/${filePath}`;
                                                            const fileUrl: string = await new Promise((resolve, reject) => {
                                                                const xhr = new XMLHttpRequest();
                                                                xhr.upload.addEventListener('progress', (ev) => {
                                                                    if (ev.lengthComputable) {
                                                                        const base = file.type.startsWith('video/') ? 50 : 0;
                                                                        const scale = file.type.startsWith('video/') ? 50 : 100;
                                                                        setUploadProgress(base + Math.round((ev.loaded / ev.total) * scale));
                                                                    }
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
                                                                xhr.send(uploadFile);
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
                                                            } else if ((proposal as any).type === 'contest') {
                                                                success = await updateProposal(proposal.id, updates);
                                                            } else {
                                                                success = await updateProductApplication(proposal.id, updates);
                                                            }
                                                            if (success) {
                                                                useWorkspaceStore.getState().updateProposal(updates);
                                                                refreshData();
                                                                toast.success(`초안 v${nextVer} 제출 완료!`);
                                                                const brandId = (proposal as any).brand_id || (proposal as any).brandId || (proposal as any).campaign?.brand_id;
                                                                const actionUrl = `/brand?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
                                                                if (brandId) {
                                                                    sendNotification(
                                                                        brandId,
                                                                        `${user?.name || '크리에이터'}님이 콘텐츠 초안을 제출했습니다.`,
                                                                        'content_submission',
                                                                        proposal.id?.toString(),
                                                                        actionUrl,
                                                                        { target_tab: 'content' }
                                                                    );
                                                                }
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
                                                <p className="text-[10px] text-muted-foreground mt-1 text-center">MP4, MOV, WebM, 이미지, PDF (최대 150MB)</p>
                                                <p className="text-[10px] text-indigo-500/70 mt-0.5 text-center leading-tight">동영상은 업로드 시 브라우저에서 자동 압축(최적화) 처리되어<br />화질은 보존하며 용량을 크게 줄여 전송됩니다.</p>
                                            </div>
                                        )}

                                    {userRole === 'brand' && (!proposal?.content_submission_file_url && !(proposal as any)?.content_submission_url) && (
                                        <div className="text-sm text-muted-foreground p-2 text-center bg-muted/20 rounded-lg">
                                            크리에이터가 콘텐츠를 제출하면 여기에 표시됩니다.
                                        </div>
                                    )}

                                    {/* Waiting for review (Creator) / Review Buttons (Brand) */}
                                    {(proposal?.content_submission_file_url || proposal?.content_submission_url) && proposal?.content_submission_status === 'submitted' && (
                                        <>
                                            {userRole === 'creator' ? (
                                                <div className="text-xs text-muted-foreground text-center bg-muted/20 rounded-lg p-2">
                                                    브랜드의 리뷰를 기다리고 있습니다...
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 h-8 text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                        onClick={async () => {
                                                            if (!proposal?.id) return;
                                                            const updates: any = {
                                                                content_submission_status: 'revision_requested',
                                                                content_revision_requested_at: new Date().toISOString(),
                                                            };
                                                            let success = false;
                                                            if ((proposal as any).moment_id || (proposal as any).momentId) success = await updateMomentProposal(proposal.id, updates);
                                                            else if ((proposal as any).campaignId || (proposal as any).campaign_id) success = await updateProposal(proposal.id, updates);
                                                            else if ((proposal as any).type === 'contest') success = await updateProposal(proposal.id, updates);
                                                            else success = await updateProductApplication(proposal.id, updates);
                                                            if (success) {
                                                                useWorkspaceStore.getState().updateProposal(updates);
                                                                refreshData();
                                                                toast.success('수정 요청을 전달했습니다.');
                                                                const creatorId = (proposal as any).creator_id || (proposal as any).creatorId || (proposal as any).influencer?.id;
                                                                const actionUrl = `/creator?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
                                                                if (creatorId) {
                                                                    sendNotification(
                                                                        creatorId,
                                                                        '브랜드가 콘텐츠 수정을 요청했습니다.',
                                                                        'content_revision',
                                                                        proposal.id?.toString(),
                                                                        actionUrl,
                                                                        { target_tab: 'content' }
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <MessageSquare className="h-3 w-3 mr-1" /> 수정 요청
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700"
                                                        onClick={async () => {
                                                            if (!proposal?.id) return;
                                                            const updates: any = { content_submission_status: 'approved' };
                                                            let success = false;
                                                            if ((proposal as any).moment_id || (proposal as any).momentId) success = await updateMomentProposal(proposal.id, updates);
                                                            else if ((proposal as any).campaignId || (proposal as any).campaign_id) success = await updateProposal(proposal.id, updates);
                                                            else if ((proposal as any).type === 'contest') success = await updateProposal(proposal.id, updates);
                                                            else success = await updateProductApplication(proposal.id, updates);
                                                            if (success) {
                                                                useWorkspaceStore.getState().updateProposal(updates);
                                                                refreshData();
                                                                toast.success('초안을 승인했습니다!');
                                                                const creatorId = (proposal as any).creator_id || (proposal as any).creatorId || (proposal as any).influencer?.id;
                                                                const actionUrl = `/creator?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
                                                                if (creatorId) {
                                                                    sendNotification(
                                                                        creatorId,
                                                                        '브랜드가 콘텐츠를 승인했습니다! 최종본과 클린본을 제출해주세요.',
                                                                        'content_approved',
                                                                        proposal.id?.toString(),
                                                                        actionUrl,
                                                                        { target_tab: 'content' }
                                                                    );
                                                                }

                                                                // [콘테스트] 초안 승인 시 Pending 정산 자동 생성
                                                                if ((proposal as any).type === 'contest' && (proposal as any).workspace_id) {
                                                                    try {
                                                                        await fetch('/api/contest-settlement', {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({
                                                                                workspaceId: (proposal as any).workspace_id,
                                                                                creatorId,
                                                                                brandId: (proposal as any).brand_id,
                                                                            })
                                                                        });
                                                                    } catch (e) {
                                                                        console.warn('[contest-settlement] Failed to create pending settlement (ignored):', e);
                                                                    }
                                                                }
                                                            }
                                                        }}

                                                    >
                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> 승인
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Wait Message for Revision */}
                                    {proposal?.content_submission_status === 'revision_requested' && userRole === 'brand' && (
                                        <div className="text-xs text-amber-600 text-center bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                                            크리에이터에게 수정 요청을 보냈습니다. 수정본 대기 중...
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
                                            <div className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-xs">최종본 {userRole === 'creator' ? '업로드' : '제출'} 완료</span>
                                                </div>
                                                <a href={proposal.content_final_url} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                    {userRole === 'brand' ? <><Download className="h-3 w-3" /> 다운로드</> : '보기'}
                                                </a>
                                            </div>
                                        ) : (
                                            userRole === 'creator' ? (
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
                                                                const filePath = `content/${proposal.id}/final_${Date.now()}.${ext}`;
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
                                                                else if ((proposal as any).type === 'contest') success = await updateProposal(proposal.id, updates);
                                                                else success = await updateProductApplication(proposal.id, updates);
                                                                if (success) {
                                                                    useWorkspaceStore.getState().updateProposal(updates); refreshData(); toast.success('최종본 업로드 완료!');
                                                                    // 🔔 브랜드에게 최종본 업로드 알림
                                                                    try {
                                                                        const targetBrandId = (proposal as any).brand_id || (proposal as any).brandId || (proposal as any).campaign?.brand_id;
                                                                        const creatorName = user?.name || '크리에이터';
                                                                        const actionUrl = `/brand?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
                                                                        if (targetBrandId) {
                                                                            sendNotification(
                                                                                targetBrandId,
                                                                                `${creatorName}님이 최종본을 업로드했습니다. 확인해보세요.`,
                                                                                'content_final_uploaded',
                                                                                proposal.id?.toString(),
                                                                                actionUrl,
                                                                                { target_tab: 'content' }
                                                                            );
                                                                        }
                                                                    } catch (notifErr) { console.warn('최종본 알림 실패:', notifErr); }
                                                                }
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
                                            ) : (
                                                <div className="text-[10px] text-muted-foreground bg-muted/20 p-2 rounded text-center">대기 중</div>
                                            )
                                        )}
                                    </div>

                                    {/* Clean version slot */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-muted-foreground">🎬 클린본</span>
                                            <span className="text-[10px] text-muted-foreground">(2차 활용용 원본)</span>
                                        </div>
                                        {proposal?.content_clean_url ? (
                                            <div className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-xs">클린본 {userRole === 'creator' ? '업로드' : '제출'} 완료</span>
                                                </div>
                                                <a href={proposal.content_clean_url} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-primary hover:underline">
                                                    {userRole === 'brand' ? <><Download className="h-3 w-3" /> 다운로드</> : '보기'}
                                                </a>
                                            </div>
                                        ) : (
                                            userRole === 'creator' ? (
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
                                                                const filePath = `content/${proposal.id}/clean_${Date.now()}.${ext}`;
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
                                                                else if ((proposal as any).type === 'contest') success = await updateProposal(proposal.id, updates);
                                                                else success = await updateProductApplication(proposal.id, updates);
                                                                if (success) {
                                                                    useWorkspaceStore.getState().updateProposal(updates); refreshData(); toast.success('클린본 업로드 완료!');
                                                                    // 🔔 브랜드에게 클린본 업로드 알림
                                                                    try {
                                                                        const targetBrandId = (proposal as any).brand_id || (proposal as any).brandId || (proposal as any).campaign?.brand_id;
                                                                        const creatorName = user?.name || '크리에이터';
                                                                        const actionUrl = `/brand?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
                                                                        if (targetBrandId) {
                                                                            sendNotification(
                                                                                targetBrandId,
                                                                                `${creatorName}님이 클린본(2차 활용 원본)을 업로드했습니다. 확인해보세요.`,
                                                                                'content_clean_uploaded',
                                                                                proposal.id?.toString(),
                                                                                actionUrl,
                                                                                { target_tab: 'content' }
                                                                            );
                                                                        }
                                                                    } catch (notifErr) { console.warn('클린본 알림 실패:', notifErr); }
                                                                }
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
                                            ) : (
                                                <div className="text-[10px] text-muted-foreground bg-muted/20 p-2 rounded text-center">대기 중</div>
                                            )
                                        )}
                                    </div>

                                    {/* [콘테스트 전용] 크리에이터 SNS 최종 게시 링크 제출 */}
                                    {(proposal as any).type === 'contest' && userRole === 'creator' && proposal?.content_final_url && (
                                        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                                            <p className="text-xs font-bold text-amber-700">📱 SNS 게시 링크 제출</p>
                                            <p className="text-[10px] text-amber-600 leading-relaxed">
                                                영상을 SNS에 게시한 후 링크를 제출해주세요. 브랜드가 실제 게시물을 확인합니다.
                                            </p>
                                            {(proposal as any).final_video_link ? (
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={(proposal as any).final_video_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline truncate flex-1"
                                                    >
                                                        ✅ {(proposal as any).final_video_link}
                                                    </a>
                                                    <button
                                                        className="text-[10px] text-slate-400 hover:text-slate-600 shrink-0"
                                                        onClick={() => setContestSnsLink((proposal as any).final_video_link)}
                                                    >
                                                        수정
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        className="flex-1 text-xs border border-amber-200 bg-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-amber-400"
                                                        placeholder="https://www.instagram.com/reel/..."
                                                        value={contestSnsLink}
                                                        onChange={e => setContestSnsLink(e.target.value)}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="h-8 text-xs bg-amber-600 hover:bg-amber-700 shrink-0"
                                                        disabled={!contestSnsLink.trim() || isSavingSnsLink}
                                                        onClick={async () => {
                                                            if (!contestSnsLink.trim() || !proposal?.id) return;
                                                            setIsSavingSnsLink(true);
                                                            try {
                                                                const supabase = (await import('@/lib/supabase/client')).createClient();
                                                                const { error } = await supabase
                                                                    .from('ad_contest_applications')
                                                                    .update({ final_video_link: contestSnsLink.trim(), status: 'uploaded' })
                                                                    .eq('workspace_id', (proposal as any).workspace_id || proposal.id)
                                                                    .eq('creator_id', user?.id || '');
                                                                if (error) throw error;
                                                                toast.success('SNS 링크가 제출되었습니다!');
                                                                refreshData();
                                                            } catch (e: any) {
                                                                toast.error(e.message || 'SNS 링크 저장 중 오류가 발생했습니다.');
                                                            } finally {
                                                                setIsSavingSnsLink(false);
                                                            }
                                                        }}
                                                    >
                                                        {isSavingSnsLink ? <Loader2 className="w-3 h-3 animate-spin" /> : '제출'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Complete button — both files required (Brand ONLY) */}
                                    {userRole === 'brand' && proposal?.content_final_url && proposal?.content_clean_url && (
                                        <div className="flex flex-col gap-2 pt-2">
                                            <Button
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold"
                                                size="sm"
                                                onClick={async () => {
                                                    if (!proposal?.id) return;

                                                    // 1. 제안 상태 settlement로 변경
                                                    const updates: any = { status: 'settlement', content_submission_status: 'completed' };
                                                    let success = false;
                                                    const proposalType = (proposal as any).moment_id || (proposal as any).moment_id
                                                        ? 'moment_proposal'
                                                        : (proposal as any).campaignId || (proposal as any).campaign_id
                                                            ? 'campaign_application'
                                                            : 'product_application';

                                                    if ((proposal as any).moment_id || (proposal as any).momentId) success = await updateMomentProposal(proposal.id, updates);
                                                    else if ((proposal as any).campaignId || (proposal as any).campaign_id) success = await updateProposal(proposal.id, updates);
                                                    else if ((proposal as any).type === 'contest') success = await updateProposal(proposal.id, updates);
                                                    else success = await updateProductApplication(proposal.id, updates);

                                                    if (!success) return;

                                                    // 2. settlements 레코드 생성
                                                    try {
                                                        const creatorId = (proposal as any).creator_id || (proposal as any).creatorId;
                                                        const brandId = (proposal as any).brand_id || (proposal as any).brandId || (proposal as any).campaign?.brand_id;
                                                        const priceOffer = (proposal as any).price_offer || 0;

                                                        if (creatorId && priceOffer > 0) {
                                                            const { error: settleErr } = await supabase.rpc('create_settlement_on_approval', {
                                                                p_proposal_id: proposal.id.toString(),
                                                                p_proposal_type: proposalType,
                                                                p_brand_id: brandId || null,
                                                                p_creator_id: creatorId,
                                                                p_gross_amount: priceOffer,
                                                            });
                                                            if (settleErr) {
                                                                console.error('[Settlement] create error:', settleErr);
                                                            }
                                                        }
                                                    } catch (e) {
                                                        console.error('[Settlement] unexpected error:', e);
                                                    }

                                                    // 3. UI 업데이트 및 알림
                                                    useWorkspaceStore.getState().updateProposal(updates);
                                                    useWorkspaceStore.getState().setCurrentStage('settlement');
                                                    refreshData();
                                                    toast.success('협업 완료 및 정산 승인되었습니다! 🎉');
                                                    const creatorId2 = (proposal as any).creator_id || (proposal as any).creatorId;
                                                    const actionUrl = `/creator?view=proposals&workspaceTab=active&proposalId=${proposal.id?.toString()}`;
                                                    if (creatorId2) {
                                                        sendNotification(
                                                            creatorId2,
                                                            '협업이 완료되었습니다! 3~7일 내 인사이트 성과를 제출해주세요.',
                                                            'collaboration_complete',
                                                            proposal.id?.toString(),
                                                            actionUrl,
                                                            { target_tab: 'performance' }
                                                        );
                                                    }
                                                }}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-1.5" /> 협업 완료 및 정산 승인
                                            </Button>
                                            <p className="text-[10px] text-emerald-600/70 text-center leading-relaxed">
                                                완료 버튼을 누르면 정산이 자동 생성되며 수정이 불가능합니다.<br />
                                                크리에이터가 성과를 제출하면 워크스페이스 카드에서 확인 가능합니다.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </StageCard>

                    {/* Stage 5: Settlement — 협업 완료 · 성과 제출 */}
                    {currentStage === 'settlement' && (
                        <StageCard
                            id="completed"
                            title="협업 완료 · 성과 제출"
                            isActive={true}
                            isCompleted={false}
                            summary={perfSubmitted ? '✅ 성과 제출 완료' : '인사이트 스크린샷을 제출해주세요'}
                        >
                            <div className="space-y-3">
                                {perfLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : perfSubmitted ? (
                                    // 제출 완료 상태
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">성과 데이터 제출 완료</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {[
                                                { label: '도달', value: perfSubmitted.reach },
                                                { label: '좋아요', value: perfSubmitted.likes },
                                                { label: '댓글', value: perfSubmitted.comments },
                                                { label: '저장', value: perfSubmitted.saves },
                                                { label: '공유', value: perfSubmitted.shares },
                                                { label: '조회수', value: perfSubmitted.views },
                                            ].map(item => (
                                                <div key={item.label} className="bg-muted/30 rounded-lg p-2 text-center">
                                                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                                                    <p className="text-sm font-bold">
                                                        {item.value != null
                                                            ? item.value >= 10000
                                                                ? `${(item.value / 10000).toFixed(1)}만`
                                                                : item.value.toLocaleString()
                                                            : '—'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-lg p-2.5 text-center">
                                                <p className="text-[10px] text-indigo-600/70">CPE</p>
                                                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                                    {perfSubmitted.cpe != null ? `${Math.round(perfSubmitted.cpe).toLocaleString()}원` : '—'}
                                                </p>
                                            </div>
                                            <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-800/40 rounded-lg p-2.5 text-center">
                                                <p className="text-[10px] text-violet-600/70">CPR</p>
                                                <p className="text-sm font-bold text-violet-700 dark:text-violet-300">
                                                    {perfSubmitted.cpr != null ? `${Math.round(perfSubmitted.cpr).toLocaleString()}원` : '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // 제출 폼 (탭: Instagram 자동 / 스크린샷)
                                    <div className="space-y-3">
                                        {/* 탭 선택기 */}
                                        <div className="flex rounded-lg bg-muted/30 p-0.5 gap-0.5">
                                            <button
                                                onClick={() => { setIgTab('instagram'); if (igMediaList.length === 0) handleFetchIgMedia(); }}
                                                className={`flex-1 text-xs font-medium rounded-md py-1.5 flex items-center justify-center gap-1 transition-colors ${igTab === 'instagram'
                                                    ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                <Instagram className="h-3 w-3" /> 자동 가져오기
                                            </button>
                                            <button
                                                onClick={() => setIgTab('screenshot')}
                                                className={`flex-1 text-xs font-medium rounded-md py-1.5 flex items-center justify-center gap-1 transition-colors ${igTab === 'screenshot'
                                                    ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                <BarChart3 className="h-3 w-3" /> 스크린샷
                                            </button>
                                        </div>

                                        {igTab === 'instagram' ? (
                                            /* Instagram 자동 수집 탭 */
                                            <div className="space-y-2">
                                                {igMediaLoading ? (
                                                    <div className="flex items-center justify-center py-6 gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">게시물 불러오는 중...</span>
                                                    </div>
                                                ) : igMediaList.length === 0 ? (
                                                    <div className="text-center py-4 space-y-2">
                                                        <Instagram className="h-6 w-6 mx-auto text-muted-foreground/40" />
                                                        <p className="text-xs text-muted-foreground">Instagram 게시물을 불러옵니다</p>
                                                        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleFetchIgMedia}>
                                                            <Instagram className="h-3.5 w-3.5" /> 게시물 불러오기
                                                        </Button>
                                                    </div>
                                                ) : !igSelectedMedia ? (
                                                    <div className="space-y-2">
                                                        <p className="text-xs text-muted-foreground">이 캠페인에 해당하는 게시물 선택</p>
                                                        <div className="grid grid-cols-3 gap-1">
                                                            {igMediaList.map((media) => {
                                                                const thumb = media.thumbnail_url || media.media_url;
                                                                return (
                                                                    <button
                                                                        key={media.id}
                                                                        onClick={() => setIgSelectedMedia(media)}
                                                                        className="aspect-square rounded-md overflow-hidden bg-muted/30 hover:ring-2 hover:ring-primary transition-all"
                                                                    >
                                                                        {thumb ? (
                                                                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <Video className="h-4 w-4 text-muted-foreground" />
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
                                                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
                                                                {(igSelectedMedia.thumbnail_url || igSelectedMedia.media_url) ? (
                                                                    <img src={igSelectedMedia.thumbnail_url || igSelectedMedia.media_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Video className="h-3 w-3 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">{igSelectedMedia.caption?.slice(0, 40) || '캡션 없음'}</p>
                                                                <p className="text-[10px] text-muted-foreground">❤️ {igSelectedMedia.like_count || 0} · 💬 {igSelectedMedia.comments_count || 0}</p>
                                                            </div>
                                                            <button onClick={() => setIgSelectedMedia(null)} className="text-xs text-muted-foreground hover:text-foreground px-1">✕</button>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="w-full h-9 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold"
                                                            onClick={handleSubmitWithIg}
                                                            disabled={igFetchingInsights}
                                                        >
                                                            {igFetchingInsights
                                                                ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />인사이트 수집 중...</>
                                                                : <><Instagram className="h-3.5 w-3.5 mr-1.5" />Instagram 인사이트 제출</>}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* 기존 스크린샷 탭 */
                                            <div className="space-y-3">
                                                <p className="text-xs text-muted-foreground">
                                                    포스팅한 게시물의 인사이트 스크린샷을 업로드해주세요.
                                                </p>
                                                <p className="text-[10px] text-muted-foreground bg-muted/30 rounded-md p-2 leading-relaxed">
                                                    특정 게시물 열기 → 하단 &ldquo;인사이트 보기&rdquo; → 스크린샷
                                                </p>

                                                <input
                                                    ref={insightFileRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setInsightFile(file);
                                                        setInsightResult(null);
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => setInsightPreview(ev.target?.result as string);
                                                        reader.readAsDataURL(file);
                                                        e.target.value = '';
                                                    }}
                                                />

                                                {!insightPreview ? (
                                                    <button
                                                        onClick={() => insightFileRef.current?.click()}
                                                        className="w-full border-2 border-dashed border-primary/30 rounded-lg p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                                    >
                                                        <BarChart3 className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground/40" />
                                                        <p className="text-xs text-muted-foreground">인사이트 스크린샷 업로드</p>
                                                    </button>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="relative">
                                                            <img
                                                                src={insightPreview}
                                                                alt="insight"
                                                                className="w-full max-h-40 object-contain rounded-lg border"
                                                            />
                                                            <button
                                                                onClick={() => { setInsightPreview(null); setInsightFile(null); setInsightResult(null); }}
                                                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                                                            >
                                                                <span className="text-xs leading-none px-0.5">✕</span>
                                                            </button>
                                                        </div>

                                                        {!insightResult ? (
                                                            <Button
                                                                size="sm"
                                                                className="w-full h-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                                                                onClick={handleInsightAnalyze}
                                                                disabled={isAnalyzing}
                                                            >
                                                                {isAnalyzing
                                                                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />AI 분석중...</>
                                                                    : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />AI 분석하기</>}
                                                            </Button>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <div className="grid grid-cols-3 gap-1.5">
                                                                    {[
                                                                        { label: '도달', value: insightResult.extracted?.metrics?.reach },
                                                                        { label: '좋아요', value: insightResult.extracted?.metrics?.likes },
                                                                        { label: '댓글', value: insightResult.extracted?.metrics?.comments },
                                                                        { label: '저장', value: insightResult.extracted?.metrics?.saves },
                                                                        { label: '공유', value: insightResult.extracted?.metrics?.shares },
                                                                        { label: '조회수', value: insightResult.extracted?.metrics?.views },
                                                                    ].map(item => (
                                                                        <div key={item.label} className="bg-muted/30 rounded-lg p-1.5 text-center">
                                                                            <p className="text-[10px] text-muted-foreground">{item.label}</p>
                                                                            <p className="text-xs font-bold">
                                                                                {item.value != null
                                                                                    ? item.value >= 10000
                                                                                        ? `${(item.value / 10000).toFixed(1)}만`
                                                                                        : item.value.toLocaleString()
                                                                                    : '—'}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 font-bold"
                                                                    onClick={handleSubmitPerformance}
                                                                    disabled={isSubmittingPerf}
                                                                >
                                                                    {isSubmittingPerf
                                                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />제출중...</>
                                                                        : <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />성과 제출 완료</>}
                                                                </Button>
                                                                <p className="text-[10px] text-muted-foreground text-center">수치가 정확한지 확인 후 제출해주세요.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </StageCard>
                    )}

                    {/* Stage 6: Final Complete — 모든 과정 완료 */}
                    {currentStage === 'final_complete' && (
                        <StageCard
                            id="final_complete"
                            title="🎉 모든 협업 과정 완료"
                            isActive={true}
                            isCompleted={false}
                            summary="성과 제출까지 완료되었습니다"
                        >
                            <div className="space-y-3">
                                <div className="flex flex-col items-center gap-3 py-4 text-center">
                                    <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300">협업이 성공적으로 완료되었습니다!</p>
                                        <p className="text-xs text-muted-foreground mt-1">성과 데이터 제출이 완료되어 최종 정산이 처리됩니다.</p>
                                    </div>
                                </div>
                            </div>
                        </StageCard>
                    )}
                </div>

                {/* Bottom Support / Report Section */}
                <div className="pt-8 pb-4">
                    <div className="bg-muted/30 rounded-lg p-4 text-center space-y-3 mx-6 mb-6">
                        <p className="text-xs font-semibold text-muted-foreground">
                            진행 중 문제가 발생했거나 일방적 계약 파기가 필요한가요?
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" asChild className="h-8 text-xs px-3">
                                <a href="mailto:admin@creadypick.com">이메일 문의</a>
                            </Button>
                            <Button variant="default" size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-xs px-3" onClick={() => setAdminChatOpen(true)}>
                                실시간 채팅 문의
                            </Button>
                        </div>
                    </div>
                </div>
            </ScrollArea >

            <AdminChatDialog
                open={adminChatOpen}
                onOpenChange={setAdminChatOpen}
                adminId={adminId}
            />
        </div >
    );
}
