import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Plus, ArrowLeft, Users, Loader2, ExternalLink, Instagram, Heart, MessageSquare, Bookmark, Share2, RefreshCw, StickyNote, Check, X } from "lucide-react"
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
    const { user, sendNotification } = useUnifiedProvider();
    const [selectedContestId, setSelectedContestId] = useState<string | null>(null);
    const [myContests, setMyContests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [isApplicantsLoading, setIsApplicantsLoading] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState<any>(null);
    const [detailTab, setDetailTab] = useState<'applicants' | 'challengers'>('applicants');
    const [isSelecting, setIsSelecting] = useState<string | null>(null);
    // 정렬 / 필터
    const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'followers_desc' | 'followers_asc'>('date_desc');
    const [filterChannel, setFilterChannel] = useState<string>('all');
    // 메모
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');

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
                    brand:profiles!brand_id(display_name, avatar_url),
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
            const errDetail = JSON.stringify(err, Object.getOwnPropertyNames(err));
            console.error('Error fetching applicants:', errDetail);
            // workspace_id 컬럼 미생성 에러인 경우 workspace join 없이 재시도
            if (errDetail.includes('workspace_id') || errDetail.includes('relationship')) {
                try {
                    const { data: fallbackData, error: fallbackErr } = await supabase
                        .from('ad_contest_applications')
                        .select(`*, creator:profiles!creator_id(id, display_name, avatar_url, followers_count, description), performance_metrics`)
                        .eq('contest_id', contestId)
                        .order('created_at', { ascending: false });
                    if (!fallbackErr) { setApplicants(fallbackData || []); return; }
                } catch { }
            }
            toast.error('지원자 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsApplicantsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyContests();
    }, [user?.id]);

    const handleSelectChallenger = async (applicationId: string, creatorId?: string) => {
        try {
            setIsSelecting(applicationId);
            const { data, error } = await supabase.rpc('select_contest_challenger', {
                p_application_id: applicationId
            });

            if (error) throw error;

            // 한싹마 선발 알림 (콘테스트 제목 + 워크스페이스 ID 전달)
            const workspaceId = data; // RPC는 workspace id를 반환
            const contestTitle = selectedContest?.title || '콘테스트';
            if (creatorId && workspaceId) {
                try {
                    await sendNotification(
                        creatorId,
                        `🏆 [${contestTitle}] 챔린저로 선발되셋니다! 워크스페이스에서 계약서를 확인해주세요.`,
                        'contest_selected',
                        workspaceId,
                        `/creator?view=contest-workspace&workspaceId=${workspaceId}`
                    );
                } catch (notifErr) {
                    console.warn('[ContestManager] Notification failed (ignored):', notifErr);
                }
            }

            toast.success('챔린저가 선발되었습니다! 워크스페이스가 생성되었습니다.');
            if (selectedContestId) {
                fetchApplicants(selectedContestId);
            }
        } catch (err: any) {
            const errDetail = JSON.stringify(err, Object.getOwnPropertyNames(err));
            console.error('[ContestManager] Error selecting challenger:', errDetail);
            const parsed = (() => { try { return JSON.parse(errDetail); } catch { return {}; } })();
            const msg = parsed.message || err?.message || '선발 처리 중 오류가 발생했습니다.';
            if (msg.includes('select_contest_challenger') && msg.includes('schema cache')) {
                toast.error('선발 기능이 DB에 등록되지 않았습니다. Supabase SQL Editor에서 44번 마이그레이션을 실행해주세요.');
            } else {
                toast.error(msg);
            }
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

    const handleSaveNote = async (applicationId: string) => {
        try {
            const { error } = await supabase
                .from('ad_contest_applications')
                .update({ brand_note: noteText.trim() || null })
                .eq('id', applicationId);
            if (error) throw error;
            setApplicants(prev => prev.map(a => a.id === applicationId ? { ...a, brand_note: noteText.trim() || null } : a));
            toast.success('메모가 저장되었습니다.');
        } catch {
            toast.error('메모 저장 중 오류가 발생했습니다.');
        } finally {
            setEditingNoteId(null);
        }
    };

    // 정렬 + 필터 적용된 지원자 목록
    const sortedApplicants = useMemo(() => {
        let list = [...applicants.filter(a => a.status === 'applied')];
        if (filterChannel !== 'all') {
            list = list.filter(a => (a.appeal_message || '').startsWith(`[${filterChannel}]`));
        }
        list.sort((a, b) => {
            if (sortBy === 'followers_desc') return (b.creator?.followers_count || 0) - (a.creator?.followers_count || 0);
            if (sortBy === 'followers_asc') return (a.creator?.followers_count || 0) - (b.creator?.followers_count || 0);
            if (sortBy === 'date_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // date_desc default
        });
        return list;
    }, [applicants, sortBy, filterChannel]);

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
        const selectedCount = applicants.filter(a => a.status !== 'applied').length;
        const targetCount = contest?.target_challenger_count || 0;
        const progressPct = targetCount > 0 ? Math.min(100, Math.round((selectedCount / targetCount) * 100)) : 0;

        const handleCloseContest = async () => {
            if (!confirm('모집을 마감하시겠습니까? 마감 후 신규 지원이 불가합니다.')) return;
            const { error } = await supabase.from('ad_contests').update({ status: 'closed' }).eq('id', selectedContestId);
            if (!error) {
                toast.success('모집이 마감되었습니다.');
                fetchMyContests();
                setSelectedContestId(null);
            }
        };

        return (
            <div className="flex-1 overflow-y-auto w-full bg-slate-50/50">
                <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-6">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedContestId(null)} className="rounded-full hover:bg-slate-200 shrink-0">
                                <ArrowLeft className="w-5 h-5 text-slate-700" />
                            </Button>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${contest?.status === 'published' ? 'bg-green-100 text-green-700' :
                                        contest?.status === 'closed' ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                        {contest?.status === 'published' ? '공개 중' : contest?.status === 'closed' ? '마감됨' : '임시저장'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{getDDay(contest?.recruit_end_date)}</span>
                                </div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1">{contest?.title}</h1>
                            </div>
                        </div>
                        <div className="sm:ml-auto flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            {/* 달성률 */}
                            <div className="hidden sm:block text-right mr-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-muted-foreground">선발 달성률</span>
                                    <span className="text-sm font-bold text-slate-900">{selectedCount} / {targetCount}명</span>
                                    <span className="text-xs font-bold text-primary">{progressPct}%</span>
                                </div>
                                <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {contest?.status === 'published' && (
                                    <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={handleCloseContest}>
                                        모집 마감
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => onNavigate('ad-contest-builder', { draftId: contest.id })}>
                                    정보 수정
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ATS Board */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-6">
                        <div className="border-b px-2 sm:px-6 py-2 sm:py-4 flex items-center justify-between gap-4">
                            <div className="flex gap-4 sm:gap-6 whitespace-nowrap">
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
                                    챌린저 ({selectedCount}명 / 목표 {targetCount}명)
                                </button>
                            </div>
                            {detailTab === 'challengers' && applicants.filter(a => ['uploaded', 'video_approved'].includes(a.status)).length > 0 && (
                                <Button
                                    size="sm"
                                    className="shrink-0 h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm gap-1.5"
                                    onClick={() => onNavigate('ad-contest-award', { contestId: selectedContestId })}
                                >
                                    <Trophy className="w-3 h-3" />
                                    수상자 시상하기
                                </Button>
                            )}
                        </div>

                        <div className="p-0">
                            {detailTab === 'applicants' ? (
                                <>
                                    {/* 정렬/필터 툴바 */}
                                    <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-3 bg-slate-50 border-b">
                                        <span className="text-xs font-semibold text-slate-500 shrink-0">정렬</span>
                                        <select
                                            className="text-xs border rounded-lg px-2 py-1 bg-white focus:ring-1 focus:ring-primary outline-none"
                                            value={sortBy}
                                            onChange={e => setSortBy(e.target.value as any)}
                                        >
                                            <option value="date_desc">최신 지원순</option>
                                            <option value="date_asc">오래된순</option>
                                            <option value="followers_desc">팔로워 많은순</option>
                                            <option value="followers_asc">팔로워 적은순</option>
                                        </select>
                                        <span className="text-xs font-semibold text-slate-500 shrink-0 ml-2">채널</span>
                                        <select
                                            className="text-xs border rounded-lg px-2 py-1 bg-white focus:ring-1 focus:ring-primary outline-none"
                                            value={filterChannel}
                                            onChange={e => setFilterChannel(e.target.value)}
                                        >
                                            <option value="all">전체</option>
                                            <option value="Instagram">인스타그램</option>
                                            <option value="YouTube">유튜브</option>
                                            <option value="TikTok">틱톡</option>
                                        </select>
                                        <span className="ml-auto text-xs text-slate-400">{sortedApplicants.length}명 표시 중</span>
                                    </div>

                                    {/* 헤더 */}
                                    <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-white border-b text-xs font-semibold text-slate-500">
                                        <div className="col-span-4">크리에이터</div>
                                        <div className="col-span-5">지원 내용 / 메모</div>
                                        <div className="col-span-3 text-right">액션</div>
                                    </div>

                                    <div className="divide-y relative min-h-[300px]">
                                        {isApplicantsLoading ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                            </div>
                                        ) : sortedApplicants.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                                <Users className="w-10 h-10 text-slate-200 mb-2" />
                                                <p className="text-slate-500 text-sm">대기 중인 지원자가 없습니다.</p>
                                            </div>
                                        ) : (
                                            sortedApplicants.map((app) => (
                                                <div key={app.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-4 p-4 sm:p-5 hover:bg-slate-50/50 transition-colors items-start lg:items-center">
                                                    {/* Col 1: Profile */}
                                                    <div className="col-span-4 w-full flex items-start gap-3">
                                                        <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0 overflow-hidden">
                                                            {app.creator?.avatar_url && <img src={app.creator.avatar_url} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="font-bold text-slate-900 truncate text-sm">{app.creator?.display_name || '알수없음'}</h4>
                                                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                {app.instagram_id && (
                                                                    <a
                                                                        href={`https://instagram.com/${app.instagram_id}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 text-[11px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full hover:opacity-90 transition-opacity"
                                                                    >
                                                                        <Instagram className="w-2.5 h-2.5" /> @{app.instagram_id}
                                                                    </a>
                                                                )}
                                                                <span className="text-[11px] text-slate-500">팔로워 <strong className="text-slate-800">{(app.creator?.followers_count || 0).toLocaleString()}</strong></span>
                                                            </div>
                                                            {app.performance_metrics && (
                                                                <div className="flex gap-2 mt-1.5 text-[10px] text-slate-500">
                                                                    <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5 text-rose-400" />{(app.performance_metrics.likes || 0).toLocaleString()}</span>
                                                                    <span className="flex items-center gap-0.5"><MessageSquare className="w-2.5 h-2.5 text-blue-400" />{(app.performance_metrics.comments || 0).toLocaleString()}</span>
                                                                    <span className="flex items-center gap-0.5"><Bookmark className="w-2.5 h-2.5 text-amber-400" />{(app.performance_metrics.saved || 0).toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Col 2: 지원 내용 + 메모 */}
                                                    <div className="col-span-5 w-full space-y-2">
                                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 px-2 py-1.5 rounded-lg">
                                                            {app.appeal_message || '코멘트 없음'}
                                                        </p>
                                                        {/* 인라인 메모 */}
                                                        {editingNoteId === app.id ? (
                                                            <div className="flex gap-1">
                                                                <input
                                                                    autoFocus
                                                                    value={noteText}
                                                                    onChange={e => setNoteText(e.target.value)}
                                                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveNote(app.id); if (e.key === 'Escape') setEditingNoteId(null); }}
                                                                    placeholder="내부 메모 입력... (Enter 저장)"
                                                                    className="flex-1 text-xs border border-primary/30 rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                                                                />
                                                                <button onClick={() => handleSaveNote(app.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check className="w-4 h-4" /></button>
                                                                <button onClick={() => setEditingNoteId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => { setEditingNoteId(app.id); setNoteText(app.brand_note || ''); }}
                                                                className={cn("w-full text-left text-xs px-2 py-1.5 rounded-lg border border-dashed transition-colors flex items-center gap-1.5",
                                                                    app.brand_note ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                <StickyNote className="w-3 h-3 shrink-0" />
                                                                <span className="truncate">{app.brand_note || '메모 추가...'}</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Col 3: 액션 */}
                                                    <div className="col-span-3 w-full flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2">
                                                        <Button variant="outline" size="sm" className="text-xs h-8" asChild>
                                                            <a href={`/creator/${app.creator?.id}`} target="_blank" rel="noopener noreferrer">
                                                                프로필 <ExternalLink className="w-3 h-3 ml-1" />
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="text-xs h-8 bg-slate-900 hover:bg-primary shadow-sm"
                                                            onClick={() => handleSelectChallenger(app.id)}
                                                            disabled={isSelecting === app.id}
                                                        >
                                                            {isSelecting === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '선발하기'}
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
                                                <th className="px-4 py-3 whitespace-nowrap min-w-[200px]">진행 현황</th>
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
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden shrink-0">
                                                                        {app.creator?.avatar_url && <img src={app.creator.avatar_url} className="w-full h-full object-cover" />}
                                                                    </div>
                                                                    <span className="font-bold text-slate-900 truncate">{app.creator?.display_name}</span>
                                                                </div>
                                                                {app.instagram_id && (
                                                                    <a
                                                                        href={`https://instagram.com/${app.instagram_id}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-pink-600 transition-colors w-fit rounded-md bg-slate-50 px-1.5 py-0.5"
                                                                    >
                                                                        <Instagram className="w-2.5 h-2.5" /> @{app.instagram_id}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center w-full max-w-[240px]">
                                                                {['서명', '배송', '콘텐츠', '정산'].map((label, idx) => {
                                                                    let stepIndex = 0;
                                                                    if (app.status === 'completed') stepIndex = 4;
                                                                    else if (app.workspace) {
                                                                        const ws = app.workspace;
                                                                        if (ws.content_submission_status === 'approved') stepIndex = 3;
                                                                        else if (ws.delivery_status === 'shipped' || ws.delivery_status === 'delivered') stepIndex = 2;
                                                                        else if (ws.contract_status === 'signed') stepIndex = 1;
                                                                    }

                                                                    const isCompleted = idx < stepIndex;
                                                                    const isCurrent = idx === stepIndex;

                                                                    return (
                                                                        <React.Fragment key={label}>
                                                                            <div className="flex flex-col items-center relative z-10 flex-1">
                                                                                <div className={cn(
                                                                                    "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300",
                                                                                    isCompleted ? "bg-primary text-primary-foreground" :
                                                                                        isCurrent ? "bg-white border-[1.5px] border-primary text-primary ring-2 ring-primary/10" :
                                                                                            "bg-slate-100 text-slate-400 border border-slate-200"
                                                                                )}>
                                                                                    {isCompleted ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                                                                                </div>
                                                                                <span className={cn(
                                                                                    "text-[9px] mt-1.5 whitespace-nowrap transition-colors duration-300",
                                                                                    isCurrent ? "text-primary font-bold" :
                                                                                        isCompleted ? "text-slate-700 font-medium" :
                                                                                            "text-slate-400"
                                                                                )}>
                                                                                    {label}
                                                                                </span>
                                                                            </div>
                                                                            {idx < 3 && (
                                                                                <div className={cn(
                                                                                    "h-[2px] flex-1 -mx-3 z-0 -translate-y-[8px] transition-colors duration-300",
                                                                                    idx < stepIndex ? "bg-primary" : "bg-slate-100"
                                                                                )} />
                                                                            )}
                                                                        </React.Fragment>
                                                                    );
                                                                })}
                                                            </div>
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
                                contest={{
                                    ...contest,
                                    brand: { display_name: user?.name || contest.brand?.display_name }
                                }}
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
