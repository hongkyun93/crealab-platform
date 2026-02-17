"use client"

import React, { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, XCircle, ChevronUp, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoadingState {
    name: string
    isLoading: boolean
    error?: string
}

interface DebugMonitorProps {
    loadingStates: LoadingState[]
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}

export function DebugMonitor({ loadingStates, position = 'bottom-left' }: DebugMonitorProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [elapsedTime, setElapsedTime] = useState(0)

    // Check if in development mode
    const isDev = process.env.NODE_ENV === 'development'

    // Allow toggle via localStorage
    const [showMonitor, setShowMonitor] = useState(false)

    useEffect(() => {
        const shouldShow = isDev || localStorage.getItem('debug-monitor') === 'true'
        setShowMonitor(shouldShow)
    }, [isDev])

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Auto-expand if loading takes too long
    useEffect(() => {
        const isLoading = loadingStates.some(s => s.isLoading)
        if (isLoading && elapsedTime > 5) {
            setIsExpanded(true)
        }
    }, [elapsedTime, loadingStates])

    if (!showMonitor || !isVisible) return null

    const isLoading = loadingStates.some(state => state.isLoading)
    const hasError = loadingStates.some(state => state.error)
    const loadingCount = loadingStates.filter(s => s.isLoading).length

    const positionClasses = {
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
    }

    return (
        <div
            className={`fixed ${positionClasses[position]} z-50 font-mono text-xs`}
            style={{ maxWidth: '320px' }}
        >
            {/* Collapsed State */}
            {!isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg
                        border-2 shadow-lg backdrop-blur-sm
                        transition-all hover:scale-105
                        ${hasError
                            ? 'bg-red-500/90 border-red-600 text-white'
                            : isLoading
                                ? 'bg-yellow-500/90 border-yellow-600 text-black animate-pulse'
                                : 'bg-emerald-500/90 border-emerald-600 text-white'
                        }
                    `}
                >
                    {hasError ? (
                        <XCircle className="h-4 w-4" />
                    ) : isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4" />
                    )}
                    <span className="font-bold">
                        {hasError ? 'ERROR' : isLoading ? `로딩 중 (${loadingCount})` : 'OK'}
                    </span>
                    {elapsedTime > 0 && isLoading && (
                        <span className="text-[10px] opacity-80">{elapsedTime}초</span>
                    )}
                </button>
            ) : (
                /* Expanded State */
                <div className="bg-black/90 border-2 border-red-500 rounded-lg shadow-2xl p-3 backdrop-blur-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-red-500/50">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-red-400 font-bold text-xs">DEBUG MONITOR</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="text-gray-400 hover:text-white p-1"
                            >
                                <ChevronDown className="h-3 w-3" />
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-gray-400 hover:text-white p-1"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* Loading States */}
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {loadingStates.map((state, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-2 p-1.5 rounded ${state.error
                                        ? 'bg-red-500/20'
                                        : state.isLoading
                                            ? 'bg-yellow-500/20'
                                            : 'bg-emerald-500/20'
                                    }`}
                            >
                                <div className="shrink-0">
                                    {state.error ? (
                                        <XCircle className="h-3 w-3 text-red-400" />
                                    ) : state.isLoading ? (
                                        <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />
                                    ) : (
                                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[11px] truncate ${state.error ? 'text-red-300' : 'text-gray-300'
                                        }`}>
                                        {state.name}
                                    </p>
                                    {state.error && (
                                        <p className="text-[9px] text-red-400 truncate mt-0.5">
                                            {state.error}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    {elapsedTime > 10 && isLoading && (
                        <div className="mt-2 pt-2 border-t border-red-500/50">
                            <p className="text-[10px] text-yellow-400 text-center">
                                ⚠️ {elapsedTime}초 경과 - 평소보다 오래 걸리는 중
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
