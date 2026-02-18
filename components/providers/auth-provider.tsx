"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { SupabaseClient } from "@supabase/supabase-js"
import type { User } from "@/lib/types"
import { useRouter } from "next/navigation"

// Auth Context Type
interface AuthContextType {
    user: User | null
    supabase: SupabaseClient
    isAuthChecked: boolean
    isInitialized: boolean
    login: (email: string, password: string) => Promise<User>
    logout: () => Promise<void>
    updateUser: (data: Partial<User>, targetId?: string) => Promise<void>
    updateProfile: (data: Partial<User>, targetId?: string) => Promise<void>
    switchRole: (newRole: 'brand' | 'creator') => Promise<void>
    refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [supabase] = useState(() => createClient())
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const lastUserId = useRef<string | null>(null)
    const isInitAuthDone = useRef(false) // Guard: prevent onAuthStateChange from double-fetching during initAuth

    // Clear any stale localStorage cache on mount (no longer used)
    useEffect(() => {
        localStorage.removeItem("creadypick_user")
    }, [])

    // Fetch user profile from database
    const fetchUserProfile = async (sessionUser: any, retryCount = 0): Promise<User> => {
        try {
            // [PERF] Run profiles and team_members queries in parallel
            const [profileResult, teamResult] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', sessionUser.id)
                    .single(),
                supabase
                    .from('team_members')
                    .select('team_id')
                    .eq('user_id', sessionUser.id)
                    .maybeSingle()
            ])

            const { data: profile, error } = profileResult
            const { data: teamMember } = teamResult

            console.log('[AuthProvider] Raw profile from DB:', {
                id: profile?.id,
                email: profile?.email,
                role: profile?.role,
                onboarding_completed: profile?.onboarding_completed,
                tags: profile?.tags
            })

            if (profile) {
                const teamId = teamMember?.team_id

                const role = profile.role as any

                return {
                    id: sessionUser.id,
                    name: profile.display_name || sessionUser.email?.split('@')[0] || "User",
                    email: profile.email || sessionUser.email,
                    role: role,
                    onboardingCompleted: profile.onboarding_completed || false,
                    avatar: profile.avatar_url,
                    bio: profile.description,  // profiles 테이블의 description 컬럼 = bio
                    handle: profile.instagram_handle,
                    followers: profile.followers_count || 0,
                    tags: profile.tags || [],
                    phone: profile.phone,
                    address: profile.shipping_address,
                    teamId: teamId,

                    // Primary Region
                    primaryRegion: profile.primary_region,

                    // Rate card fields from profiles - EXTENDED
                    priceVideo: profile.price_video || 0,
                    priceFeed: profile.price_feed || 0,
                    priceStory: profile.price_story || 0,
                    priceUsageRights: profile.price_usage_rights || 0,
                    priceAutoDm: profile.price_auto_dm || 0,
                    secondaryRights: profile.secondary_rights || false,
                    usageRightsMonth: profile.usage_rights_month || 0,
                    usageRightsPrice: profile.usage_rights_price || 0,
                    autoDmMonth: profile.auto_dm_month || 0,
                    autoDmPrice: profile.auto_dm_price || 0,

                    // Bank Info
                    bankName: profile.bank_name,
                    accountNumber: profile.account_number,
                    accountHolder: profile.account_holder
                }
            }

