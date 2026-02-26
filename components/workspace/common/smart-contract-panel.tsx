"use client"

import { useAuth } from '@/components/providers/auth-provider';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Proposal } from "@/lib/types/proposal";
import { cn } from "@/lib/utils";
import { BadgeCheck, CheckCircle2, Clock, Copy, CreditCard, Download, FileSignature, FileText, Loader2, Pencil, PenTool, RotateCcw, Save, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
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

    // ── 예치금 잔액 (브랜드 뷰에서만 사용) ──
    const [depositBalance, setDepositBalance] = useState<number | null>(null);
    const [isPayingDeposit, setIsPayingDeposit] = useState(false);
    const [payTab, setPayTab] = useState<'transfer' | 'deposit'>('transfer');
    const [isNotifyingTransfer, setIsNotifyingTransfer] = useState(false);
    const [transferNotified, setTransferNotified] = useState(false);

    // ── 프로필 추가 파싱 ──
    const [brandProfile, setBrandProfile] = useState<any>(null);
    const [creatorProfile, setCreatorProfile] = useState<any>(null);

    const p = proposal as any;
    const brandId = p.brand_id || p.brandId;
    const influencerId = p.influencer_id || p.influencerId;

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

            const ids = [brandId, influencerId].filter(Boolean);
            if (!ids.length) return;

            const { data } = await supabase
                .from('profiles')
                .select(profileColumns)
                .in('id', ids);

            if (data) {
                const bProfile = data.find((d: any) => d.id === brandId);
                const cProfile = data.find((d: any) => d.id === influencerId);
                if (bProfile) setBrandProfile(bProfile);
                if (cProfile) setCreatorProfile(cProfile);
            }
        };
        fetchProfiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brandId, influencerId]);

    // Status Logic
    const isBrandSigned = !!proposal.brand_signature;
    const isInfluencerSigned = !!proposal.influencer_signature;
    const isFullySigned = isBrandSigned && isInfluencerSigned;
    const isAnySigned = isBrandSigned || isInfluencerSigned;
    const canEdit = userType === 'brand' && !isAnySigned;

    const brandName = brandProfile?.display_name || (proposal as any).brandName || (proposal as any).brand_name || "브랜드(갑)";
    const influencerName = creatorProfile?.legal_name || creatorProfile?.display_name || (proposal as any).influencerName || "크리에이터(을)";

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

    // ── 새로고침 후 입금 알림 상태 복원 ──
    useEffect(() => {
        if (!isFullySigned || userType !== 'brand' || !brandId) return;
        const checkNotified = async () => {
            const { data } = await supabase
                .from('brand_deposits')
                .select('id')
                .eq('brand_id', brandId)
                .eq('type', 'charge')
                .eq('status', 'pending')
                .like('note', `계좌이체 입금 알림:${proposal.id}%`)
                .maybeSingle();
            if (data) setTransferNotified(true);
        };
        checkNotified();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brandId, isFullySigned, userType]);

    const handlePayFromDeposit = async () => {
        const cost: number = (proposal as any).price_offer ?? 0;
        const totalWithVat = Math.round(cost * 1.1);
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

            // 1. 거래 내역 삽입
            const { error: txErr } = await supabase.from('brand_deposits').insert({
                brand_id: brandId,
                type: 'use',
                amount: totalWithVat,
                balance_after: newBalance,
                reference_id: proposal.id,
                reference_type: proposalType,
                note: `워크스페이스 광고비 자동 차감 (${(proposal as any).product_name ?? ''})`,
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
            });
            if (txErr) throw txErr;

            // 2. 예치금 잔액 차감
            const { error: balErr } = await supabase
                .from('profiles')
                .update({ deposit_balance: newBalance })
                .eq('id', brandId);
            if (balErr) throw balErr;

            // 3. payment_confirmed_at 세팅
            const tableMap: Record<string, string> = {
                product_application: 'product_applications',
                moment_proposal: 'moment_proposals',
                campaign_application: 'campaign_applications',
            };
            const table = tableMap[proposalType] ?? 'product_applications';
            const { error: payErr } = await supabase
                .from(table)
                .update({ payment_confirmed_at: new Date().toISOString() })
                .eq('id', proposal.id);
            if (payErr) throw payErr;

            updateProposal({ payment_confirmed_at: new Date().toISOString() } as any);
            setDepositBalance(newBalance);
        } catch (err) {
            console.error('[SmartContractPanel] deposit payment failed:', err);
        } finally {
            setIsPayingDeposit(false);
        }
    };

    // ── 계좌이체 입금 완료 알리기 ──
    const handleNotifyTransfer = async () => {
        if (transferNotified || isNotifyingTransfer) return;
        setIsNotifyingTransfer(true);
        try {
            const cost: number = (proposal as any).price_offer ?? 0;
            const totalWithVat = Math.round(cost * 1.1);
            const proposalType = (proposal as any).moment_id
                ? 'moment_proposal'
                : (proposal as any).campaign_id
                    ? 'campaign_application'
                    : 'product_application';

            // brand_deposits에 pending charge 레코드 삽입 → 관리자 "입금 확인" 탭에 노출
            const { error } = await supabase.from('brand_deposits').insert({
                brand_id: brandId,
                type: 'charge',
                amount: totalWithVat,
                status: 'pending',
                balance_after: depositBalance ?? 0,  // 관리자가 확인 시 실제값으로 업데이트
                note: `계좌이체 입금 알림:${proposal.id}`,
            });
            if (error) throw error;

            // 관리자 알림
            await supabase.from('notifications').insert({
                recipient_id: brandId, // 관리자 알림은 별도 channel이 없으므로 brand 측에 확인 안내
                type: 'payment_pending',
                content: `입금 완료 알림이 접수되었습니다. 관리자가 확인 후 다음 단계가 활성화됩니다. (금액: ${totalWithVat.toLocaleString()}원)`,
                reference_id: proposal.id as string,
            });

            setTransferNotified(true);
        } catch (err) {
            console.error('[SmartContractPanel] notify transfer failed:', err);
        } finally {
            setIsNotifyingTransfer(false);
        }
    };


    const generateContract = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/generate-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposal,
                    brandName,
                    influencerName,
                    messages: [],
                    brandProfile: brandProfile || null,
                    creatorProfile: creatorProfile || null,
                }),
            });
            const data = await res.json();
            if (data.result) {
                setContractContent(data.result);
                if (onSaveContract) await onSaveContract(data.result);
                updateProposal({ contract_content: data.result } as any);
            }
        } catch (err) {
            console.error('[SmartContractPanel] AI contract generation failed:', err);
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
            formData.append('influencerName', influencerName);
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
            const productName = proposal.productName || proposal.product_name || '협업';
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
                                            {isGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                            재생성
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
                            <div className="p-4">
                                <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="font-mono text-xs leading-relaxed min-h-[200px]"
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
                                            <Sparkles className="h-6 w-6 text-indigo-500" />
                                            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">AI 자동 생성</span>
                                            <span className="text-[10px] text-muted-foreground text-center">제안 조건 기반으로 AI가 자동 작성</span>
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
                                        {isInfluencerSigned && proposal.influencer_signature?.startsWith('data:image') ? (
                                            <>
                                                <img src={proposal.influencer_signature} alt="을 서명" className="h-8 w-auto" />
                                                <p className="text-[8px] text-muted-foreground mt-0.5">을(크리에이터) · {formatKST(proposal.influencer_signed_at)}</p>
                                            </>
                                        ) : isInfluencerSigned ? (
                                            <>
                                                <p className="font-bold text-xs text-indigo-700">{proposal.influencer_signature || influencerName}</p>
                                                <p className="text-[8px] text-muted-foreground mt-0.5">{formatKST(proposal.influencer_signed_at)}</p>
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
                                {(isBrandSigned || isInfluencerSigned) && (
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
                                            {isInfluencerSigned && proposal.influencer_signature?.startsWith('data:image') ? (
                                                <img src={proposal.influencer_signature} alt="크리에이터 서명" className="h-12 mx-auto" />
                                            ) : isInfluencerSigned ? (
                                                <p className="font-bold text-indigo-700">{proposal.influencer_signature || influencerName}</p>
                                            ) : (
                                                <p className="text-muted-foreground text-xs">서명 대기 중</p>
                                            )}
                                            {proposal.influencer_signed_at && (
                                                <p className="text-[10px] text-muted-foreground mt-1">{formatKST(proposal.influencer_signed_at)}</p>
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
                            {/* 탭 전환 */}
                            <div className="flex rounded-lg bg-orange-100 dark:bg-orange-900/40 p-0.5 gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => setPayTab('transfer')}
                                    className={cn(
                                        'flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all',
                                        payTab === 'transfer'
                                            ? 'bg-white dark:bg-orange-800 text-orange-700 dark:text-orange-200 shadow-sm'
                                            : 'text-orange-600/70 dark:text-orange-400/60 hover:text-orange-700'
                                    )}
                                >
                                    계좌이체
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPayTab('deposit')}
                                    className={cn(
                                        'flex-1 text-[11px] font-bold py-1.5 rounded-md transition-all',
                                        payTab === 'deposit'
                                            ? 'bg-white dark:bg-orange-800 text-orange-700 dark:text-orange-200 shadow-sm'
                                            : 'text-orange-600/70 dark:text-orange-400/60 hover:text-orange-700'
                                    )}
                                >
                                    예치금 차감
                                    {depositBalance !== null && depositBalance > 0 && (
                                        <span className="ml-1 text-[9px] bg-orange-500 text-white rounded-full px-1.5 py-0.5">
                                            {depositBalance.toLocaleString()}원
                                        </span>
                                    )}
                                </button>
                            </div>

                            {payTab === 'transfer' ? (
                                <>
                                    <p className="text-[10px] text-orange-800 dark:text-orange-200 leading-relaxed">
                                        계약이 완전히 체결되었습니다. 아래 계좌로 광고비를 입금해 주세요.<br />
                                        입금 확인 후 배송 단계가 자동으로 활성화됩니다.
                                    </p>
                                    <div className="rounded-lg bg-white dark:bg-orange-950/40 border border-orange-200 dark:border-orange-700 p-3 space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-orange-700/70 dark:text-orange-300/60">은행</span>
                                            <span className="font-bold text-orange-900 dark:text-orange-100">우리은행</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-orange-700/70 dark:text-orange-300/60">계좌번호</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono font-bold tracking-wide text-orange-900 dark:text-orange-100">1005-504-356962</span>
                                                <button
                                                    type="button"
                                                    onClick={() => navigator.clipboard.writeText('1005504356962')}
                                                    className="p-0.5 rounded hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
                                                    title="계좌번호 복사"
                                                >
                                                    <Copy className="h-3 w-3 text-orange-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-orange-700/70 dark:text-orange-300/60">예금주</span>
                                            <span className="font-bold text-orange-900 dark:text-orange-100">주식회사 인비저블 컴퍼니</span>
                                        </div>
                                        {(proposal as any).price_offer > 0 && (
                                            <div className="flex justify-between pt-2 border-t border-orange-200 dark:border-orange-700">
                                                <span className="text-orange-700/70 dark:text-orange-300/60">입금 금액 (VAT 10% 포함)</span>
                                                <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">
                                                    {Math.round((proposal as any).price_offer * 1.1).toLocaleString()}원
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-orange-600/60 dark:text-orange-400/40">
                                        ※ 입금자명: <span className="font-mono font-semibold text-orange-700 dark:text-orange-300 text-xs bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded">
                                            {(() => {
                                                const code = String(parseInt((proposal as any)?.id?.replace(/-/g, '').slice(-4) || '0', 16) % 100).padStart(2, '0');
                                                const name = brandProfile?.display_name || brandProfile?.representative_name || '회사명';
                                                return `${name}${code}`;
                                            })()}
                                        </span> 으로 입력해 주세요.
                                    </p>
                                    {/* 입금 완료 알리기 버튼 */}
                                    {transferNotified ? (
                                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700 px-3 py-2.5 flex items-center gap-2">
                                            <span className="text-emerald-600 dark:text-emerald-400 text-sm">✅</span>
                                            <div>
                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">입금 알림 접수 완료</p>
                                                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">관리자가 확인 후 배송 단계가 활성화됩니다.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleNotifyTransfer}
                                            disabled={isNotifyingTransfer}
                                            className="w-full py-2.5 rounded-lg text-xs font-bold transition-all bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isNotifyingTransfer ? '처리 중...' : '✅ 입금 완료 알리기'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                /* 예치금 차감 탭 */
                                <div className="space-y-3">
                                    {(() => {
                                        const cost = (proposal as any).price_offer ?? 0;
                                        const totalWithVat = Math.round(cost * 1.1);
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
                            )}
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
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", isInfluencerSigned ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-muted text-muted-foreground")}>
                                    {isInfluencerSigned ? "✅ 을" : "⬜ 을"}
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
                                    existingSignature={proposal.influencer_signature}
                                    signedAt={proposal.influencer_signed_at}
                                    signerName={influencerName}
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
