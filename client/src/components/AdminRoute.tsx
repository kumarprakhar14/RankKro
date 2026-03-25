import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'

interface AdminRouteProps {
    children: ReactNode
}

/**
 * Wraps routes that require ADMIN role.
 * Redirects to /sign-in if not authenticated, or to / if the user is not an ADMIN.
 */
export function AdminRoute({ children }: AdminRouteProps) {
    const { isAuthenticated, user } = useAuth()
    const location = useLocation()


    if (!isAuthenticated) {
        return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
    }
    

    if (user?.role !== 'ADMIN') {
        // Not an admin -> send back to home or a 403 page
        alert("You are not authorized to access this page")
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}
