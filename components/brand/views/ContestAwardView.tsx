import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowLeft, Loader2, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { toast } from "sonner"

interface ContestAwardViewProps {
    onNavigate: (view: string, params?: any) => void;
    contestId?: string;
}

export function ContestAwardView({ onNavigate, contestId }: ContestAwardViewProps) {
    const { user } = useUnifiedProvider();
    const supabase = createClient();

    const [contest, setContest] = useState<any>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFinalizing, setIsFinalizing] = useState(false);

    // 각 rank slot에 선택된 applicationId
    const [selections, setSelections] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!contestId) return;
        loadData();
    }, [contestId]);

    const loadData = async () => {
        if (!contestId) return;
        setIsLoading(true);
        try {
            // 콘테스트 정보 조회
            const { data: contestData, error: cErr } = await supabase
                .from('ad_contests')
                .select('*')
                .eq('id', contestId)
                .single();
            if (cErr) throw cErr;
            setContest(contestData);

            // 업로드 완료된 챌린저 목록 조회 (video_approved, uploaded, selected 중 final_video_link 있는)
            const { data: apps, error: aErr } = await supabase
                .from('ad_contest_applications')
                .select(`
                    *,
                    creator:profiles!ad_contest_applications_creator_id_fkey(id, name, avatar_url)
                `)
                .eq('contest_id', contestId)
                .in('status', ['uploaded', 'video_approved', 'selected'])
                .order('updated_at', { ascending: false });
            if (aErr) throw aErr;
            setCandidates(apps || []);
        } catch (err: any) {
            toast.error('데이터를 불러오는데 실패했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (n: number) =>
        new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(n);

    // 동적으로 rank 슬롯 생성 (rank_rewards 기반)
    const rankSlots = contest?.rank_rewards ? [
        { key: 'rank1', label: '🥇 1등', count: contest.rank_rewards.rank1?.count || 1, reward: contest.rank_rewards.rank1?.reward || 0 },
        { key: 'rank2', label: '🥈 2등', count: contest.rank_rewards.rank2?.count || 1, reward: contest.rank_rewards.rank2?.reward || 0 },
        { key: 'rank3', label: '🥉 3등', count: contest.rank_rewards.rank3?.count || 1, reward: contest.rank_rewards.rank3?.reward || 0 },
    ] : [];

    const handleSelectWinner = (rankKey: string, applicationId: string) => {
        setSelections(prev => ({ ...prev, [rankKey]: applicationId }));
    };

    const handleFinalize = async () => {
        if (!contestId) return;

        const selectedCount = Object.keys(selections).length;
        if (selectedCount === 0) {
            toast.error('최소 1명 이상의 수상자를 선택해주세요.');
            return;
        }

        setIsFinalizing(true);
        try {
            // 각 rank별로 awarded_rank 및 status 업데이트
            const rankMap: Record<string, number> = { rank1: 1, rank2: 2, rank3: 3 };

            for (const [rankKey, applicationId] of Object.entries(selections)) {
                const rankNum = rankMap[rankKey];
                const { error } = await supabase
                    .from('ad_contest_applications')
                    .update({ awarded_rank: rankNum, status: 'completed' })
                    .eq('id', applicationId);
                if (error) throw error;
            }

            // 수상하지 못한 챌린저들도 completed 처리 (기본 참가비 정산)
            const winnerIds = Object.values(selections);
            const nonWinnerCandidates = candidates.filter(c => !winnerIds.includes(c.id));
            for (const app of nonWinnerCandidates) {
                const { error } = await supabase
                    .from('ad_contest_applications')
                    .update({ status: 'completed' })
                    .eq('id', app.id);
                if (error) console.warn('[AwardView] Non-winner completion failed silently:', error);
            }

            // 콘테스트 자체도 completed 처리
            await supabase
                .from('ad_contests')
                .update({ status: 'completed' })
                .eq('id', contestId);

            toast.success('🎉 시상이 확정되었습니다! 수상자별 정산이 자동 처리됩니다.');
            onNavigate('ad-contests');
        } catch (err: any) {
            toast.error(err.message || '시상 처리 중 오류가 발생했습니다.');
        } finally {
            setIsFinalizing(false);
        }
    };

    if (!contestId) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>콘테스트를 선택해주세요.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto w-full bg-slate-50/50">
            <div className="container max-w-5xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => onNavigate('ad-contests')} className="bg-white">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <h1 className="text-2xl font-bold text-slate-900">수상자 시상</h1>
                        </div>
                        {contest && (
                            <p className="text-sm text-muted-foreground mt-0.5">{contest.title}</p>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="font-semibold">영상을 업로드한 챌린저가 없습니다.</p>
                        <p className="text-sm mt-1">챌린저들이 최종 영상을 업로드한 후 시상할 수 있습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* 수상 등수별 선정 */}
                        {rankSlots.map((slot) => (
                            <div key={slot.key} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-5 border-b bg-slate-50/50 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-lg">{slot.label}</h3>
                                        <p className="text-sm text-slate-500">상금: {formatPrice(slot.reward)}</p>
                                    </div>
                                    {selections[slot.key] && (
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                            선정 완료
                                        </Badge>
                                    )}
                                </div>
                                <div className="p-5 space-y-3">
                                    {candidates.map((app) => (
                                        <div
                                            key={app.id}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selections[slot.key] === app.id
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                                                }`}
                                            onClick={() => handleSelectWinner(slot.key, app.id)}
                                        >
                                            {/* 아바타 */}
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                {app.creator?.avatar_url ? (
                                                    <img src={app.creator.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold text-slate-400">
                                                        {app.creator?.name?.[0] || '?'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* 이름 & 링크 */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 truncate">{app.creator?.name || '크리에이터'}</p>
                                                {app.final_video_link && (
                                                    <a
                                                        href={app.final_video_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        최종 영상 보기 <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>

                                            {/* 성과 지표 */}
                                            {app.performance_metrics && (
                                                <div className="text-right text-xs text-slate-500 hidden sm:block">
                                                    {app.performance_metrics.likes && <div>❤️ {app.performance_metrics.likes?.toLocaleString()}</div>}
                                                    {app.performance_metrics.views && <div>👁️ {app.performance_metrics.views?.toLocaleString()}</div>}
                                                </div>
                                            )}

                                            {/* 선택 인디케이터 */}
                                            <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${selections[slot.key] === app.id
                                                    ? 'border-primary bg-primary'
                                                    : 'border-slate-200'
                                                }`}>
                                                {selections[slot.key] === app.id && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* 시상 확정 버튼 */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900">시상 확정 및 정산 실행</p>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        확정 후에는 수정이 불가능합니다. 수상자별 정산이 자동으로 처리됩니다.
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        ・ 선정된 수상자: {Object.keys(selections).length}명 /
                                        미선정 챌린저 {candidates.length - Object.keys(selections).length}명은 기본 참가비로 정산됩니다.
                                    </p>
                                </div>
                                <Button
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all"
                                    onClick={handleFinalize}
                                    disabled={isFinalizing || Object.keys(selections).length === 0}
                                >
                                    {isFinalizing ? (
                                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> 처리 중...</>
                                    ) : (
                                        <><Trophy className="w-4 h-4 mr-2" /> 시상 확정</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
