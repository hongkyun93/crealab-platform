"use client"

import React, { createContext, useContext } from "react"

interface DemoModeContextType {
    isDemoMode: boolean
}

const DemoModeContext = createContext<DemoModeContextType>({
    isDemoMode: false,
})

/**
 * Detects demo mode from URL search params (?demo=true).
 * Uses window.location for SSR-safe detection without requiring Suspense.
 */
export function useDemoMode(): DemoModeContextType {
    const [isDemoMode, setIsDemoMode] = React.useState(false)

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        setIsDemoMode(params.get('demo') === 'true')
    }, [])

    return { isDemoMode }
}

/**
 * Helper to check demo mode synchronously (for use outside React components, e.g. in fetchers).
 */
export function isDemoModeActive(): boolean {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('demo') === 'true'
}
