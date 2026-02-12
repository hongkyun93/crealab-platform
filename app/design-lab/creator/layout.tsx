import { DesignLabCreatorSidebar } from "@/components/design-lab/CreatorSidebar"

export default function DesignLabCreatorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <DesignLabCreatorSidebar className="w-64 flex-shrink-0" />
            <main className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] p-8">
                {children}
            </main>
        </div>
    )
}
