"use client"

import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, FileSignature, ShieldCheck, Download, Pencil, Save, X, Loader2, RotateCcw, FileText, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";
import { Proposal } from "@/lib/types/proposal";
import { useWorkspaceStore } from '../hooks/use-workspace-store';

// ───── Types ─────
interface SmartContractPanelProps {
    proposal: Proposal;
    userType: 'brand' | 'creator';
    onSign: (role: 'brand' | 'creator', signatureData: string) => Promise<void>;
    onSaveContract?: (content: string) => Promise<void>;
    onUndoSign?: (role: 'brand' | 'creator') => Promise<void>;
    isSigning?: boolean;
    fullWidth?: boolean; // When true, renders in main workspace area (larger)
}

type ContractTab = 'view' | 'brand_sign' | 'creator_sign';

// ───── Signature Canvas Component ─────
function SignatureCanvas({
    onSign,
    onUndo,
    existingSignature,
    signedAt,
    signerName,
    disabled,
    isOwner, // True if this user owns this signature tab
    isSigning,
}: {
    onSign: (data: string) => void;
    onUndo?: () => void;
    existingSignature?: string | null;
    signedAt?: string | null;
    signerName: string;
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
            <div className="space-y-4">
                <div className="border-2 border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/40 rounded-xl p-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-3" />
                    <p className="font-bold text-green-700 dark:text-green-400 mb-2">서명 완료</p>
                    {existingSignature.startsWith('data:image') ? (
                        <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border inline-block">
                            <img src={existingSignature} alt="서명" className="h-16 w-auto" />
                        </div>
                    ) : (
                        <div className="font-script text-2xl text-indigo-700 dark:text-indigo-400">{existingSignature}</div>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                        {signerName} · {signedAt ? new Date(signedAt).toLocaleString('ko-KR') : ''}
                    </p>
                    {/* Undo button — only for the owner of this signature */}
                    {isOwner && onUndo && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 text-xs text-red-500 border-red-200 hover:bg-red-50"
                            onClick={onUndo}
                        >
                            <RotateCcw className="h-3 w-3 mr-1" /> 서명 취소
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className={cn(
                "border-2 border-dashed rounded-xl p-4 transition-colors",
                disabled ? "border-muted bg-muted/10 opacity-50" : "border-indigo-200 bg-indigo-50/30 dark:bg-indigo-950/10 dark:border-indigo-800/30"
            )}>
                <p className="text-sm text-muted-foreground mb-3 text-center">
                    {disabled
                        ? (isOwner ? "서명 패드" : "상대방만 서명할 수 있습니다.")
                        : "아래 영역에 서명해주세요"}
                </p>
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className={cn(
                        "w-full h-[120px] sm:h-[150px] rounded-lg border bg-white dark:bg-zinc-900 touch-none",
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
                <div className="flex gap-2 mt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearCanvas}
                        disabled={disabled || !hasDrawn}
                        className="flex-1"
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> 지우기
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSign}
                        disabled={disabled || !hasDrawn || isSigning}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isSigning ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <PenTool className="h-3.5 w-3.5 mr-1" />}
                        {isSigning ? "처리 중..." : "서명 완료"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ───── Main Panel ─────
export function SmartContractPanel({ proposal, userType, onSign, onSaveContract, onUndoSign, isSigning, fullWidth }: SmartContractPanelProps) {
    const [activeTab, setActiveTab] = useState<ContractTab>('view');
    const [contractContent, setContractContent] = useState<string>(proposal.contract_content || '');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
    const contractRef = useRef<HTMLDivElement>(null);
    const updateProposal = useWorkspaceStore((state) => state.updateProposal);
    const setContractViewOpen = useWorkspaceStore((state) => state.setContractViewOpen);

    // Status Logic
    const isBrandSigned = !!proposal.brand_signature;
    const isInfluencerSigned = !!proposal.influencer_signature;
    const isFullySigned = isBrandSigned && isInfluencerSigned;
    const isAnySigned = isBrandSigned || isInfluencerSigned;
    const canEdit = userType === 'brand' && !isAnySigned;

    const brandName = proposal.brandName || proposal.brand_name || "브랜드(갑)";
    const influencerName = proposal.influencerName || "크리에이터(을)";

    // Generate AI contract on first load if no content exists
    useEffect(() => {
        if (!contractContent && !isGenerating) {
            generateContract();
        }
    }, []);

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
                }),
            });
            const data = await res.json();
            if (data.result) {
                setContractContent(data.result);
                if (onSaveContract) {
                    await onSaveContract(data.result);
                }
                updateProposal({ contract_content: data.result } as any);
            }
        } catch (err) {
            console.error('[SmartContractPanel] AI contract generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleStartEdit = () => {
        setEditContent(contractContent);
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            setContractContent(editContent);
            if (onSaveContract) {
                await onSaveContract(editContent);
            }
            updateProposal({ contract_content: editContent } as any);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent('');
    };

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
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
            };

            await html2pdf().set(opt).from(contractRef.current).save();
        } catch (err) {
            console.error('[SmartContractPanel] PDF generation failed:', err);
            window.print();
        } finally {
            setIsPdfGenerating(false);
        }
    };

    // Simple markdown-to-HTML renderer
    const renderMarkdown = (md: string) => {
        if (!md) return '';
        return md
            .split('\n')
            .map(line => {
                if (line.startsWith('# ')) return `<h1 class="text-xl font-bold mt-6 mb-2 text-primary">${line.slice(2)}</h1>`;
                if (line.startsWith('## ')) return `<h2 class="text-lg font-bold mt-5 mb-2 text-primary">${line.slice(3)}</h2>`;
                if (line.startsWith('### ')) return `<h3 class="text-base font-bold mt-4 mb-1 text-primary">${line.slice(4)}</h3>`;
                line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                if (line.match(/^\d+\.\s/)) return `<p class="ml-4 my-1">${line}</p>`;
                if (line.startsWith('- ')) return `<p class="ml-4 my-1">• ${line.slice(2)}</p>`;
                if (line.trim() === '') return '<br />';
                return `<p class="my-1">${line}</p>`;
            })
            .join('');
    };

    // ───── Tabs ─────
    const tabs: { id: ContractTab; label: string; icon: React.ReactNode }[] = [
        { id: 'view', label: '계약서 보기', icon: <FileText className="h-3.5 w-3.5" /> },
        { id: 'brand_sign', label: '브랜드 서명', icon: <PenTool className="h-3.5 w-3.5" /> },
        { id: 'creator_sign', label: '크리에이터 서명', icon: <PenTool className="h-3.5 w-3.5" /> },
    ];

    return (
        <div className={cn(
            "w-full flex flex-col border rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm",
            fullWidth && "h-full"
        )}>
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between bg-card/50">
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setContractViewOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b bg-muted/30">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all border-b-2",
                            activeTab === tab.id
                                ? "border-indigo-600 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            tab.id === 'brand_sign' && isBrandSigned && "text-green-600",
                            tab.id === 'creator_sign' && isInfluencerSigned && "text-green-600",
                        )}
                    >
                        {(tab.id === 'brand_sign' && isBrandSigned) || (tab.id === 'creator_sign' && isInfluencerSigned)
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            : tab.icon
                        }
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={cn("flex-1 min-h-0", fullWidth && "overflow-auto")}>
                {/* ───── Tab: 계약서 보기 ───── */}
                {activeTab === 'view' && (
                    <div className="flex flex-col h-full">
                        {/* Toolbar */}
                        <div className="px-4 py-2 border-b flex items-center justify-between bg-background/80">
                            <span className="text-xs text-muted-foreground">
                                {isAnySigned ? '🔒 서명이 완료되어 수정할 수 없습니다' : 'AI가 자동 생성한 계약서입니다'}
                            </span>
                            <div className="flex gap-1.5">
                                {canEdit && !isEditing && (
                                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleStartEdit}>
                                        <Pencil className="h-3 w-3 mr-1" /> 수정
                                    </Button>
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={handleDownloadPdf}
                                        disabled={isPdfGenerating}
                                    >
                                        {isPdfGenerating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                                        PDF
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Contract Content */}
                        <ScrollArea className={cn("flex-1", fullWidth ? "max-h-none" : "max-h-[400px]")}>
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
                                    <p className="text-sm font-medium">AI가 계약서를 생성하고 있습니다...</p>
                                    <p className="text-xs mt-1">약 5~10초 소요됩니다</p>
                                </div>
                            ) : isEditing ? (
                                <div className="p-4">
                                    <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className={cn("font-mono text-xs leading-relaxed", fullWidth ? "min-h-[500px]" : "min-h-[300px]")}
                                        placeholder="계약서 내용을 수정하세요..."
                                    />
                                </div>
                            ) : (
                                <div ref={contractRef} className={cn("p-6", fullWidth && "max-w-4xl mx-auto")}>
                                    <div
                                        className="prose dark:prose-invert max-w-none text-sm leading-relaxed select-text"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(contractContent) }}
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
                                                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(proposal.brand_signed_at).toLocaleString('ko-KR')}</p>
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
                                                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(proposal.influencer_signed_at).toLocaleString('ko-KR')}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                )}

                {/* ───── Tab: 브랜드 서명 ───── */}
                {activeTab === 'brand_sign' && (
                    <div className={cn("p-4", fullWidth && "max-w-xl mx-auto py-8")}>
                        <SignatureCanvas
                            onSign={async (data) => { await onSign('brand', data); }}
                            onUndo={onUndoSign ? () => onUndoSign('brand') : undefined}
                            existingSignature={proposal.brand_signature}
                            signedAt={proposal.brand_signed_at}
                            signerName={brandName}
                            disabled={userType !== 'brand'}
                            isOwner={userType === 'brand'}
                            isSigning={isSigning}
                        />
                        {userType !== 'brand' && !isBrandSigned && (
                            <p className="text-xs text-muted-foreground text-center mt-3">
                                브랜드만 이 탭에서 서명할 수 있습니다.
                            </p>
                        )}
                    </div>
                )}

                {/* ───── Tab: 크리에이터 서명 ───── */}
                {activeTab === 'creator_sign' && (
                    <div className={cn("p-4", fullWidth && "max-w-xl mx-auto py-8")}>
                        <SignatureCanvas
                            onSign={async (data) => { await onSign('creator', data); }}
                            onUndo={onUndoSign ? () => onUndoSign('creator') : undefined}
                            existingSignature={proposal.influencer_signature}
                            signedAt={proposal.influencer_signed_at}
                            signerName={influencerName}
                            disabled={userType !== 'creator'}
                            isOwner={userType === 'creator'}
                            isSigning={isSigning}
                        />
                        {userType !== 'creator' && !isInfluencerSigned && (
                            <p className="text-xs text-muted-foreground text-center mt-3">
                                크리에이터만 이 탭에서 서명할 수 있습니다.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
