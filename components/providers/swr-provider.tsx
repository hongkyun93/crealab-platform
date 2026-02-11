import { SWRConfig } from 'swr'
import { swrConfig } from '@/lib/swr-config'

/**
 * SWR Provider Wrapper
 * Wraps the entire app with SWR configuration
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig value={swrConfig}>
            {children}
        </SWRConfig>
    )
}
