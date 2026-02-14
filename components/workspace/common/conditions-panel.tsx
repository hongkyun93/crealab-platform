"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Package, CheckCircle2, Clock, AlertCircle, Pencil, Save, X, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Proposal } from '@/lib/types'; // Corrected import path

interface ConditionsPanelProps {
    userRole: 'brand' | 'creator';
    readonly?: boolean;
    onSave?: (updates: any) => Promise<void> | void; // Persistence callback
}

export function ConditionsPanel({ userRole, readonly = false, onSave }: ConditionsPanelProps) {
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
        contentType: '',
        secondaryUsage: ''
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
                contentType: proposal.content_type || proposal.contentType || '',
                secondaryUsage: proposal.condition_secondary_usage_period || proposal.secondaryUsage || ''
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
            content_type: editValues.contentType,
            condition_secondary_usage_period: editValues.secondaryUsage,


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
    const formattedCost = cost >= 10000
        ? `${(cost / 10000).toLocaleString()}만원`
        : new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(cost);
    const specialTerms = proposal?.special_terms || proposal?.specialTerms; // [FIX] Prioritize special_terms
    // [New] View Data
    const incentive = (proposal?.has_incentive ? (proposal?.incentive_detail || '제공') : '') || proposal?.incentive;
    const contentType = proposal?.content_type || proposal?.contentType || '협의 필요';
    const secondaryUsage = proposal?.condition_secondary_usage_period || proposal?.secondaryUsage || '협의 필요';

    // Display Date Logic (Check both camelCase and snake_case)
    const rawDateReceived = proposal?.condition_product_receipt_date || proposal?.date_received;
    const rawDateDraft = proposal?.condition_draft_submission_date || proposal?.date_draft;
    const rawDateFinal = proposal?.condition_final_submission_date || proposal?.date_final; // [NEW] Final Date Logic
    const rawDateUpload = proposal?.condition_upload_date || proposal?.date_upload;

    const displayDateReceived = rawDateReceived ? new Date(rawDateReceived).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : getDateString(5);
    const displayDateDraft = rawDateDraft ? new Date(rawDateDraft).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : getDateString(13);
    const displayDateFinal = rawDateFinal ? new Date(rawDateFinal).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : getDateString(17);
    const displayDateUpload = rawDateUpload ? new Date(rawDateUpload).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : getDateString(20);

    const canEdit = userRole === 'brand' && !readonly;

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
                        <Label className="text-xs text-muted-foreground">제안 비용 (단위: 만원)</Label>
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
                            <Label className="text-xs text-muted-foreground">콘텐츠 타입</Label>
                            <Input
                                value={editValues.contentType}
                                onChange={(e) => setEditValues({ ...editValues, contentType: e.target.value })}
                                className="h-8 text-xs bg-background"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">2차 활용 기간</Label>
                            <Input
                                value={editValues.secondaryUsage}
                                onChange={(e) => setEditValues({ ...editValues, secondaryUsage: e.target.value })}
                                className="h-8 text-xs bg-background"
                            />
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

            {/* Content & Usage Info */}
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">콘텐츠 타입</label>
                    <div className="p-2 bg-background rounded-md border border-border/50 text-xs font-medium truncate" title={contentType}>
                        {contentType}
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">2차 활용</label>
                    <div className="p-2 bg-background rounded-md border border-border/50 text-xs font-medium truncate">
                        {secondaryUsage}
                    </div>
                </div>
            </div>

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
                <label className="text-xs text-muted-foreground font-medium">주요 일정 (예상)</label>

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

            {/* Status Indicators - Role Based */}
            <div className="pt-2 flex gap-2">
                {userRole === 'brand' ? (
                    <>
                        <StatusChip label="브랜드 (나)" status="confirmed" text="✅ 제안함" />
                        <StatusChip label="크리에이터" status="waiting" text="⏳ 대기중" active />
                    </>
                ) : (
                    <>
                        <StatusChip label="브랜드" status="confirmed" text="✅ 제안함" />
                        <StatusChip label="크리에이터 (나)" status="action_needed" text="⚠️ 확인 필요" active />
                    </>
                )}
            </div>
        </div>
    );
}

function StatusChip({ label, status, text, active }: { label: string, status: 'confirmed' | 'waiting' | 'action_needed', text: string, active?: boolean }) {
    const styles = {
        confirmed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100",
        waiting: "bg-muted text-muted-foreground border-transparent",
        action_needed: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 animate-pulse",
    };

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
