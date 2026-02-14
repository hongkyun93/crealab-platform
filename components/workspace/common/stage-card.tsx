
import React from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '../hooks/use-workspace-store';

interface StageCardProps {
    id: string;
    title: string;
    isCompleted?: boolean;
    isActive?: boolean;
    children: React.ReactNode;
    summary?: React.ReactNode;
}

export function StageCard({ id, title, isCompleted, isActive, children, summary }: StageCardProps) {
    const expandedSections = useWorkspaceStore((state) => state.expandedSections);
    const toggleSection = useWorkspaceStore((state) => state.toggleSection);

    const isExpanded = expandedSections.includes(id);

    // If active, it should ideally be expanded by default or controlled by the parent/store.
    // The store handles the 'expandedSections' state.

    return (
        <div
            className={cn(
                'rounded-xl border transition-all duration-300 overflow-hidden',
                isActive
                    ? 'border-primary/50 bg-background shadow-sm ring-1 ring-primary/10'
                    : isCompleted
                        ? 'border-muted bg-muted/20 opacity-80 hover:opacity-100'
                        : 'border-muted/50 bg-muted/10 opacity-60'
            )}
        >
            <div
                className={cn(
                    'flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                    isActive && 'bg-primary/5'
                )}
                onClick={() => toggleSection(id)}
            >
                <div className="flex items-center gap-3">
                    {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isActive ? (
                        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                        </div>
                    ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/50" />
                    )}
                    <h3
                        className={cn(
                            'font-semibold text-sm',
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                        )}
                    >
                        {title}
                    </h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 pt-0 border-t border-dashed border-border/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="pt-4">
                        {children}
                    </div>
                </div>
            )}

            {/* Collapsed Summary (only when NOT expanded and has summary) */}
            {!isExpanded && summary && (
                <div className="px-4 pb-4 pl-12 text-xs text-muted-foreground line-clamp-2">
                    {summary}
                </div>
            )}
        </div>
    );
}
