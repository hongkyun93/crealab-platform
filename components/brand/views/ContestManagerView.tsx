import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Plus, ArrowLeft, Users, Loader2, ExternalLink, Instagram, Heart, MessageSquare, Bookmark, Share2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { differenceInDays, parseISO } from "date-fns"
import { ContestCard } from "@/components/cards/ContestCard"
import { ContestDetailDialog } from "@/components/dialogs/ContestDetailDialog"

interface ContestManagerViewProps {
    onNavigate: (view: string, params?: any) => void;
}

export function ContestManagerView({ onNavigate }: ContestManagerViewProps) {
    const { user } = useUnifiedProvider();
    const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
    const [myContests, setMyContests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [isApplicantsLoading, setIsApplicantsLoading] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState<any>(null);
    const [detailTab, setDetailTab] = useState<'applicants' | 'challengers'>('applicants'); // [NEW]
    const [isSelecting, setIsSelecting] = useState<string | null>(null); // [NEW]

    const supabase = createClient();

    const fetchMyContests = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            // Fetch contests and count applications
            const { data: contests, error } = await supabase
                .from('ad_contests')
                .select(`
                    *,
                    applications:ad_contest_applications(count)
                `)
                .eq('brand_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMyContests(contests || []);
        } catch (err: any) {
            console.error("Error fetching my contests:", err);
            toast.error("콘테스트 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchApplicants = async (contestId: string) => {
        try {
            setIsApplicantsLoading(true);
            const { data, error } = await supabase
                .from('ad_contest_applications')
                .select(`
                    *,
                    creator:profiles!ad_contest_applications_creator_id_fkey(*),
                    workspace:workspaces!workspace_id(*)
                `)
                .eq('contest_id', contestId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApplicants(data || []);
        } catch (err: any) {
            console.error("Error fetching applicants:", err);
            toast.error("지원자 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsApplicantsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyContests();
    }, [user?.id]);

    const handleSelectChallenger = async (applicationId: string) => {
        try {
            setIsSelecting(applicationId);
            const { data, error } = await supabase.rpc('select_contest_challenger', {
                p_application_id: applicationId
            });

            if (error) throw error;

            toast.success("챌린저가 선발되었습니다! 워크스페이스가 생성되었습니다.");
            if (selectedContestId) {
                fetchApplicants(selectedContestId);
            }
        } catch (err: any) {
            console.error("Error selecting challenger:", err);
            toast.error(err.message || "선발 처리 중 오류가 발생했습니다.");
        } finally {
            setIsSelecting(null);
        }
    };

    const handleUpdateRank = async (applicationId: string, rank: number) => {
        try {
            const { error } = await supabase
                .from('ad_contest_applications')
                .update({ awarded_rank: rank })
                .eq('id', applicationId);

            if (error) throw error;
            toast.success("순위가 반영되었습니다.");
            if (selectedContestId) fetchApplicants(selectedContestId);
        } catch (err: any) {
            console.error("Error updating rank:", err);
            toast.error("순위 반영 중 오류가 발생했습니다.");
        }
    };

    const handleFinalSettlement = async (applicationId: string) => {
        try {
            setIsSelecting(applicationId);
            // 상태를 'completed'로 변경하면 DB 트리거가 정산 테이블에 레코드 생성
            const { error } = await supabase
                .from('ad_contest_applications')
                .update({ status: 'completed' })
                .eq('id', applicationId);

            if (error) throw error;
            toast.success("최종 정산이 요청되었습니다. 정산 탭에서 확인 가능합니다.");
            if (selectedContestId) fetchApplicants(selectedContestId);
        } catch (err: any) {
            console.error("Error triggering settlement:", err);
            toast.error("정산 처리 중 오류가 발생했습니다.");
        } finally {
            setIsSelecting(null);
        }
    };

    useEffect(() => {
        if (selectedContestId) {
            fetchApplicants(selectedContestId);
        } else {
            setApplicants([]);
        }
    }, [selectedContestId]);

    const getDDay = (dateString: string) => {
        if (!dateString) return "미정";
        const targetDate = parseISO(dateString);
        const diff = differenceInDays(targetDate, new Date());
        if (diff === 0) return "오늘 마감";
        if (diff < 0) return "마감됨";
        return `D-${diff}`;
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (selectedContestId) {
        // --- DETAIL VIEW (ATS / Applicant Tracking) ---
        const contest = myContests.find(c => c.id === selectedContestId);

        return (
            <div className="flex-1 overflow-y-auto w-full bg-slate-50/50">
                <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
                    {/* Header with Back Button */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-6">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedContestId(null)} className="rounded-full hover:bg-slate-200 shrink-0">
                                <ArrowLeft className="w-5 h-5 text-slate-700" />
                            </Button>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${contest?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {contest?.status === 'published' ? '공개됨' : '임시저장'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{getDDay(contest?.application_end_date)}</span>
                                </div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1">{contest?.title}</h1>
                            </div>
                        </div>
                        <div className="sm:ml-auto flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-end sm:justify-start">
                            <div className="text-right mr-2 hidden sm:block">
                                <div className="text-xs text-muted-foreground">목표 선발</div>
                                <div className="text-sm font-semibold">0 / {contest?.total_winners_count}명</div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => onNavigate('ad-contest-builder', { draftId: contest.id })}>
                                정보 수정
                            </Button>
                        </div>
                    </div>

                    {/* ATS Board */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-6">
                        <div className="border-b px-2 sm:px-6 py-2 sm:py-4 flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
                            <button
                                onClick={() => setDetailTab('applicants')}
                                className={cn(
                                    "text-xs sm:text-sm font-bold pb-2 sm:pb-4 -mb-2 sm:-mb-4 shrink-0 transition-colors",
                                    detailTab === 'applicants' ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                지원자 ({applicants.filter(a => a.status === 'applied').length}명)
                            </button>
                            <button
                                onClick={() => setDetailTab('challengers')}
                                className={cn(
                                    "text-xs sm:text-sm font-bold pb-2 sm:pb-4 -mb-2 sm:-mb-4 shrink-0 transition-colors",
                                    detailTab === 'challengers' ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                챌린저 관리 ({applicants.filter(a => a.status !== 'applied').length}명)
                            </button>
                        </div>

                        <div className="p-0">
                            {detailTab === 'applicants' ? (
                                <>
                                    {/* Desktop Table Header */}
                                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b text-xs font-semibold text-slate-500">
                                        <div className="col-span-4">크리에이터 프로필</div>
                                        <div className="col-span-6">지원 상세 정보</div>
                                        <div className="col-span-2 text-right">액션</div>
                                    </div>

                                    <div className="divide-y relative min-h-[300px]">
                                        {isApplicantsLoading ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                            </div>
                                        ) : applicants.filter(a => a.status === 'applied').length === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                                <Users className="w-10 h-10 text-slate-200 mb-2" />
                                                <p className="text-slate-500 text-sm">대기 중인 지원자가 없습니다.</p>
                                            </div>
                                        ) : (
                                            applicants.filter(a => a.status === 'applied').map((app) => (
                                                <div key={app.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-4 p-4 sm:p-6 hover:bg-slate-50/50 transition-colors items-start lg:items-center">
                                                    {/* ... (Previous Applicant Row Item) */}
                                                    {/* Column 1: Profile Info */}
                                                    <div className="col-span-4 w-full flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0 mt-1 overflow-hidden">
                                                            {app.creator?.avatar_url && <img src={app.creator.avatar_url} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-slate-900 truncate">{app.creator?.display_name || "알수없음"}</h4>
                                                                {app.instagram_id && (
                                                                    <a
                                                                        href={`https://instagram.com/${app.instagram_id}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium border border-indigo-100 shrink-0 flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                                                                    >
                                                                        <Instagram className="w-2.5 h-2.5" /> @{app.instagram_id}
                                                                    </a>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate mb-1">{app.creator?.description || "소개 없음"}</p>
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                                                                <span>팔로워 <strong className="text-slate-900">{app.creator?.followers_count?.toLocaleString() || 0}</strong></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Column 2: Application Info */}
                                                    <div className="col-span-6 w-full lg:px-4 flex flex-col justify-center">
                                                        <div className="hidden lg:block text-xs font-semibold text-slate-500 mb-1">지원 상세 정보</div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div>
                                                                <div className="text-[10px] text-muted-foreground mb-1.5 flex items-center justify-between">
                                                                    <span>실시간 성과 지표</span>
                                                                </div>
                                                                {app.performance_metrics ? (
                                                                    <div className="grid grid-cols-4 gap-1">
                                                                        <div className="bg-slate-50 p-1.5 rounded-md text-center">
                                                                            <div className="flex justify-center mb-0.5"><Heart className="w-2.5 h-2.5 text-rose-500" /></div>
                                                                            <div className="text-[10px] font-bold">{(app.performance_metrics.likes || 0).toLocaleString()}</div>
                                                                        </div>
                                                                        <div className="bg-slate-50 p-1.5 rounded-md text-center">
                                                                            <div className="flex justify-center mb-0.5"><MessageSquare className="w-2.5 h-2.5 text-blue-500" /></div>
                                                                            <div className="text-[10px] font-bold">{(app.performance_metrics.comments || 0).toLocaleString()}</div>
                                                                        </div>
                                                                        <div className="bg-slate-50 p-1.5 rounded-md text-center">
                                                                            <div className="flex justify-center mb-0.5"><Bookmark className="w-2.5 h-2.5 text-amber-500" /></div>
                                                                            <div className="text-[10px] font-bold">{(app.performance_metrics.saved || 0).toLocaleString()}</div>
                                                                        </div>
                                                                        <div className="bg-slate-50 p-1.5 rounded-md text-center">
                                                                            <div className="flex justify-center mb-0.5"><Share2 className="w-2.5 h-2.5 text-indigo-500" /></div>
                                                                            <div className="text-[10px] font-bold">{(app.performance_metrics.shares || 0).toLocaleString()}</div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-[10px] text-slate-400 italic py-2">
                                                                        성과 데이터를 불러올 수 없습니다.
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-muted-foreground mb-0.5">지원 코멘트</div>
                                                                <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed bg-slate-50 lg:bg-transparent p-2 lg:p-0 rounded-md">
                                                                    {app.appeal_message || "코멘트가 없습니다."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Column 3: Actions */}
                                                    <div className="col-span-2 w-full flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2 mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-0 border-slate-100">
                                                        <Button variant="outline" size="sm" className="w-full lg:w-auto text-xs h-8" asChild>
                                                            <a href={`/creator/${app.creator?.id}`} target="_blank" rel="noopener noreferrer">
                                                                프로필 <ExternalLink className="w-3 h-3 ml-1" />
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="w-full lg:w-auto text-xs h-8 bg-slate-900 hover:bg-primary shadow-sm"
                                                            onClick={() => handleSelectChallenger(app.id)}
                                                            disabled={isSelecting === app.id}
                                                        >
                                                            {isSelecting === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "선발하기"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                                            <tr>
                                                <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10 border-r whitespace-nowrap">챌린저</th>
                                                <th className="px-4 py-3 whitespace-nowrap">계약 상태</th>
                                                <th className="px-4 py-3 whitespace-nowrap">배송 정보</th>
                                                <th className="px-4 py-3 whitespace-nowrap">콘텐츠 검수</th>
                                                <th className="px-4 py-3 whitespace-nowrap">성과 지표</th>
                                                <th className="px-4 py-3 whitespace-nowrap">수상 순위</th>
                                                <th className="px-4 py-3 whitespace-nowrap text-right">정산 관리</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {applicants.filter(a => a.status !== 'applied').length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">선발된 챌린저가 없습니다.</td>
                                                </tr>
                                            ) : (
                                                applicants.filter(a => a.status !== 'applied').map((app) => (
                                                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r min-w-[150px]">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden shrink-0">
                                                                    {app.creator?.avatar_url && <img src={app.creator.avatar_url} className="w-full h-full object-cover" />}
                                                                </div>
                                                                <span className="font-bold text-slate-900 truncate">{app.creator?.display_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full font-medium text-[10px]",
                                                                app.workspace?.contract_status === 'signed' ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-600"
                                                            )}>
                                                                {app.workspace?.contract_status === 'signed' ? "체결 완료" : "서명 대기"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full font-medium text-[10px]",
                                                                app.workspace?.delivery_status === 'shipped' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                                                            )}>
                                                                {app.workspace?.delivery_status === 'shipped' ? "배송 중" : "준비 중"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full font-medium text-[10px]",
                                                                app.workspace?.content_submission_status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                                                                    app.workspace?.content_submission_url ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"
                                                            )}>
                                                                {app.workspace?.content_submission_status === 'approved' ? "검수 완료" :
                                                                    app.workspace?.content_submission_url ? "검토 필요" : "미제출"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                                                            {app.performance_metrics ?
                                                                <div className="flex gap-2 text-[10px]">
                                                                    <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5 text-rose-500" />{(app.performance_metrics.likes || 0).toLocaleString()}</span>
                                                                    <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5 text-blue-500" />{(app.performance_metrics.comments || 0).toLocaleString()}</span>
                                                                    <span className="flex items-center gap-0.5"><Bookmark className="w-2.5 h-2.5 text-amber-500" />{(app.performance_metrics.saved || 0).toLocaleString()}</span>
                                                                </div> :
                                                                '-'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <select
                                                                className="text-[10px] border rounded px-1 py-0.5 bg-white font-medium focus:ring-1 focus:ring-primary outline-none"
                                                                value={app.awarded_rank || 0}
                                                                onChange={(e) => handleUpdateRank(app.id, parseInt(e.target.value))}
                                                            >
                                                                <option value={0}>- 미선정 -</option>
                                                                <option value={1}>🥇 1위</option>
                                                                <option value={2}>🥈 2위</option>
                                                                <option value={3}>🥉 3위</option>
                                                                <option value={4}>🏆 입선</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 text-[10px] px-2 text-muted-foreground"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onNavigate('brand-workspace', { workspaceId: app.workspace_id });
                                                                    }}
                                                                >
                                                                    워크스페이스 <ExternalLink className="w-3 h-3 ml-1" />
                                                                </Button>
                                                                {app.status === 'completed' ? (
                                                                    <Badge className="bg-slate-100 text-slate-600 border-none text-[10px]">정산 완료</Badge>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 text-[10px] bg-primary text-white hover:bg-primary/90 shadow-sm px-3"
                                                                        onClick={() => handleFinalSettlement(app.id)}
                                                                        disabled={isSelecting === app.id}
                                                                    >
                                                                        {isSelecting === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "최종 정산"}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST VIEW (Master) ---
    return (
        <div className="flex-1 overflow-y-auto w-full bg-slate-50/50">
            <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-primary" />
                            내 콘테스트 관리
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            운영 중인 광고 콘테스트 현황을 확인하고 지원자를 선발하세요.
                        </p>
                    </div>
                    <Button onClick={() => onNavigate('ad-contest-builder')} className="shadow-sm w-full sm:w-auto text-white">
                        <Plus className="w-4 h-4 mr-2" /> 새 콘테스트 개최
                    </Button>
                </div>

                {myContests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed bg-white shadow-sm mt-8">
                        <Trophy className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">진행 중인 콘테스트가 없습니다</h3>
                        <p className="text-slate-500 mb-6 max-w-md text-sm sm:text-base">새로운 콘테스트를 개최하여 퀄리티 높은 크리에이터들의 영상을 수집하고 브랜드 인지도를 높여보세요!</p>
                        <Button onClick={() => onNavigate('ad-contest-builder')} variant="outline">
                            지금 시작하기
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                        {myContests.map((contest) => (
                            <ContestCard
                                key={contest.id}
                                contest={contest}
                                mode="brand"
                                onClick={() => {
                                    setSelectedContest(contest);
                                    setIsDetailOpen(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 상세 정보 다이얼로그 (브랜드용) */}
            {selectedContest && (
                <ContestDetailDialog
                    isOpen={isDetailOpen}
                    onClose={() => {
                        setIsDetailOpen(false);
                        setSelectedContest(null);
                    }}
                    contest={selectedContest}
                    role="brand"
                    onManageApplicants={() => {
                        setIsDetailOpen(false);
                        setSelectedContestId(selectedContest.id);
                    }}
                    onEdit={() => {
                        setIsDetailOpen(false);
                        onNavigate('ad-contest-builder', { draftId: selectedContest.id });
                    }}
                />
            )}
        </div>
    )
}
