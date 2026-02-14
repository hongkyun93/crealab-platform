"use strict";
"use client";

import React, { useState } from "react";
import {
    BadgeCheck, Calendar, Check, ChevronRight, Clock, DollarSign,
    FileText, Gift, Info, MessageSquare, Package, Send, Shield, User, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Mock Data ---
const mockProposal = {
    id: "prop_123",
    brand: "Voive",
    brandAvatar: "V",
    product: "Home Fragrance Diffuser",
    compensation: "200,000 KRW",
    status: "negotiating",
    message: "We love your aesthetic! We'd like to propose a collaboration for our new home fragrance line.",
    conditions: {
        draft: "2024-03-20",
        final: "2024-03-25",
        upload: "2024-03-30"
    }
};

// --- Reusable Components for Designs ---

function StatusBadge({ status, variant = "default" }: { status: string, variant?: string }) {
    if (variant === "minimal") {
        return <span className="text-xs font-medium text-emerald-600">● Negotiating</span>;
    }
    return (
        <Badge className="bg-emerald-100 text-emerald-700 border-0 hover:bg-emerald-200">
            Negotiating
        </Badge>
    );
}

// --- Design Variations ---

// 1. Minimalist Clean
const DesignMinimalist = () => (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm max-w-2xl mx-auto font-sans">
        <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4">
                <Avatar className="h-12 w-12 bg-slate-50 border border-slate-100 text-slate-400">
                    <AvatarFallback>V</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold text-lg text-slate-900">{mockProposal.brand}</h3>
                    <p className="text-sm text-slate-500">{mockProposal.product}</p>
                </div>
            </div>
            <Badge variant="outline" className="text-slate-500 border-slate-200 font-normal">
                Negotiating
            </Badge>
        </div>

        <div className="space-y-6">
            <section>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Compensation</h4>
                <div className="flex items-center gap-2 text-slate-700">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{mockProposal.compensation}</span>
                </div>
            </section>

            <section>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Schedule</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-slate-400 block text-xs mb-1">Draft</span>
                        <span className="text-slate-700">{mockProposal.conditions.draft}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-xs mb-1">Final</span>
                        <span className="text-slate-700">{mockProposal.conditions.final}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-xs mb-1">Upload</span>
                        <span className="text-slate-700">{mockProposal.conditions.upload}</span>
                    </div>
                </div>
            </section>

            <div className="pt-4 flex gap-3">
                <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800 h-10 rounded-lg">Accept Proposal</Button>
                <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 h-10 rounded-lg">Discuss</Button>
            </div>
        </div>
    </div>
);

// 2. Soft Gray (Rounded & Gentle)
const DesignSoftGray = () => (
    <div className="bg-slate-50 p-6 rounded-[2rem] max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm font-bold">V</div>
                <span className="font-bold text-slate-700">{mockProposal.brand}</span>
            </div>
            <div className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-emerald-600 shadow-sm">
                Negotiating
            </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm mb-4">
            <h3 className="font-bold text-lg text-slate-800 mb-1">{mockProposal.product}</h3>
            <p className="text-slate-500 text-sm mb-4">Proposed Compensation: <span className="text-emerald-600 font-bold">{mockProposal.compensation}</span></p>

            <div className="flex flex-wrap gap-2">
                {Object.entries(mockProposal.conditions).map(([key, val]) => (
                    <span key={key} className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                        {key.charAt(0).toUpperCase() + key.slice(1)}: {val}
                    </span>
                ))}
            </div>
        </div>

        <div className="flex gap-3">
            <Button className="flex-1 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm border-0">Accept</Button>
            <Button variant="ghost" className="flex-1 rounded-2xl text-slate-500 hover:bg-white/50">Details</Button>
        </div>
    </div>
);

// 3. Modern Card (Floating)
const DesignModernCard = () => (
    <div className="bg-gray-100 p-8 flex justify-center">
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 w-full max-w-2xl border border-gray-100">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{mockProposal.product}</h2>
                    <p className="text-sm text-gray-500 mt-1">Collab with {mockProposal.brand}</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgb(16,185,129,0.5)]"></div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Offer</label>
                    <div className="text-lg font-bold text-gray-800 mt-1">{mockProposal.compensation}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Upload Date</label>
                    <div className="text-lg font-bold text-gray-800 mt-1">{mockProposal.conditions.upload}</div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="outline" className="border-gray-200">Decline</Button>
                <Button className="bg-gray-900 text-white">Accept Offer</Button>
            </div>
        </div>
    </div>
);

