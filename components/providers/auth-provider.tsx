"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@/lib/types"

// Auth Context Type
interface AuthContextType {
    user: User | null
    isAuthChecked: boolean
    isInitialized: boolean
    login: (email: string, password: string) => Promise<User>
    logout: () => Promise<void>
    updateUser: (data: Partial<User>) => Promise<void>
    switchRole: (newRole: 'brand' | 'influencer') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [supabase] = useState(() => createClient())
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
                .select('*, influencer_details(*)')
                .eq('id', sessionUser.id)
                .single()

            if (profile) {
                let details = null
                if (Array.isArray(profile.influencer_details)) {
                    details = profile.influencer_details.length > 0 ? profile.influencer_details[0] : null
                } else {
                    details = profile.influencer_details
                }

                console.log('[AuthProvider] Fetched profile with details:', {
                    hasDetails: !!details,
                    tags: details?.tags,
                    priceVideo: details?.price_video
                })

                return {
                    id: sessionUser.id,
                    name: profile.display_name || profile.name || sessionUser.email?.split('@')[0] || "User",
                    type: (profile.role as "brand" | "influencer" | "admin") || "influencer",
                    avatar: profile.avatar_url,
                    bio: profile.bio,
                    website: profile.website,
                    handle: details?.instagram_handle || undefined,
                    followers: details?.followers_count || 0,
                    tags: details?.tags || [],
                    phone: profile.phone,
                    address: profile.address,
                    priceVideo: details?.price_video || 0,
                    priceFeed: details?.price_feed || 0,
                    secondaryRights: details?.secondary_rights || 0,
                    usageRightsMonth: details?.usage_rights_month || 0,
                    usageRightsPrice: details?.usage_rights_price || 0,
                    autoDmMonth: details?.auto_dm_month || 0,
                    autoDmPrice: details?.auto_dm_price || 0
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
            type: (sessionUser.user_metadata?.role as "brand" | "influencer" | "admin") || "influencer",
            avatar: sessionUser.user_metadata?.avatar_url,
            tags: []
        }
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
                const fetchedUser = await fetchUserProfile(session.user)
                if (fetchedUser) {
                    setUser(fetchedUser)
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
                return {
                    id: data.session.user.id,
                    name: data.session.user.user_metadata?.name || email.split('@')[0],
                    type: (data.session.user.user_metadata?.role as "brand" | "influencer" | "admin") || "influencer"
                }
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

    // Update user profile
    const updateUser = async (data: Partial<User>) => {
        console.log('[AuthProvider] Updating user:', user?.id, data)

        if (!user) {
            console.error('[AuthProvider] No user to update')
            return
        }

        try {
            // Profile updates
            const profileUpdates: any = {
                updated_at: new Date().toISOString(),
            }
            if (data.name !== undefined) profileUpdates.display_name = data.name
            if (data.bio !== undefined) profileUpdates.bio = data.bio
            if (data.avatar !== undefined) profileUpdates.avatar_url = data.avatar
            if (data.website !== undefined) profileUpdates.website = data.website
            if (data.phone !== undefined) profileUpdates.phone = data.phone
            if (data.address !== undefined) profileUpdates.address = data.address

            console.log('[AuthProvider] Profile updates:', profileUpdates)

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...profileUpdates
                }, { onConflict: 'id' })

            if (profileError) {
                console.error('[AuthProvider] Profile update error:', profileError)
                alert(`저장 실패 (Profile): ${profileError.message}`)
                throw profileError
            }

            // Influencer details updates
            if (user.type === 'influencer') {
                const detailsUpdates: any = {
                    id: user.id,
                    updated_at: new Date().toISOString(),
                }

                if (data.tags !== undefined) detailsUpdates.tags = data.tags
                if (data.handle !== undefined) detailsUpdates.instagram_handle = data.handle
                if (data.followers !== undefined) {
                    const count = typeof data.followers === 'string' ? parseInt(data.followers) : data.followers
                    detailsUpdates.followers_count = isNaN(count) ? 0 : count

                    let tier = 'Nano'
                    if (count >= 1000000) tier = 'Mega'
                    else if (count >= 100000) tier = 'Macro'
                    else if (count >= 10000) tier = 'Micro'
                    detailsUpdates.tier = tier
                }

                // Rate card fields
                if (data.priceVideo !== undefined) detailsUpdates.price_video = data.priceVideo
                if (data.priceFeed !== undefined) detailsUpdates.price_feed = data.priceFeed
                if (data.secondaryRights !== undefined) detailsUpdates.secondary_rights = !!data.secondaryRights
                if (data.usageRightsMonth !== undefined) detailsUpdates.usage_rights_month = data.usageRightsMonth
                if (data.usageRightsPrice !== undefined) detailsUpdates.usage_rights_price = data.usageRightsPrice
                if (data.autoDmMonth !== undefined) detailsUpdates.auto_dm_month = data.autoDmMonth
                if (data.autoDmPrice !== undefined) detailsUpdates.auto_dm_price = data.autoDmPrice

                console.log('[AuthProvider] Influencer details updates:', detailsUpdates)

                const { error: detailsError } = await supabase
                    .from('influencer_details')
                    .upsert(detailsUpdates, { onConflict: 'id' })

                if (detailsError) {
                    console.warn('[AuthProvider] Influencer details error:', detailsError)
                } else {
                    console.log('[AuthProvider] Influencer details updated')
                }
            }

            // Update local state
            const updatedUser = { ...user, ...data }
            setUser(updatedUser)
            console.log('[AuthProvider] User updated successfully')
        } catch (error: any) {
            console.error('[AuthProvider] Update failed:', error)
            throw error
        }
    }

    // Switch role
    const switchRole = async (newRole: 'brand' | 'influencer') => {
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
            setUser(prev => prev ? { ...prev, type: newRole } : null)

            alert("계정 유형이 성공적으로 변경되었습니다. 새로운 대시보드로 이동합니다.")
            window.location.href = newRole === 'brand' ? '/brand' : '/creator'
        } catch (error: any) {
            console.error('[AuthProvider] Switch failed:', error)
            alert(`전환 실패: ${error.message || "알 수 없는 오류"}`)
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthChecked,
            isInitialized,
            login,
            logout,
            updateUser,
            switchRole
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
            isAuthChecked: false,
            isInitialized: false,
            login: async () => { throw new Error('Auth not initialized') },
            logout: async () => { },
            updateUser: async () => { },
            switchRole: async () => { }
        }
    }
    return context
}
