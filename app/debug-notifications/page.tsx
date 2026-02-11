"use client"

import { useEffect, useState } from "react"
import { usePlatform } from "@/components/providers/legacy-platform-hook"

export default function DebugNotificationsPage() {
    const [logs, setLogs] = useState<string[]>([])
    const { supabase, user } = usePlatform()

    const log = (msg: string) => setLogs(prev => [...prev, msg])

    useEffect(() => {
        async function check() {
            if (!user) {
                log("Waiting for user...")
                return
            }

            log(`Auth User: ${user.id}`)

            // Check 1: Simple Select
            log("Attempting to fetch notifications...")
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', user.id)
                .limit(5)

            if (error) {
                log(`FETCH ERROR: ${error.message} (${error.code})`)
                log(`Details: ${JSON.stringify(error, null, 2)}`)
            } else {
                log(`FETCH SUCCESS. Count: ${data?.length}`)
                if (data && data.length > 0) {
                    log(`Sample: ${JSON.stringify(data[0])}`)
                }
            }

            // Check 2: Verify Table Existence (via Insert Test)
            log("Attempting Insert Test (Self-Notification)...")
            const { error: insertError } = await supabase
                .from('notifications')
                .insert({
                    recipient_id: user.id,
                    type: 'system',
                    content: 'Debug Notification Test',
                    is_read: false
                })

            if (insertError) {
                log(`INSERT ERROR: ${insertError.message} (${insertError.code})`)
            } else {
                log("INSERT SUCCESS.")
            }
        }

        check()
    }, [user, supabase])

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Debug Notifications</h1>
            <pre className="bg-slate-100 p-4 rounded whitespace-pre-wrap">{logs.join('\n')}</pre>
        </div>
    )
}
