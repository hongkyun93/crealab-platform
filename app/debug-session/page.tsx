"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function DebugSessionPage() {
    const [clientSession, setClientSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState<string>("")

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getSession().then(({ data }) => {
            setClientSession(data.session)
            setToken(data.session?.access_token || "No token")
            setLoading(false)
        })
    }, [])

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 break-all">
            <h1 className="text-2xl font-bold">Session Debugger</h1>

            <div className="border p-4 rounded bg-gray-50">
                <h2 className="font-bold mb-2">Client Side Session</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(clientSession, null, 2)}
                    </pre>
                )}
            </div>

            <div className="border p-4 rounded bg-gray-50">
                <h2 className="font-bold mb-2">Cookie Check (Client)</h2>
                <p className="text-sm">{typeof document !== 'undefined' ? document.cookie : 'N/A'}</p>
            </div>

            <div className="flex gap-4">
                <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded">Go to Login</Link>
                <Link href="/influencer" className="px-4 py-2 bg-green-500 text-white rounded">Go to Dashboard</Link>
            </div>
        </div>
    )
}