// 4. Borderless (Airy)
const DesignBorderless = () => (
    <div className="bg-white p-8 max-w-2xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-light text-slate-800 mb-2">{mockProposal.brand}</h1>
            <p className="text-slate-400 font-light text-lg">invites you to collaborate on {mockProposal.product}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
                <h4 className="font-semibold text-emerald-600 mb-2">Compensation</h4>
                <p className="text-2xl text-slate-800 font-light">{mockProposal.compensation}</p>
            </div>
            <div>
                <h4 className="font-semibold text-emerald-600 mb-2">Timeline</h4>
                <ul className="space-y-1 text-slate-600 font-light">
                    <li>Draft by {mockProposal.conditions.draft}</li>
                    <li>Final by {mockProposal.conditions.final}</li>
                    <li>Live by {mockProposal.conditions.upload}</li>
                </ul>
            </div>
        </div>

        <div className="flex gap-6">
            <button className="text-emerald-600 font-medium hover:underline decoration-2 underline-offset-4">Accept Proposal</button>
            <button className="text-slate-400 font-medium hover:text-slate-600 transition-colors">Review Terms</button>
        </div>
    </div>
);

// 5. Linear (Horizontal Rhythm)
const DesignLinear = () => (
    <div className="bg-white max-w-2xl mx-auto border border-slate-200 rounded-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="font-medium text-slate-700">{mockProposal.brand}</span>
            <span className="text-xs text-slate-400 font-mono">ID: {mockProposal.id}</span>
        </div>
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <span className="text-slate-500">Product</span>
                <span className="font-medium text-slate-900">{mockProposal.product}</span>
            </div>
            <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <span className="text-slate-500">Offer</span>
                <span className="font-medium text-slate-900">{mockProposal.compensation}</span>
            </div>
            <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <span className="text-slate-500">Due Date</span>
                <span className="font-medium text-slate-900">{mockProposal.conditions.upload}</span>
            </div>
            <div className="pt-2 text-right">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Confirm</Button>
            </div>
        </div>
    </div>
);

// 6. Pastel Accent (Soft Colors)
const DesignPastelAccent = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 max-w-2xl mx-auto">
        <div className="bg-indigo-50/50 p-6 flex items-start gap-4">
            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                <Gift className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-indigo-900 mb-1">Collaboration Offer</h3>
                <p className="text-indigo-700/80 text-sm">Review the details from {mockProposal.brand}</p>
            </div>
        </div>
        <div className="p-6">
            <div className="bg-orange-50/50 rounded-xl p-4 mb-4 border border-orange-100/50">
                <div className="flex gap-2 items-center text-orange-800 font-medium text-sm mb-1">
                    <Clock className="w-4 h-4" /> Schedule
                </div>
                <div className="text-orange-900/70 text-sm pl-6">
                    Upload by {mockProposal.conditions.upload}
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 border-0 shadow-lg shadow-indigo-200">Let's do this</Button>
                <Button variant="ghost" className="flex-1 text-slate-500">Maybe later</Button>
            </div>
        </div>
    </div>
);

// 7. Compact (Dense Info)
const DesignCompact = () => (
    <div className="bg-white border border-slate-200 rounded max-w-2xl mx-auto text-sm">
        <div className="grid grid-cols-[1fr_auto] gap-4 p-3 border-b border-slate-100 bg-slate-50 items-center">
            <div className="font-bold text-slate-800">{mockProposal.product}</div>
            <Badge variant="secondary" className="text-[10px] h-5">Negotiating</Badge>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="p-3 space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Brand</span> <span>{mockProposal.brand}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Pay</span> <span className="font-medium">{mockProposal.compensation}</span></div>
            </div>
            <div className="p-3 space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Draft</span> <span>{mockProposal.conditions.draft}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Upload</span> <span>{mockProposal.conditions.upload}</span></div>
            </div>
        </div>
        <div className="p-2 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs">Reject</Button>
            <Button size="sm" className="h-7 text-xs bg-slate-900 text-white">Accept</Button>
        </div>
    </div>
);

