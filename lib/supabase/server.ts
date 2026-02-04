import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        "https://wbeyxjoqcwjbcuwvjrsa.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZXl4am9xY3dqYmN1d3ZqcnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjE2NjYsImV4cCI6MjA4NTY5NzY2Nn0.dd42_fmkAw67xYMztVnu_8i7W3N2cya-4oJw-R0NUb8",
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
