import { SiteHeader } from "@/components/site-header"
import { CreatorSidebar } from "./components/CreatorSidebar"

export default function CreatorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-muted/30">
            <SiteHeader />
            <main className="container py-8 max-w-[1920px] px-6 md:px-8">
                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    <CreatorSidebar />
                    {children}
                </div>
            </main>
        </div>
    )
}
