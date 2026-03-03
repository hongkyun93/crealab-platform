"use client"

import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { cn } from '@/lib/utils';
import { ChatArea } from './chat-area';
import { FileSharePanel } from './file-share-panel';
import { VideoReviewPanel } from './VideoReviewPanel';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { DesktopLayout } from './desktop-layout';
import { MobileTabs } from '../common/mobile-tabs';
import { ProgressBar } from './progress-bar';
import { RealtimeWorkspaceSync } from './realtime-workspace-sync';
import { InfoPanel } from './info-panel';

interface WorkspaceLayoutProps {
    className?: string;
    userRole: 'brand' | 'creator';
}

export function WorkspaceLayout({ className, userRole }: WorkspaceLayoutProps) {
    return (
        <>
            <RealtimeWorkspaceSync />
            <div className={cn("md:hidden flex flex-col h-full w-full", className)}>
                <MobileLayout userRole={userRole} />
            </div>
            <div className={cn("hidden md:flex h-full w-full items-center justify-center", className)}>
                <DesktopLayout userRole={userRole} />
            </div>
        </>
    );
}

function MobileLayout({ userRole }: { userRole: 'brand' | 'creator' }) {
    const activeMobileTab = useWorkspaceStore((state) => state.activeMobileTab);
    const proposal = useWorkspaceStore((state) => state.proposal);

    const opponentAvatar = userRole === 'brand'
        ? (proposal?.creatorAvatar || (proposal as any)?.creator_avatar)
        : ((proposal?.brandAvatar || proposal?.brand_avatar));

    const opponentName = userRole === 'brand'
        ? (proposal?.creatorName || (proposal as any)?.creator_name || (proposal as any)?.influencer?.display_name || (proposal as any)?.influencer?.name || '크리에이터')
        : (proposal?.brand_name || proposal?.brandName || 'Brand Name');

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden relative">
            {/* 1. Mobile Top Bar - Simplified */}
            <div className="shrink-0 px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20 overflow-hidden">
                <div className="flex items-center justify-between w-full">
                    {/* 아바타 & 리드 정보 (좌측) */}
                    <div className="flex items-center gap-2 shrink-0 max-w-[30%] sm:max-w-[40%] mr-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden shrink-0">
                            {opponentAvatar ? (
                                <img src={opponentAvatar} alt="Opponent" className="w-full h-full object-cover" />
                            ) : (
                                opponentName[0] || (userRole === 'brand' ? 'C' : 'B')
                            )}
                        </div>
                        <div className="min-w-0" style={{ maxWidth: 'calc(100% - 2.5rem)' }}>
                            <h2 className="text-xs font-bold leading-tight truncate">{opponentName}</h2>
                            <span className="text-[10px] text-muted-foreground block truncate">{proposal?.target_name || '협업 프로젝트'}</span>
                        </div>
                    </div>

                    {/* 진행 상태바 (우측, 크기 축소) */}
                    <div className="flex-1 min-w-0 relative h-12 flex items-center justify-end overflow-hidden">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[115%] sm:w-[105%] flex items-center justify-end" style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}>
                            <ProgressBar />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* CONTENT: Content Tab */}
                <div className={cn(
                    "absolute inset-0 w-full h-full transition-transform duration-300 bg-background",
                    activeMobileTab === 'content' ? 'translate-x-0' : '-translate-x-full'
                )}>
                    <div className="h-full w-full bg-background relative flex flex-col min-w-0">
                        <VideoReviewPanel userType={userRole} />
                    </div>
                </div>

                {/* CONTENT: Info Tab */}
                <div className={cn(
                    "absolute inset-0 w-full h-full transition-transform duration-300 bg-background overflow-y-auto",
                    activeMobileTab === 'info' ? 'translate-x-0' :
                        activeMobileTab === 'content' ? 'translate-x-full' : '-translate-x-full'
                )}>
                    <div className="p-4">
                        <InfoPanel userRole={userRole} />
                    </div>
                </div>

                {/* CONTENT: Chat Tab */}
                <div className={cn(
                    "absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 bg-background",
                    activeMobileTab === 'chat' ? 'translate-x-0' : 'translate-x-full'
                )}>
                    <ChatArea className="flex-1 min-h-0" />
                </div>
            </div>

            {/* 3. Bottom Navigation Tabs (Sticky) */}
            <MobileTabs />
        </div>
    );
}
