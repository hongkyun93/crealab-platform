
// This is the core store for managing the workspace state
import { Proposal } from '@/lib/types';
import { WorkspaceStage } from '@/lib/compute-workspace-stage';
import { create } from 'zustand';

interface WorkspaceState {
    // Data
    proposal: Proposal | null;
    currentStage: WorkspaceStage;
    stageMap: Record<string, WorkspaceStage>; // proposalId → stage (카드 목록 공유)

    // UI State
    isChatOpen: boolean;
    activeMobileTab: 'chat' | 'info' | 'contract' | 'content';
    expandedSections: string[];
    contractViewOpen: boolean;
    videoReviewOpen: boolean;

    // Actions
    setProposal: (proposal: any) => void;
    updateProposal: (fields: Partial<Proposal>) => void;
    setCurrentStage: (stage: WorkspaceStage) => void;
    setStageMap: (map: Record<string, WorkspaceStage>) => void;
    setIsChatOpen: (isOpen: boolean) => void;
    toggleSection: (sectionId: string) => void;
    setMobileTab: (tab: WorkspaceState['activeMobileTab']) => void;
    setContractViewOpen: (isOpen: boolean) => void;
    setVideoReviewOpen: (isOpen: boolean) => void;
    reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    // Initial State
    proposal: null,
    currentStage: 'negotiation',
    stageMap: {},
    isChatOpen: false,
    activeMobileTab: 'info',
    expandedSections: ['current_stage', 'negotiation'],
    contractViewOpen: false,
    videoReviewOpen: false,

    // Actions
    setProposal: (proposal) => set({ proposal }),
    updateProposal: (fields) =>
        set((state) => ({
            proposal: state.proposal ? { ...state.proposal, ...fields } : null,
        })),
    setCurrentStage: (stage) => set({ currentStage: stage }),
    setStageMap: (map) => set((state) => ({ stageMap: { ...state.stageMap, ...map } })),
    setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
    toggleSection: (sectionId) =>
        set((state) => {
            const isExpanded = state.expandedSections.includes(sectionId);
            return {
                expandedSections: isExpanded
                    ? state.expandedSections.filter((id) => id !== sectionId)
                    : [...state.expandedSections, sectionId],
            };
        }),
    setMobileTab: (tab) => set({ activeMobileTab: tab }),
    setContractViewOpen: (isOpen) => set({ contractViewOpen: isOpen }),
    setVideoReviewOpen: (isOpen) => set({ videoReviewOpen: isOpen }),
    reset: () =>
        set({
            proposal: null,
            currentStage: 'negotiation',
            isChatOpen: false,
            activeMobileTab: 'info',
            expandedSections: ['current_stage', 'negotiation'],
            contractViewOpen: false,
            videoReviewOpen: false,
        }),
}));
