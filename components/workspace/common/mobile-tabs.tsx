import { cn } from '@/lib/utils';
import { FileText, MessageSquare, Video } from 'lucide-react';
import { useWorkspaceStore } from '../hooks/use-workspace-store';

export function MobileTabs() {
    const activeMobileTab = useWorkspaceStore((state) => state.activeMobileTab);
    const setMobileTab = useWorkspaceStore((state) => state.setMobileTab);

    const tabs = [
        { id: 'content', label: '콘텐츠', icon: Video },
        { id: 'info', label: '정보/조건', icon: FileText },
        { id: 'chat', label: '메세지', icon: MessageSquare },
    ] as const;

    return (
        <div className="shrink-0 bg-background border-t border-border pb-safe sticky bottom-0 z-50 w-full">
            <div className="flex items-center justify-around h-[60px]">
                {tabs.map((tab) => {
                    const isActive = activeMobileTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setMobileTab(tab.id);
                            }}
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
