"use client"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LoadingState {
    name: string
    isLoading: boolean
    error?: string
    duration?: number
}

interface DebugLoadingScreenProps {
    loadingStates: LoadingState[]
    onRetry?: () => void
    showDetails?: boolean
}

export function DebugLoadingScreen({ loadingStates, onRetry, showDetails = true }: DebugLoadingScreenProps) {
    const [elapsedTime, setElapsedTime] = useState(0)
    const [showDebug, setShowDebug] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Auto-show debug info after 5 seconds
    useEffect(() => {
        if (elapsedTime > 5) {
            setShowDebug(true)
        }
    }, [elapsedTime])

    const allLoaded = loadingStates.every(state => !state.isLoading)
    const hasError = loadingStates.some(state => state.error)
    const isStuck = elapsedTime > 30 // Consider stuck after 30 seconds

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <Card className="w-full max-w-md p-6 shadow-xl border-2">
                <div className="flex flex-col items-center gap-6">
                    {/* Main Loading Indicator */}
                    <div className="relative">
                        {!hasError ? (
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        ) : (
                            <XCircle className="h-12 w-12 text-destructive" />
                        )}
                        {isStuck && (
                            <AlertTriangle className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
                        )}
                    </div>

                    {/* Main Message */}
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold">
                            {hasError ? '로딩 중 오류 발생' : allLoaded ? '거의 완료됨...' : '데이터를 불러오는 중'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            경과 시간: {elapsedTime}초
                        </p>
                        {isStuck && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                ⚠️ 평소보다 오래 걸리고 있습니다
                            </p>
                        )}
                    </div>

                    {/* Detailed Loading States */}
                    {(showDebug || showDetails || isStuck) && (
                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-muted-foreground">상세 로딩 상태</h3>
                                <button
                                    onClick={() => setShowDebug(!showDebug)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {showDebug ? '숨기기' : '보기'}
                                </button>
                            </div>

                            {showDebug && (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {loadingStates.map((state, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${state.error
                                                    ? 'bg-destructive/10 border-destructive/50'
                                                    : state.isLoading
                                                        ? 'bg-primary/5 border-primary/30'
                                                        : 'bg-emerald-500/10 border-emerald-500/30'
                                                }`}
                                        >
                                            <div className="shrink-0">
                                                {state.error ? (
                                                    <XCircle className="h-4 w-4 text-destructive" />
                                                ) : state.isLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-sm font-medium truncate">{state.name}</p>
                                                {state.error && (
                                                    <p className="text-xs text-destructive mt-0.5 truncate">
                                                        {state.error}
                                                    </p>
                                                )}
                                                {state.duration !== undefined && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {state.duration.toFixed(1)}초
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {(hasError || isStuck) && onRetry && (
                        <div className="w-full space-y-2">
                            <Button onClick={onRetry} className="w-full" variant={hasError ? "destructive" : "default"}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                다시 시도
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                문제가 계속되면 페이지를 새로고침해주세요
                            </p>
                        </div>
                    )}

                    {/* Debug Tips */}
                    {isStuck && (
                        <div className="w-full p-3 bg-muted/50 rounded-lg border border-dashed">
                            <p className="text-xs text-muted-foreground font-medium mb-2">💡 디버깅 팁:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• 브라우저 콘솔(F12)에서 에러 확인</li>
                                <li>• 네트워크 탭에서 실패한 요청 확인</li>
                                <li>• 인터넷 연결 상태 확인</li>
                            </ul>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
