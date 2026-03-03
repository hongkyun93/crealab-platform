"use client"

import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { cn } from '@/lib/utils';
import { ChatArea } from '../common/chat-area';
import { FileSharePanel } from '../common/file-share-panel';
import { SmartContractPanel } from '../common/smart-contract-panel';
import { VideoReviewPanel } from '../common/VideoReviewPanel';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { InfoPanel } from './info-panel';

import { BrandDesktopLayout } from './desktop-layout';
import { BrandMobileTabs } from './mobile-tabs';
import { ProgressBar } from '../common/progress-bar';
import { RealtimeWorkspaceSync } from '../common/realtime-workspace-sync';

interface BrandWorkspaceLayoutProps {
    className?: string;
}

export function BrandWorkspaceLayout({ className }: BrandWorkspaceLayoutProps) {
    return (
        <>
            <RealtimeWorkspaceSync />
            <div className={cn("md:hidden flex flex-col h-full w-full", className)}>
                <BrandMobileLayout />
            </div>
            <div className={cn("hidden md:flex h-full w-full items-center justify-center", className)}>
                <BrandDesktopLayout />
            </div>
        </>
    );
}

function BrandMobileLayout() {
    const activeMobileTab = useWorkspaceStore((state) => state.activeMobileTab);
    const proposal = useWorkspaceStore((state) => state.proposal);
    const contractViewOpen = useWorkspaceStore((state) => state.contractViewOpen);
    const videoReviewOpen = useWorkspaceStore((state) => state.videoReviewOpen);
    const { updateBrandProposal, updateMomentProposal, updateProposal, refreshData } = useUnifiedProvider();

    // Sign handler for brand (used if signing from mobile contract view)
    const handleSign = async (role: 'brand' | 'creator', signatureData: string) => {
        if (!proposal?.id) return;
        const updates: any = {
            brand_signature: signatureData,
            brand_signed_at: new Date().toISOString(),
            contract_status: proposal.creator_signature ? 'signed' : 'partial',
        };

        // Optimistic UI update
        useWorkspaceStore.getState().updateProposal(updates);

        let success = false;
        if ((proposal as any).moment_id || (proposal as any).moment_id) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateBrandProposal(proposal.id, updates);
        }

        if (success) {
            refreshData();
        } else {
            // Revert on failure (optional, but good practice. For now, we trust it works or refresh fixes it)
            refreshData();
        }
    };

    const handleSaveContract = async (content: string) => {
        if (!proposal?.id) return;
        const updates: any = { contract_content: content };
        if ((proposal as any).moment_id || (proposal as any).moment_id) {
            await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            await updateProposal(proposal.id, updates);
        } else {
            await updateBrandProposal(proposal.id, updates);
        }
    };

    const handleUndoSign = async (role: 'brand' | 'creator') => {
        if (!proposal?.id) return;
        const updates: any = {
            brand_signature: null,
            brand_signed_at: null,
            contract_status: proposal.creator_signature ? 'partial' : 'none',
        };

        // Optimistic UI update
        useWorkspaceStore.getState().updateProposal(updates);

        let success = false;
        if ((proposal as any).moment_id || (proposal as any).moment_id) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateBrandProposal(proposal.id, updates);
        }

        if (success) {
            refreshData();
        } else {
            refreshData();
        }
    };

    // 크리에이터의 아바타 및 이름 결정
    const creatorAvatar = proposal?.creatorAvatar || (proposal as any)?.creator_avatar;
    const creatorName = proposal?.creatorName || (proposal as any)?.creator_name || (proposal as any)?.influencer?.display_name || (proposal as any)?.influencer?.name || '크리에이터';

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background overflow-hidden relative">
            {/* 1. Mobile Top Bar - Simplified */}
            <div className="shrink-0 px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20 overflow-hidden">
                <div className="flex items-center justify-between w-full">
                    {/* 아바타 & 크리에이터 정보 (좌측) */}
                    <div className="flex items-center gap-2 shrink-0 max-w-[30%] sm:max-w-[40%] mr-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden shrink-0">
                            {creatorAvatar ? (
                                <img src={creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                            ) : (
                                creatorName[0] || 'C'
                            )}
                        </div>
                        <div className="min-w-0" style={{ maxWidth: 'calc(100% - 2.5rem)' }}>
                            <h2 className="text-xs font-bold leading-tight truncate">{creatorName}</h2>
                            <span className="text-[10px] text-muted-foreground block truncate">{proposal?.product_name || proposal?.campaignName || '협업 프로젝트'}</span>
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
                        <VideoReviewPanel userType="brand" />
                    </div>
                </div>

                {/* CONTENT: Info Tab */}
                <div className={cn(
                    "absolute inset-0 w-full h-full transition-transform duration-300 bg-background overflow-y-auto",
                    activeMobileTab === 'info' ? 'translate-x-0' :
                        activeMobileTab === 'content' ? 'translate-x-full' : '-translate-x-full'
                )}>
                    <div className="p-4">
                        <InfoPanel />
                    </div>
                </div>

                {/* CONTENT: Chat Tab (+ FileSharePanel on chat tab if needed, but normally chat is primary) */}
                <div className={cn(
                    "absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 bg-background",
                    activeMobileTab === 'chat' ? 'translate-x-0' : 'translate-x-full'
                )}>
                    <ChatArea className="flex-1 min-h-0" />
                    {/* 모바일 화면을 너무 많이 차지하고 드래그 앤 드롭이 부자연스러워 요청에 따라 제거 */}
                    {/* <div className="shrink-0 border-t border-border/50">
                        <FileSharePanel />
                    </div> */}
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
                                userType="brand"
                                onSign={handleSign}
                                onSaveContract={handleSaveContract}
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
            <BrandMobileTabs />
        </div>
    );
}
