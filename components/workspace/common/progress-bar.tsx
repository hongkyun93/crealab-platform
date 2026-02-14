
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '../hooks/use-workspace-store';

const STAGES = [
    { id: 'negotiation', label: '조건협의' },
    { id: 'contract', label: '계약서' },
    { id: 'shipping', label: '제품발송' },
    { id: 'content', label: '콘텐츠' },
    { id: 'completed', label: '완료' },
] as const;

export function ProgressBar() {
    const currentStage = useWorkspaceStore((state) => state.currentStage);

    const getCurrentStepIndex = () => {
        return STAGES.findIndex((s) => s.id === currentStage);
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="w-full flex items-center justify-between px-2 py-4">
            {STAGES.map((stage, index) => {
                const isCompleted = index < currentStepIndex || currentStage === 'completed';
                const isCurrent = stage.id === currentStage;
                const isPending = index > currentStepIndex;

                return (
                    <div key={stage.id} className="flex flex-col items-center relative z-10 w-full">
                        {/* Connecting Line */}
                        {index !== 0 && (
                            <div
                                className={cn(
                                    'absolute top-3 right-[50%] w-full h-[2px] -z-10',
                                    index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                                )}
                            />
                        )}

                        {/* Dot/Icon */}
                        <div
                            className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                                isCompleted
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : isCurrent
                                        ? 'bg-background border-primary ring-4 ring-primary/20'
                                        : 'bg-muted border-muted-foreground/30'
                            )}
                        >
                            {isCompleted ? (
                                <Check className="w-3 h-3" />
                            ) : (
                                <div
                                    className={cn(
                                        'w-2 h-2 rounded-full',
                                        isCurrent ? 'bg-primary' : 'bg-muted-foreground/30'
                                    )}
                                />
                            )}
                        </div>

                        {/* Label */}
                        <span
                            className={cn(
                                'text-[10px] mt-2 font-medium transition-colors duration-300',
                                isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'
                            )}
                        >
                            {stage.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
