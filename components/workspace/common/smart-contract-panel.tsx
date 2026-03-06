"use client"

import { useAuth } from '@/components/providers/auth-provider';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Proposal } from "@/lib/types/proposal";
import { cn } from "@/lib/utils";
import { BadgeCheck, CheckCircle2, Clock, Copy, CreditCard, Download, FileSignature, FileText, Loader2, Pencil, PenTool, RotateCcw, Save, ShieldCheck, Upload, X } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';
import { useWorkspaceStore } from '../hooks/use-workspace-store';

// ───── Types ─────
interface SmartContractPanelProps {
    proposal: Proposal;
    userType: 'brand' | 'creator';
    onSign: (role: 'brand' | 'creator', signatureData: string) => Promise<void>;
    onSaveContract?: (content: string) => Promise<void>;
    onUndoSign?: (role: 'brand' | 'creator') => Promise<void>;
    isSigning?: boolean;
    fullWidth?: boolean;
}

// ───── Signature Canvas Component ─────
function SignatureCanvas({
    onSign,
    onUndo,
    existingSignature,
    signedAt,
    signerName,
    label,
    disabled,
    isOwner,
    isSigning,
}: {
    onSign: (data: string) => void;
    onUndo?: () => void;
    existingSignature?: string | null;
    signedAt?: string | null;
    signerName: string;
    label: string;
    disabled: boolean;
    isOwner: boolean;
    isSigning?: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled || existingSignature) return;
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        setIsDrawing(true);
        const { x, y } = getCoords(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || disabled || existingSignature) return;
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCoords(e);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1e3a5f';
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasDrawn(true);
    };

    const endDraw = () => setIsDrawing(false);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const handleSign = () => {
        if (!canvasRef.current || !hasDrawn) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onSign(dataUrl);
    };

    // If already signed, show the signature image + undo button for owner
    if (existingSignature) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                <p className="font-bold text-green-700 dark:text-green-400 text-sm mb-2">서명 완료</p>
                {existingSignature.startsWith('data:image') ? (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-2 border inline-block">
                        <img src={existingSignature} alt="서명" className="h-14 w-auto" />
                    </div>
                ) : (
                    <div className="font-script text-xl text-indigo-700 dark:text-indigo-400">{existingSignature}</div>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">
                    {signerName} · {signedAt ? new Date(signedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) + ' KST' : ''}
                </p>
                {isOwner && onUndo && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 text-xs text-red-500 border-red-200 hover:bg-red-50"
                        onClick={onUndo}
                    >
                        <RotateCcw className="h-3 w-3 mr-1" /> 서명 취소
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-3 overflow-hidden">
            <p className="text-xs font-semibold text-muted-foreground mb-2 text-center shrink-0">{label}</p>
            <div className={cn(
                "flex-1 min-h-0 border-2 border-dashed rounded-xl transition-colors flex flex-col overflow-hidden",
                disabled ? "border-muted bg-muted/10 opacity-50" : "border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/10 dark:border-indigo-800/30"
            )}>
                <p className="text-[10px] text-muted-foreground text-center pt-2 shrink-0">
                    {disabled ? (isOwner ? "서명 패드" : "상대방만 서명 가능") : "아래에 서명해주세요"}
                </p>
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className={cn(
                        "flex-1 min-h-0 w-full rounded-lg bg-white dark:bg-zinc-900 touch-none",
                        disabled ? "cursor-not-allowed" : "cursor-crosshair"
                    )}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                />
            </div>
            <div className="flex gap-2 mt-2 shrink-0">
                <Button variant="outline" size="sm" onClick={clearCanvas} disabled={disabled || !hasDrawn} className="flex-1 h-8 text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" /> 지우기
                </Button>
                <Button size="sm" onClick={handleSign} disabled={disabled || !hasDrawn || isSigning} className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700">
                    {isSigning ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <PenTool className="h-3 w-3 mr-1" />}
                    {isSigning ? "처리 중..." : "서명 완료"}
                </Button>
            </div>
        </div>
    );
}

// ───── Main Panel ─────
export function SmartContractPanel({ proposal, userType, onSign, onSaveContract, onUndoSign, isSigning, fullWidth }: SmartContractPanelProps) {
    const { supabase } = useAuth();
    const [contractContent, setContractContent] = useState<string>(proposal.contract_content || '');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
    const [signatureExpanded, setSignatureExpanded] = useState(false);
    const contractRef = useRef<HTMLDivElement>(null);
    const updateProposal = useWorkspaceStore((state) => state.updateProposal);
    const setContractViewOpen = useWorkspaceStore((state) => state.setContractViewOpen);

    // ── [FIX] proposal.contract_content가 나중에 로드될 때 state 동기화 ──
    // useState 초기값은 최초 마운트에만 적용되므로, proposal prop 변경 시 명시적으로 업데이트
    useEffect(() => {
        if (proposal.contract_content && !contractContent) {
            setContractContent(proposal.contract_content);
        }
    }, [proposal.contract_content]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── 예치금 잔액 (브랜드 뷰에서만 사용) ──
    const [depositBalance, setDepositBalance] = useState<number | null>(null);
    const [isPayingDeposit, setIsPayingDeposit] = useState(false);

    // ── 프로필 추가 파싱 ──
    const [brandProfile, setBrandProfile] = useState<any>(null);
    const [creatorProfile, setCreatorProfile] = useState<any>(null);

    const p = proposal as any;
    const brandId = p.brand_id || p.brandId;
    const creatorId = p.creator_id || p.creatorId;

    useEffect(() => {
        const fetchProfiles = async () => {
            const profileColumns = [
                'id', 'display_name', 'email', 'phone',
                // Brand fields
                'representative_name', 'business_number', 'company_address', 'company_phone',
                'tax_email', 'business_category', 'business_type',
                'contact_person_name', 'contact_person_phone', 'contact_person_email', 'settlement_bank',
                // Creator fields
                'legal_name', 'birth_date', 'legal_address', 'shipping_address',
                'creator_business_number', 'bank_name', 'account_number', 'account_holder',
            ].join(',');

            const ids = [brandId, creatorId].filter(Boolean);
            if (!ids.length) return;

            const { data } = await supabase
                .from('profiles')
                .select(profileColumns)
                .in('id', ids);

            if (data) {
                const bProfile = data.find((d: any) => d.id === brandId);
                const cProfile = data.find((d: any) => d.id === creatorId);
                if (bProfile) setBrandProfile(bProfile);
                if (cProfile) setCreatorProfile(cProfile);
            }
        };
        fetchProfiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brandId, creatorId]);

    // Status Logic
    const isBrandSigned = !!proposal.brand_signature;
    const isCreatorSigned = !!proposal.creator_signature;
    const isFullySigned = isBrandSigned && isCreatorSigned;
    const isAnySigned = isBrandSigned || isCreatorSigned;
    const canEdit = userType === 'brand' && !isAnySigned;

    const brandName = brandProfile?.display_name || (proposal as any).brandName || (proposal as any).brand_name || "브랜드(갑)";
    const creatorName = creatorProfile?.legal_name || creatorProfile?.display_name || (proposal as any).creatorName || "크리에이터(을)";

    // Format date/time in KST
    const formatKST = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
            hour12: false,
        }) + ' KST';
    };

    // ── File upload state ──
    const [isParsingFile, setIsParsingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── 자동 생성 제거: 브랜드가 명시적으로 선택해야 생성 함
    // useEffect로 양쪽에서 자동 호출하는 버그 수정

    // ── 워크스페이스가 수신 홈에서 열릴 때 예치금 잡아오기 ──
    useEffect(() => {
        const fetchDepositBalance = async () => {
            if (userType !== 'brand' || !brandId) return;
            const { data } = await supabase
                .from('profiles')
                .select('deposit_balance')
                .eq('id', brandId)
                .single();
            if (data) setDepositBalance(data.deposit_balance ?? 0);
        };
        if (isFullySigned) fetchDepositBalance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brandId, isFullySigned, userType]);



    const handlePayFromDeposit = async () => {
        const priceOffer: number = (proposal as any).price_offer ?? 0;
        const totalWithVat = Math.round(priceOffer * 1.1);
        if (depositBalance === null || depositBalance < totalWithVat) {
            return;
        }
        setIsPayingDeposit(true);
        try {
            const newBalance = depositBalance - totalWithVat;
            const proposalType = (proposal as any).moment_id
                ? 'moment_proposal'
                : (proposal as any).campaign_id
                    ? 'campaign_application'
                    : 'product_application';

            // SECURITY DEFINER 함수로 원자 처리:
            // 1. brand_deposits INSERT  2. profiles.deposit_balance 차감  3. payment_confirmed_at 세팅
            const { error: rpcErr } = await supabase.rpc('brand_pay_from_deposit', {
                p_proposal_id: proposal.id,
                p_proposal_type: proposalType,
                p_amount: totalWithVat,
                p_product_name: (proposal as any).product_name ?? '',
            });
            if (rpcErr) throw rpcErr;

            updateProposal({ payment_confirmed_at: new Date().toISOString() } as any);
            setDepositBalance(newBalance);

            // 배송 단계로 전환
            setContractViewOpen(false);
            useWorkspaceStore.getState().setCurrentStage('shipping');

            // 성공 피드백
            const { toast: showToast } = await import('sonner');
            showToast.success(`광고비 결제 완료! (${totalWithVat.toLocaleString()}원) 배송 단계가 활성화됐습니다.`);

            // 🔔 크리에이터에게 입금 확인 알림
            try {
                if (creatorId) {
                    await supabase.from('notifications').insert({
                        recipient_id: creatorId,
                        sender_id: brandId,
                        type: 'payment_confirmed',
                        content: `광고비 입금이 확인되었습니다. 배송 단계가 활성화되었습니다.`,
                        reference_id: (proposal as any).workspace_id?.toString() || proposal.id?.toString(),
                        is_read: false,
                    });
                }
            } catch (notifErr) {
                console.warn('입금 확인 알림 실패 (무시):', notifErr);
            }
        } catch (err: any) {
            const msg = err?.message ?? err?.code ?? JSON.stringify(err);
            console.error('[SmartContractPanel] deposit payment failed:', msg);
            const { toast: showToast } = await import('sonner');
            showToast.error(`결제 실패: ${msg}`);
        } finally {
            setIsPayingDeposit(false);
        }
    };



    const generateContract = async () => {
        setIsGenerating(true);
        try {
            const p = proposal as any;

            // ── 변수 추출 ──
            const bName = brandProfile?.display_name || p.brand_name || '브랜드(갑)';
            const bRep = brandProfile?.representative_name || '';
            const bAddress = brandProfile?.company_address || '';
            const cName = creatorProfile?.legal_name || creatorProfile?.display_name || p.creator_name || '크리에이터(을)';
            const cAddress = creatorProfile?.legal_address || creatorProfile?.shipping_address || '';
            const productName = p.target_name || p.product_name || '협업 프로젝트';
            const channelName = p.channel_name || p.channelName || 'SNS 채널';
            const channelSubtype = p.channel_subtype || p.channelSubtype || '콘텐츠';
            const priceOffer = p.price_offer ? Number(p.price_offer).toLocaleString() : '0';
            const secondaryPeriod = p.condition_secondary_usage_period || p.secondary_usage_period || '6개월';
            const secondaryFee = p.secondary_usage_fee ? `${Number(p.secondary_usage_fee).toLocaleString()}원` : '광고비에 포함';
            const receiptDate = p.condition_product_receipt_date || p.dateReceived || '협의 후 결정';
            const draftDate = p.condition_draft_submission_date || p.dateDraft || '협의 후 결정';
            const finalDate = p.condition_final_submission_date || p.dateFinal || '협의 후 결정';
            const uploadDate = p.condition_upload_date || p.dateUpload || '협의 후 결정';
            const maintenancePeriod = p.condition_maintenance_period || '협의 후 결정';
            const hasIncentive = p.has_incentive;
            const incentiveDetail = p.incentive_detail || '';
            const specialTerms = p.special_terms || p.specialTerms || '';
            const isLoan = (p.product_type || '').toLowerCase() === 'loan';
            const taxClause = creatorProfile?.creator_business_number
                ? '세금계산서 발행 (부가세 10% 별도)'
                : '사업소득세 3.3% 원천징수 별도';
            const contractDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

            // ── 표준 계약서 템플릿 ──
            const template = `# 인플루언서 콘텐츠 광고 협업 계약서

**광고주(갑):** ${bName}
**크리에이터(을):** ${cName}

---

## 제1조 (목적)
본 계약은 광고주와 크리에이터가 ${productName} 홍보를 위한 브랜디드/PPL 콘텐츠 제작 및 ${channelName} 채널 게재에 관하여 합의된 조건을 명확히 하기 위해 체결한다.

## 제2조 (용역 범위)
1. 크리에이터는 ${productName}을 소재로 ${channelSubtype} 형식의 콘텐츠를 제작하여 ${channelName} 채널에 게재한다.
2. 일정
   - 제품 수령 기한: ${receiptDate}
   - 초안 제출 기한: ${draftDate}
   - 최종본 제출 기한: ${finalDate}
   - 게재(업로드) 완료 기한: ${uploadDate}
   - 게시 유지 기간: 업로드 이후 ${maintenancePeriod}

## 제3조 (광고비 및 지급)
1. 광고주는 크리에이터에게 광고비 **${priceOffer}원** (${taxClause})을 업로드 완료 후 30일 이내에 지급한다.
${hasIncentive ? `2. 인센티브: ${incentiveDetail}\n` : ''}3. 2차 활용 기간: **${secondaryPeriod}** (추가 비용: ${secondaryFee})
4. 크리에이터가 지정 기한 내 업로드를 완료하지 못할 경우, 지연일수에 따라 연 12% 비율의 지체상금을 광고주에게 반환한다. 단, 광고주의 귀책 또는 불가항력의 경우는 제외한다.
${isLoan ? `\n## 제3조의2 (제품 반납)\n광고주가 제공한 제품은 대여품으로, 콘텐츠 게재 완료 후 14일 이내에 광고주에게 반납해야 한다. 분실 또는 파손 시 동일 제품의 시가에 해당하는 금액을 배상한다.` : ''}

## 제4조 (콘텐츠 수정)
1. 기획안 수정 요청은 촬영 개시 전에 진행한다.
2. 편집본 수정은 게재 전에 한하며, 자막 및 부분 편집 범위로 제한한다.
3. 광고주가 콘텐츠 수령 후 영업일 3일 내 명확한 사유 없이 미통보 시 승인된 것으로 간주한다.

## 제5조 (저작권 및 2차 활용)
1. 제작물의 저작권은 광고주에 귀속된다. 단, 광고비 미지급 시 광고주는 결과물을 사용할 수 없다.
2. 제작물 활용 범위: 광고주의 국내외 공식 SNS, 온/오프라인 판매채널, 온라인 마케팅 채널 (범위 외 활용 시 크리에이터 사전 동의 필요)
3. 크리에이터는 광고주 동의 후 자신의 포트폴리오에 제작물을 활용할 수 있다.
4. 계약 기간 연장 또는 추가 매체 활용은 별도 서면 합의가 필요하다.

## 제6조 (초상권)
본 계약의 초상권 범위는 크리에이터의 얼굴 및 본인으로 인지될 수 있는 범위로 한다. 범위 외 신체(손 등) 활용은 별도 합의가 필요하다.

## 제7조 (크리에이터 준수사항)
크리에이터는 다음 각 호의 행위를 하여서는 아니 된다.
1. 범죄행위(사기, 폭행, 음주운전, 마약, 성범죄, 도박) 또는 사회적 물의로 광고주 이미지에 심각한 손상을 주는 행위
2. 광고주의 이미지 또는 명예를 훼손하는 행위
3. 관련 법령(표시광고법 등) 및 플랫폼 정책 위반 콘텐츠 게재
4. 공정거래위원회 고시에 따른 경제적 이해관계 표시 의무 위반 — 게재 콘텐츠에 "#광고", "#협찬" 등 추천·보증 표시를 반드시 명기해야 한다

## 제8조 (비밀 유지)
양 당사자는 계약 기간 중 및 종료 후에도 상대방의 보수, 광고 방법, 기획 노하우 등을 제3자에게 누설하거나 이용하여서는 아니 된다.

## 제9조 (권리·의무 양도 금지)
양 당사자는 상대방의 서면 동의 없이 본 계약상의 권리·의무를 제3자에게 양도할 수 없다.

## 제10조 (불가항력)
천재지변, 전쟁, 내란, 관련 법령 개폐 등 합리적 지배 범위 밖의 사유로 계약 이행이 불가한 경우 해당 당사자는 책임을 면한다.

## 제11조 (계약 해지)
다음 각 호의 경우 서면 통보 후 15일 내 미시정 시 계약을 해지할 수 있다.
1. 부도, 파산, 회생절차 신청
2. 본 계약의 중요한 내용을 위반한 경우
3. 크리에이터가 제7조를 위반하여 광고주 이미지에 심각한 손상을 준 경우

## 제12조 (손해 배상)
1. 귀책 당사자는 상대방에게 발생한 손해를 배상한다. 단, 손해배상액은 본 계약 광고비 금액을 초과하지 않는다.
2. 크리에이터가 제2조의 게재 의무를 이행하지 않을 경우 광고비 전액을 위약금으로 광고주에게 반환한다.

## 제13조 (전자서명)
본 계약은 전자적 형태로 체결될 수 있으며, 전자서명법 및 전자문서 및 전자거래 기본법에 따라 서면과 동일한 법적 효력을 가진다.

## 제14조 (분쟁 해결)
본 계약과 관련한 분쟁은 서울중앙지방법원을 제1심 관할 법원으로 한다.
${specialTerms ? `\n## 제15조 (특약사항)\n${specialTerms}` : ''}

---

계약 체결일: ${contractDate}

**광고주(갑):** ${bName}${bRep ? ` / 대표 ${bRep}` : ''}
주소: ${bAddress}

**크리에이터(을):** ${cName}
주소: ${cAddress}`;

            setContractContent(template);
            if (onSaveContract) await onSaveContract(template);
            updateProposal({ contract_content: template } as any);
        } catch (err) {
            console.error('[SmartContractPanel] contract generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const isHwp = fileName.endsWith('.hwp') || fileName.endsWith('.hwpx');
        if (isHwp) {
            alert('HWP(한글) 파일은 지원되지 않습니다.\nSupabase 파일을 PDF 또는 DOCX로 변환 후 업로드해주세요.');
            return;
        }

        setIsParsingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('proposal', JSON.stringify(proposal));
            formData.append('brandName', brandName);
            formData.append('creatorName', creatorName);
            formData.append('brandProfile', JSON.stringify(brandProfile || {}));
            formData.append('creatorProfile', JSON.stringify(creatorProfile || {}));

            const res = await fetch('/api/parse-contract', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || '파일 파싱에 실패했습니다.');
                return;
            }

            if (data.result) {
                setContractContent(data.result);
                if (onSaveContract) await onSaveContract(data.result);
                updateProposal({ contract_content: data.result } as any);
            }
        } catch (err) {
            console.error('[SmartContractPanel] File parse error:', err);
            alert('파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setIsParsingFile(false);
            // reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleStartEdit = () => { setEditContent(contractContent); setIsEditing(true); };
    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            setContractContent(editContent);
            if (onSaveContract) await onSaveContract(editContent);
            updateProposal({ contract_content: editContent } as any);
            setIsEditing(false);
        } finally { setIsSaving(false); }
    };
    const handleCancelEdit = () => { setIsEditing(false); setEditContent(''); };

    // CSS variable overrides: oklch → hex (for html2canvas compatibility)
    const hexColorOverrides = `
:root, .dark, *, *::before, *::after {
  --background: #ffffff !important;
  --foreground: #1a1a1a !important;
  --card: #ffffff !important;
  --card-foreground: #1a1a1a !important;
  --popover: #ffffff !important;
  --popover-foreground: #1a1a1a !important;
  --primary: #1e3a8a !important;
  --primary-foreground: #f5f5f5 !important;
  --secondary: #f5f5f5 !important;
  --secondary-foreground: #1a1a1a !important;
  --muted: #f5f5f5 !important;
  --muted-foreground: #737373 !important;
  --accent: #f5f5f5 !important;
  --accent-foreground: #1a1a1a !important;
  --destructive: #dc2626 !important;
  --border: #e5e5e5 !important;
  --input: #e5e5e5 !important;
  --ring: #a3a3a3 !important;
  --chart-1: #e66e2a !important;
  --chart-2: #2a9d8f !important;
  --chart-3: #264653 !important;
  --chart-4: #e9c46a !important;
  --chart-5: #f4a261 !important;
  --sidebar: #fafafa !important;
  --sidebar-foreground: #1a1a1a !important;
  --sidebar-primary: #1a1a1a !important;
  --sidebar-primary-foreground: #fafafa !important;
  --sidebar-accent: #f5f5f5 !important;
  --sidebar-accent-foreground: #1a1a1a !important;
  --sidebar-border: #e5e5e5 !important;
  --sidebar-ring: #a3a3a3 !important;
}
body { background: #fff !important; color: #111 !important; }
`;

    const handleDownloadPdf = async () => {
        if (!contractRef.current) return;
        setIsPdfGenerating(true);
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const productName = proposal.target_name || proposal.product_name || '협업 프로젝트';
            const filename = `CreadyPick_계약서_${productName}.pdf`;

            const opt = {
                margin: [10, 10, 10, 10] as [number, number, number, number],
                filename,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc: Document) => {
                        // Inject hex color overrides to replace all oklch() variables
                        const style = clonedDoc.createElement('style');
                        style.textContent = hexColorOverrides;
                        clonedDoc.head.appendChild(style);

                        // Also remove all existing stylesheets that contain oklch
                        clonedDoc.querySelectorAll('style').forEach((s) => {
                            if (s !== style && s.textContent?.includes('oklch')) {
                                s.textContent = s.textContent.replace(/oklch\([^)]*\)/g, '#111111');
                            }
                        });
                    },
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
            };
            await html2pdf().set(opt).from(contractRef.current).save();
        } catch (err) {
            console.error('[SmartContractPanel] PDF generation failed:', err);
            window.print();
        } finally { setIsPdfGenerating(false); }
    };

    // Simple markdown-to-HTML renderer
    const renderMarkdown = (md: string) => {
        if (!md) return '';
        return md.split('\n').map(line => {
            if (line.startsWith('# ')) return `<h1 style="color:#1e3a8a;font-size:1.25rem;font-weight:700;margin-top:1.5rem;margin-bottom:0.5rem">${line.slice(2)}</h1>`;
            if (line.startsWith('## ')) return `<h2 style="color:#1e3a8a;font-size:1.125rem;font-weight:700;margin-top:1.25rem;margin-bottom:0.5rem">${line.slice(3)}</h2>`;
            if (line.startsWith('### ')) return `<h3 style="color:#1e3a8a;font-size:1rem;font-weight:700;margin-top:1rem;margin-bottom:0.25rem">${line.slice(4)}</h3>`;
            line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            if (line.match(/^\d+\.\s/)) return `<p class="ml-4 my-1">${line}</p>`;
            if (line.startsWith('- ')) return `<p class="ml-4 my-1">• ${line.slice(2)}</p>`;
            if (line.trim() === '') return '<br />';
            return `<p class="my-1">${line}</p>`;
        }).join('');
    };

    return (
        <div className={cn("w-full flex flex-col border rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm", fullWidth && "h-full")}>
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between bg-card/50 shrink-0">
                <div className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-indigo-600" />
                    <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        전자 계약서
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {isFullySigned && (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800/40 text-xs px-2 py-0.5 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> 체결 완료
                        </Badge>
                    )}
                    {fullWidth && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setContractViewOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* ───── 3-Section Layout ───── */}
            <div className={cn("flex-1 min-h-0 flex flex-col", fullWidth && "overflow-hidden")}>
                {/* Top Section: 계약서 보기 */}
                <div className={cn("flex-1 min-h-0 flex flex-col", signatureExpanded && "border-b")}>
                    {/* Contract Toolbar -- 계약서 있을 때만 표시 */}
                    {contractContent && (
                        <div className="px-4 py-2 border-b flex items-center justify-between bg-background/80 shrink-0">
                            <span className="text-xs text-muted-foreground">
                                {isAnySigned ? '🔒 서명이 완료되어 수정할 수 없습니다' : '📄 브랜드가 작성한 계약서'}
                            </span>
                            <div className="flex gap-1.5">
                                {/* 브랜드 전용: 재생성 / 파일로 교체 / 수정 */}
                                {canEdit && !isEditing && (
                                    <>
                                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={generateContract} disabled={isGenerating}>
                                            {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                                            재작성
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()} disabled={isParsingFile}>
                                            {isParsingFile ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}
                                            파일 교체
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleStartEdit}>
                                            <Pencil className="h-3 w-3 mr-1" /> 수정
                                        </Button>
                                    </>
                                )}
                                {isEditing && (
                                    <>
                                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCancelEdit}>
                                            <X className="h-3 w-3 mr-1" /> 취소
                                        </Button>
                                        <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveEdit} disabled={isSaving}>
                                            {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                                            저장
                                        </Button>
                                    </>
                                )}
                                {!isEditing && contractContent && (
                                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleDownloadPdf} disabled={isPdfGenerating}>
                                        {isPdfGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                                        PDF
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileUpload}
                    />

                    {/* Contract Content */}
                    <ScrollArea className="flex-1">
                        {(isGenerating || isParsingFile) ? (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
                                <p className="text-sm font-medium">
                                    {isParsingFile ? '파일을 분석하고 조항을 추출하는 중입니다...' : 'AI가 계약서를 생성하고 있습니다...'}
                                </p>
                                <p className="text-xs mt-1">약 10~20초 소요됩니다</p>
                            </div>
                        ) : isEditing ? (
                            <div className="p-4 flex flex-col flex-1 min-h-0 h-full">
                                <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="font-mono text-xs leading-relaxed flex-1 min-h-[500px] resize-none h-full"
                                    placeholder="계약서 내용을 수정하세요..."
                                />
                            </div>
                        ) : !contractContent ? (
                            /* ── 계약서 없음: 브랜드 vs 크리에이터 분기 ── */
                            userType === 'brand' ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
                                    <FileSignature className="h-10 w-10 text-indigo-400 mb-1" />
                                    <p className="text-sm font-semibold text-foreground">계약서 작성 방법을 선택하세요</p>
                                    <p className="text-xs text-muted-foreground text-center">작성된 계약서는 크리에이터 워크스페이스에 자동으로 공유됩니다</p>
                                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-2">
                                        <button
                                            onClick={generateContract}
                                            disabled={isGenerating}
                                            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all cursor-pointer"
                                        >
                                            <FileText className="h-6 w-6 text-indigo-500" />
                                            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">표준 계약서 생성</span>
                                            <span className="text-[10px] text-muted-foreground text-center">조건 기반으로 표준 계약서 자동 작성</span>
                                        </button>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isParsingFile}
                                            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all cursor-pointer"
                                        >
                                            <FileText className="h-6 w-6 text-blue-500" />
                                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">파일 업로드</span>
                                            <span className="text-[10px] text-muted-foreground text-center">PDF · DOCX 업로드 후 AI가 조항 추출</span>
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">※ HWP 파일은 PDF 또는 DOCX로 변환 후 업로드해주세요</p>
                                </div>
                            ) : (
                                /* 크리에이터: 대기 상태 */
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                    <Clock className="h-8 w-8 text-indigo-300 mb-3" />
                                    <p className="text-sm font-medium">계약서 작성 중</p>
                                    <p className="text-xs mt-1">브랜드가 계약서를 작성하면 여기에 표시됩니다</p>
                                </div>
                            )
                        ) : (
                            <div ref={contractRef} className={cn("p-6", fullWidth && "max-w-4xl mx-auto")}>
                                {/* Top Signature Boxes (duplicate for PDF safety) */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-1">
                                        <div
                                            className="prose dark:prose-invert max-w-none text-sm leading-relaxed select-text"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(contractContent.split('\n').slice(0, 1).join('\n')) }}
                                        />
                                    </div>
                                    {/* Brand signature box (red border) */}
                                    <div className="shrink-0 w-[140px] h-[70px] border-2 border-red-400 rounded-lg flex flex-col items-center justify-center bg-white dark:bg-zinc-900 overflow-hidden">
                                        {isBrandSigned && proposal.brand_signature?.startsWith('data:image') ? (
                                            <>
                                                <img src={proposal.brand_signature} alt="갑 서명" className="h-8 w-auto" />
                                                <p className="text-[8px] text-muted-foreground mt-0.5">갑(브랜드) · {formatKST(proposal.brand_signed_at)}</p>
                                            </>
                                        ) : isBrandSigned ? (
                                            <>
                                                <p className="font-bold text-xs text-indigo-700">{proposal.brand_signature || brandName}</p>
                                                <p className="text-[8px] text-muted-foreground mt-0.5">{formatKST(proposal.brand_signed_at)}</p>
                                            </>
                                        ) : (
                                            <p className="text-[9px] text-muted-foreground">갑(브랜드) 서명란</p>
                                        )}
                                    </div>
                                    {/* Creator signature box (blue border) */}
                                    <div className="shrink-0 w-[140px] h-[70px] border-2 border-blue-400 rounded-lg flex flex-col items-center justify-center bg-white dark:bg-zinc-900 overflow-hidden">
                                        {isCreatorSigned && proposal.creator_signature?.startsWith('data:image') ? (
                                            <>
                                                <img src={proposal.creator_signature} alt="을 서명" className="h-8 w-auto" />
                                                <p className="text-[8px] text-muted-foreground mt-0.5">을(크리에이터) · {formatKST(proposal.creator_signed_at)}</p>
                                            </>
                                        ) : isCreatorSigned ? (
                                            <>
                                                <p className="font-bold text-xs text-indigo-700">{proposal.creator_signature || creatorName}</p>
                                                <p className="text-[8px] text-muted-foreground mt-0.5">{formatKST(proposal.creator_signed_at)}</p>
                                            </>
                                        ) : (
                                            <p className="text-[9px] text-muted-foreground">을(크리에이터) 서명란</p>
                                        )}
                                    </div>
                                </div>
                                {/* Contract body (skip first line since it's rendered above) */}
                                <div
                                    className="prose dark:prose-invert max-w-none text-sm leading-relaxed select-text"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(contractContent.split('\n').slice(1).join('\n')) }}
                                />
                                {/* Signature section for PDF */}
                                {(isBrandSigned || isCreatorSigned) && (
                                    <div className="mt-8 pt-6 border-t grid grid-cols-2 gap-6">
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-2">"갑" (브랜드)</p>
                                            {isBrandSigned && proposal.brand_signature?.startsWith('data:image') ? (
                                                <img src={proposal.brand_signature} alt="브랜드 서명" className="h-12 mx-auto" />
                                            ) : isBrandSigned ? (
                                                <p className="font-bold text-indigo-700">{proposal.brand_signature || brandName}</p>
                                            ) : (
                                                <p className="text-muted-foreground text-xs">서명 대기 중</p>
                                            )}
                                            {proposal.brand_signed_at && (
                                                <p className="text-[10px] text-muted-foreground mt-1">{formatKST(proposal.brand_signed_at)}</p>
                                            )}
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-xs text-muted-foreground mb-2">"을" (크리에이터)</p>
                                            {isCreatorSigned && proposal.creator_signature?.startsWith('data:image') ? (
                                                <img src={proposal.creator_signature} alt="크리에이터 서명" className="h-12 mx-auto" />
                                            ) : isCreatorSigned ? (
                                                <p className="font-bold text-indigo-700">{proposal.creator_signature || creatorName}</p>
                                            ) : (
                                                <p className="text-muted-foreground text-xs">서명 대기 중</p>
                                            )}
                                            {proposal.creator_signed_at && (
                                                <p className="text-[10px] text-muted-foreground mt-1">{formatKST(proposal.creator_signed_at)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* ── 입금 안내 배너: 양측 서명 완료 후 브랜드 뷰에만 ── */}
                {isFullySigned && userType === 'brand' && (
                    (proposal as any).payment_confirmed_at ? (
                        <div className="mx-4 mb-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/25 px-4 py-3 flex items-center gap-3">
                            <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">입금 확인 완료</p>
                                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">
                                    {new Date((proposal as any).payment_confirmed_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 확인됨 · 배송 단계가 활성화되었습니다.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mx-4 mb-3 rounded-xl border-2 border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-950/30 px-4 py-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
                                <p className="text-xs font-bold text-orange-700 dark:text-orange-300">💰 광고비 결제 안내</p>
                            </div>
                            {/* 예치금 차감 결제 */}
                            <div className="space-y-3">
                                {(() => {
                                    const priceOffer: number = (proposal as any).price_offer ?? 0;
                                    const totalWithVat = Math.round(priceOffer * 1.1);
                                    const bal = depositBalance ?? 0;
                                    const sufficient = bal >= totalWithVat;
                                    const afterPay = bal - totalWithVat;
                                    return (
                                        <>
                                            <div className="rounded-lg bg-white dark:bg-orange-950/40 border border-orange-200 dark:border-orange-700 p-3 space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-orange-700/70">현재 예치금 잔액</span>
                                                    <span className={cn('font-bold', sufficient ? 'text-orange-900 dark:text-orange-100' : 'text-red-600')}>{bal.toLocaleString()}원</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-orange-700/70">차감 금액 (VAT 포함)</span>
                                                    <span className="font-bold text-orange-900 dark:text-orange-100">-{totalWithVat.toLocaleString()}원</span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t border-orange-200 dark:border-orange-700">
                                                    <span className="text-orange-700/70">결제 후 잔액</span>
                                                    <span className={cn('font-black text-sm', sufficient ? 'text-emerald-600' : 'text-red-600')}>
                                                        {sufficient ? afterPay.toLocaleString() : '잔액 부족'}원
                                                    </span>
                                                </div>
                                            </div>
                                            {!sufficient && (
                                                <p className="text-[10px] text-red-500 dark:text-red-400">
                                                    예치금이 부족합니다. 사이드바 예치금 관리에서 충전해 주세요.
                                                </p>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handlePayFromDeposit}
                                                disabled={!sufficient || isPayingDeposit}
                                                className={cn(
                                                    'w-full py-2.5 rounded-lg text-xs font-bold transition-all',
                                                    sufficient && !isPayingDeposit
                                                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-orange-200'
                                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                )}
                                            >
                                                {isPayingDeposit ? '처리 중...' : `지금 결제하기 — ${totalWithVat.toLocaleString()}원`}
                                            </button>
                                            <p className="text-[10px] text-orange-600/60 dark:text-orange-400/40">
                                                예치금 차감 결제는 즉시 확인되어 배송 단계가 바로 활성화됩니다.
                                            </p>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                    )
                )}

                {/* ── 크리에이터 결제 상태 배너: 양측 서명 완료 후 ── */}
                {isFullySigned && userType === 'creator' && (
                    (proposal as any).payment_confirmed_at ? (
                        <div className="mx-4 mb-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/25 px-4 py-3 flex items-center gap-3">
                            <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">광고비 입금 확인 완료</p>
                                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">
                                    브랜드의 광고비 입금이 확인되었습니다. 제품 배송이 곧 시작됩니다.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mx-4 mb-3 rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 px-4 py-3 flex items-center gap-3">
                            <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0 animate-pulse" />
                            <div>
                                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">광고비 입금 대기 중</p>
                                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/60 mt-0.5">
                                    브랜드의 광고비 입금을 기다리고 있습니다. 입금 확인 후 배송 단계가 시작됩니다.
                                </p>
                            </div>
                        </div>
                    )
                )}

                {/* Bottom Section: Collapsible Signature Area */}
                <div className="shrink-0 border-t">
                    {/* Toggle Bar — always visible */}
                    <button
                        onClick={() => setSignatureExpanded(!signatureExpanded)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <PenTool className="h-3.5 w-3.5 text-indigo-600" />
                            <span className="text-xs font-semibold text-foreground">서명하기</span>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", isBrandSigned ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-muted text-muted-foreground")}>
                                    {isBrandSigned ? "✅ 갑" : "⬜ 갑"}
                                </span>
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", isCreatorSigned ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-muted text-muted-foreground")}>
                                    {isCreatorSigned ? "✅ 을" : "⬜ 을"}
                                </span>
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{signatureExpanded ? '▲ 접기' : '▼ 펼치기'}</span>
                    </button>

                    {/* Expandable Signature Pads */}
                    {signatureExpanded && (
                        <div className="grid grid-cols-2 divide-x" style={{ height: fullWidth ? '40%' : '260px' }}>
                            {/* 브랜드 서명 (좌) */}
                            <div className="bg-background/50">
                                <SignatureCanvas
                                    onSign={async (data) => { await onSign('brand', data); }}
                                    onUndo={onUndoSign ? () => onUndoSign('brand') : undefined}
                                    existingSignature={proposal.brand_signature}
                                    signedAt={proposal.brand_signed_at}
                                    signerName={brandName}
                                    label={`"갑" 브랜드 서명`}
                                    disabled={userType !== 'brand'}
                                    isOwner={userType === 'brand'}
                                    isSigning={isSigning}
                                />
                            </div>
                            {/* 크리에이터 서명 (우) */}
                            <div className="bg-background/50">
                                <SignatureCanvas
                                    onSign={async (data) => { await onSign('creator', data); }}
                                    onUndo={onUndoSign ? () => onUndoSign('creator') : undefined}
                                    existingSignature={proposal.creator_signature}
                                    signedAt={proposal.creator_signed_at}
                                    signerName={creatorName}
                                    label={`"을" 크리에이터 서명`}
                                    disabled={userType !== 'creator'}
                                    isOwner={userType === 'creator'}
                                    isSigning={isSigning}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
