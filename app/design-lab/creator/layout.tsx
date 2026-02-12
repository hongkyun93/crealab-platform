import { SiteHeader } from "@/components/site-header"
import { CreatorSidebar } from "@/components/creator/CreatorSidebar"

export default function CreatorDesignLabLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex flex-1 container max-w-[1920px] px-0 md:px-8">
                <CreatorSidebar user={{
                    name: '김수민',
                    email: 'soomin@love.com',
                    handle: '@go_gyeol_kim',
                    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80'
                }} />
                <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-3.5rem)]">
                    {children}
                </main>
            </div>
        </div>
    )
}
