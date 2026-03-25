import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
    children: ReactNode
}

/**
 * Wraps routes that require authentication.
 * Redirects to /sign-in if not authenticated, preserving the intended destination.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth()
    const location = useLocation()

    if (!isAuthenticated) {
        // Save the attempted URL so we can redirect back after login
        return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
    }

    return <>{children}</>
}
