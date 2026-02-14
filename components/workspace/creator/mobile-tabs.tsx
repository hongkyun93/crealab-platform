
import React from 'react';
import { MessageSquare, FileText, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '../hooks/use-workspace-store';

export function MobileTabs() {
    const activeMobileTab = useWorkspaceStore((state) => state.activeMobileTab);
    const setMobileTab = useWorkspaceStore((state) => state.setMobileTab);

    const tabs = [
        { id: 'chat', label: '대화', icon: MessageSquare },
        { id: 'info', label: '정보/조건', icon: FileText },
        { id: 'contract', label: '계약서', icon: ScrollText },
    ] as const;

    return (
        <div className="shrink-0 bg-background border-t border-border pb-safe">
            <div className="flex items-center justify-around h-14">
                {tabs.map((tab) => {
                    const isActive = activeMobileTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setMobileTab(tab.id)}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors relative",
                                isActive ? "text-primary" : "text-muted-foreground/60 hover:text-muted-foreground"
                            )}
                        >
                            <div className={cn(
                                "p-1 rounded-lg transition-all",
                                isActive && "bg-primary/10"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium">{tab.label}</span>

                            {isActive && (
                                <div className="absolute top-0 w-12 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
