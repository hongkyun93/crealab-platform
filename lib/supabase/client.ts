import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                // Disable navigator.locks — it causes AbortError on Vercel production.
                // All auth methods (getUser, getSession, signInWithPassword, etc.)
                // use navigator.locks internally, and this API is unreliable on Vercel
                // Edge Runtime, causing universal AbortError.
                // lockNoOp: just run the function directly without locking.
                lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
                    return await fn()
                },
            }
        }
    )
}
