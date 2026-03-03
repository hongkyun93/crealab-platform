import { useUnifiedProvider } from '@/components/providers/unified-provider';
import { cn } from '@/lib/utils';
import { ChatArea } from './chat-area';
import { FileSharePanel } from './file-share-panel';
import { SmartContractPanel } from './smart-contract-panel';
import { VideoReviewPanel } from './VideoReviewPanel';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { InfoPanel } from './info-panel';

interface DesktopLayoutProps {
    className?: string;
    userRole: 'brand' | 'creator';
}

export function DesktopLayout({ className, userRole }: DesktopLayoutProps) {
    const contractViewOpen = useWorkspaceStore((state) => state.contractViewOpen);
    const videoReviewOpen = useWorkspaceStore((state) => state.videoReviewOpen);
    const proposal = useWorkspaceStore((state) => state.proposal);
    const { updateProductApplication, updateMomentProposal, updateProposal, refreshData } = useUnifiedProvider();

    const handleSign = async (role: 'brand' | 'creator', signatureData: string) => {
        if (!proposal?.id) return;
        const updates: any = {};

        if (userRole === 'brand') {
            updates.brand_signature = signatureData;
            updates.brand_signed_at = new Date().toISOString();
            updates.contract_status = proposal.creator_signature ? 'signed' : 'partial';
        } else {
            updates.creator_signature = signatureData;
            updates.creator_signed_at = new Date().toISOString();
            updates.contract_status = proposal.brand_signature ? 'signed' : 'partial';
        }

        useWorkspaceStore.getState().updateProposal(updates);

        let success = false;
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateProductApplication(proposal.id, updates);
        }

        if (success) refreshData();
        else refreshData();
    };

    const handleSaveContract = async (content: string) => {
        if (!proposal?.id) return;
        const updates: any = { contract_content: content };
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            await updateProposal(proposal.id, updates);
        } else {
            await updateProductApplication(proposal.id, updates);
        }
    };

    const handleUndoSign = async (role: 'brand' | 'creator') => {
        if (!proposal?.id) return;
        const updates: any = {};

        if (userRole === 'brand') {
            updates.brand_signature = null;
            updates.brand_signed_at = null;
            updates.contract_status = proposal.creator_signature ? 'partial' : 'none';
        } else {
            updates.creator_signature = null;
            updates.creator_signed_at = null;
            updates.contract_status = proposal.brand_signature ? 'partial' : 'none';
        }

        useWorkspaceStore.getState().updateProposal(updates);

        let success = false;
        if ((proposal as any).moment_id || (proposal as any).momentId) {
            success = await updateMomentProposal(proposal.id, updates);
        } else if ((proposal as any).campaignId || (proposal as any).campaign_id) {
            success = await updateProposal(proposal.id, updates);
        } else {
            success = await updateProductApplication(proposal.id, updates);
        }

        if (success) refreshData();
        else refreshData();
    };

    return (
        <div className={cn("grid grid-cols-[390px_minmax(200px,1fr)_260px] h-full w-full max-w-[1500px] bg-background rounded-xl overflow-hidden shadow-2xl border border-border/50", className)}>
            {/* Left Column: Information Panel */}
            <div className="h-full border-r border-border/50 bg-background/50 relative z-10 flex flex-col min-w-0 overflow-hidden">
                <InfoPanel userRole={userRole} />
            </div>

            {/* Center + Right: Contract View OR Video Review OR Chat + Files */}
            {contractViewOpen && proposal ? (
                <>
                    {/* Center: Contract */}
                    <div className="h-full bg-background relative flex flex-col min-w-0 overflow-hidden">
                        <SmartContractPanel
                            proposal={proposal}
                            userType={userRole}
                            onSign={handleSign}
                            onSaveContract={handleSaveContract}
                            onUndoSign={handleUndoSign}
                            fullWidth
                        />
                    </div>
                    {/* Right: Chat */}
                    <div className="h-full bg-muted/20 relative flex flex-col min-w-0 overflow-hidden border-l border-border/50">
                        <ChatArea className="h-full" />
                    </div>
                </>
            ) : videoReviewOpen ? (
                /* Video Review: spans center + right columns merged */
                <div className="col-span-2 h-full bg-background relative flex flex-col min-w-0 overflow-hidden">
                    <VideoReviewPanel userType={userRole} />
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
