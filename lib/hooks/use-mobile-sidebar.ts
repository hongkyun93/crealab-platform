import { create } from 'zustand'

interface MobileSidebarState {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    toggle: () => void
}

export const useMobileSidebar = create<MobileSidebarState>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
