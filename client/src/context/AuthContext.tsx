import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authAPI } from '@/lib/api'

// Types matching server's sanitizeUser() response
export interface User {
    id: string
    name: string
    email: string
    phone: string | null
    image: string | null
    plan: 'FREE' | 'PREMIUM'
    role: 'USER' | 'ADMIN'
    isActive: boolean
    createdAt: string
}

interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean
    login: (accessToken: string, user: User) => void
    logout: () => Promise<void>
    setUser: (user: User) => void
}

const AuthContext = createContext<AuthState | null>(null)

const STORAGE_KEYS = {
    USER: 'rankro_user',
    TOKEN: 'rankro_access_token',
} as const

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.USER)
            return stored ? JSON.parse(stored) : null
        } catch {
            return null
        }
    })

    const [accessToken, setAccessToken] = useState<string | null>(() => {
        return localStorage.getItem(STORAGE_KEYS.TOKEN)
    })

    const isAuthenticated = !!user && !!accessToken

    const login = useCallback((token: string, userData: User) => {
        setAccessToken(token)
        setUserState(userData)
        localStorage.setItem(STORAGE_KEYS.TOKEN, token)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
    }, [])

    const setUser = useCallback((userData: User) => {
        setUserState(userData)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
    }, [])

    const logout = useCallback(async () => {
        try {
            // Call server to invalidate refresh token + clear cookie
            await authAPI.logout()
        } catch (error) {
            console.error('Logout API error:', error)
            // Still clear local state even if API call fails
        } finally {
            setAccessToken(null)
            setUserState(null)
            localStorage.removeItem(STORAGE_KEYS.TOKEN)
            localStorage.removeItem(STORAGE_KEYS.USER)
        }
    }, [])

    useEffect(() => {
        const handleUnauthorized = () => {
            setAccessToken(null)
            setUserState(null)
            localStorage.removeItem(STORAGE_KEYS.TOKEN)
            localStorage.removeItem(STORAGE_KEYS.USER)
            window.location.href = '/sign-up'
        }

        window.addEventListener('auth:unauthorized', handleUnauthorized)
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }, [])

    return (
        <AuthContext.Provider value={{ user, accessToken, isAuthenticated, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
