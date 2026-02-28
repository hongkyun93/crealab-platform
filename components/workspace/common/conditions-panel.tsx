"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn, generateUTMLink } from '@/lib/utils';
import { Copy, DollarSign, FileText, Package, Pencil, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useWorkspaceStore } from '../hooks/use-workspace-store';

interface ConditionsPanelProps {
    userRole: 'brand' | 'creator';
    readonly?: boolean;
    onSave?: (updates: any) => Promise<void> | void; // Persistence callback
    onToggleConfirm?: (role: 'brand' | 'creator', currentValue: boolean) => Promise<void> | void;
}

export function ConditionsPanel({ userRole, readonly = false, onSave, onToggleConfirm }: ConditionsPanelProps) {
    const proposal = useWorkspaceStore((state) => state.proposal);
    const updateProposal = useWorkspaceStore((state) => state.updateProposal);

    const [isEditing, setIsEditing] = useState(false);

    // Local state for editing
    const [editValues, setEditValues] = useState({
        cost: 0,
        productName: '',
        dateReceived: '',
        dateDraft: '',
        dateFinal: '',
        dateUpload: '',
        specialTerms: '',
        // [New] Additional Fields
        incentive: '',
        channelName: '' as string,
        channelSubtype: '' as string,
        secondaryUsage: '',
        secondaryUsageFee: 0,
        productType: 'gift' as 'gift' | 'loan'
    });

    // Semantic Date Helpers (Simulated for now, would be better if proposal had specific date fields)
    // Mapping proposal dates to specific logic could be complex, simplifying for UI demo
    const startDate = proposal?.created_at ? new Date(proposal.created_at) : new Date();

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const getDateString = (daysOffset: number) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + daysOffset);
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // Calculate dates BACKWARDS from Upload Date if available, otherwise FORWARDS from Created Date
    const calculateDefaultDates = () => {
        // 1. Target Date (Upload Date)
        const targetDateStr = proposal?.condition_upload_date || proposal?.desired_date;

        if (targetDateStr) {
            const upload = new Date(targetDateStr);
            return {
                upload: targetDateStr,
                final: formatDate(new Date(upload.getTime() - 3 * 24 * 60 * 60 * 1000)),    // Upload - 3 days
                draft: formatDate(new Date(upload.getTime() - 7 * 24 * 60 * 60 * 1000)),    // Upload - 7 days
                receipt: formatDate(new Date(upload.getTime() - 14 * 24 * 60 * 60 * 1000)), // Upload - 14 days
            };
        }

        // 2. Fallback: Created Date + Offsets
        const created = startDate;
        return {
            upload: formatDate(new Date(created.getTime() + 20 * 24 * 60 * 60 * 1000)),
            final: formatDate(new Date(created.getTime() + 17 * 24 * 60 * 60 * 1000)), // Upload - 3 days
            draft: formatDate(new Date(created.getTime() + 13 * 24 * 60 * 60 * 1000)), // Upload - 7 days
            receipt: formatDate(new Date(created.getTime() + 5 * 24 * 60 * 60 * 1000)), // Upload - 15 days
        };
    };

    const defaultDates = calculateDefaultDates();

    // Initialize edit values ONLY when entering edit mode
    // Initialize edit values ONLY when entering edit mode
    useEffect(() => {
        if (isEditing && proposal) {
            setEditValues({
                // [FIX] Unify to price_offer (Master) -> compensation_amount (Legacy) -> cost (Legacy)
                cost: proposal.price_offer || (proposal.compensation_amount ? parseInt(proposal.compensation_amount.replace(/[^0-9]/g, '')) : 0) || proposal.cost || 0,
                productName: proposal.product_name || proposal.productName || (proposal.productId ? '제품명 로딩중...' : ''),
                // Use stored dates if available (check both camelCase and snake_case), otherwise fallback to logic
                dateReceived: proposal.condition_product_receipt_date || proposal.date_received || defaultDates.receipt,
                dateDraft: proposal.condition_draft_submission_date || proposal.date_draft || defaultDates.draft,
                dateFinal: proposal.condition_final_submission_date || proposal.date_final || defaultDates.final, // [NEW] Final Date
                dateUpload: proposal.condition_upload_date || proposal.date_upload || defaultDates.upload,
                specialTerms: proposal.special_terms || proposal.specialTerms || '',
                // [New] Init Additional Fields
                incentive: (proposal.has_incentive ? (proposal.incentive_detail || '인센티브 제공') : '') || proposal.incentive || '',
                channelName: proposal.channel_name || '',
                channelSubtype: proposal.channel_subtype || '',
                secondaryUsage: proposal.condition_secondary_usage_period || proposal.secondaryUsage || '',
                secondaryUsageFee: proposal.secondary_usage_fee || 0,
                productType: (proposal.product_type as 'gift' | 'loan') || 'gift'
            });
        }
    }, [isEditing]); // Removed 'proposal' dependency to prevent infinite loop if proposal ref is unstable

    const handleSave = async () => {
        const updates = {
            // Map back to DB columns (snake_case)
            price_offer: editValues.cost,
            product_name: editValues.productName,
            condition_product_receipt_date: editValues.dateReceived,
            condition_draft_submission_date: editValues.dateDraft,
            condition_final_submission_date: editValues.dateFinal, // [NEW] Final Date Persistence
            condition_upload_date: editValues.dateUpload,
            special_terms: editValues.specialTerms,
            // [New] Persist Additional Fields
            incentive_detail: editValues.incentive,
            has_incentive: !!editValues.incentive,
            channel_name: editValues.channelName || undefined,
            channel_subtype: editValues.channelSubtype || undefined,
            condition_secondary_usage_period: editValues.secondaryUsage,
            secondary_usage_fee: editValues.secondaryUsageFee || 0,
            product_type: editValues.productType,


            // Keep camelCase for legacy store compat if needed (optional)
            cost: editValues.cost,
            productName: editValues.productName,
            specialTerms: editValues.specialTerms
        };

        // 1. Optimistic Update (Local Store)
        updateProposal(updates);

        // 2. Persist to Database (via parent callback)
        if (onSave) {
            await onSave(updates);
        }

        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    // View Data (Prioritize saved dates over calculated ones)
    const product = proposal?.product_name || proposal?.productName || (proposal?.productId ? '제품명 로딩중...' : '협업 제품 정보 없음');
    // [FIX] Unified Logic: price_offer is master. Fallback to parsing string if needed.
    const cost = proposal?.price_offer || (proposal?.compensation_amount ? parseInt(proposal.compensation_amount.replace(/[^0-9]/g, '')) : 0) || proposal?.cost || 0;
    const formattedCost = cost > 0
        ? `${cost.toLocaleString()}원`
        : '협의 필요';
    const specialTerms = proposal?.special_terms || proposal?.specialTerms; // [FIX] Prioritize special_terms
    // [New] View Data
    const incentive = (proposal?.has_incentive ? (proposal?.incentive_detail || '제공') : '') || proposal?.incentive;
    // Channel name label
    const CHANNEL_LABELS: Record<string, string> = {
        instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', blog: 'Blog', other: '기타',
    };
    const secondaryUsage = proposal?.condition_secondary_usage_period || proposal?.secondaryUsage || '협의 필요';
    const secondaryUsageFee = proposal?.secondary_usage_fee || 0;

    // [NEW] 채널 서브타입 레이블 파싱 (여러 개 지원)
    const channelSubtypeRaw = proposal?.channel_subtype || '';
    const SUBTYPE_LABELS: Record<string, string> = {
        instagram_reels: '🎞️ 릴스',
        instagram_feed: '📷 피드',
        instagram_story: '⭕ 스토리',
        youtube_longform: '▶️ 롱폼',
        youtube_shorts: '⚡ 숏츠',
    };
    // 콤마 구분 지원: "instagram_reels,youtube_shorts" 또는 "other:팟캐스트" 형태
    const channelSubtypeLabels = channelSubtypeRaw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => {
            if (SUBTYPE_LABELS[s]) return SUBTYPE_LABELS[s]
            if (s.startsWith('other:')) return `기타: ${s.slice(6)}`
            return null
        })
        .filter((l): l is string => l !== null);

    // Display Date Logic (Check both camelCase and snake_case)
    const rawDateReceived = proposal?.condition_product_receipt_date || proposal?.date_received;
    const rawDateDraft = proposal?.condition_draft_submission_date || proposal?.date_draft;
    const rawDateFinal = proposal?.condition_final_submission_date || proposal?.date_final; // [NEW] Final Date Logic
    const rawDateUpload = proposal?.condition_upload_date || proposal?.date_upload;

    const displayDateReceived = rawDateReceived ? new Date(rawDateReceived).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : getDateString(5);
    const displayDateDraft = rawDateDraft ? new Date(rawDateDraft).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : getDateString(13);
    const displayDateFinal = rawDateFinal ? new Date(rawDateFinal).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : getDateString(17);
    const displayDateUpload = rawDateUpload ? new Date(rawDateUpload).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : getDateString(20);

    // 브랜드만 편집 가능, readonly 아닐 때, 그리고 둘 중 하나라도 수락하면 편집 불가
    const canEdit = userRole === 'brand' && !readonly &&
        !proposal?.brand_condition_confirmed && !proposal?.influencer_condition_confirmed;

    if (isEditing) {
        return (
            <div className="space-y-4 text-sm animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">조건 수정</span>
                    <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7 w-7 p-0">
                            <X className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={handleSave} className="h-7 w-7 p-0 bg-primary text-primary-foreground">
                            <Save className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">제품명</Label>
                        <Input
                            value={editValues.productName}
                            onChange={(e) => setEditValues({ ...editValues, productName: e.target.value })}
                            className="h-8 text-xs bg-background"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">제안 비용 (원)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={editValues.cost}
                                onChange={(e) => setEditValues({ ...editValues, cost: Number(e.target.value) })}
                                className="h-8 text-xs bg-background font-bold text-emerald-600 pr-8"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">원</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">인센티브 (Incentive)</Label>
                        <Input
                            value={editValues.incentive}
                            onChange={(e) => setEditValues({ ...editValues, incentive: e.target.value })}
                            placeholder="없음"
                            className="h-8 text-xs bg-background"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">진행 채널</Label>
                            <div className="grid grid-cols-5 gap-1">
                                {(['instagram', 'youtube', 'tiktok', 'blog', 'other'] as const).map(ch => (
                                    <button
                                        type="button"
                                        key={ch}
                                        onClick={() => setEditValues({ ...editValues, channelName: ch, channelSubtype: '' })}
                                        className={`py-1.5 rounded-md border text-[10px] font-medium transition-all duration-200
                                            ${editValues.channelName === ch
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                                            }`}
                                    >
                                        {ch === 'instagram' ? 'IG' : ch === 'youtube' ? 'YT' : ch === 'tiktok' ? 'TT' : ch === 'blog' ? 'Blog' : '기타'}
                                    </button>
                                ))}
                            </div>
                            {/* Subtypes in edit mode */}
                            {editValues.channelName === 'instagram' && (
                                <div className="flex gap-1 flex-wrap">
                                    {[{ id: 'instagram_reels', label: '릴스' }, { id: 'instagram_feed', label: '피드' }, { id: 'instagram_story', label: '스토리' }].map(sub => (
                                        <button type="button" key={sub.id}
                                            onClick={() => setEditValues({ ...editValues, channelSubtype: editValues.channelSubtype === sub.id ? '' : sub.id })}
                                            className={`px-2 py-0.5 rounded-full border text-[10px] font-medium transition-all ${editValues.channelSubtype === sub.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border'}`}
                                        >{sub.label}</button>
                                    ))}
                                </div>
                            )}
                            {editValues.channelName === 'youtube' && (
                                <div className="flex gap-1 flex-wrap">
                                    {[{ id: 'youtube_longform', label: '롱폼' }, { id: 'youtube_shorts', label: '숏츠' }].map(sub => (
                                        <button type="button" key={sub.id}
                                            onClick={() => setEditValues({ ...editValues, channelSubtype: editValues.channelSubtype === sub.id ? '' : sub.id })}
                                            className={`px-2 py-0.5 rounded-full border text-[10px] font-medium transition-all ${editValues.channelSubtype === sub.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border'}`}
                                        >{sub.label}</button>
                                    ))}
                                </div>
                            )}
                            {editValues.channelName === 'other' && (
                                <Input
                                    value={editValues.channelSubtype.startsWith('other:') ? editValues.channelSubtype.slice(6) : ''}
                                    onChange={e => setEditValues({ ...editValues, channelSubtype: e.target.value ? `other:${e.target.value}` : '' })}
                                    placeholder="채널명 입력"
                                    className="h-7 text-xs bg-background"
                                />
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">2차 활용</Label>
                            <select
                                value={editValues.secondaryUsage}
                                onChange={(e) => setEditValues({ ...editValues, secondaryUsage: e.target.value })}
                                className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
                            >
                                <option value="">기간 선택</option>
                                <option value="불가">불가</option>
                                <option value="3개월">3개월</option>
                                <option value="6개월">6개월</option>
                                <option value="12개월">12개월</option>
                                <option value="영구">영구</option>
                                <option value="협의">협의 필요</option>
                            </select>
                            {editValues.secondaryUsage && editValues.secondaryUsage !== '불가' && (
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={editValues.secondaryUsageFee || ''}
                                        onChange={(e) => setEditValues({ ...editValues, secondaryUsageFee: Number(e.target.value) })}
                                        placeholder="2차 활용 비용 (원)"
                                        className="h-7 text-xs bg-background pr-6"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">원</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 제품 제공 방식 토글 */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">제품 제공 방식</Label>
                        <div className="flex gap-2">
                            {(['gift', 'loan'] as const).map(type => (
                                <button
                                    type="button"
                                    key={type}
                                    onClick={() => setEditValues({ ...editValues, productType: type })}
                                    className={`flex-1 py-1.5 rounded-md border text-xs font-medium transition-all duration-200
                                        ${editValues.productType === type
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                                        }`}
                                >
                                    {type === 'gift' ? '🎁 증정' : '🔄 대여'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">특약사항 (Special Terms)</Label>
                        <Textarea
                            value={editValues.specialTerms}
                            onChange={(e) => setEditValues({ ...editValues, specialTerms: e.target.value })}
                            placeholder="추가적인 계약 조건이나 요청사항을 입력하세요."
                            className="min-h-[80px] text-xs bg-background resize-none leading-relaxed"
                        />
                    </div>

                    {/* Date Inputs */}
                    {/* Date Inputs */}
                    <div className="space-y-3 pt-2 border-t border-border/40 mt-1">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">제품 수령일 (Date Received)</Label>
                            <Input
                                type="date"
                                value={editValues.dateReceived}
                                onChange={(e) => setEditValues({ ...editValues, dateReceived: e.target.value })}
                                className="h-8 text-xs bg-background"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">초안 제출일 (Draft Due)</Label>
                            <Input
                                type="date"
                                value={editValues.dateDraft}
                                onChange={(e) => setEditValues({ ...editValues, dateDraft: e.target.value })}
                                className="h-8 text-xs bg-background"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">최종본 제출일 (Final Due)</Label>
                            <Input
                                type="date"
                                value={editValues.dateFinal}
                                onChange={(e) => setEditValues({ ...editValues, dateFinal: e.target.value })}
                                className="h-8 text-xs bg-background"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">업로드일 (Upload Date)</Label>
                            <Input
                                type="date"
                                value={editValues.dateUpload}
                                onChange={(e) => setEditValues({ ...editValues, dateUpload: e.target.value })}
                                className="h-8 text-xs font-bold text-indigo-600 bg-background"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 text-sm group relative">
            {/* Edit Button for Brand */}
            {canEdit && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="absolute -top-1 -right-1 h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    title="조건 수정"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </Button>
            )}

            {/* Product Info */}
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">협업 제품</label>
                <div className="flex items-center gap-2 p-2 bg-background rounded-md border border-border/50">
                    <div className="p-1.5 bg-secondary rounded-md">
                        <Package className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <span className="font-medium truncate">{product}</span>
                </div>
            </div>

            {/* Cost Info */}
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">제안 비용 & 인센티브</label>
                <div className="flex items-center gap-2 p-2 bg-background rounded-md border border-border/50">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formattedCost}</span>
                        {incentive && <span className="text-[10px] text-muted-foreground">+ {incentive}</span>}
                    </div>
                </div>
            </div>

            {/* Channel & Usage Info */}
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">진행 채널</label>
                    <div className="p-2 bg-background rounded-md border border-border/50 text-xs font-medium truncate">
                        {proposal?.channel_name ? (CHANNEL_LABELS[proposal.channel_name] || proposal.channel_name) : '협의 필요'}
                    </div>
                    {channelSubtypeLabels.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                            {channelSubtypeLabels.map((lbl, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                    {lbl}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">2차 활용</label>
                    <div className="p-2 bg-background rounded-md border border-border/50 text-xs font-medium truncate">
                        {secondaryUsage}
                        {secondaryUsageFee > 0 && (
                            <span className="ml-1 text-emerald-600">· {secondaryUsageFee.toLocaleString()}원</span>
                        )}
                    </div>
                </div>
            </div>

            {/* 제품 제공 방식 */}
            {(proposal?.product_type) && (
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">제품 제공 방식</label>
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                        proposal.product_type === 'loan'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800'
                            : 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-800'
                    )}>
                        {proposal.product_type === 'loan' ? '🔄 대여 (반납 필요)' : '🎁 증정 (제품 제공)'}
                    </div>
                </div>
            )}

            {/* 영상 가이드 */}
            {((proposal as any)?.video_guide) && (
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">영상 가이드</label>
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                        (proposal as any).video_guide === 'brand_provided'
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800'
                            : 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-800'
                    )}>
                        {(proposal as any).video_guide === 'brand_provided' ? '📋 브랜드 가이드 제공' : '🎨 크리에이터 기획'}
                    </div>
                </div>
            )}

            <Separator />

            {/* Special Terms Display */}
            {specialTerms && (
                <>
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <FileText className="w-3 h-3" /> 특약사항
                        </label>
                        <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-md text-xs leading-relaxed whitespace-pre-wrap text-amber-900 dark:text-amber-100">
                            {specialTerms}
                        </div>
                    </div>
                    <Separator />
                </>
            )}

            {/* Schedule Info */}
            <div className="space-y-3">
                <label className="text-xs text-muted-foreground font-medium">주요 일정</label>

                <div className="grid grid-cols-[1fr_auto] gap-2 items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> 제품 수령
                    </span>
                    <span className="font-medium">{displayDateReceived}</span>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-2 items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-300" /> 초안 제출
                    </span>
                    <span className="font-medium">{displayDateDraft}</span>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-2 items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> 최종본 제출
                    </span>
                    <span className="font-medium">{displayDateFinal}</span>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-2 items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" /> 업로드
                    </span>
                    <span className="font-bold text-primary">{displayDateUpload}</span>
                </div>
            </div>

            {/* UTM 성과 추적 링크 — product_url 있을 때만 표시 */}
            {(proposal as any)?.product_url && (() => {
                const productUrl = (proposal as any).product_url as string;
                const proposalId = proposal?.id?.toString() || '';
                const creatorId = (proposal as any).influencer_id ||
                    (proposal as any).influencerId || '';
                if (!proposalId || !creatorId) return null;
                const utmLink = generateUTMLink(productUrl, proposalId, creatorId);
                return (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                📊 성과 추적 링크
                            </label>
                            <div className="flex gap-1.5">
                                <input
                                    readOnly
                                    value={utmLink}
                                    className="flex-1 text-[10px] px-2 py-1.5 bg-muted/40 border border-border/50 rounded-md font-mono truncate text-muted-foreground"
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                />
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 shrink-0"
                                    onClick={() => {
                                        navigator.clipboard.writeText(utmLink).then(() => {
                                            toast.success('UTM 링크가 복사되었습니다!');
                                        }).catch(() => {
                                            toast.error('복사 실패. 직접 선택해서 복사해주세요.');
                                        });
                                    }}
                                    title="복사"
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                이 링크를 게시물 바이오에 사용하면 브랜드가 GA4에서 유입을 추적할 수 있어요.
                            </p>
                        </div>
                    </>
                );
            })()}

            {/* Status Indicators - based on actual confirmed flags */}
            <div className="pt-2 flex gap-2">
                {userRole === 'brand' ? (
                    <>
                        <StatusChip
                            label="브랜드 (나)"
                            status={proposal?.brand_condition_confirmed ? "confirmed" : "action_needed"}
                            text={proposal?.brand_condition_confirmed ? "✅ 확정함" : "⚠️ 확정 필요"}
                            active={!proposal?.brand_condition_confirmed}
                            onClick={onToggleConfirm
                                ? () => onToggleConfirm('brand', !!proposal?.brand_condition_confirmed)
                                : undefined
                            }
                        />
                        <StatusChip
                            label="크리에이터"
                            status={proposal?.influencer_condition_confirmed ? "confirmed" : "waiting"}
                            text={proposal?.influencer_condition_confirmed ? "✅ 수락함" : "⏳ 대기중"}
                        />
                    </>
                ) : (
                    <>
                        <StatusChip
                            label="브랜드"
                            status={proposal?.brand_condition_confirmed ? "confirmed" : "waiting"}
                            text={proposal?.brand_condition_confirmed ? "✅ 확정함" : "⏳ 대기중"}
                        />
                        <StatusChip
                            label="크리에이터 (나)"
                            status={proposal?.influencer_condition_confirmed ? "confirmed" : "action_needed"}
                            text={proposal?.influencer_condition_confirmed ? "✅ 수락함" : "⚠️ 확인 필요"}
                            active={!proposal?.influencer_condition_confirmed}
                            onClick={onToggleConfirm
                                ? () => onToggleConfirm('creator', !!proposal?.influencer_condition_confirmed)
                                : undefined
                            }
                        />
                    </>
                )}
            </div>

            {/* Hint text (UX Idea B) */}
            {(() => {
                const brandOk = !!proposal?.brand_condition_confirmed;
                const creatorOk = !!proposal?.influencer_condition_confirmed;
                const bothConfirmed = brandOk && creatorOk;
                if (bothConfirmed) return null; // 둘 다 완료 → 힌트 불필요

                const myConfirmed = userRole === 'brand' ? brandOk : creatorOk;

                return (
                    <div className="flex items-start gap-1.5 pt-1">
                        <div className="w-1 h-1 rounded-full bg-primary/60 flex-shrink-0 mt-1.5" />
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {myConfirmed
                                ? '다시 클릭하면 수락을 취소하고 조건을 수정할 수 있어요.'
                                : '내 탭을 클릭하면 수락됩니다. 양쪽 모두 수락하면 계약 단계로 자동 이동해요.'}
                        </p>
                    </div>
                );
            })()}
        </div>
    );
}

function StatusChip({
    label, status, text, active, onClick
}: {
    label: string
    status: 'confirmed' | 'waiting' | 'action_needed'
    text: string
    active?: boolean
    onClick?: () => void
}) {
    const styles = {
        confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100",
        waiting: "bg-muted text-muted-foreground border-transparent",
        action_needed: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 animate-pulse",
    };

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    "flex-1 py-1.5 px-3 rounded text-center border transition-all cursor-pointer",
                    "hover:brightness-95 active:scale-[0.97]",
                    styles[status],
                    active && "ring-1 ring-offset-1 ring-primary/20 bg-background shadow-sm"
                )}
                title={status === 'confirmed' ? '클릭하면 수락 취소' : '클릭하면 수락'}
            >
                <span className="text-[10px] opacity-70 block mb-0.5">{label}</span>
                <span className="text-xs font-bold">{text}</span>
            </button>
        );
    }

    return (
        <div className={cn(
            "flex-1 py-1.5 px-3 rounded text-center border transition-all",
            styles[status],
            active && "ring-1 ring-offset-1 ring-primary/20 bg-background shadow-sm"
        )}>
            <span className="text-[10px] opacity-70 block mb-0.5">{label}</span>
            <span className="text-xs font-bold">{text}</span>
        </div>
    );
}
