
import React from 'react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { MobileTabs } from './mobile-tabs';
import { CreatorInfoPanel } from './info-panel';
import { ChatArea } from '../common/chat-area';
import { ProgressBar } from '../common/progress-bar';
import { CreatorDesktopLayout } from './desktop-layout';

interface CreatorWorkspaceLayoutProps {
    className?: string;
}

export function CreatorWorkspaceLayout({ className }: CreatorWorkspaceLayoutProps) {
    return (
        <>
            <div className={cn("md:hidden flex flex-col h-full w-full", className)}>
                <CreatorMobileLayout />
            </div>
            <div className={cn("hidden md:flex h-full w-full items-center justify-center", className)}>
                <CreatorDesktopLayout />
            </div>
        </>
    );
}

function CreatorMobileLayout() {
    const activeMobileTab = useWorkspaceStore((state) => state.activeMobileTab);
    const proposal = useWorkspaceStore((state) => state.proposal);

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden relative">
            {/* 1. Mobile Top Bar - Simplified */}
            <div className="shrink-0 px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 overflow-hidden">
                            {(proposal?.brandAvatar || proposal?.brand_avatar) ? (
                                <img src={proposal.brandAvatar || proposal.brand_avatar} alt="Brand" className="w-full h-full object-cover" />
                            ) : (
                                (proposal?.brand_name?.[0] || proposal?.brandName?.[0] || 'B')
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold leading-none">{proposal?.brand_name || proposal?.brandName || 'Brand Name'}</h2>
                            <span className="text-[10px] text-muted-foreground">{proposal?.product_name || proposal?.productName || proposal?.campaignName}</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 px-2 py-1 bg-indigo-50 rounded-full">
                        조건 협의 중
                    </span>
                </div>
                {/* Simplified Progress Bar for Mobile */}
                <div className="px-2">
                    <ProgressBar />
                </div>
            </div>

            {/* 2. Main Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* CONTENT: Chat Tab */}
                <div className={cn(
                    "absolute inset-0 w-full h-full transition-transform duration-300 bg-background",
                    activeMobileTab === 'chat' ? 'translate-x-0' : '-translate-x-full'
                )}>
                    <ChatArea className="h-full pb-20" />
                    {/* pb-20 to avoid overlap with sticky bottom tabs/inputs */}
                </div>

                {/* CONTENT: Info Tab */}
                <div className={cn(
                    "absolute inset-0 w-full h-full transition-transform duration-300 bg-background overflow-y-auto pb-24",
                    activeMobileTab === 'info' ? 'translate-x-0' :
                        activeMobileTab === 'chat' ? 'translate-x-full' : '-translate-x-full'
                )}>
                    <div className="p-4">
                        <CreatorInfoPanel />
                    </div>
                </div>

                {/* CONTENT: Contract Tab */}
                <div className={cn(
                    "absolute inset-0 w-full h-full transition-transform duration-300 bg-background p-4 flex items-center justify-center text-muted-foreground",
                    activeMobileTab === 'contract' ? 'translate-x-0' : 'translate-x-full'
                )}>
                    계약서 미리보기 영역
                </div>

            </div>

            {/* 3. Bottom Navigation Tabs (Sticky) */}
            <MobileTabs />
        </div>
    );
}
