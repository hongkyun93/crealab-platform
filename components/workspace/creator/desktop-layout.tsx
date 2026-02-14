
import React from 'react';
import { cn } from '@/lib/utils';
import { CreatorInfoPanel } from './info-panel';
import { ChatArea } from '../common/chat-area';

interface CreatorDesktopLayoutProps {
    className?: string;
}

import { FileSharePanel } from '../common/file-share-panel';

export function CreatorDesktopLayout({ className }: CreatorDesktopLayoutProps) {
    // This layout uses a 3-column grid:
    // Left: Fixed width (390px) for info display - [FIX] Synced with Brand Workspace
    // Center: Flexible width (flex-1) for chat
    // Right: Fixed width (260px) for files

    return (
        <div className={cn("grid grid-cols-[390px_minmax(200px,1fr)_260px] h-full w-full max-w-[1500px] bg-background rounded-xl overflow-hidden shadow-2xl border border-border/50", className)}>
            {/* Left Column: Information Panel */}
            <div className="h-full border-r border-border/50 bg-background/50 relative z-10 flex flex-col min-w-0 overflow-hidden">
                <CreatorInfoPanel />
            </div>

            {/* Center Column: Chat Area */}
            <div className="h-full bg-muted/20 relative flex flex-col min-w-0 overflow-hidden">
                <ChatArea className="h-full" />
            </div>

            {/* Right Column: File Share Panel */}
            <div className="h-full bg-background relative z-10 min-w-0 overflow-hidden">
                <FileSharePanel />
            </div>
        </div>
    );
}
