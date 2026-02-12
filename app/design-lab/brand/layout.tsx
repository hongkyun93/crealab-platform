import { SiteHeader } from "@/components/site-header"
import { BrandSidebar } from "@/components/brand/BrandSidebar"

export default function BrandDesignLabLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex flex-1 container max-w-[1920px] px-0 md:px-8">
                <BrandSidebar user={{ name: '보이브', email: '브랜드 계정' }} />
                <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-3.5rem)]">
                    {children}
                </main>
            </div>
        </div>
    )
}
