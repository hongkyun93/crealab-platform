import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Check, ChevronRight, Trophy, Sparkles, X, ImageIcon, Package } from "lucide-react"
import { AdContest } from "@/lib/types/contest"
import { ChannelSelector } from "@/components/shared/ChannelSelector"
import {
    Dialog,
    DialogContent, DialogDescription,
    DialogFooter, DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface ContestBuilderViewProps {
    onNavigate: (view: string, params?: any) => void;
    initialParams?: any;
}

export function ContestBuilderView({ onNavigate, initialParams }: ContestBuilderViewProps) {
    const supabase = createClient()
    const { products, user } = useUnifiedProvider()
    const brandProducts = products.filter(p => p.brandId === user?.id)

    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [productName, setProductName] = useState("");
    const [productLink, setProductLink] = useState("");
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

    const [isProductLoadModalOpen, setIsProductLoadModalOpen] = useState(false);

    const handleSelectProduct = (product: any) => {
        setProductName(product.name);
        setProductLink(product.link || "");

        const prodImage = product.image || product.image_url || "";
        if (prodImage && prodImage !== "📦") {
            setThumbnailPreview(prodImage);
        }

        setIsProductLoadModalOpen(false);
        toast.success("제품 정보를 불러왔습니다!");
    };

    const [targetCount, setTargetCount] = useState(30);
    const [baseReward, setBaseReward] = useState(10000);

    // Reward amounts
    const [rank1Reward, setRank1Reward] = useState(1000000);
    const [rank2Reward, setRank2Reward] = useState(500000);
    const [rank3Reward, setRank3Reward] = useState(200000);

    // Winner Headcounts
    const [rank1Count, setRank1Count] = useState(1);
    const [rank2Count, setRank2Count] = useState(1);
    const [rank3Count, setRank3Count] = useState(3);

    const [videoLength, setVideoLength] = useState("15초 내외");
    const [videoRatio, setVideoRatio] = useState("9:16 세로형 (숏폼 최적화)");
    const [videoResolution, setVideoResolution] = useState("1080p 이상");

    const [sellingPoints, setSellingPoints] = useState("");
    const [requiredCuts, setRequiredCuts] = useState("");
    const [forbiddenRules, setForbiddenRules] = useState("- 영상을 N일 이내에 삭제할 경우 리워드가 환수될 수 있으며, 향후 플랫폼 참여가 제한됩니다.");
    const [hashtags, setHashtags] = useState("");
    const [maintenancePeriod, setMaintenancePeriod] = useState(60);

    // Thumbnail State
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    // Schedule States
    const [recruitStartDate, setRecruitStartDate] = useState("");
    const [recruitEndDate, setRecruitEndDate] = useState("");

    const [challengerAnnounceDate, setChallengerAnnounceDate] = useState("");

    const [videoSubmitStartDate, setVideoSubmitStartDate] = useState("");
    const [videoSubmitEndDate, setVideoSubmitEndDate] = useState("");

    const [videoReviewStartDate, setVideoReviewStartDate] = useState("");
    const [videoReviewEndDate, setVideoReviewEndDate] = useState("");

    const [videoUploadStartDate, setVideoUploadStartDate] = useState("");
    const [videoUploadEndDate, setVideoUploadEndDate] = useState("");

    const [reactionTestStartDate, setReactionTestStartDate] = useState("");
    const [reactionTestEndDate, setReactionTestEndDate] = useState("");

    const [awardStartDate, setAwardStartDate] = useState("");
    const [awardEndDate, setAwardEndDate] = useState("");

    // Live Budget Calculation
    const budgetSummary = useMemo(() => {
        const totalBase = targetCount * baseReward;
        const totalRank = (rank1Reward * rank1Count) + (rank2Reward * rank2Count) + (rank3Reward * rank3Count);
        const totalRankWinners = rank1Count + rank2Count + rank3Count;
        const pureBudget = totalBase + totalRank;
        const platformFee = Math.floor(pureBudget * 0.05);
        const vat = Math.floor((pureBudget + platformFee) * 0.1);
        const totalAmount = pureBudget + platformFee + vat;

        return {
            totalBase,
            totalRank,
            totalRankWinners,
            pureBudget,
            platformFee,
            vat,
            totalAmount
        };
    }, [targetCount, baseReward, rank1Reward, rank2Reward, rank3Reward, rank1Count, rank2Count, rank3Count]);

    // Added Submission Logic
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [creditBalance, setCreditBalance] = useState<number | null>(null);

    useEffect(() => {
        const fetchDraft = async () => {
            if (!user?.id) return;
            try {
                const targetId = initialParams?.draftId;
                let query = supabase.from('ad_contests').select('*');

                if (targetId) {
                    query = query.eq('id', targetId);
                } else {
                    query = query.eq('brand_id', user.id).eq('status', 'draft').order('created_at', { ascending: false }).limit(1);
                }

                const { data, error } = await query.single();

                const formatDateForInput = (dateStr: string | null) => {
                    if (!dateStr || dateStr === "") return "";
                    return dateStr.split('T')[0];
                };

                if (error && error.code !== 'PGRST116') throw error; // Ignore no rows error

                if (data) {
                    setDraftId(data.id);
                    setTitle(data.title || "");
                    setProductName(data.product_name || "");
                    setProductLink(data.product_link || "");
                    setTargetCount(data.target_challenger_count || 30);
                    setBaseReward(data.base_reward || 10000);

                    // Parse rank_rewards JSONB
                    if (data.rank_rewards) {
                        setRank1Reward(data.rank_rewards.rank1?.reward || 1000000);
                        setRank1Count(data.rank_rewards.rank1?.count || 1);
                        setRank2Reward(data.rank_rewards.rank2?.reward || 500000);
                        setRank2Count(data.rank_rewards.rank2?.count || 1);
                        setRank3Reward(data.rank_rewards.rank3?.reward || 200000);
                        setRank3Count(data.rank_rewards.rank3?.count || 3);
                    }

                    setVideoLength(data.video_length || "15초 내외");
                    setVideoRatio(data.video_ratio || "9:16 세로형 (숏폼 최적화)");
                    setVideoResolution(data.video_resolution || "1080p 이상");

                    if (data.selling_points && Array.isArray(data.selling_points)) {
                        setSellingPoints(data.selling_points.join('\n'));
                    }
                    if (data.required_cuts && Array.isArray(data.required_cuts)) {
                        setRequiredCuts(data.required_cuts.join('\n'));
                    }
                    if (data.forbidden_rules && Array.isArray(data.forbidden_rules)) {
                        setForbiddenRules(data.forbidden_rules.join('\n'));
                    }
                    setMaintenancePeriod(data.maintenance_period || 60);

                    if (data.required_hashtags && Array.isArray(data.required_hashtags)) {
                        setHashtags(data.required_hashtags.join(" "));
                    }

                    if (data.thumbnail_url) {
                        setThumbnailPreview(data.thumbnail_url);
                    }
                    if (data.platforms && Array.isArray(data.platforms)) {
                        setSelectedChannels(data.platforms);
                    }

                    setRecruitStartDate(formatDateForInput(data.recruit_start_date));
                    setRecruitEndDate(formatDateForInput(data.recruit_end_date));
                    setChallengerAnnounceDate(formatDateForInput(data.winner_announce_date));
                    setVideoSubmitStartDate(formatDateForInput(data.video_submit_start_date));
                    setVideoSubmitEndDate(formatDateForInput(data.video_submit_end_date));
                    setVideoReviewStartDate(formatDateForInput(data.video_review_start_date));
                    setVideoReviewEndDate(formatDateForInput(data.video_review_end_date));
                    setVideoUploadStartDate(formatDateForInput(data.video_upload_start_date));
                    setVideoUploadEndDate(formatDateForInput(data.video_upload_end_date));
                    setReactionTestStartDate(formatDateForInput(data.reaction_test_start_date));
                    setReactionTestEndDate(formatDateForInput(data.reaction_test_end_date));
                    setAwardStartDate(formatDateForInput(data.award_start_date));
                    setAwardEndDate(formatDateForInput(data.award_end_date));

                    if (targetId) {
                        toast.info("수정할 콘테스트 정보를 불러왔습니다.", { position: "top-center" });
                    } else {
                        toast.info("이전에 작성 중이던 임시 저장본을 불러왔습니다.", { position: "top-center" });
                    }
                }
            } catch (err: any) {
                console.error("Failed to load contest:", err?.message || JSON.stringify(err));
            }
        };
        fetchDraft();
    }, [user?.id, initialParams?.draftId]);

    const handleSaveContest = async (isFinal: boolean = false) => {
        if (isFinal) {
            if (!title.trim()) {
                toast.error("콘테스트 제목을 입력해주세요.");
                setStep(1);
                return;
            }
            if (!productName.trim()) {
                toast.error("제품/서비스명을 입력해주세요.");
                setStep(1);
                return;
            }
        } else {
            if (!title.trim()) {
                toast.error("임시저장을 위해 최소한 콘테스트 제목은 입력해주세요.");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            let thumbnailUrl = undefined;

            // Thumbnail Upload
            if (thumbnailFile) {
                const fileExt = thumbnailFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `contests/${user?.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('public_assets')
                    .upload(filePath, thumbnailFile);

                if (uploadError) {
                    toast.error("썸네일 이미지 업로드에 실패했습니다.");
                    throw uploadError;
                }

                const { data } = supabase.storage.from('public_assets').getPublicUrl(filePath);
                thumbnailUrl = data.publicUrl;
            } else if (thumbnailPreview && !thumbnailPreview.startsWith('blob:')) {
                thumbnailUrl = thumbnailPreview;
            }

            const parsedHashtags = hashtags
                .split(' ')
                .map(t => t.trim())
                .filter(t => t.length > 0)
                .map(t => t.startsWith('#') ? t : `#${t}`);

            const payload = {
                brand_id: user?.id,
                title,
                selling_points: sellingPoints.split('\n').filter(s => s.trim().length > 0),
                required_cuts: requiredCuts.split('\n').filter(s => s.trim().length > 0),
                forbidden_rules: forbiddenRules.split('\n').filter(s => s.trim().length > 0),
                required_hashtags: parsedHashtags,
                video_length: videoLength,
                video_ratio: videoRatio,
                video_resolution: videoResolution,
                platforms: selectedChannels,
                total_budget: budgetSummary.pureBudget,
                target_challenger_count: targetCount,
                base_reward: baseReward,
                rank_rewards: {
                    rank1: { count: rank1Count, reward: rank1Reward },
                    rank2: { count: rank2Count, reward: rank2Reward },
                    rank3: { count: rank3Count, reward: rank3Reward }
                },
                recruit_start_date: recruitStartDate || null,
                recruit_end_date: recruitEndDate || null,
                winner_announce_date: challengerAnnounceDate || null,
                video_submit_start_date: videoSubmitStartDate || null,
                video_submit_end_date: videoSubmitEndDate || null,
                video_review_start_date: videoReviewStartDate || null,
                video_review_end_date: videoReviewEndDate || null,
                video_upload_start_date: videoUploadStartDate || null,
                video_upload_end_date: videoUploadEndDate || null,
                reaction_test_start_date: reactionTestStartDate || null,
                reaction_test_end_date: reactionTestEndDate || null,
                award_start_date: awardStartDate || null,
                award_end_date: awardEndDate || null,
                product_name: productName,
                product_link: productLink,
                status: 'draft', // 에스크로 결제 완료 후 RPC가 'published'로 변경
                maintenance_period: maintenancePeriod,
                ...(thumbnailUrl && { thumbnail_url: thumbnailUrl })
            };

            if (draftId) {
                const { error } = await supabase.from('ad_contests').update(payload).eq('id', draftId);
                if (error) {
                    console.error("[Save Draft] Update error:", error);
                    window.alert("업데이트 중 오류가 발생했습니다: " + (error.message || JSON.stringify(error)));
                    throw error;
                }
                toast.success(isFinal ? "콘테스트 정보가 저장되었습니다. 결제를 진행해주세요." : "임시저장이 완료되었습니다.");
            } else {
                console.log("[Save Draft] Attempting insert with payload:", payload);
                const { data, error } = await supabase.from('ad_contests').insert(payload).select().single();
                if (error) {
                    console.error("[Save Draft] Insert error:", error);
                    window.alert("저장 중 오류가 발생했습니다: " + (error.message || JSON.stringify(error)));
                    setIsSubmitting(false);
                    return;
                }
                console.log("[Save Draft] Insert success, data:", data);
                setDraftId(data.id);
                toast.success(isFinal ? "콘테스트 정보가 저장되었습니다. 결제를 진행해주세요." : "임시저장이 완료되었습니다.");
            }

            if (isFinal) {
                // 예치금 잔액 조회 후 에스크로 모달 오픈
                try {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('deposit_balance')
                        .eq('id', user?.id)
                        .single();
                    setCreditBalance(profileData?.deposit_balance ?? 0);
                } catch {
                    setCreditBalance(null);
                }
                setIsEscrowModalOpen(true);
            }
        } catch (error: any) {
            console.error("Error creating/updating contest:", error);
            window.alert("예기치 않은 오류가 발생했습니다: " + (error?.message || JSON.stringify(error) || "알 수 없음"));
            toast.error(error?.message || "오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 에스크로 결제 실행
    const handlePublish = async () => {
        if (!draftId || !user?.id) return;
        setIsPublishing(true);
        try {
            const { data, error } = await supabase.rpc('create_contest_escrow', {
                p_contest_id: draftId,
                p_brand_id: user.id,
                p_total_amount: budgetSummary.totalAmount
            });

            if (error) throw error;
            if (!data?.success) {
                if (data?.error === 'Insufficient balance.') {
                    toast.error(`크레딧이 부족합니다. 필요: ${data.required?.toLocaleString()}원 / 현재: ${data.current?.toLocaleString()}원`);
                } else {
                    toast.error(data?.error || '결제 처리 중 오류가 발생했습니다.');
                }
                return;
            }

            toast.success('🎉 콘테스트가 성공적으로 발행되었습니다!');
            setIsEscrowModalOpen(false);
            onNavigate('ad-contests');
        } catch (err: any) {
            toast.error(err?.message || '에스크로 결제 중 오류가 발생했습니다.');
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto w-full bg-slate-50/50">
            <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Header Sequence */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => onNavigate('ad-contests')} className="shrink-0 bg-white">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">STEP {step}/3</span>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">새 광고 콘테스트</h1>
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">상금 경쟁을 통해 수십 개의 고퀄리티 브랜드 숏폼 영상을 모아보세요.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => handleSaveContest(false)} disabled={isSubmitting}>
                            {isSubmitting ? "저장 중..." : "임시저장"}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Form Area */}
                    <div className="flex-1 space-y-6">
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Section 1: Basic Info */}
                                <Card className="border shadow-sm rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50 border-b px-6 py-4">
                                        <h2 className="text-lg font-bold text-slate-900">콘테스트 기본 정보</h2>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-sm font-semibold text-slate-700">콘테스트 제목 <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="title"
                                                placeholder="ex) 극강의 살냄새 향수 30초 숏폼 챌린지"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="h-12 text-base transition-all focus:ring-primary/20"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold text-slate-700">대표 썸네일 & 제품 정보</Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
                                                    onClick={() => setIsProductLoadModalOpen(true)}
                                                >
                                                    <Package className="h-3 w-3" />
                                                    내 브랜드 제품 불러오기
                                                </Button>
                                            </div>

                                            <div className="flex flex-col md:flex-row items-start gap-6">
                                                {/* Thumbnail Area */}
                                                <div className="shrink-0 space-y-2">
                                                    <div
                                                        className="h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors relative group"
                                                        onClick={() => document.getElementById('thumbnail-upload')?.click()}
                                                    >
                                                        {thumbnailPreview ? (
                                                            <>
                                                                <img src={thumbnailPreview} alt="Preview" className="h-full w-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <ImageIcon className="h-6 w-6 text-white" />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setThumbnailFile(null);
                                                                        setThumbnailPreview(null);
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                                                <ImageIcon className="h-6 w-6" />
                                                                <span className="text-[10px]">썸네일 등록</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Input
                                                        id="thumbnail-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleThumbnailChange}
                                                    />
                                                    <p className="text-[10px] text-muted-foreground text-center w-32 leading-tight">
                                                        메인 노출용 대표사진<br />(1:1 비율 권장)
                                                    </p>
                                                </div>

                                                {/* Product Info Inputs */}
                                                <div className="flex-1 space-y-4 w-full">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="productName" className="text-xs font-semibold text-slate-500">제품/서비스명</Label>
                                                        <Input
                                                            id="productName"
                                                            value={productName}
                                                            onChange={(e) => setProductName(e.target.value)}
                                                            placeholder="제품명을 직접 입력하거나 불러오세요"
                                                            className="h-10 transition-all focus:ring-primary/20"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="productLink" className="text-xs font-semibold text-slate-500">제품 구입 링크</Label>
                                                        <Input
                                                            id="productLink"
                                                            value={productLink}
                                                            onChange={(e) => setProductLink(e.target.value)}
                                                            placeholder="https://"
                                                            className="h-10 transition-all focus:ring-primary/20"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <Label className="text-sm font-semibold text-slate-700 flex justify-between">
                                                필수 해시태그 (#)
                                                <span className="text-xs text-muted-foreground">스페이스로 구분해서 입력해주세요</span>
                                            </Label>
                                            <Input
                                                placeholder="#살냄새향수 #지속력좋은향수 → 스페이스로 구분"
                                                value={hashtags}
                                                onChange={e => {
                                                    // 한글 IME 조합 중에는 변환 로직을 건드리지 않음
                                                    if ((e.nativeEvent as any).isComposing) {
                                                        setHashtags(e.target.value)
                                                        return
                                                    }
                                                    let val = e.target.value
                                                    if (val === '') { setHashtags(''); return }
                                                    if (!val.startsWith('#')) val = '#' + val
                                                    // 스페이스 뒤에 #이 없는 경우에만 # 추가
                                                    val = val.replace(/ (?![#\s])(?=\S)/g, ' #')
                                                    // 연속된 # 제거
                                                    val = val.replace(/#{2,}/g, '#')
                                                    setHashtags(val)
                                                }}
                                                onCompositionEnd={e => {
                                                    // 한글 조합 완료 시점에 한 번만 변환 처리
                                                    let val = (e.target as HTMLInputElement).value
                                                    if (val === '') return
                                                    if (!val.startsWith('#')) val = '#' + val
                                                    val = val.replace(/ (?![#\s])(?=\S)/g, ' #')
                                                    val = val.replace(/#{2,}/g, '#')
                                                    setHashtags(val)
                                                }}
                                                className="h-10 transition-all focus:ring-primary/20 bg-slate-50"
                                            />
                                            <p className="text-xs text-muted-foreground">태그 입력 후 스페이스로 다음 태그를 구분하세요.</p>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <Label className="text-sm font-semibold text-slate-700 block mb-2">콘테스트 추진 일정 (상세)</Label>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">챌린저 모집 기간</Label>
                                                    <div className="flex gap-2">
                                                        <Input type="date" className="h-9 text-xs" value={recruitStartDate} onChange={e => setRecruitStartDate(e.target.value)} />
                                                        <span className="text-slate-400 self-center">~</span>
                                                        <Input type="date" className="h-9 text-xs" value={recruitEndDate} onChange={e => setRecruitEndDate(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">챌린저 발표일</Label>
                                                    <Input type="date" className="h-9 text-xs w-full" value={challengerAnnounceDate} onChange={e => setChallengerAnnounceDate(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">챌린저 영상 제출 (초안)</Label>
                                                    <div className="flex gap-2">
                                                        <Input type="date" className="h-9 text-xs" value={videoSubmitStartDate} onChange={e => setVideoSubmitStartDate(e.target.value)} />
                                                        <span className="text-slate-400 self-center">~</span>
                                                        <Input type="date" className="h-9 text-xs" value={videoSubmitEndDate} onChange={e => setVideoSubmitEndDate(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">영상 검수 기간</Label>
                                                    <div className="flex gap-2">
                                                        <Input type="date" className="h-9 text-xs" value={videoReviewStartDate} onChange={e => setVideoReviewStartDate(e.target.value)} />
                                                        <span className="text-slate-400 self-center">~</span>
                                                        <Input type="date" className="h-9 text-xs" value={videoReviewEndDate} onChange={e => setVideoReviewEndDate(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">최종 영상 업로드 (개인SNS)</Label>
                                                    <div className="flex gap-2">
                                                        <Input type="date" className="h-9 text-xs" value={videoUploadStartDate} onChange={e => setVideoUploadStartDate(e.target.value)} />
                                                        <span className="text-slate-400 self-center">~</span>
                                                        <Input type="date" className="h-9 text-xs" value={videoUploadEndDate} onChange={e => setVideoUploadEndDate(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">영상 반응 추이 테스트</Label>
                                                    <div className="flex gap-2">
                                                        <Input type="date" className="h-9 text-xs" value={reactionTestStartDate} onChange={e => setReactionTestStartDate(e.target.value)} />
                                                        <span className="text-slate-400 self-center">~</span>
                                                        <Input type="date" className="h-9 text-xs" value={reactionTestEndDate} onChange={e => setReactionTestEndDate(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">최종 수상자 심사</Label>
                                                    <div className="flex gap-2">
                                                        <Input type="date" className="h-9 text-xs" value={awardStartDate} onChange={e => setAwardStartDate(e.target.value)} />
                                                        <span className="text-slate-400 self-center">~</span>
                                                        <Input type="date" className="h-9 text-xs" value={awardEndDate} onChange={e => setAwardEndDate(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100">
                                            <Label className="text-sm font-semibold text-slate-700 block mb-4">희망 플랫폼 채널</Label>
                                            <ChannelSelector
                                                selected={selectedChannels}
                                                onChange={setSelectedChannels}
                                                label=""
                                                description="복수 선택 가능"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end pt-4 gap-3">
                                    <Button variant="outline" size="lg" className="md:w-auto h-12 px-8 text-base shadow-sm" onClick={() => handleSaveContest(false)} disabled={isSubmitting}>
                                        {isSubmitting ? "저장 중..." : "임시저장"}
                                    </Button>
                                    <Button size="lg" className="w-full md:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20" onClick={() => setStep(2)}>
                                        다음: 영상 가이드 작성 <ChevronRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <Card className="border shadow-sm rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50 border-b px-6 py-4">
                                        <h2 className="text-lg font-bold text-slate-900">영상 제작 가이드라인</h2>
                                    </div>
                                    <CardContent className="p-6 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-slate-700">권장 영상 길이</Label>
                                                <select
                                                    value={videoLength}
                                                    onChange={(e) => setVideoLength(e.target.value)}
                                                    className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option>15초 내외</option>
                                                    <option>30초 내외</option>
                                                    <option>45초 내외</option>
                                                    <option>60초 내외</option>
                                                    <option>무관</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-slate-700">영상 규격 (비율)</Label>
                                                <select
                                                    value={videoRatio}
                                                    onChange={(e) => setVideoRatio(e.target.value)}
                                                    className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option>9:16 세로형 (숏폼 최적화)</option>
                                                    <option>16:9 가로형</option>
                                                    <option>1:1 정방형</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-slate-700">해상도</Label>
                                                <select
                                                    value={videoResolution}
                                                    onChange={(e) => setVideoResolution(e.target.value)}
                                                    className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option>1080p 이상</option>
                                                    <option>2K 이상</option>
                                                    <option>4K 전용</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-slate-700 flex justify-between">
                                                    제품 소구점 (강조점)
                                                    <span className="text-xs text-muted-foreground">엔터(줄바꿈)로 구분해서 여러 줄 작성</span>
                                                </Label>
                                                <Textarea
                                                    placeholder="- 비누향+코튼향 조합의 극강의 살냄새 향&#13;&#10;- 지속력 24시간 테스트 완료"
                                                    value={sellingPoints}
                                                    onChange={e => setSellingPoints(e.target.value)}
                                                    className="min-h-[120px] bg-slate-50 border-dashed resize-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-slate-700 flex justify-between">
                                                    필수 포함 컷 (장면)
                                                    <span className="text-xs text-muted-foreground">엔터(줄바꿈)로 구분해서 여러 줄 작성</span>
                                                </Label>
                                                <Textarea
                                                    placeholder="- 입고 있는 옷에 뿌리는 컷&#13;&#10;- 제형이 보이도록 펌핑하는 컷"
                                                    value={requiredCuts}
                                                    onChange={e => setRequiredCuts(e.target.value)}
                                                    className="min-h-[120px] bg-slate-50 border-dashed resize-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-red-600 flex justify-between">
                                                    절대 금지 사항 / 주의 사항
                                                    <span className="text-xs text-red-500/80">크리에이터 필수 체크 항목 (줄바꿈 구분)</span>
                                                </Label>
                                                <Textarea
                                                    placeholder="- 타사 향수 브랜드 언급 절대 금지&#13;&#10;- 과대광고(의료/시술) 직간접적 용어 사용 금지"
                                                    value={forbiddenRules}
                                                    onChange={e => setForbiddenRules(e.target.value)}
                                                    className="min-h-[120px] bg-red-50/50 border-red-200 focus-visible:ring-red-500 resize-none"
                                                />
                                            </div>

                                            <div className="pt-6 border-t border-slate-100 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-sm font-semibold text-slate-700">최소 영상 유지 기간</Label>
                                                        <p className="text-xs text-muted-foreground">영상이 인스타그램/유튜브 등 SNS에 게시된 후 유지되어야 하는 최소 기간입니다.</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={maintenancePeriod}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                setMaintenancePeriod(val);
                                                                // 금지사항 문구 자동 업데이트 (ID 대신 실제 기간 반영)
                                                                const defaultWarning = `영상을 ${val}일 이내에 삭제할 경우 리워드가 환수될 수 있으며, 향후 플랫폼 참여가 제한됩니다.`;
                                                                if (forbiddenRules.includes("N일") || forbiddenRules.includes("일 이내에 삭제할 경우")) {
                                                                    setForbiddenRules(prev => prev.replace(/영상을 \d*N?일 이내에 삭제할 경우/, `영상을 ${val}일 이내에 삭제할 경우`));
                                                                }
                                                            }}
                                                            className="flex h-10 w-32 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-bold text-primary"
                                                        >
                                                            <option value={30}>30일 (1개월)</option>
                                                            <option value={60}>60일 (2개월)</option>
                                                            <option value={90}>90일 (3개월)</option>
                                                            <option value={180}>180일 (6개월)</option>
                                                            <option value={365}>365일 (1년)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                                    <p className="text-[11px] text-amber-700 leading-relaxed">
                                                        <strong>* 베타 테스트 안내:</strong> 영상 유지 기간의 절반이 지나기 전까지는 리워드 출금이 제한되는 정책을 준비 중입니다. 현재는 안내 문구만 크리에이터에게 노출됩니다.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" size="lg" className="h-12 px-8 text-base shadow-sm shrink-0" onClick={() => setStep(1)}>
                                        <ArrowLeft className="mr-2 w-5 h-5" /> 이전
                                    </Button>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Button variant="outline" size="lg" className="hidden md:flex flex-1 md:flex-none h-12 px-8 text-base shadow-sm" onClick={() => handleSaveContest(false)} disabled={isSubmitting}>
                                            {isSubmitting ? "저장 중..." : "임시저장"}
                                        </Button>
                                        <Button size="lg" className="flex-1 md:flex-none h-12 px-8 text-base shadow-lg shadow-primary/20" onClick={() => setStep(3)}>
                                            다음: 최종 검토 구역 <ChevronRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <Card className="border shadow-sm rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50 border-b px-6 py-4 flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-900">리워드 & 예산 설정</h2>
                                    </div>
                                    <CardContent className="p-6 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                                    목표 선발 인원
                                                    <span className="text-xs text-muted-foreground font-normal">명</span>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={targetCount} onChange={(e) => setTargetCount(Number(e.target.value))}
                                                    className="h-12 font-mono text-lg text-right pr-4"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                                                    참여자 전원 기본 리워드
                                                    <span className="text-xs text-muted-foreground font-normal">원</span>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={baseReward} onChange={(e) => setBaseReward(Number(e.target.value))}
                                                    className="h-12 font-mono text-lg text-right pr-4"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-dashed">
                                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Trophy className="w-4 h-4 text-primary" /> 순위별 우승 상금
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 font-bold text-yellow-500 flex items-center gap-1">
                                                        <span className="text-lg">🥇</span> 1등상
                                                    </div>
                                                    <div className="flex-1">
                                                        <Input type="number" value={rank1Reward} onChange={(e) => setRank1Reward(Number(e.target.value))} className="h-10 text-right font-mono" placeholder="상금액 (원)" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input type="number" value={rank1Count} onChange={(e) => setRank1Count(Math.max(0, Number(e.target.value)))} className="h-10 w-16 text-center" min={0} />
                                                        <span className="text-sm font-medium text-slate-500">명</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 font-bold text-slate-400 flex items-center gap-1">
                                                        <span className="text-lg">🥈</span> 2등상
                                                    </div>
                                                    <div className="flex-1">
                                                        <Input type="number" value={rank2Reward} onChange={(e) => setRank2Reward(Number(e.target.value))} className="h-10 text-right font-mono" placeholder="상금액 (원)" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input type="number" value={rank2Count} onChange={(e) => setRank2Count(Math.max(0, Number(e.target.value)))} className="h-10 w-16 text-center" min={0} />
                                                        <span className="text-sm font-medium text-slate-500">명</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 font-bold text-amber-600 flex items-center gap-1">
                                                        <span className="text-lg">🥉</span> 3등상
                                                    </div>
                                                    <div className="flex-1">
                                                        <Input type="number" value={rank3Reward} onChange={(e) => setRank3Reward(Number(e.target.value))} className="h-10 text-right font-mono" placeholder="상금액 (원)" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input type="number" value={rank3Count} onChange={(e) => setRank3Count(Math.max(0, Number(e.target.value)))} className="h-10 w-16 text-center" min={0} />
                                                        <span className="text-sm font-medium text-slate-500">명</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="bg-slate-50 border-t px-6 py-4">
                                        <h2 className="text-lg font-bold text-slate-900 mb-2">최종 확인 및 결제 (Escrow)</h2>
                                        <p className="text-sm text-slate-500">목표 인원이 미달되더라도 예비인원을 위해 잔여 예치금은 환불되지 않습니다.</p>
                                    </div>
                                </Card>
                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" size="lg" className="h-12 px-8 text-base shrink-0" onClick={() => setStep(2)}>
                                        <ArrowLeft className="mr-2 w-5 h-5" /> 가이드 수정
                                    </Button>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Button variant="outline" size="lg" className="hidden md:flex flex-1 md:flex-none h-12 px-8 text-base shadow-sm" onClick={() => handleSaveContest(false)} disabled={isSubmitting}>
                                            {isSubmitting ? "저장 중..." : "임시저장"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Live Budget Sidebar (Sticky & Floating) */}
                    <div className="w-full lg:w-[340px] shrink-0">
                        <div className="sticky top-20 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-6 overflow-hidden relative">
                            {/* Accent Top Border */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-purple-500" />

                            <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border text-sm">💰</div>
                                예상 결제 금액
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span className="text-sm">기본 리워드 ({targetCount}명)</span>
                                    <span className="font-semibold text-slate-900">{budgetSummary.totalBase.toLocaleString()} <span className="text-xs font-normal">원</span></span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span className="text-sm">순위 우승 상금 (총 {budgetSummary.totalRankWinners}명)</span>
                                    <span className="font-semibold text-slate-900">{budgetSummary.totalRank.toLocaleString()} <span className="text-xs font-normal">원</span></span>
                                </div>

                                <div className="border-t border-slate-100 pt-4 mt-2"></div>

                                <div className="flex justify-between items-center text-slate-500 text-sm">
                                    <span>순수 상금 총액</span>
                                    <span className="font-medium text-slate-700">{budgetSummary.pureBudget.toLocaleString()} <span className="text-xs">원</span></span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 text-sm">
                                    <span>수수료 (5%)</span>
                                    <span>{budgetSummary.platformFee.toLocaleString()} <span className="text-xs">원</span></span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 text-sm">
                                    <span>부가세 (10%)</span>
                                    <span>{budgetSummary.vat.toLocaleString()} <span className="text-xs">원</span></span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-sm font-bold text-slate-900">최종 에스크로 결제</span>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-primary tracking-tight">{budgetSummary.totalAmount.toLocaleString()} <span className="text-sm font-semibold">원</span></div>
                                    </div>
                                </div>

                                {step === 3 ? (
                                    <Button
                                        onClick={() => handleSaveContest(true)}
                                        disabled={isSubmitting}
                                        className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 transition-all"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        {isSubmitting ? "처리 중..." : "결제 및 콘테스트 발행"}
                                    </Button>
                                ) : (
                                    <Button variant="secondary" className="w-full h-12 text-sm font-medium bg-slate-100 text-slate-500 hover:bg-slate-100 cursor-default">
                                        결제 단계는 STEP 3에서 진행됩니다
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Load Modal */}
            <Dialog open={isProductLoadModalOpen} onOpenChange={setIsProductLoadModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>내 제품 불러오기</DialogTitle>
                        <DialogDescription>
                            이전에 등록한 브랜드 제품 정보를 선택하여 콘테스트 내용에 빠르게 채울 수 있습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {brandProducts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">등록된 브랜드 제품이 없습니다.</p>
                                <p className="text-xs mt-1">캠페인 생성 시 제품 정보를 함께 저장하면<br />다음부터 쉽게 불러올 수 있습니다.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {brandProducts.map(product => {
                                    const productImage = product.image || (product as any).image_url;
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => handleSelectProduct(product)}
                                            className="flex items-center gap-4 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors group"
                                        >
                                            <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-xl overflow-hidden shrink-0 border border-slate-200/50 group-hover:border-primary/20">
                                                {productImage && productImage !== "📦" ? (
                                                    <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    "📦"
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{product.name}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{product.category || '카테고리 없음'}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity px-2 h-8 text-xs bg-white border border-slate-200">
                                                선택
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* 에스크로 결제 확인 모달 */}
            <Dialog open={isEscrowModalOpen} onOpenChange={(open) => !open && setIsEscrowModalOpen(false)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            콘테스트 발행 및 에스크로 결제
                        </DialogTitle>
                        <DialogDescription>
                            상금이 안전하게 보호되도록 크레딧으로 미리 예치합니다. 크리에이터들이 신뢰하고 참여할 수 있습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {/* 예치금 내역 */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm border border-slate-100">
                            <div className="flex justify-between text-slate-600">
                                <span>기본 참가 보상 ({targetCount}명 × {baseReward.toLocaleString()}원)</span>
                                <span className="font-semibold">{budgetSummary.totalBase.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>수상 상금 (1/2/3등 합계)</span>
                                <span className="font-semibold">{budgetSummary.totalRank.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-xs">
                                <span>플랫폼 수수료 (5%)</span>
                                <span>{budgetSummary.platformFee.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-xs">
                                <span>VAT (10%)</span>
                                <span>{budgetSummary.vat.toLocaleString()}원</span>
                            </div>
                            <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900">
                                <span>총 예치금</span>
                                <span className="text-primary">{budgetSummary.totalAmount.toLocaleString()}원</span>
                            </div>
                        </div>

                        {/* 크레딧 잔액 */}
                        <div className={`rounded-xl p-4 border text-sm ${creditBalance !== null && creditBalance < budgetSummary.totalAmount ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                            <div className="flex justify-between font-semibold">
                                <span>현재 크레딧 잔액</span>
                                <span>{creditBalance !== null ? `${creditBalance.toLocaleString()}원` : '조회 중...'}</span>
                            </div>
                            {creditBalance !== null && creditBalance < budgetSummary.totalAmount && (
                                <p className="text-xs mt-1 text-red-600 font-medium">
                                    ⚠️ 크레딧이 {(budgetSummary.totalAmount - creditBalance).toLocaleString()}원 부족합니다. 관리자에게 충전을 요청해주세요.
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsEscrowModalOpen(false)} disabled={isPublishing}>
                            취소
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={isPublishing || (creditBalance !== null && creditBalance < budgetSummary.totalAmount)}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isPublishing ? '결제 중...' : `${budgetSummary.totalAmount.toLocaleString()}원 결제하고 발행`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
