"use client"

import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { cn } from '@/lib/utils';
import { ChatArea } from '../common/chat-area';
import { FileSharePanel } from '../common/file-share-panel';
import { SmartContractPanel } from '../common/smart-contract-panel';
import { VideoReviewPanel } from '../common/VideoReviewPanel';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { InfoPanel } from './info-panel';

interface BrandWorkspaceLayoutProps {
    className?: string;
}

export function BrandWorkspaceLayout({ className }: BrandWorkspaceLayoutProps) {
    const contractViewOpen = useWorkspaceStore((state) => state.contractViewOpen);
    const videoReviewOpen = useWorkspaceStore((state) => state.videoReviewOpen);
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { updateBrandProposal, updateMomentProposal, updateProposal, refreshData } = useUnifiedProvider();

    // Sign handler for brand
    const handleSign = async (role: 'brand' | 'creator', signatureData: string) => {
        if (!proposal?.id) return;
        const updates: any = {
            brand_signature: signatureData,
            brand_signed_at: new Date().toISOString(),
            contract_status: proposal.influencer_signature ? 'signed' : 'partial',
        };
        let success = false;
        if ((proposal as any).moment_id || (proposal as any).event_id) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateBrandProposal(proposal.id, updates);
        }
        if (success) {
            useWorkspaceStore.getState().updateProposal(updates);
            refreshData();
        }
    };

    // Save contract content
    const handleSaveContract = async (content: string) => {
        if (!proposal?.id) return;
        const updates: any = { contract_content: content };
        if ((proposal as any).moment_id || (proposal as any).event_id) {
            await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            await updateProposal(proposal.id, updates);
        } else {
            await updateBrandProposal(proposal.id, updates);
        }
    };

    // Undo sign handler
    const handleUndoSign = async (role: 'brand' | 'creator') => {
        if (!proposal?.id) return;
        const updates: any = {
            brand_signature: null,
            brand_signed_at: null,
            contract_status: proposal.influencer_signature ? 'partial' : 'none',
        };
        let success = false;
        if ((proposal as any).moment_id || (proposal as any).event_id) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateBrandProposal(proposal.id, updates);
        }
        if (success) {
            useWorkspaceStore.getState().updateProposal(updates);
            refreshData();
        }
    };

    return (
        <div className={cn("grid grid-cols-[390px_minmax(200px,1fr)_260px] h-full w-full max-w-[1500px] bg-background rounded-xl overflow-hidden shadow-2xl border border-border/50", className)}>
            {/* Left Column: Information Panel */}
            <div className="h-full border-r border-border/50 bg-background/50 relative z-10 flex flex-col min-w-0 overflow-hidden">
                <InfoPanel />
            </div>

            {/* Center + Right: Contract View OR Video Review OR Chat + Files */}
            {contractViewOpen && proposal ? (
                <>
                    {/* Center: Contract */}
                    <div className="h-full bg-background relative flex flex-col min-w-0 overflow-hidden">
                        <SmartContractPanel
                            proposal={proposal}
                            userType="brand"
                            onSign={handleSign}
                            onSaveContract={handleSaveContract}
                            onUndoSign={handleUndoSign}
                            fullWidth
                        />
                    </div>
                    {/* Right: Chat (so brand can discuss while viewing contract) */}
                    <div className="h-full bg-muted/20 relative flex flex-col min-w-0 overflow-hidden border-l border-border/50">
                        <ChatArea className="h-full" />
                    </div>
                </>
            ) : videoReviewOpen ? (
                /* Video Review: spans center + right columns merged */
                <div className="col-span-2 h-full bg-background relative flex flex-col min-w-0 overflow-hidden">
                    <VideoReviewPanel userType="brand" />
                </div>
            ) : (
                <>
                    <div className="h-full bg-muted/20 relative flex flex-col min-w-0 overflow-hidden">
                        <ChatArea className="h-full" />
                    </div>
                    <div className="h-full bg-background relative z-10 min-w-0 overflow-hidden">
                        <FileSharePanel />
                    </div>
                </>
            )}
        </div>
    );
}
