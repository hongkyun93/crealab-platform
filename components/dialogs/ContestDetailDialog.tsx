import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Video, FileText, ShoppingBag, ExternalLink, CheckCircle2, AlertTriangle, Hash, Clock, Monitor, Users } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { toast } from "sonner"

interface ContestDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    contest: any;
    onApply?: () => void;
    role?: 'creator' | 'brand';
    onManageApplicants?: () => void;
    onEdit?: () => void;
}

export function ContestDetailDialog({
    isOpen,
    onClose,
    contest,
    onApply,
    role = 'creator',
    onManageApplicants,
    onEdit
}: ContestDetailDialogProps) {
    if (!contest) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return "미정";
        try {
            return format(parseISO(dateString), "yyyy. MM. dd.", { locale: ko });
        } catch (e) {
            return dateString;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
    };

    const SectionHeader = ({ icon: Icon, title, step }: { icon: any, title: string, step: number }) => (
        <div className="flex items-center gap-2 mb-4 pt-6 first:pt-0 border-t first:border-t-0 border-slate-100">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {step}
            </div>
            <Icon className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900">{title}</h3>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto p-0 gap-0">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Trophy className="w-6 h-6 text-primary" />
                            콘테스트 상세 정보
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* 왼쪽 섹션: 1, 2, 4 */}
                    <div className="space-y-10">
                        {/* 1. 기본 정보 및 브랜드 제품 */}
                        <section>
                            <SectionHeader icon={ShoppingBag} title="기본 정보 및 브랜드 제품" step={1} />
                            <div className="bg-slate-50 rounded-2xl p-5 flex gap-5 items-start border border-slate-100">
                                {contest.thumbnail_url && (
                                    <img src={contest.thumbnail_url} className="w-28 h-28 rounded-xl object-cover shadow-md" alt="Thumbnail" />
                                )}
                                <div className="flex-1">
                                    <h4 className="font-extrabold text-slate-900 text-xl mb-2">{contest.title}</h4>
                                    <div className="text-sm text-slate-600 space-y-2">
                                        <p className="flex items-center gap-2">
                                            <span className="text-slate-400 font-medium">제품명</span>
                                            <span className="font-bold text-slate-900">{contest.product_name}</span>
                                        </p>
                                        {contest.product_link && (
                                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold rounded-lg border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-colors" asChild>
                                                <a href={contest.product_link} target="_blank" rel="noopener noreferrer">
                                                    제품 상세 보기 <ExternalLink className="w-3 h-3 ml-1" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 필수 해시태그 (1번 바로 아래로 이동) */}
                            {contest.required_hashtags?.length > 0 && (
                                <div className="mt-4 p-5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <h5 className="text-[11px] font-black tracking-widest text-slate-500 mb-3 flex items-center gap-2 uppercase">
                                        <Hash className="w-4 h-4" /> 필수 해시태그
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {contest.required_hashtags.map((tag: string, idx: number) => (
                                            <span key={idx} className="text-[12px] font-bold bg-white text-primary px-3 py-1 rounded-lg border border-primary/10 shadow-sm">
                                                {tag.startsWith('#') ? tag : `#${tag}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 2. 보상 체계 */}
                        <section>
                            <SectionHeader icon={Trophy} title="보상 체계" step={2} />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 shadow-sm relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="text-xs text-amber-600 font-black mb-1 uppercase tracking-wider">총 상금 규모</div>
                                        <div className="text-2xl font-black text-slate-900">{formatPrice(contest.total_budget || 0)}</div>
                                        <div className="text-[10px] text-slate-500 mt-1 font-bold">전체 우승 상금 포함</div>
                                    </div>
                                    <Trophy className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-200/50 -rotate-12 transition-transform group-hover:scale-110" />
                                </div>
                                <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 shadow-sm">
                                    <div className="text-xs text-primary font-black mb-1 uppercase tracking-wider">기본 참가 보상</div>
                                    <div className="text-2xl font-black text-slate-900">{formatPrice(contest.base_reward || 0)}</div>
                                    <div className="text-[10px] text-slate-500 mt-1 font-bold">선발된 모든 챌린저 지급</div>
                                </div>
                                <div className="col-span-2 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                                    <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        목표 챌린저 수
                                    </div>
                                    <div className="text-lg font-black text-slate-900">{contest.target_challenger_count || '-'}명</div>
                                </div>
                            </div>
                            <div className="mt-5 space-y-2.5">
                                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-amber-200 transition-colors">
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                        <span className="w-6 h-6 bg-amber-400 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm">1</span>
                                        1등 상금 ({contest.rank_rewards?.rank1?.count || 1}명)
                                    </span>
                                    <span className="text-lg font-black text-slate-900">{formatPrice(contest.rank_rewards?.rank1?.reward || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-200 transition-colors">
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                        <span className="w-6 h-6 bg-slate-300 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm">2</span>
                                        2등 상금 ({contest.rank_rewards?.rank2?.count || 0}명)
                                    </span>
                                    <span className="text-lg font-black text-slate-900">{formatPrice(contest.rank_rewards?.rank2?.reward || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-orange-200 transition-colors">
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-3">
                                        <span className="w-6 h-6 bg-orange-300 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm">3</span>
                                        3등 상금 ({contest.rank_rewards?.rank3?.count || 0}명)
                                    </span>
                                    <span className="text-lg font-black text-slate-900">{formatPrice(contest.rank_rewards?.rank3?.reward || 0)}</span>
                                </div>
                            </div>
                        </section>

                        {/* 4. 영상 규격 */}
                        <section>
                            <SectionHeader icon={Video} title="영상 규격" step={4} />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mb-2 uppercase">
                                        <Clock className="w-3 h-3" /> 영상 길이
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900">{contest.video_length || "제한 없음"}</div>
                                </div>
                                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mb-2 uppercase">
                                        <Monitor className="w-3 h-3" /> 영상 비율
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900">{contest.video_ratio || "9:16"}</div>
                                </div>
                                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mb-2 uppercase">
                                        <FileText className="w-3 h-3" /> 해상도
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900">{contest.video_resolution || "1080p 이상"}</div>
                                </div>
                                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mb-2 uppercase">
                                        <Hash className="w-3 h-3" /> 플랫폼
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900">{(contest.platforms || []).join(", ") || "범용"}</div>
                                </div>
                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl col-span-2">
                                    <div className="text-[10px] text-primary font-bold flex items-center gap-1.5 mb-2 uppercase">
                                        <Clock className="w-3 h-3" /> 최소 영상 유지 기간
                                    </div>
                                    <div className="text-sm font-black text-slate-900">
                                        게시 후 최소 <span className="text-primary">{contest.maintenance_period || 60}일</span> 유지 필수
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">※ 유지 기간 미달 시 리워드 환수 및 패널티가 부여될 수 있습니다.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 오른쪽 섹션: 3, 5 */}
                    <div className="space-y-10">
                        {/* 3. 상세 추진 일정 */}
                        <section>
                            <SectionHeader icon={Calendar} title="상세 추진 일정" step={3} />
                            <div className="bg-slate-50/30 border border-slate-100 rounded-2xl p-7">
                                <div className="space-y-6 border-l-2 border-slate-100 ml-2 pl-7 py-1">
                                    {[
                                        { title: "챌린저 모집", start: contest.recruit_start_date, end: contest.recruit_end_date, active: true },
                                        { title: "챌린저 발표", date: contest.winner_announce_date },
                                        { title: "영상 제출(초안)", start: contest.video_submit_start_date, end: contest.video_submit_end_date },
                                        { title: "영상 검수", start: contest.video_review_start_date, end: contest.video_review_end_date },
                                        { title: "최종 영상 업로드", start: contest.video_upload_start_date, end: contest.video_upload_end_date },
                                        { title: "반응 추이 테스트", start: contest.reaction_test_start_date, end: contest.reaction_test_end_date },
                                        { title: "최종 수상자 시상", start: contest.award_start_date, end: contest.award_end_date }
                                    ].map((item, idx) => (
                                        <div key={idx} className="relative">
                                            <div className={`absolute -left-[35px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${idx === 0 ? 'bg-primary ring-4 ring-primary/10' : 'bg-slate-200'}`} />
                                            <div className="text-sm font-extrabold text-slate-900 mb-0.5">{item.title}</div>
                                            <div className="text-xs font-bold text-slate-500">
                                                {item.date ? formatDate(item.date) : `${formatDate(item.start)} ~ ${formatDate(item.end)}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 5. 가이드라인 */}
                        <section>
                            <SectionHeader icon={FileText} title="가이드라인" step={5} />
                            <div className="space-y-7 bg-white p-2">
                                <div>
                                    <h5 className="text-[11px] font-black tracking-widest text-indigo-600 mb-3 flex items-center gap-2 uppercase">
                                        <CheckCircle2 className="w-4 h-4" /> 핵심 소구점 (Selling Points)
                                    </h5>
                                    <ul className="space-y-2.5 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50">
                                        {(contest.selling_points || []).map((point: string, idx: number) => (
                                            <li key={idx} className="text-[13px] font-bold text-slate-700 flex items-start gap-3 leading-relaxed">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-black tracking-widest text-emerald-600 mb-3 flex items-center gap-2 uppercase">
                                        <Video className="w-4 h-4" /> 필수 포함 컷 (Required Cuts)
                                    </h5>
                                    <ul className="space-y-2.5 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                                        {(contest.required_cuts || []).map((cut: string, idx: number) => (
                                            <li key={idx} className="text-[13px] font-bold text-slate-700 flex items-start gap-3 leading-relaxed">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                {cut}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-black tracking-widest text-rose-600 mb-3 flex items-center gap-2 uppercase">
                                        <AlertTriangle className="w-4 h-4" /> 금지 사항 (Forbidden Rules)
                                    </h5>
                                    <ul className="space-y-2.5 bg-rose-50/30 p-4 rounded-2xl border border-rose-100/50">
                                        {(contest.forbidden_rules || []).map((rule: string, idx: number) => (
                                            <li key={idx} className="text-[13px] font-bold text-slate-700 flex items-start gap-3 leading-relaxed">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <DialogFooter className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t p-6 px-10 z-10 sm:justify-center gap-4">
                    {role === 'brand' ? (
                        <>
                            <Button
                                variant="outline"
                                className="flex-1 h-14 text-lg font-bold rounded-2xl border-2 border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                                onClick={onEdit}
                            >
                                정보 수정하기
                            </Button>
                            <Button
                                className="flex-[2] h-14 text-xl font-black rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                                onClick={onManageApplicants}
                            >
                                지원자 관리하기
                            </Button>
                        </>
                    ) : (
                        <Button
                            className="w-full sm:max-w-md h-14 text-xl font-black rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                            onClick={() => {
                                if (!onApply) {
                                    toast.error('브랜드 계정은 콘테스트에 참가할 수 없습니다.')
                                    return
                                }
                                onApply()
                            }}
                        >
                            지금 바로 도전하기
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
