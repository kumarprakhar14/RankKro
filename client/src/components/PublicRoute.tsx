import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'

interface PublicRouteProps {
    children: ReactNode
}

/**
 * Wraps routes that should ONLY be accessible to unauthenticated users
 * (like login or register pages).
 * Redirects to / if the user is already authenticated.
 */
export function PublicRoute({ children }: PublicRouteProps) {
    const { isAuthenticated } = useAuth()

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
