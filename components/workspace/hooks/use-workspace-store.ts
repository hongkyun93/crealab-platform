
// This is the core store for managing the workspace state
import { create } from 'zustand';
import { Proposal } from '@/lib/types'; // Assuming Proposal type is here

interface WorkspaceState {
    // Data
    proposal: Proposal | null;
    currentStage: 'negotiation' | 'contract' | 'shipping' | 'content' | 'completed';

    // UI State
    isChatOpen: boolean;
    activeMobileTab: 'chat' | 'info' | 'contract';
    expandedSections: string[]; // e.g., ['conditions']
    contractViewOpen: boolean; // When true, contract panel replaces chat+files area
    videoReviewOpen: boolean;  // When true, video review panel replaces chat+files area

    // Actions
    setProposal: (proposal: any) => void;
    updateProposal: (fields: Partial<Proposal>) => void;
    setCurrentStage: (stage: WorkspaceState['currentStage']) => void;
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
    isChatOpen: false,
    activeMobileTab: 'chat',
    expandedSections: ['current_stage'],
    contractViewOpen: false,
    videoReviewOpen: false,

    // Actions
    setProposal: (proposal) => set({ proposal }),
    updateProposal: (fields) =>
        set((state) => ({
            proposal: state.proposal ? { ...state.proposal, ...fields } : null,
        })),
    setCurrentStage: (stage) => set({ currentStage: stage }),
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
            activeMobileTab: 'chat',
            expandedSections: ['current_stage'],
            contractViewOpen: false,
            videoReviewOpen: false,
        }),
}));
