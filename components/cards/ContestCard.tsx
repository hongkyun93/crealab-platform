import React from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Instagram, Youtube, Video, Calendar, ShoppingBag, ArrowRight } from "lucide-react"
import { differenceInDays, parseISO, format } from "date-fns"

interface ContestCardProps {
    contest: any;
    onClick: () => void;
    mode?: 'creator' | 'brand';
}

export function ContestCard({ contest, onClick, mode = 'creator' }: ContestCardProps) {
    const getDDay = (dateString: string) => {
        if (!dateString) return "미정";
        const targetDate = parseISO(dateString);
        const diff = differenceInDays(targetDate, new Date());
        if (diff === 0) return "오늘 마감";
        if (diff < 0) return "마감됨";
        return `D-${diff}`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
    };

    const formatDateRange = (start: string, end: string) => {
        if (!start || !end) return "기간 미정";
        try {
            return `${format(parseISO(start), "MM.dd")} ~ ${format(parseISO(end), "MM.dd")}`;
        } catch (e) {
            return "기간 오류";
        }
    };

    return (
        <div
            className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
            onClick={onClick}
        >
            {/* 이미지 영역 */}
            <div className="relative h-56 overflow-hidden">
                {contest.thumbnail_url ? (
                    <img src={contest.thumbnail_url} alt={contest.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <Trophy className="w-16 h-16 text-slate-200" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                <div className="absolute top-4 left-4 flex gap-2">
                    {(contest.platforms || []).map((p: string) => (
                        <div key={p} className="bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm">
                            {p === 'Instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                            {p === 'TikTok' && <Video className="w-4 h-4 text-black" />}
                            {p === 'YouTube' && <Youtube className="w-4 h-4 text-red-600" />}
                        </div>
                    ))}
                </div>

                <div className="absolute top-4 right-4 bg-primary text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                    {getDDay(contest.recruit_end_date || contest.application_end_date)}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Users className="w-4 h-4" />
                        현재 {contest.applications?.[0]?.count || 0}명 지원 중
                    </div>
                    {mode === 'brand' && (
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${contest.status === 'published' ? 'bg-green-500/80' : 'bg-slate-500/80'}`}>
                            {contest.status === 'published' ? '공개중' : '임시저장'}
                        </div>
                    )}
                </div>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="p-7 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black tracking-widest uppercase text-primary bg-primary/5 px-2 py-0.5 rounded">
                        {contest.brand?.display_name || "OFFICIAL"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" /> {contest.product_name}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">
                    {contest.title}
                </h3>

                <div className="space-y-4 pt-4 border-t border-slate-50 mt-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">1등 우승 상금</div>
                            <div className="text-lg font-black text-slate-900">
                                {formatPrice(contest.rank_rewards?.rank1?.reward || 0)}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">총 상금</div>
                            <div className="text-lg font-black text-primary">
                                {formatPrice(contest.total_budget || 0)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600">
                                {formatDateRange(contest.recruit_start_date, contest.recruit_end_date || contest.application_end_date)}
                            </span>
                        </div>
                        <div className="text-xs font-black text-slate-900">
                            {contest.target_challenger_count}명 모집
                        </div>
                    </div>

                    <Button className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-xl font-bold gap-2 group/btn">
                        {mode === 'brand' ? '내용 및 지원자 확인' : '상세 요강 보기'}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