            if (error) {
                console.warn('[AuthProvider] Profile fetch issue:', error.message)
            }
        } catch (e: any) {
            // Detect AbortError (React StrictMode double-mount cancels in-flight requests)
            const isAbortError = e?.name === 'AbortError' ||
                e?.message?.includes('AbortError') ||
                e?.message?.includes('aborted') ||
                e?.message === 'Failed to fetch' ||
                e?.message === 'Load failed'

            if (isAbortError && retryCount < 2) {
                // Retry after a short delay - the abort was transient (StrictMode cleanup)
                console.log(`[AuthProvider] Fetch aborted, retrying (attempt ${retryCount + 1})...`)
                await new Promise(resolve => setTimeout(resolve, 150))
                return fetchUserProfile(sessionUser, retryCount + 1)
            }

            console.error("[AuthProvider] Exception:", e)
        }

        // Fallback: DB fetch failed, use session metadata
        console.warn('[AuthProvider] Profile DB fetch failed, using session metadata fallback')
        return {
            id: sessionUser.id,
            name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || "User",
            email: sessionUser.email,
            role: sessionUser.user_metadata?.role as "brand" | "creator" | "admin", // No default fallback
            avatar: sessionUser.user_metadata?.avatar_url,
            tags: [],
            _isFallback: true  // Flag to indicate this is a fallback, not a fresh user
        } as User
    }

    // Auth initialization and listener
    useEffect(() => {
        let mounted = true

        // Failsafe timeout to prevent infinite loading if auth check hangs
        // 15s gives enough time for slow networks to recover session from cookies
        const timer = setTimeout(() => {
            if (!isAuthChecked && mounted) {
                console.warn("[AuthProvider] Auth check timed out, forcing render")
                // NOTE: Do NOT set mounted=false here - initAuth may still complete
                setIsAuthChecked(true)
                setIsInitialized(true)
                window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '인증 확인 시간 초과 (강제 진행)', type: 'error' } }))
            }
        }, 15000)

        const initAuth = async () => {
            console.log('[AuthProvider] Initializing auth...')

            try {
                // Use getUser() instead of getSession() for faster cookie-based session recovery
                // getSession() checks localStorage first, then falls back to server (slow when localStorage is empty)
                // getUser() always validates with server directly, more reliable with SSR cookie sessions
                const { data: { user: sessionUser } } = await supabase.auth.getUser()

                if (sessionUser && mounted) {
                    console.log('[AuthProvider] User found:', sessionUser.id)
                    lastUserId.current = sessionUser.id // Set before fetch so onAuthStateChange skips
                    const fetchedUser = await fetchUserProfile(sessionUser)

                    if (fetchedUser && mounted) {
                        setUser(fetchedUser)

                        // STRICT REDIRECT LOGIC
                        const currentPath = window.location.pathname

                        if (!fetchedUser.role && !(fetchedUser as any)._isFallback) {
                            if (currentPath !== '/onboarding') {
                                console.log('[AuthProvider] Role is NULL -> Redirecting to /onboarding')
                                router.replace('/onboarding')
                            }
                        } else {
                            if (currentPath === '/onboarding' || currentPath === '/login' || currentPath === '/signup') {
                                const target = fetchedUser.role === 'brand' || fetchedUser.role === 'agency' ? '/brand' : '/creator'
                                console.log(`[AuthProvider] Role is ${fetchedUser.role} -> Redirecting to ${target}`)
                                router.replace(target)
                            }
                        }
                    }
                } else if (mounted) {
                    console.log('[AuthProvider] No session found, clearing user')
                    setUser(null)
                }
            } catch (e) {
                console.error('[AuthProvider] initAuth error:', e)
            } finally {
                clearTimeout(timer) // Cancel the failsafe timeout since initAuth completed
                if (mounted) {
                    setIsAuthChecked(true)
                    setIsInitialized(true) // initAuth complete → isInitialized now means "DB fetch done"
                    isInitAuthDone.current = true // Signal: onAuthStateChange can now handle events
                }
            }
        }

        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[AuthProvider] Auth event: ${event}`, session?.user?.id)

            if (session?.user) {
                // Skip INITIAL_SESSION: initAuth already handled it
                // Skip if same user and not a fresh SIGNED_IN event
                if (event === 'INITIAL_SESSION') {
                    console.log('[AuthProvider] Skip INITIAL_SESSION (handled by initAuth)')
                    return
                }
                if (lastUserId.current === session.user.id && event !== 'SIGNED_IN') {
                    console.log('[AuthProvider] Skip redundant fetch')
                    return
                }

                lastUserId.current = session.user.id
                if (mounted) {
                    const fetchedUser = await fetchUserProfile(session.user)
                    setUser(fetchedUser)

                    // Check if user needs onboarding (first login only)
                    if (session?.user && fetchedUser) {
                        console.log('[AuthProvider] Onboarding Check:', {
                            pathname: window.location.pathname,
                            onboardingCompleted: fetchedUser.onboardingCompleted,
                            email: fetchedUser.email,
                            role: fetchedUser.role
                        });

                        // Redirect to onboarding ONLY if not completed AND not already there
                        const needsOnboarding = !fetchedUser.onboardingCompleted &&
                            fetchedUser.role !== 'admin' &&
                            fetchedUser.role !== 'mcn' &&
                            fetchedUser.role !== 'creator' &&
                            fetchedUser.role !== 'brand' &&
                            fetchedUser.role !== 'agency';

                        if (needsOnboarding && window.location.pathname !== '/onboarding') {
                            console.log('[AuthProvider] Onboarding required - redirecting')
                            router.push('/onboarding')
                        }
                        // After login/signup, redirect to appropriate dashboard
                        else if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
                            if (fetchedUser.role === 'brand' || fetchedUser.role === 'agency') {
                                router.push('/brand')
                            } else {
                                // creator, mcn, admin go to creator dashboard
                                router.push('/creator')
                            }
                        }
                    }
                }
            } else if (mounted) {
                lastUserId.current = null
                setUser(null)
            }
            if (mounted) {
                setIsAuthChecked(true)
                setIsInitialized(true)
            }
        })

        // Failsafe timeout: Reduced for faster automation recovery (Cleanup managed via primary useEffect)

        return () => {
            mounted = false
            subscription.unsubscribe()
            clearTimeout(timer)
        }
    }, [supabase])

    // Login function
    const login = async (email: string, password: string): Promise<User> => {
        try {
            // 1. Clear ALL caches before login (stale data prevention)
            localStorage.removeItem("creadypick_user")
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-')) localStorage.removeItem(key)
            })
            sessionStorage.clear()
            document.cookie.split(';').forEach(cookie => {
                const name = cookie.split('=')[0].trim()
                if (name.startsWith('sb-') || name === 'supabase-auth-token') {
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
                }
            })
            setUser(null)

            // 2. Sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                throw error
            }

            if (data.session?.user) {
                // 3. Always fetch fresh user info from DB
                const profile = await fetchUserProfile(data.session.user)
                return profile
            }
        } catch (e) {
            console.error("[AuthProvider] Login error:", e)
        }

        throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.")
    }

    // Logout function
    const logout = async () => {
        try {
            console.log('[AuthProvider] Signing out...')
            const { error } = await supabase.auth.signOut({ scope: 'global' })
            if (error) {
                console.error('[AuthProvider] Logout error:', error)
                // Continue with local cleanup even if server signout implies error
            }

            // 1. Clear state
            setUser(null)

            // 2. Clear localStorage (creadypick + supabase sb-* keys)
            localStorage.removeItem("creadypick_user")
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-')) localStorage.removeItem(key)
            })

            // 3. Clear sessionStorage
            sessionStorage.clear()

            // 4. Clear browser cookies (sb-* auth token cookies)
            document.cookie.split(';').forEach(cookie => {
                const name = cookie.split('=')[0].trim()
                if (name.startsWith('sb-') || name === 'supabase-auth-token') {
                    // Expire on all possible paths and domains
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
                }
            })

            // 5. Navigate (full reload to clear any in-memory state)
            window.location.href = '/login'
        } catch (error: any) {
            console.error('[AuthProvider] Logout failed:', error)
            setUser(null)
            localStorage.removeItem("creadypick_user")
            sessionStorage.clear()
            window.location.href = '/login'
        }
    }

    // Generic Profile Update Function (Exposed)
    const updateProfile = async (data: Partial<User>, targetId?: string) => {
        // Default to current user if no targetId provided
        const idToUpdate = targetId || user?.id
        console.log('[AuthProvider] Updating profile:', idToUpdate, data)

        if (!idToUpdate) {
            console.error('[AuthProvider] No user ID to update')
            return
        }

        try {
            // Consolidated profile updates
            const updates: any = {
                updated_at: new Date().toISOString(),
            }

            // Basic profile fields
            if (data.name !== undefined) updates.display_name = data.name
            if (data.bio !== undefined) updates.description = data.bio  // profiles 테이블의 description 컬럼 = bio
            if (data.avatar !== undefined) updates.avatar_url = data.avatar
            if (data.phone !== undefined) updates.phone = data.phone
            if (data.address !== undefined) updates.shipping_address = data.address

            // NEW: Primary Region
            if (data.primaryRegion !== undefined) updates.primary_region = data.primaryRegion

            // Determine role/type for logic (If updating self, use local user.type, else fetch or assume creator)
            // For now, if targetId is different, we assume we are updating a creator as MCN
            const isUpdatingSelf = idToUpdate === user?.id
            const targetType = isUpdatingSelf ? user?.role : 'creator'

            // Creator specific fields
            if (targetType === 'creator') {
                if (data.tags !== undefined) updates.tags = data.tags
                if (data.handle !== undefined) updates.instagram_handle = data.handle
                if (data.followers !== undefined) {
                    const count = typeof data.followers === 'string' ? parseInt(data.followers) : data.followers
                    updates.followers_count = isNaN(count) ? 0 : count

                    let tier = 'Nano'
                    if (count >= 1000000) tier = 'Mega'
                    else if (count >= 100000) tier = 'Macro'
                    else if (count >= 10000) tier = 'Micro'
                    updates.tier = tier
                }

                // Rate card fields - EXTENDED
                if (data.priceVideo !== undefined) updates.price_video = data.priceVideo
                if (data.priceFeed !== undefined) updates.price_feed = data.priceFeed
                if (data.priceStory !== undefined) updates.price_story = data.priceStory
                if (data.priceUsageRights !== undefined) updates.price_usage_rights = data.priceUsageRights
                if (data.priceAutoDm !== undefined) updates.price_auto_dm = data.priceAutoDm
                if (data.secondaryRights !== undefined) updates.secondary_rights = !!data.secondaryRights
                if (data.usageRightsMonth !== undefined) updates.usage_rights_month = data.usageRightsMonth
                if (data.usageRightsPrice !== undefined) updates.usage_rights_price = data.usageRightsPrice
                if (data.autoDmMonth !== undefined) updates.auto_dm_month = data.autoDmMonth
                if (data.autoDmPrice !== undefined) updates.auto_dm_price = data.autoDmPrice

                // Bank Info
                if (data.bankName !== undefined) updates.bank_name = data.bankName
                if (data.accountNumber !== undefined) updates.account_number = data.accountNumber
                if (data.accountHolder !== undefined) updates.account_holder = data.accountHolder
            }

            console.log('[AuthProvider] Profile updates payload:', updates)

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', idToUpdate)

            if (updateError) {
                console.error('[AuthProvider] Profile update error:', JSON.stringify(updateError, null, 2))
                alert(`저장 실패 (Profile): ${updateError.message || JSON.stringify(updateError)}`)
                throw updateError
            }

            console.log('[AuthProvider] Profile updated successfully')

            // Only update local state if we updated ourselves
            if (isUpdatingSelf && user) {
                const updatedUser = { ...user, ...data }
                setUser(updatedUser)
                console.log('[AuthProvider] Local user state updated')
            } else {
                // If we updated someone else (proxy), we might want to trigger a refresh if the UI depends on it
                // For now, the caller (SettingsView) usually handles the UI state or re-fetch
                console.log('[AuthProvider] Proxy update completed - Local user state unchanged')
            }

        } catch (error: any) {
            console.error('[AuthProvider] Update failed:', error)
            throw error
        }
    }

    // Legacy alias (for backward compatibility), but now supports targetId
    const updateUser = updateProfile

    // Switch role
    const switchRole = async (newRole: 'brand' | 'creator') => {
        if (!user) {
            alert("로그인 세션이 확인되지 않습니다.")
            return
        }

        try {
            console.log(`[AuthProvider] Switching to: ${newRole}`)

            // Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    role: newRole,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' })

            if (profileError) {
                console.error('[AuthProvider] Switch role error:', profileError)
                throw new Error(`DB 업데이트 실패: ${profileError.message}`)
            }

            // Update auth metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { role: newRole }
            })

            if (authError) {
                console.error('[AuthProvider] Auth metadata error:', authError)
            }

            // Update local state
            setUser(prev => prev ? { ...prev, role: newRole } : null)

            alert("계정 유형이 성공적으로 변경되었습니다. 새로운 대시보드로 이동합니다.")
            window.location.href = newRole === 'brand' ? '/brand' : '/creator'
        } catch (error: any) {
            console.error('[AuthProvider] Switch failed:', error)
            alert(`전환 실패: ${error.message || "알 수 없는 오류"}`)
            throw error
        }
    }

    // Refresh session and user profile
    const refreshSession = async () => {
        console.log('[AuthProvider] Manual session refresh...')
        try {
            const { data: { session }, error } = await supabase.auth.refreshSession()
            if (error) {
                console.error('[AuthProvider] Session refresh error:', error)
                throw error
            }

            if (session?.user) {
                window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '사용자 프로필 불러오는 중...', type: 'loading' } }))
                const fetchedUser = await fetchUserProfile(session.user)
                if (fetchedUser) {
                    setUser(fetchedUser)
                    window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: `${fetchedUser.name}님 환영합니다 (${fetchedUser.role})`, type: 'success' } }))
                    console.log('[AuthProvider] User profile refreshed:', fetchedUser.role)
                }
            } else {
                window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '게스트 모드로 시작', type: 'info' } }))
            }
        } catch (error) {
            console.error('[AuthProvider] Failed to refresh session:', error)
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            supabase,
            isAuthChecked,
            isInitialized,
            login,
            logout,
            updateUser, // Kept for compatibility
            updateProfile, // New exposed function
            switchRole,
            refreshSession
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        // Return safe fallback to prevent SSR crashes (Recoverable Error)
        // This allows the app to hydration-switch to client rendering if server render fails context lookup
        console.warn('useAuth used outside AuthProvider, returning fallback')
        return {
            user: null,
            supabase: createClient(), // Fallback (rarely used, but keeps types happy)
            isAuthChecked: false,
            isInitialized: false,
            login: async () => { throw new Error('Auth not initialized') },
            logout: async () => { },
            updateUser: async () => { },
            updateProfile: async () => { },
            switchRole: async () => { },
            refreshSession: async () => { }
        }
    }
    return context
}
