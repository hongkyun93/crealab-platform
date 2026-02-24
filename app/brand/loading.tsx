import Image from "next/image"

export default function BrandLoading() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <Image src="/logo.png" alt="CreadyPick" width={160} height={32} className="h-8 w-auto opacity-80" priority />
            </div>
            <div className="flex flex-col items-center gap-3">
                <div className="h-1 w-48 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-[loading_1.2s_ease-in-out_infinite]" style={{ width: '40%' }} />
                </div>
                <p className="text-xs text-muted-foreground">브랜드 대시보드 로딩 중...</p>
            </div>
            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(350%); }
                }
            `}</style>
        </div>
    )
}
