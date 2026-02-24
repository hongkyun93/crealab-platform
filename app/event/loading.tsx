import { Loader2 } from "lucide-react"

export default function EventLoading() {
    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Loader2 className="absolute inset-0 m-auto h-5 w-5 text-primary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">모먼트를 불러오는 중...</p>
            </div>
        </div>
    )
}
