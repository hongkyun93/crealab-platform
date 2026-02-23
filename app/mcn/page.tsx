"use client"

import { DemoBanner } from "@/components/demo-banner"
import { McnDashboard } from "@/components/mcn/mcn-dashboard"
import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { SiteHeader } from "@/components/site-header"
import { useDemoMode } from "@/lib/contexts/demo-context"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"

function McnPageContent() {
    const { user, isLoading, isInitialized, isAuthLoading } = useUnifiedProvider()
    const router = useRouter()
    const { isDemoMode } = useDemoMode()

    // Auth guard — redirect in useEffect to avoid setState during render
    useEffect(() => {
        if (isDemoMode || isAuthLoading || !isInitialized) return

        if (!user) {
            router.replace('/login')
        } else if (user.role !== 'mcn' && user.role !== 'agency') {
            router.replace(user.role === 'brand' ? '/brand' : '/creator')
        }
    }, [isDemoMode, isAuthLoading, isInitialized, user, router])

    // Wait for auth
    if (isAuthLoading || !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Guard render while redirecting
    if (!isDemoMode && (!user || (user.role !== 'mcn' && user.role !== 'agency'))) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <>
            <SiteHeader />
            <McnDashboard />
        </>
    )
}

export default function McnPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <DemoBanner />
            <McnPageContent />
        </Suspense>
    )
}

