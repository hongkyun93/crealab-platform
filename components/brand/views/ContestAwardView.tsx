import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, AlertTriangle, CheckCircle } from "lucide-react"

interface ContestAwardViewProps {
    onNavigate: (view: string) => void;
}

export function ContestAwardView({ onNavigate }: ContestAwardViewProps) {
    const [selectedRank1, setSelectedRank1] = useState<string | null>(null);
    const [selectedRank2, setSelectedRank2] = useState<string | null>(null);
    const [selectedRank3, setSelectedRank3] = useState<string[]>([]);

    // Mock candidates who finished the contest (video approved)
    const candidates = [
        { id: '1', name: '뷰티유튜버 A', videoUrl: '#' },
        { id: '2', name: '트렌드세터 B', videoUrl: '#' },
        { id: '3', name: '크리에이터 C', videoUrl: '#' },
        { id: '4', name: '숏폼장인 D', videoUrl: '#' },
        { id: '5', name: '인플루언서 E', videoUrl: '#' },
    ];

    const canFinalize = selectedRank1 && selectedRank2 && selectedRank3.length === 3; // Example rules: 1st, 2nd, and 3x 3rd

    return (
        <div className="flex-1 overflow-y-auto w-full bg-slate-50/50">
            <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            최종 시상식 (Award Center)
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            모든 영상이 승인되었습니다. 약속한 상금을 지급할 우승 대상을 지정해주세요.
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900">
                        <strong className="block mb-1">시상 지정은 필수입니다. (거부 불가)</strong>
                        목표 인원에 맞춰 각 등수별 당선자를 모두 지정해야 에스크로 정산이 완료되고 콘테스트가 종료됩니다.
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Rank 1 */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                            <span className="text-3xl">🥇</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">1등상 (1명)</h3>
                        <p className="text-sm text-muted-foreground mb-4">상금 1,000,000원</p>
                        <select
                            className="w-full h-10 border rounded-md px-3 text-sm focus:ring-2 focus:ring-primary"
                            value={selectedRank1 || ''}
                            onChange={(e) => setSelectedRank1(e.target.value)}
                        >
                            <option value="">우승자를 선택하세요</option>
                            {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Rank 2 */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <span className="text-3xl">🥈</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">2등상 (1명)</h3>
                        <p className="text-sm text-muted-foreground mb-4">상금 500,000원</p>
                        <select
                            className="w-full h-10 border rounded-md px-3 text-sm focus:ring-2 focus:ring-primary"
                            value={selectedRank2 || ''}
                            onChange={(e) => setSelectedRank2(e.target.value)}
                        >
                            <option value="">우승자를 선택하세요</option>
                            {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Rank 3 */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                            <span className="text-3xl">🥉</span>
                        </div>
                        <h3 className="font-bold text-lg mb-1">3등상 (3명)</h3>
                        <p className="text-sm text-muted-foreground mb-4">상금 각 200,000원</p>
                        <div className="w-full space-y-2">
                            {[0, 1, 2].map(idx => (
                                <select
                                    key={idx}
                                    className="w-full h-10 border rounded-md px-3 text-sm focus:ring-2 focus:ring-primary"
                                    value={selectedRank3[idx] || ''}
                                    onChange={(e) => {
                                        const newArr = [...selectedRank3];
                                        newArr[idx] = e.target.value;
                                        setSelectedRank3(newArr);
                                    }}
                                >
                                    <option value="">우승자를 선택하세요</option>
                                    {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t mt-8">
                    <Button
                        size="lg"
                        className="h-12 px-8 text-base"
                        disabled={!canFinalize}
                        onClick={() => onNavigate('ad-contests')}
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        시상 확정 및 정산 실행
                    </Button>
                </div>
            </div>
        </div>
    )
}
