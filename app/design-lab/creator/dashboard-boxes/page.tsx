"use client"

import { Calendar, Megaphone, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function DashboardBoxesDesignLab() {
    // Mock Data
    const activeMoments = [1, 2]
    const myMoments = [1]
    const pastMoments = [1]
    const outboundApplications = [1, 2, 3]
    const inboundProposals = [1]

    const Box = ({ title, icon: Icon, count, subtext, badgeColor, borderColor, className }: any) => (
        <div className={`h-[180px] flex flex-col justify-center items-center bg-card rounded-xl cursor-pointer transition-all group ${className}`}>
            <div className={`p-4 rounded-full mb-4 group-hover:scale-110 transition-transform ${badgeColor}`}>
                <Icon className="h-8 w-8" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-700">{title}</h3>
                    <Badge variant="outline" className="text-slate-500 border-slate-300 text-md px-2 py-0.5">
                        {count}건
                    </Badge>
                </div>
                <div className="text-xs text-slate-400 text-center">{subtext}</div>
            </div>
        </div>
    )

    return (
        <div className="p-10 space-y-12 bg-background min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Dashboard Archive Box Designs</h1>

            {/* Design A: Pastel Solid Border */}
            <section>
                <h2 className="text-xl font-bold mb-4">Option A: Solid Pastel Borders (Thicker)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Box
                        title="내 모먼트 아카이브" icon={Calendar} count={4}
                        subtext={<>나의 모먼트 <span className="text-emerald-600 font-bold">2건</span> / 지난 모먼트 1건</>}
                        badgeColor="bg-emerald-100/50 text-emerald-600"
                        className="border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md"
                    />
                    <Box
                        title="내 캠페인 아카이브" icon={Megaphone} count={3} subtext="나의 지원 현황"
                        badgeColor="bg-blue-100/50 text-blue-600"
                        className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-md"
                    />
                    <Box
                        title="받은 제안 아카이브" icon={Bell} count={1} subtext="브랜드 직접 제안"
                        badgeColor="bg-purple-100/50 text-purple-600"
                        className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-md"
                    />
                </div>
            </section>

            {/* Design B: Gradient Border */}
            <section>
                <h2 className="text-xl font-bold mb-4">Option B: Gradient Borders</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-[2px] rounded-xl bg-gradient-to-br from-emerald-200 to-teal-100 hover:from-emerald-400 hover:to-teal-300 transition-all shadow-sm hover:shadow-md">
                        <Box
                            title="내 모먼트 아카이브" icon={Calendar} count={4}
                            subtext={<>나의 모먼트 <span className="text-emerald-600 font-bold">2건</span> / 지난 모먼트 1건</>}
                            badgeColor="bg-emerald-50 text-emerald-600"
                            className="h-full border-0"
                        />
                    </div>
                    <div className="p-[2px] rounded-xl bg-gradient-to-br from-blue-200 to-indigo-100 hover:from-blue-400 hover:to-indigo-300 transition-all shadow-sm hover:shadow-md">
                        <Box
                            title="내 캠페인 아카이브" icon={Megaphone} count={3} subtext="나의 지원 현황"
                            badgeColor="bg-blue-50 text-blue-600"
                            className="h-full border-0"
                        />
                    </div>
                    <div className="p-[2px] rounded-xl bg-gradient-to-br from-purple-200 to-pink-100 hover:from-purple-400 hover:to-pink-300 transition-all shadow-sm hover:shadow-md">
                        <Box
                            title="받은 제안 아카이브" icon={Bell} count={1} subtext="브랜드 직접 제안"
                            badgeColor="bg-purple-50 text-purple-600"
                            className="h-full border-0"
                        />
                    </div>
                </div>
            </section>

            {/* Design C: Dashed/Dotted Border */}
            <section>
                <h2 className="text-xl font-bold mb-4">Option C: Dashed Borders (Archive Feel)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Box
                        title="내 모먼트 아카이브" icon={Calendar} count={4}
                        subtext={<>나의 모먼트 <span className="text-emerald-600 font-bold">2건</span> / 지난 모먼트 1건</>}
                        badgeColor="bg-emerald-100/50 text-emerald-600"
                        className="border-2 border-dashed border-emerald-300/60 hover:border-emerald-500 hover:bg-emerald-50/10"
                    />
                    <Box
                        title="내 캠페인 아카이브" icon={Megaphone} count={3} subtext="나의 지원 현황"
                        badgeColor="bg-blue-100/50 text-blue-600"
                        className="border-2 border-dashed border-blue-300/60 hover:border-blue-500 hover:bg-blue-50/10"
                    />
                    <Box
                        title="받은 제안 아카이브" icon={Bell} count={1} subtext="브랜드 직접 제안"
                        badgeColor="bg-purple-100/50 text-purple-600"
                        className="border-2 border-dashed border-purple-300/60 hover:border-purple-500 hover:bg-purple-50/10"
                    />
                </div>
            </section>

            {/* Design D: Soft Glow / Shadow */}
            <section>
                <h2 className="text-xl font-bold mb-4">Option D: Colored Shadow / Glow</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Box
                        title="내 모먼트 아카이브" icon={Calendar} count={4}
                        subtext={<>나의 모먼트 <span className="text-emerald-600 font-bold">2건</span> / 지난 모먼트 1건</>}
                        badgeColor="bg-emerald-100/50 text-emerald-600"
                        className="border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.25)]"
                    />
                    <Box
                        title="내 캠페인 아카이브" icon={Megaphone} count={3} subtext="나의 지원 현황"
                        badgeColor="bg-blue-100/50 text-blue-600"
                        className="border border-blue-100 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.25)]"
                    />
                    <Box
                        title="받은 제안 아카이브" icon={Bell} count={1} subtext="브랜드 직접 제안"
                        badgeColor="bg-purple-100/50 text-purple-600"
                        className="border border-purple-100 shadow-[0_4px_20px_-4px_rgba(168,85,247,0.15)] hover:shadow-[0_8px_30px_-4px_rgba(168,85,247,0.25)]"
                    />
                </div>
            </section>

        </div>
    )
}