// 8. Focused (Active Highlight)
const DesignFocused = () => (
    <div className="bg-white max-w-2xl mx-auto rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex">
            <div className="w-1.5 bg-blue-500"></div>
            <div className="p-5 flex-1">
                <h3 className="font-bold text-slate-800 mb-2">Requires Action: Proposal Review</h3>
                <p className="text-slate-500 text-sm mb-4">
                    {mockProposal.brand} has sent a proposal for <strong className="text-slate-700">{mockProposal.product}</strong>.
                </p>

                <div className="flex items-center gap-4 bg-blue-50 p-3 rounded-md border border-blue-100">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-blue-900">Step 1: Confirm Terms</h4>
                        <p className="text-xs text-blue-700">Check price ({mockProposal.compensation}) and dates.</p>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Review</Button>
                </div>

                <div className="flex items-center gap-4 p-3 opacity-50">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">2</div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-500">Step 2: Sign Contract</h4>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// 9. Glassmorphism (Premium)
const DesignGlassmorphism = () => (
    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-8 rounded-xl max-w-2xl mx-auto flex justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl w-full text-white">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold">{mockProposal.brand}</h2>
                    <p className="text-white/70 text-sm">Platinum Partner</p>
                </div>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">VIP Offer</Badge>
            </div>

            <div className="space-y-4 mb-8">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <label className="text-xs text-indigo-100 block mb-1">Product</label>
                    <div className="font-medium">{mockProposal.product}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <label className="text-xs text-indigo-100 block mb-1">Offer</label>
                    <div className="font-medium text-xl">{mockProposal.compensation}</div>
                </div>
            </div>

            <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 font-bold shadow-lg shadow-black/10">
                View Full Proposal
            </Button>
        </div>
    </div>
);

// 10. Warm Paper (Natural)
const DesignWarmPaper = () => (
    <div className="bg-[#FAF9F6] p-6 rounded-lg max-w-2xl mx-auto border border-stone-200 shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-300 to-stone-200"></div>

        <div className="font-serif text-2xl text-stone-800 mb-2 italic">{mockProposal.brand}</div>
        <div className="w-8 h-0.5 bg-stone-300 mb-6"></div>

        <p className="text-stone-600 mb-6 leading-relaxed">
            Dear Creator,<br />
            We are pleased to invite you to join our campaign for <strong>{mockProposal.product}</strong>.
        </p>

        <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-center p-4 border border-stone-200 rounded bg-white">
                <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Fee</div>
                <div className="text-lg font-serif text-stone-800">{mockProposal.compensation}</div>
            </div>
            <div className="text-center p-4 border border-stone-200 rounded bg-white">
                <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Deadline</div>
                <div className="text-lg font-serif text-stone-800">{mockProposal.conditions.upload}</div>
            </div>
        </div>

        <div className="flex justify-center">
            <Button variant="outline" className="border-stone-400 text-stone-700 hover:bg-stone-100 min-w-[140px]">
                Read More
            </Button>
        </div>
    </div>
);

// 11. Kanban Board (A, B, C Columns)
const DesignKanban = () => {
    const kanbanData = {
        upcoming: [
            {
                id: "k1",
                brand: "Voive",
                product: "Home Fragrance Diffuser",
                compensation: "200,000 KRW",
                status: "Contract Signing",
                dueDate: "2024-03-25",
                avatar: "V",
                priority: "high"
            }
        ],
        inProgress: [
            {
                id: "k2",
                brand: "Urban Lifestyle",
                product: "Minimalist Backpack",
                compensation: "350,000 KRW",
                status: "Content Creation",
                dueDate: "2024-03-20",
                avatar: "U",
                priority: "medium"
            },
            {
                id: "k3",
                brand: "Green Tea Co.",
                product: "Organic Tea Set",
                compensation: "180,000 KRW",
                status: "Product Received",
                dueDate: "2024-03-28",
                avatar: "G",
                priority: "low"
            }
        ],
        completed: [
            {
                id: "k4",
                brand: "Sneaker Lab",
                product: "Limited Edition Sneakers",
                compensation: "500,000 KRW",
                status: "Approved",
                dueDate: "2024-03-15",
                avatar: "S",
                priority: "high"
            }
        ]
    };

    const KanbanCard = ({ project }: { project: any }) => (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-move group">
            <div className="flex items-start gap-3 mb-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ${project.priority === 'high' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : project.priority === 'medium' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                    {project.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{project.brand}</h4>
                    <p className="text-xs text-slate-500 truncate">{project.product}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${project.priority === 'high' ? 'border-red-200 text-red-600 bg-red-50' : project.priority === 'medium' ? 'border-orange-200 text-orange-600 bg-orange-50' : 'border-green-200 text-green-600 bg-green-50'}`}>
                    {project.priority.toUpperCase()}
                </Badge>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <DollarSign className="w-3 h-3" />
                    <span className="font-medium">{project.compensation}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3 h-3" />
                    <span>{project.dueDate}</span>
                </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">{project.status}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">협업 프로젝트 보드</h3>
                <p className="text-sm text-slate-600">진행 상태별로 프로젝트를 관리하세요</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column A: Upcoming */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-3 w-3 rounded-full bg-purple-500 shadow-lg shadow-purple-200"></div>
                        <h4 className="font-bold text-slate-800">A. 진행 예정</h4>
                        <Badge variant="secondary" className="ml-auto text-xs h-5">{kanbanData.upcoming.length}</Badge>
                    </div>
                    <div className="space-y-3 min-h-[200px] bg-purple-50/30 rounded-xl p-3 border-2 border-dashed border-purple-200">
                        {kanbanData.upcoming.map(project => (
                            <KanbanCard key={project.id} project={project} />
                        ))}
                        <div className="flex items-center justify-center h-12 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-purple-300 hover:text-purple-500 transition-colors cursor-pointer">
                            <span className="text-sm font-medium">+ 새 프로젝트</span>
                        </div>
                    </div>
                </div>

                {/* Column B: In Progress */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-3 w-3 rounded-full bg-blue-500 shadow-lg shadow-blue-200"></div>
                        <h4 className="font-bold text-slate-800">B. 작업 중</h4>
                        <Badge variant="secondary" className="ml-auto text-xs h-5">{kanbanData.inProgress.length}</Badge>
                    </div>
                    <div className="space-y-3 min-h-[200px] bg-blue-50/30 rounded-xl p-3 border-2 border-dashed border-blue-200">
                        {kanbanData.inProgress.map(project => (
                            <KanbanCard key={project.id} project={project} />
                        ))}
                    </div>
                </div>

                {/* Column C: Completed */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></div>
                        <h4 className="font-bold text-slate-800">C. 완료</h4>
                        <Badge variant="secondary" className="ml-auto text-xs h-5">{kanbanData.completed.length}</Badge>
                    </div>
                    <div className="space-y-3 min-h-[200px] bg-emerald-50/30 rounded-xl p-3 border-2 border-dashed border-emerald-200">
                        {kanbanData.completed.map(project => (
                            <KanbanCard key={project.id} project={project} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function WorkspaceDesigns() {
    const [activeTab, setActiveTab] = useState("all");

    const designs = [
        { id: "minimalist", name: "1. Minimalist Clean", component: DesignMinimalist },
        { id: "softgray", name: "2. Soft Gray", component: DesignSoftGray },
        { id: "moderncard", name: "3. Modern Card", component: DesignModernCard },
        { id: "borderless", name: "4. Borderless", component: DesignBorderless },
        { id: "linear", name: "5. Linear", component: DesignLinear },
        { id: "pastel", name: "6. Pastel Accent", component: DesignPastelAccent },
        { id: "compact", name: "7. Compact", component: DesignCompact },
        { id: "focused", name: "8. Focused", component: DesignFocused },
        { id: "glass", name: "9. Glassmorphism", component: DesignGlassmorphism },
        { id: "warm", name: "10. Warm Paper", component: DesignWarmPaper },
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Workspace Design Variations</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Exploring calmer, more refined layouts for the collaboration workspace.
                    </p>
                </div>

                <Tabs defaultValue="all" className="space-y-8">
                    <TabsList className="flex flex-wrap h-auto justify-center gap-2 bg-transparent p-0">
                        <TabsTrigger value="all" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white bg-white border border-slate-200">All Designs</TabsTrigger>
                        {designs.map(d => (
                            <TabsTrigger key={d.id} value={d.id} className="data-[state=active]:bg-slate-900 data-[state=active]:text-white bg-white border border-slate-200">{d.name}</TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="all" className="space-y-12">
                        {designs.map((design, index) => (
                            <section key={design.id} className="space-y-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <Badge variant="outline" className="bg-slate-900 text-white border-0 h-6 w-6 flex items-center justify-center rounded-full text-xs p-0 shadow-md">
                                        {index + 1}
                                    </Badge>
                                    <h2 className="text-xl font-bold text-slate-800">{design.name.split('. ')[1]}</h2>
                                </div>
                                <div className="p-8 border border-slate-200 rounded-xl bg-slate-100/50">
                                    <design.component />
                                </div>
                                <Separator className="my-12 opacity-50" />
                            </section>
                        ))}
                    </TabsContent>

                    {designs.map(design => (
                        <TabsContent key={design.id} value={design.id} className="min-h-[60vh] flex flex-col items-center justify-center p-8 border border-slate-200 rounded-xl bg-slate-100/50">
                            <div className="w-full">
                                <design.component />
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}
