"use client"

import { useAuth } from '@/components/providers/auth-provider';
import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { BarChart3, CheckCircle2, Clock, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PerformanceDialogProps {
    open: boolean;
    onClose: () => void;
    proposal: any;
    proposalType: 'product_application' | 'moment_proposal' | 'campaign_application';
    onCompleted: () => void; // 최종완료 후 카드 갱신용 콜백
}

export function PerformanceDialog({
    open,
    onClose,
    proposal,
    proposalType,
    onCompleted,
}: PerformanceDialogProps) {
    const { supabase } = useAuth();
    const { updateBrandProposal, updateMomentProposal, updateProposal, refreshData, sendNotification } = useUnifiedProvider();

    const [performance, setPerformance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // 다이얼로그 열릴 때마다 campaign_performance 조회
    useEffect(() => {
        if (!open || !proposal?.id) return;
        const fetch = async () => {
            setIsLoading(true);
            try {
                const { data } = await supabase
                    .from('campaign_performance')
                    .select('*')
                    .eq('proposal_type', proposalType)
                    .eq('proposal_id', proposal.id.toString())
                    .maybeSingle();
                setPerformance(data || null);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [open, proposal?.id, proposalType, supabase]);

    // 정산 완료 이후 일수 배지
    const settlementApprovedAt = (proposal as any)?.content_submission_completed_at
        || (proposal as any)?.updated_at;
    const daysSince = settlementApprovedAt
        ? Math.floor((Date.now() - new Date(settlementApprovedAt).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    const handleFinalComplete = async () => {
        if (!proposal?.id) return;
        setIsCompleting(true);
        try {
            const updates: any = { status: 'completed' };

            // 제안 status → 'completed'
            let success = false;
            if (proposalType === 'moment_proposal') success = await updateMomentProposal(proposal.id, updates);
            else if (proposalType === 'campaign_application') success = await updateProposal(proposal.id, updates);
            else success = await updateBrandProposal(proposal.id, updates);

            if (!success) {
                toast.error('최종완료 처리 중 오류가 발생했습니다.');
                return;
            }

            // settlements.final_completed_at 업데이트 (RPC)
            const { error: settleErr } = await supabase.rpc('complete_settlement', {
                p_proposal_id: proposal.id.toString(),
                p_proposal_type: proposalType,
            });
            if (settleErr) {
                console.error('[PerformanceDialog] complete_settlement error:', settleErr);
                // 실패해도 워크플로우 계속 진행
            }

            // 크리에이터 알림
            const creatorId = (proposal as any).influencer_id || (proposal as any).creator_id;
            if (creatorId) {
                sendNotification(
                    creatorId,
                    '브랜드가 협업을 최종 완료했습니다. 수고하셨습니다! 🎉',
                    'collaboration_final_complete',
                    proposal.id?.toString()
                );
            }

            toast.success('협업이 최종 완료되었습니다! 🎉');
            onCompleted();
            onClose();
            refreshData();
        } catch (e) {
            console.error('[PerformanceDialog] handleFinalComplete error:', e);
            toast.error('처리 중 오류가 발생했습니다.');
        } finally {
            setIsCompleting(false);
        }
    };

    const creatorName = proposal?.influencerName || '크리에이터';

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        성과 확인 · 최종 완료
                        <span className="text-sm font-normal text-muted-foreground ml-1">— {creatorName}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* 타임라인 배지 */}
                    {daysSince !== null && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">정산 승인 후 <strong>{daysSince}일</strong> 경과</span>
                            {daysSince > 7 && (
                                <Badge variant="outline" className="text-[10px] h-5 text-orange-500 border-orange-300 bg-orange-50 dark:bg-orange-900/20">
                                    제출 기한 초과
                                </Badge>
                            )}
                            {daysSince <= 7 && daysSince >= 3 && (
                                <Badge variant="outline" className="text-[10px] h-5 text-amber-500 border-amber-300 bg-amber-50 dark:bg-amber-900/20">
                                    제출 기한 임박
                                </Badge>
                            )}
                        </div>
                    )}

                    <Separator />

                    {/* 성과 데이터 영역 */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !performance ? (
                        <div className="text-center py-8 space-y-2">
                            <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/30" />
                            <p className="text-sm font-medium text-muted-foreground">
                                크리에이터가 아직 성과를 제출하지 않았습니다.
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                                크리에이터 워크스페이스에서 인사이트 스크린샷을 제출하면 여기 표시됩니다.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* 스크린샷 링크 */}
                            {performance.screenshot_url && (
                                <a
                                    href={performance.screenshot_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs text-primary hover:underline bg-muted/30 rounded-lg p-2"
                                >
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    인사이트 스크린샷 원본 보기
                                </a>
                            )}

                            {/* 수치 카드 6개 */}
                            <div className="grid grid-cols-3 gap-1.5">
                                {[
                                    { label: '도달', value: performance.reach },
                                    { label: '좋아요', value: performance.likes },
                                    { label: '댓글', value: performance.comments },
                                    { label: '저장', value: performance.saves },
                                    { label: '공유', value: performance.shares },
                                    { label: '조회수', value: performance.views },
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

                            {/* KPI 카드 */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-lg p-3 text-center">
                                    <p className="text-[10px] text-indigo-600/70">CPE</p>
                                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                        {performance.cpe != null ? `${Math.round(performance.cpe).toLocaleString()}원` : '—'}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground">참여 1회당 비용</p>
                                </div>
                                <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-800/40 rounded-lg p-3 text-center">
                                    <p className="text-[10px] text-violet-600/70">CPR</p>
                                    <p className="text-sm font-bold text-violet-700 dark:text-violet-300">
                                        {performance.cpr != null ? `${Math.round(performance.cpr).toLocaleString()}원` : '—'}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground">도달 1명당 비용</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* 최종완료 버튼 */}
                    <div className="space-y-2">
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold"
                            onClick={handleFinalComplete}
                            disabled={isCompleting}
                        >
                            {isCompleting
                                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                : <CheckCircle2 className="h-4 w-4 mr-2" />
                            }
                            최종 완료
                        </Button>
                        <p className="text-[10px] text-muted-foreground text-center">
                            최종 완료 후에는 워크스페이스가 완료됨으로 이동하며 되돌릴 수 없습니다.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
