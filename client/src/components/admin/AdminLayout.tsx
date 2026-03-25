import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, FileQuestion, BookOpen, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Questions', path: '/admin/questions', icon: FileQuestion },
    { label: 'Tests', path: '/admin/tests', icon: BookOpen },
]

export function AdminLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        if (window.confirm("Are you sure you want to log out?")) {
            await logout()
            navigate('/sign-in')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col pt-6">
                <div className="px-6 mb-8">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1A5DC8] to-[#FF6B00] bg-clip-text text-transparent" style={{ fontFamily: "'Sora', sans-serif" }}>
                        RanKro Admin
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'} // Exact match for root admin dash
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                                    isActive
                                        ? 'bg-[#1A5DC8] text-white'
                                        : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom section (User info + Logout) */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user?.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">Admin</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                {/* 
                  Outlet is where the child route (e.g. AdminDashboard, AdminUsers) 
                  will be injected. 
                */}
                <Outlet />
            </main>
        </div>
    )
}
