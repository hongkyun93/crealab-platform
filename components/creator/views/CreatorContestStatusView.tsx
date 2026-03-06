import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowRight, Loader2, Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { formatDistanceToNow, parseISO } from "date-fns"
import { ko } from "date-fns/locale"

interface CreatorContestStatusViewProps {
    onNavigate?: (view: string, params?: any) => void;
    onOpenWorkspace?: (proposal: any) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    applied: { label: '심사 중', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    selected: { label: '✅ 선발됨', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    rejected: { label: '미선발', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: XCircle },
    completed: { label: '완료', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
    uploaded: { label: '영상 업로드 완료', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: CheckCircle2 },
    video_approved: { label: '영상 승인됨', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle2 },
};

export function CreatorContestStatusView({ onNavigate, onOpenWorkspace }: CreatorContestStatusViewProps) {
    const { user } = useUnifiedProvider();
    const supabase = createClient();

    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'applied' | 'selected' | 'completed'>('all');

    useEffect(() => {
        if (user?.id) loadApplications();
        else setIsLoading(false);
    }, [user?.id]);

    const loadApplications = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('ad_contest_applications')
                .select(`
                    *,
                    contest:ad_contests!contest_id(
                        id, title, thumbnail_url, base_reward, rank_rewards,
                        recruit_end_date, winner_announce_date, award_start_date
                    ),
                    workspace:workspaces!workspace_id(id, status)
                `)
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (err: any) {
            console.error('[ContestStatusView] Load failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = applications.filter(app => {
        if (filter === 'all') return true;
        if (filter === 'applied') return app.status === 'applied';
        if (filter === 'selected') return ['selected', 'uploaded', 'video_approved'].includes(app.status);
        if (filter === 'completed') return app.status === 'completed';
        return true;
    });

    const formatDateRelative = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ko });
        } catch { return null; }
    };

    const getAwardAmount = (app: any) => {
        if (!app.awarded_rank || !app.contest?.rank_rewards) return null;
        const rank = app.contest.rank_rewards[`rank${app.awarded_rank}`];
        return rank?.reward ? rank.reward.toLocaleString() + '원' : null;
    };

    const counts = {
        all: applications.length,
        applied: applications.filter(a => a.status === 'applied').length,
        selected: applications.filter(a => ['selected', 'uploaded', 'video_approved'].includes(a.status)).length,
        completed: applications.filter(a => a.status === 'completed').length,
    };

    return (
        <div className="flex-1 overflow-y-auto pb-20">
            <div className="container max-w-3xl mx-auto px-4 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            내 콘테스트
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">지원한 콘테스트 목록과 선발 현황</p>
                    </div>
                    {onNavigate && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => onNavigate('discover-contests')}
                        >
                            더 많은 콘테스트 보기 <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-5 flex-wrap">
                    {([
                        { key: 'all', label: '전체' },
                        { key: 'applied', label: '심사 중' },
                        { key: 'selected', label: '선발됨' },
                        { key: 'completed', label: '완료' },
                    ] as const).map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === f.key
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {f.label}
                            {counts[f.key] > 0 && (
                                <span className={`ml-1.5 text-[10px] font-black ${filter === f.key ? 'text-white/80' : 'text-slate-400'}`}>
                                    {counts[f.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                        <p className="font-semibold text-slate-500">
                            {filter === 'all' ? '지원한 콘테스트가 없습니다.' : '해당 항목이 없습니다.'}
                        </p>
                        {filter === 'all' && onNavigate && (
                            <Button variant="outline" className="mt-4 text-sm" onClick={() => onNavigate('discover-contests')}>
                                콘테스트 둘러보기
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(app => {
                            const statusConf = STATUS_CONFIG[app.status] || { label: app.status, color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock };
                            const StatusIcon = statusConf.icon;
                            const awardAmount = getAwardAmount(app);
                            const isSelected = ['selected', 'uploaded', 'video_approved'].includes(app.status);
                            const isCompleted = app.status === 'completed';

                            return (
                                <div
                                    key={app.id}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="flex gap-4 p-4">
                                        {/* 썸네일 */}
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                            {app.contest?.thumbnail_url ? (
                                                <img src={app.contest.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">🏆</div>
                                            )}
                                        </div>

                                        {/* 내용 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-bold text-slate-900 text-sm leading-snug truncate">
                                                    {app.contest?.title || '콘테스트'}
                                                </p>
                                                <Badge className={`shrink-0 text-[10px] font-semibold border px-2 py-0.5 ${statusConf.color}`}>
                                                    <StatusIcon className="w-3 h-3 mr-1 inline" />
                                                    {statusConf.label}
                                                </Badge>
                                            </div>

                                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                                                <span>지원 {formatDateRelative(app.created_at)}</span>
                                                {app.contest?.winner_announce_date && app.status === 'applied' && (
                                                    <span>발표 {formatDateRelative(app.contest.winner_announce_date)}</span>
                                                )}
                                            </div>

                                            {/* 수상 정보 */}
                                            {isCompleted && app.awarded_rank && (
                                                <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-1.5 text-xs font-bold">
                                                    {app.awarded_rank === 1 ? '🥇' : app.awarded_rank === 2 ? '🥈' : '🥉'}
                                                    {app.awarded_rank}등 수상
                                                    {awardAmount && <span className="ml-1 text-emerald-600">· {awardAmount}</span>}
                                                </div>
                                            )}
                                            {isCompleted && !app.awarded_rank && (
                                                <p className="mt-2 text-xs text-slate-400">기본 참가 보상 지급 예정</p>
                                            )}

                                            {/* 워크스페이스 입장 버튼 */}
                                            {isSelected && app.workspace_id && (
                                                <Button
                                                    size="sm"
                                                    className="mt-3 h-8 text-xs bg-primary hover:bg-primary/90 gap-1.5"
                                                    onClick={() => {
                                                        if (onOpenWorkspace) {
                                                            onOpenWorkspace({ ...app, type: 'contest' });
                                                        }
                                                    }}
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    워크스페이스 입장
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
