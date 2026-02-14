
import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileSignature, ShieldCheck, Download, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { Proposal } from "@/lib/types/proposal";

interface SmartContractPanelProps {
    proposal: Proposal;
    userType: 'brand' | 'influencer';
    onSign: (role: 'brand' | 'influencer') => Promise<void>;
    isSigning?: boolean;
}

export function SmartContractPanel({ proposal, userType, onSign, isSigning }: SmartContractPanelProps) {
    const [hasRead, setHasRead] = useState(false);

    // Status Logic
    const isBrandSigned = !!proposal.brand_signature;
    const isInfluencerSigned = !!proposal.influencer_signature;
    const isUserSigned = userType === 'brand' ? isBrandSigned : isInfluencerSigned;
    const isFullySigned = isBrandSigned && isInfluencerSigned;

    const brandName = proposal.brandName || "브랜드(갑)";
    const influencerName = proposal.influencerName || "크리에이터(을)";
    const productName = proposal.productName || "제품명 미정";
    const cost = proposal.priceOffer || proposal.price_offer || 0;
    const costString = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(cost);

    // Condition Dates
    const productDate = proposal.condition_product_receipt_date || "미정";
    const draftDate = proposal.condition_draft_submission_date || "미정";
    const uploadDate = proposal.condition_upload_date || "미정";

    const handleSign = async () => {
        if (!hasRead) {
            alert("계약서 내용을 확인하고 동의해주세요.");
            return;
        }
        await onSign(userType);
    };

    return (
        <Card className="w-full h-full flex flex-col border-none shadow-none bg-background/50 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between bg-card/50">
                <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        <FileSignature className="h-5 w-5 text-indigo-600" />
                        표준 광고 거래 계약서
                    </CardTitle>
                    <CardDescription>
                        CreadyPick 표준 안심 계약 (제 2026-{(proposal.id || "").slice(0, 8)}호)
                    </CardDescription>
                </div>
                {isFullySigned && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-3 py-1 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        계약 체결 완료
                    </Badge>
                )}
            </CardHeader>

            <ScrollArea className="flex-1 p-6 bg-white/80 dark:bg-zinc-900/80 rounded-b-xl">
                <div className="prose dark:prose-invert max-w-none text-sm space-y-6 select-text p-4 border rounded-lg bg-card shadow-sm">
                    {/* Contract Content */}
                    <div className="text-center space-y-2 pb-6 border-b">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">제품 광고/협찬 표준 계약서</h1>
                        <p className="text-gray-500">
                            본 계약은 <strong>{brandName}</strong>(이하 "갑"이라 함)와 <strong>{influencerName}</strong>(이하 "을"이라 함) 간의 신뢰를 바탕으로 체결한다.
                        </p>
                    </div>

                    <article>
                        <h3 className="font-bold text-lg mb-2 text-primary">제 1 조 (목적)</h3>
                        <p>본 계약은 "갑"이 제공하는 제품 <strong>[{productName}]</strong>에 대한 홍보 콘텐츠를 "을"이 제작하고, 이를 지정된 채널에 게시함에 있어 필요한 제반 사항을 규정함을 목적으로 한다.</p>
                    </article>

                    <article>
                        <h3 className="font-bold text-lg mb-2 text-primary">제 2 조 (계약 기간 및 일정)</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>제품 수령 예정일: <span className="font-semibold text-foreground underline decoration-wavy decoration-indigo-300">{productDate}</span></li>
                            <li>초안 제출 마감일: <span className="font-semibold text-foreground underline decoration-wavy decoration-indigo-300">{draftDate}</span></li>
                            <li>최종 업로드 마감일: <span className="font-semibold text-foreground underline decoration-wavy decoration-indigo-300">{uploadDate}</span></li>
                        </ul>
                    </article>

                    <article>
                        <h3 className="font-bold text-lg mb-2 text-primary">제 3 조 (지급 및 협찬)</h3>
                        <p>
                            "갑"은 "을"에게 본 계약의 대가로
                            <span className="font-bold text-green-600 mx-1">{costString}</span>
                            을(를) 콘텐츠 게시 후 30일 이내에 지급하며, 촬영용 제품을 무상으로 제공한다.
                        </p>
                    </article>

                    <article>
                        <h3 className="font-bold text-lg mb-2 text-primary">제 4 조 (특약 사항)</h3>
                        <div className="p-3 bg-muted rounded-md text-muted-foreground italic border-l-4 border-indigo-400">
                            {proposal.specialTerms || proposal.special_terms || "별도 특약사항 없음"}
                        </div>
                    </article>

                    <article>
                        <h3 className="font-bold text-lg mb-2 text-primary">제 5 조 (성실 의무)</h3>
                        <p>"을"은 합의된 가이드라인을 준수하여 콘텐츠를 제작하며, 업로드 후 최소 3개월간 게시물을 유지하여야 한다. "갑"은 정당한 사유 없이 콘텐츠 수정을 무리하게 요구할 수 없다.</p>
                    </article>

                    {/* Signatures Visual Representation */}
                    <div className="mt-12 pt-8 border-t grid grid-cols-2 gap-8 text-center">
                        <div className={cn("p-6 rounded-xl border-2 border-dashed transition-all", isBrandSigned ? "border-solid border-indigo-600 bg-indigo-50/50" : "border-gray-200")}>
                            <p className="text-sm text-gray-500 mb-4">"갑" (브랜드)</p>
                            {isBrandSigned ? (
                                <div className="space-y-2">
                                    <div className="font-script text-2xl text-indigo-700">{proposal.brand_signature || brandName}</div>
                                    <p className="text-xs text-indigo-600/70">서명 완료 ({new Date(proposal.brand_signed_at || Date.now()).toLocaleDateString()})</p>
                                </div>
                            ) : (
                                <p className="text-gray-300">서명 대기 중</p>
                            )}
                        </div>

                        <div className={cn("p-6 rounded-xl border-2 border-dashed transition-all", isInfluencerSigned ? "border-solid border-indigo-600 bg-indigo-50/50" : "border-gray-200")}>
                            <p className="text-sm text-gray-500 mb-4">"을" (크리에이터)</p>
                            {isInfluencerSigned ? (
                                <div className="space-y-2">
                                    <div className="font-script text-2xl text-indigo-700">{proposal.influencer_signature || influencerName}</div>
                                    <p className="text-xs text-indigo-600/70">서명 완료 ({new Date(proposal.influencer_signed_at || Date.now()).toLocaleDateString()})</p>
                                </div>
                            ) : (
                                <p className="text-gray-300">서명 대기 중</p>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Actions Footer */}
            <div className="p-4 border-t bg-background/50 backdrop-blur flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {!isUserSigned && (
                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                            <input
                                type="checkbox"
                                checked={hasRead}
                                onChange={(e) => setHasRead(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            위 계약 내용을 모두 확인하였으며 이에 동의합니다.
                        </label>
                    )}
                </div>

                <div className="flex gap-2">
                    {isFullySigned ? (
                        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                            <Download className="w-4 h-4" />
                            PDF 다운로드
                        </Button>
                    ) : (
                        isUserSigned ? (
                            <Button disabled variant="secondary" className="gap-2 opacity-50 cursor-not-allowed">
                                <CheckCircle2 className="w-4 h-4" />
                                서명 완료 (상대방 대기중)
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSign}
                                disabled={!hasRead || isSigning}
                                className={cn("gap-2 min-w-[140px]", hasRead ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400")}
                            >
                                {isSigning ? "처리중..." : "서명하기"}
                                <Filesignature className="w-4 h-4" />
                            </Button>
                        )
                    )}
                </div>
            </div>
        </Card>
    );
}
