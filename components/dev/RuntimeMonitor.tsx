"use client"

import { useUnifiedProvider } from "@/components/providers/unified-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, CheckCircle2, ChevronDown, Clock, Info, Terminal, XCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function RuntimeMonitor() {
    const { loadingStates, isLoading, isAuthLoading } = useUnifiedProvider()
    const [isOpen, setIsOpen] = useState(false)
    const [logs, setLogs] = useState<{ id: string, time: string, msg: string, type: 'info' | 'success' | 'error' | 'loading' }[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)

    // Add logs based on loading state changes
    useEffect(() => {
        const timestamp = new Date().toLocaleTimeString()

        // Auth Log
        if (isAuthLoading) {
            addLog("인증 시스템 확인 중...", 'loading')
        } else {
            addLog("인증 정보 확인 완료", 'success')
        }

    }, [isAuthLoading])

    // Monitor specific loading states
    useEffect(() => {
        loadingStates?.forEach(state => {
            if (state.isLoading) {
                // addLog(`${state.name} 로드 시작`, 'loading')
            }
        })
    }, [loadingStates])

    // Listen for custom runtime logs
    useEffect(() => {
        const handleRuntimeLog = (e: any) => {
            const { msg, type } = e.detail
            addLog(msg, type || 'info')
        }
        window.addEventListener('runtime-log', handleRuntimeLog)
        return () => window.removeEventListener('runtime-log', handleRuntimeLog)
    }, [])

    const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'loading') => {
        const time = new Date().toLocaleTimeString()
        const id = Math.random().toString(36).substr(2, 9)
        setLogs(prev => {
            // Prevent duplicate adjacent logs with same message
            if (prev.length > 0 && prev[prev.length - 1].msg === msg) return prev
            // Keep only last 50 logs
            const next = [...prev, { id, time, msg, type }]
            return next.slice(-50)
        })
    }

    // Auto scroll logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs, isOpen])

    return (
        <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs">
            {/* Minimal Toggle Bubble */}
            {!isOpen && (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                    className={`rounded-full shadow-2xl border-2 border-primary/20 gap-2 h-10 px-4 animate-in fade-in slide-in-from-bottom-2 ${isLoading ? 'animate-pulse bg-amber-50 dark:bg-amber-900/20' : 'bg-background'}`}
                >
                    <Activity className={`h-4 w-4 ${isLoading ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <span className="font-bold">RUNTIME MONITOR</span>
                    {isLoading && <Badge variant="outline" className="h-4 px-1 text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20">LOADING</Badge>}
                </Button>
            )}

            {/* Expanded Monitor Panel */}
            {isOpen && (
                <div className="w-[380px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="p-3 bg-muted/50 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal className="h-4 w-4 text-primary" />
                            <span className="font-bold tracking-tight">System Status</span>
                            {isLoading && <Activity className="h-3 w-3 animate-spin text-amber-500" />}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => setIsOpen(false)}>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Loading State Grid */}
                    <div className="p-4 grid grid-cols-2 gap-2 bg-muted/20 border-b">
                        {loadingStates?.map(state => (
                            <div key={state.name} className="flex items-center justify-between gap-2 p-1.5 rounded border bg-background/50">
                                <span className="truncate text-muted-foreground">{state.name}</span>
                                {state.isLoading ? (
                                    <Clock className="h-3 w-3 animate-spin text-amber-500" />
                                ) : (
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Console Logs */}
                    <div
                        ref={scrollRef}
                        className="h-[240px] overflow-y-auto p-3 space-y-1.5 bg-black/5 dark:bg-white/5 scrollbar-thin"
                    >
                        {logs.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground italic gap-2 opacity-50">
                                <Info className="h-4 w-4" />
                                <span>No events logged yet</span>
                            </div>
                        )}
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-2 leading-relaxed animate-in fade-in slide-in-from-left-1 duration-200">
                                <span className="text-[10px] text-muted-foreground opacity-70 shrink-0">[{log.time}]</span>
                                <span className={`
                                    ${log.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                                    ${log.type === 'error' ? 'text-red-500' : ''}
                                    ${log.type === 'loading' ? 'text-amber-600 dark:text-amber-400 italic' : ''}
                                    ${log.type === 'info' ? 'text-foreground' : ''}
                                `}>
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Performance Metrics */}
                    <div className="p-2 px-3 flex justify-between items-center bg-primary/5 border-t border-primary/10 text-[10px]">
                        <div className="flex items-center gap-3">
                            <span className="text-primary font-bold">Optimization:</span>
                            <span className="text-emerald-600 dark:text-emerald-400">TURBO ENABLED</span>
                            <span className="text-blue-600 dark:text-blue-400">MEMOIZED HOOKS</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-2 px-3 flex justify-between items-center bg-muted/30 border-t text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <div className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            {isLoading ? 'Processing hooks...' : 'All core systems stable'}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-[10px] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40"
                            onClick={() => setLogs([])}
                        >
                            <XCircle className="h-3 w-3 mr-1" /> Clear
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
