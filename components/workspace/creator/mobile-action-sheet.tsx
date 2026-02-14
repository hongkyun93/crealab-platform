
import React from 'react';
import { CtaButton } from '../common/cta-button';
import { useWorkspaceStore } from '../hooks/use-workspace-store';
import { cn } from '@/lib/utils';

export function MobileActionSheet() {
    const currentStage = useWorkspaceStore((state) => state.currentStage);
    const activeMobileTab = useWorkspaceStore((state) => state.activeMobileTab);

    // CTA is only shown in 'info' tab or specific contexts
    if (activeMobileTab !== 'info') return null;

    return (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pb-6 z-10 pointer-events-none">
            {/* Pointer events none on container, auto on button to allow clicking through transparent areas if needed, 
           but here we want the button to float above content */}
            <div className="pointer-events-auto shadow-lg bg-background rounded-xl p-1 border border-border/50">
                <CtaButton fullWidth size="lg" className="shadow-lg">
                    조건 확정하기
                </CtaButton>
            </div>
        </div>
    );
}
