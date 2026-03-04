import { useState, useEffect } from "react"
import { Loader2, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { ContestCard } from "@/components/cards/ContestCard"
import { ContestDetailDialog } from "@/components/dialogs/ContestDetailDialog"
import { ContestApplyDialog } from "@/components/dialogs/ContestApplyDialog"

export function ContestDiscoverView() {
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState<any>(null);
    const [contests, setContests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userInstagramId, setUserInstagramId] = useState("");

    const supabase = createClient();

    const fetchContests = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('ad_contests')
                .select(`
                    *,
                    brand:profiles!ad_contests_brand_id_fkey(display_name),
                    applications:ad_contest_applications(count)
                `)
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContests(data || []);
        } catch (err: any) {
            console.error("Error fetching contests:", err);
            toast.error("콘테스트 목록을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContests();

        // Fetch user's instagram handle for pre-filling
        const fetchUserIg = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Try social_channels (primary instagram)
            const { data: channels } = await supabase
                .from('social_channels')
                .select('handle')
                .eq('user_id', user.id)
                .eq('platform', 'instagram')
                .eq('is_primary', true)
                .maybeSingle();

            if (channels?.handle) {
                setUserInstagramId(channels.handle);
                return;
            }

            // 2. Try profiles.instagram_handle
            const { data: profile } = await supabase
                .from('profiles')
                .select('instagram_handle')
                .eq('id', user.id)
                .maybeSingle();

            if (profile?.instagram_handle) {
                setUserInstagramId(profile.instagram_handle);
            }
        };
        fetchUserIg();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto w-full bg-[#F8FAFC]">
            <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                            New Opportunities
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-primary" />
                            광고 콘테스트 둘러보기
                        </h1>
                        <p className="text-slate-500 text-base max-w-2xl">
                            나만의 창의적인 숏폼 영상으로 브랜드의 주인공이 되어보세요. 선정된 모든 분께 기본 활동비와 추가 우승 상금을 드립니다.
                        </p>
                    </div>
                </div>

                {contests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                            <Trophy className="w-10 h-10 text-slate-300 mb-4" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">현재 진행 중인 콘테스트가 없습니다</h3>
                        <p className="text-slate-500 max-w-md">새로운 영상 미션이 준비 중입니다. 잠시 후 다시 확인해 주세요!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {contests.map((contest) => (
                            <ContestCard
                                key={contest.id}
                                contest={contest}
                                onClick={() => {
                                    setSelectedContest(contest);
                                    setIsDetailOpen(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 상세 정보 다이얼로그 */}
            {selectedContest && (
                <ContestDetailDialog
                    isOpen={isDetailOpen}
                    onClose={() => {
                        setIsDetailOpen(false);
                        setSelectedContest(null);
                    }}
                    contest={selectedContest}
                    onApply={() => {
                        setIsDetailOpen(false);
                        setIsApplyOpen(true);
                    }}
                />
            )}

            {/* 참가 신청 다이얼로그 */}
            {selectedContest && (
                <ContestApplyDialog
                    isOpen={isApplyOpen}
                    onClose={() => {
                        setIsApplyOpen(false);
                        setSelectedContest(null);
                    }}
                    contestTitle={selectedContest.title}
                    forbiddenRules={selectedContest.forbidden_rules || []}
                    maintenancePeriod={selectedContest.maintenance_period}
                    defaultInstagramId={userInstagramId}
                    onApply={async (data) => {
                        try {
                            const { data: { user } } = await supabase.auth.getUser();

                            if (!user) {
                                toast.error("로그인이 필요합니다.");
                                return;
                            }

                            const formattedMessage = `[${data.channel}] ${data.appealMessage}`;

                            const { error } = await supabase.from('ad_contest_applications').insert({
                                contest_id: selectedContest.id,
                                creator_id: user.id,
                                instagram_id: data.instagramId,
                                appeal_message: formattedMessage,
                                agreed_to_rules: true,
                                status: 'applied'
                            });

                            if (error) {
                                if (error.code === '23505') {
                                    toast.error("이미 지원한 콘테스트입니다.");
                                    return;
                                }
                                throw error;
                            }

                            toast.success("참가 신청이 완료되었습니다!");
                            setIsApplyOpen(false);
                            setSelectedContest(null);
                            fetchContests(); // 실시간 지원자 수 갱신
                        } catch (err: any) {
                            console.error("Apply Error Detail:", {
                                message: err.message,
                                code: err.code,
                                details: err.details,
                                hint: err.hint,
                                stack: err.stack,
                                error: err
                            });
                            toast.error(err.message || "참가 신청 중 오류가 발생했습니다.");
                        }
                    }}
                />
            )}
        </div>
    )
}
