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

    // Initialize from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("creadypick_user")
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                console.error("[AuthProvider] Failed to parse stored user:", e)
            }
        }
        setIsInitialized(true)
    }, [])

    // Save user to localStorage
    useEffect(() => {
        if (!isInitialized) return
        if (user) {
            localStorage.setItem("creadypick_user", JSON.stringify(user))
        } else {
            localStorage.removeItem("creadypick_user")
        }
    }, [user, isInitialized])

    // Fetch user profile from database
    const fetchUserProfile = async (sessionUser: any): Promise<User> => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', sessionUser.id)
                .single()

            console.log('[AuthProvider] Raw profile from DB:', {
                id: profile?.id,
                email: profile?.email,
                role: profile?.role,
                onboarding_completed: profile?.onboarding_completed,
                tags: profile?.tags
            })

            if (profile) {
                let teamId = undefined;
                try {
                    const { data: teamMember } = await supabase
                        .from('team_members')
                        .select('team_id')
                        .eq('user_id', sessionUser.id)
                        .maybeSingle()

                    if (teamMember) teamId = teamMember.team_id
                } catch (e) {
                    console.warn('[AuthProvider] Team fetch error', e)
                }

                // [REFACTOR] user_type removed. Using role as primary.
                // If role is missing in DB (legacy data), fallback to user_type if present, otherwise NULL (to trigger onboarding)
                const role = (profile.role || profile.user_type) as any

                return {
                    id: sessionUser.id,
                    name: profile.display_name || profile.name || sessionUser.email?.split('@')[0] || "User",
                    email: profile.email || sessionUser.email,
                    role: role, // Mapped directly
                    onboardingCompleted: profile.onboarding_completed || false,
                    avatar: profile.avatar_url,
                    bio: profile.bio,
                    website: profile.website,
                    handle: profile.instagram_handle || profile.handle,
                    followers: profile.followers_count || 0,
                    tags: profile.tags || [],
                    phone: profile.phone,
                    address: profile.address,
                    teamId: teamId,

                    // Rate card fields from profiles
                    priceVideo: profile.price_video || 0,
                    priceFeed: profile.price_feed || 0,
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
        } catch (e) {
            console.error("[AuthProvider] Exception:", e)
        }

        // Fallback
        return {
            id: sessionUser.id,
            name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || "User",
            email: sessionUser.email,
            role: sessionUser.user_metadata?.role as "brand" | "creator" | "admin", // No default fallback
            avatar: sessionUser.user_metadata?.avatar_url,
            tags: []
        } as User
    }

    // Auth initialization and listener
    useEffect(() => {
        let mounted = true

        const initAuth = async () => {
            console.log('[AuthProvider] Initializing auth...')

            // Retry logic for session
            let session = null
            for (let i = 0; i < 5; i++) {
                const result = await supabase.auth.getSession()
                session = result.data.session
                if (session?.user) {
                    console.log(`[AuthProvider] Session found on attempt ${i + 1}`)
                    break
                }
                if (i < 4) await new Promise(resolve => setTimeout(resolve, 50))
            }

            if (session?.user && mounted) {
                console.log('[AuthProvider] User found:', session.user.id)
                // FORCE DATABASE FETCH: Do not trust local storage or metadata for role
                const fetchedUser = await fetchUserProfile(session.user)

                if (fetchedUser) {
                    setUser(fetchedUser)

                    // STRICT REDIRECT LOGIC
                    const currentPath = window.location.pathname

                    if (!fetchedUser.role) {
                        // Case 1: Role is NULL -> MUST go to Onboarding
                        if (currentPath !== '/onboarding') {
                            console.log('[AuthProvider] Role is NULL -> Redirecting to /onboarding')
                            router.replace('/onboarding')
                        }
                    } else {
                        // Case 2: Role exists -> MUST NOT be on Onboarding or Login
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
            if (mounted) setIsAuthChecked(true)
        }

        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[AuthProvider] Auth event: ${event}`, session?.user?.id)

            if (session?.user) {
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
            if (mounted) setIsAuthChecked(true)
        })

        // Failsafe timeout
        const timer = setTimeout(() => {
            if (!isAuthChecked && mounted) {
                console.warn("[AuthProvider] Auth check timed out, forcing render")
                setIsAuthChecked(true)
            }
        }, 10000)

        return () => {
            mounted = false
            subscription.unsubscribe()
            clearTimeout(timer)
        }
    }, [supabase])

    // Login function
    const login = async (email: string, password: string): Promise<User> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                throw error
            }

            if (data.session?.user) {
                // Strict Login: Fetch profile from DB to get real role
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
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error('[AuthProvider] Logout error:', error)
                // Continue with local cleanup even if server signout implies error
            }

            // 1. Clear state
            setUser(null)

            // 2. Clear all local storage to be safe (or specific keys)
            localStorage.removeItem("creadypick_user")
            // Also might want to clear supabase session if it persists
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-')) localStorage.removeItem(key)
            })

            // 3. Navigate
            window.location.href = '/login'
        } catch (error: any) {
            console.error('[AuthProvider] Logout failed:', error)
            setUser(null)
            localStorage.removeItem("creadypick_user")
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
            if (data.bio !== undefined) updates.bio = data.bio
            if (data.avatar !== undefined) updates.avatar_url = data.avatar
            if (data.website !== undefined) updates.website = data.website
            if (data.phone !== undefined) updates.phone = data.phone
            if (data.address !== undefined) updates.address = data.address

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

                // Rate card fields
                if (data.priceVideo !== undefined) updates.price_video = data.priceVideo
                if (data.priceFeed !== undefined) updates.price_feed = data.priceFeed
                if (data.secondaryRights !== undefined) updates.secondary_rights = !!data.secondaryRights
                if (data.usageRightsMonth !== undefined) updates.usage_rights_month = data.usageRightsMonth
                if (data.usageRightsPrice !== undefined) updates.usage_rights_price = data.usageRightsPrice
                if (data.autoDmMonth !== undefined) updates.auto_dm_month = data.autoDmMonth
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
                .upsert({
                    id: idToUpdate,
                    ...updates
                }, { onConflict: 'id' })

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
                const fetchedUser = await fetchUserProfile(session.user)
                if (fetchedUser) {
                    setUser(fetchedUser)
                    console.log('[AuthProvider] User profile refreshed:', fetchedUser.role)
                }
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
