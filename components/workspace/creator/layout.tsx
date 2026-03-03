
import { cn } from '@/lib/utils';
import { ChatArea } from '../common/chat-area';
import { ProgressBar } from '../common/progress-bar';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { CreatorDesktopLayout } from './desktop-layout';
import { CreatorInfoPanel } from './info-panel';
import { MobileTabs } from './mobile-tabs';
import { VideoReviewPanel } from '../common/VideoReviewPanel';

import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { SmartContractPanel } from '../common/smart-contract-panel';
import { RealtimeWorkspaceSync } from '../common/realtime-workspace-sync';

interface CreatorWorkspaceLayoutProps {
    className?: string;
}

export function CreatorWorkspaceLayout({ className }: CreatorWorkspaceLayoutProps) {
    return (
        <>
            <RealtimeWorkspaceSync />
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
    const contractViewOpen = useWorkspaceStore((state) => state.contractViewOpen);
    const videoReviewOpen = useWorkspaceStore((state) => state.videoReviewOpen);
    const { updateProductApplication, updateMomentProposal, updateProposal, refreshData } = useUnifiedProvider();

    // Sign handler for creator
    const handleSign = async (role: 'brand' | 'creator', signatureData: string) => {
        if (!proposal?.id) return;
        const updates: any = {
            creator_signature: signatureData,
            creator_signed_at: new Date().toISOString(),
            contract_status: proposal.brand_signature ? 'signed' : 'partial',
        };

        // Optimistic UI update
        useWorkspaceStore.getState().updateProposal(updates);

        let success = false;
        if ((proposal as any).moment_id || (proposal as any).moment_id) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateProductApplication(proposal.id, updates);
        }

        if (success) {
            refreshData();
        } else {
            refreshData();
        }
    };

    const handleUndoSign = async (role: 'brand' | 'creator') => {
        if (!proposal?.id) return;
        const updates: any = {
            creator_signature: null,
            creator_signed_at: null,
            contract_status: proposal.brand_signature ? 'partial' : 'none',
        };

        // Optimistic UI update
        useWorkspaceStore.getState().updateProposal(updates);

        let success = false;
        if ((proposal as any).moment_id || (proposal as any).moment_id) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateProductApplication(proposal.id, updates);
        }

        if (success) {
            refreshData();
        } else {
            refreshData();
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden relative">
            {/* 1. Mobile Top Bar - Simplified */}
            <div className="shrink-0 px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20 overflow-hidden">
                <div className="flex items-center justify-between w-full">
                    {/* 아바타 & 리드 정보 (좌측) */}
                    <div className="flex items-center gap-2 shrink-0 max-w-[30%] sm:max-w-[40%] mr-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 overflow-hidden shrink-0">
                            {(proposal?.brandAvatar || proposal?.brand_avatar) ? (
                                <img src={proposal.brandAvatar || proposal.brand_avatar} alt="Brand" className="w-full h-full object-cover" />
                            ) : (
                                (proposal?.brand_name?.[0] || proposal?.brandName?.[0] || 'B')
                            )}
                        </div>
                        <div className="min-w-0" style={{ maxWidth: 'calc(100% - 2.5rem)' }}>
                            <h2 className="text-xs font-bold leading-tight truncate">{proposal?.brand_name || proposal?.brandName || 'Brand Name'}</h2>
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
                        <VideoReviewPanel userType="creator" />
                    </div>
                </div>

                {/* CONTENT: Info Tab */}
                <div className={cn(
                    "absolute inset-0 w-full h-full transition-transform duration-300 bg-background overflow-y-auto",
                    activeMobileTab === 'info' ? 'translate-x-0' :
                        activeMobileTab === 'content' ? 'translate-x-full' : '-translate-x-full'
                )}>
                    <div className="p-4">
                        <CreatorInfoPanel />
                    </div>
                </div>

                {/* CONTENT: Chat Tab */}
                <div className={cn(
                    "absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 bg-background",
                    activeMobileTab === 'chat' ? 'translate-x-0' : 'translate-x-full'
                )}>
                    <ChatArea className="flex-1 min-h-0" />
                </div>

                {/* CONTENT: Contract Tab (Overlay Modal) - Removed for Mobile Layout as requested */}
                {/* 
                <div className={cn(
                    "fixed inset-0 z-[100] w-full h-[100dvh] transition-transform duration-300",
                    contractViewOpen ? 'translate-y-0' : 'translate-y-full'
                )}>
                    {proposal ? (
                        <div className="h-full w-full bg-background flex flex-col overflow-hidden shadow-2xl">
                            <SmartContractPanel
                                proposal={proposal}
                                userType="creator"
                                onSign={handleSign}
                                onUndoSign={handleUndoSign}
                                fullWidth
                            />
                        </div>
                    ) : (
                        <div className="h-full w-full bg-background flex items-center justify-center text-muted-foreground p-4 text-sm text-center">
                            계약서 정보를 불러올 수 없거나<br />아직 생성되지 않았습니다.
                        </div>
                    )}
                </div>
                */}

            </div>

            {/* 3. Bottom Navigation Tabs (Sticky) */}
            <MobileTabs />
        </div>
    );
}
