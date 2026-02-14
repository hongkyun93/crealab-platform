
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileIcon, ImageIcon, UploadCloud, Download, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '../hooks/use-workspace-store';

export function FileSharePanel() {
    const proposal = useWorkspaceStore((state) => state.proposal);

    return (
        <div className="flex flex-col h-full bg-background/50 border-l border-border/50">
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-bold text-sm">공유 파일</h3>
                <span className="text-xs text-muted-foreground">3개</span>
            </div>

            {/* File List */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {/* Section: Contract */}
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            계약 문서
                            <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">1</span>
                        </h4>
                        <div className="space-y-2">
                            <FileItem
                                name="표준_광고_계약서.pdf"
                                size="245 KB"
                                type="pdf"
                                date="2026.02.14"
                            />
                        </div>
                    </div>

                    {/* Section: References */}
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            참고 자료
                            <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full">2</span>
                        </h4>
                        <div className="space-y-2">
                            <FileItem
                                name="브랜드_가이드라인_v2.pdf"
                                size="1.2 MB"
                                type="pdf"
                                date="2026.02.14"
                            />
                            <FileItem
                                name="제품_연출_예시.jpg"
                                size="4.8 MB"
                                type="image"
                                date="2026.02.14"
                            />
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Upload Area */}
            <div className="p-4 border-t border-border/50 bg-background">
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        <UploadCloud className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs font-medium mb-1">파일을 드래그하거나 클릭하여 업로드</p>
                    <p className="text-[10px] text-muted-foreground">최대 50MB (PDF, JPG, PNG)</p>
                </div>
            </div>
        </div>
    );
}

function FileItem({ name, size, type, date }: { name: string, size: string, type: 'pdf' | 'image' | 'doc', date: string }) {
    return (
        <div className="group flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/50">
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                type === 'pdf' ? "bg-red-50 text-red-600" :
                    type === 'image' ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600"
            )}>
                {type === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-none mb-1.5">{name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{size}</span>
                    <span>•</span>
                    <span>{date}</span>
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Download className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
}
