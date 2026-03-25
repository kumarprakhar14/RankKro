import { useState, useEffect } from 'react'
import { adminAPI } from '@/lib/api'
import { Search, ShieldAlert, Crown, User as UserIcon, X } from 'lucide-react'

// Modals are simpler for this, let's create a User Detail Modal
function UserDetailModal({ userId, onClose }: { userId: string, onClose: () => void }) {
    const [data, setData] = useState<{ user: any, attempts: any[], stats: any } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await adminAPI.getUserDetail(userId)
                if (res.data) setData(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchDetail()
    }, [userId])

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-8 max-w-2xl w-full text-center">
                    <div className="w-8 h-8 border-4 border-[#1A5DC8] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">{data.user.name}</h2>
                            <p className="text-sm text-gray-500">{data.user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Attempts</p>
                            <p className="text-2xl font-bold text-[#1A5DC8]">{data.stats.totalAttempts}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-1">Avg Score</p>
                            <p className="text-2xl font-bold text-green-600">{data.stats.averageScore}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-1">Best Score</p>
                            <p className="text-2xl font-bold text-amber-600">{data.stats.bestScore}</p>
                        </div>
                    </div>

                    {/* Attempt History */}
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Attempt History (Last 50)</h3>
                    {data.attempts.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                            <p className="text-gray-500">No tests attempted yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.attempts.map((attempt) => (
                                <div key={attempt._id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div>
                                        <p className="font-semibold text-gray-900">{attempt.test_id?.title || 'Unknown Test'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(attempt.started_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {attempt.status === 'SUBMITTED' ? (
                                            <span className="text-lg font-bold text-[#1A5DC8]">{attempt.final_score} <span className="text-xs text-gray-500 font-normal">marks</span></span>
                                        ) : (
                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-100 text-amber-700">IN PROGRESS</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [planFilter, setPlanFilter] = useState('')
    
    // Pagination
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Modal
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const res = await adminAPI.listUsers({ search, plan: planFilter, page, limit: 15 })
            if (res.data) {
                setUsers(res.data.users)
                setTotalPages(res.data.pagination.totalPages)
            }
        } catch (err) {
            console.error('Failed to fetch users', err)
        } finally {
            setLoading(false)
        }
    }

    // Debounce search slightly
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers()
        }, 300)
        return () => clearTimeout(timer)
    }, [search, planFilter, page])

    const handlePlanToggle = async (userId: string, currentPlan: string) => {
        if (!window.confirm(`Are you sure you want to change this user's plan?`)) return

        const newPlan = currentPlan === 'FREE' ? 'PREMIUM' : 'FREE'
        try {
            await adminAPI.updateUserPlan(userId, newPlan)
            // Optmistic update
            setUsers(users.map(u => u._id === userId ? { ...u, plan: newPlan } : u))
        } catch (err: any) {
            alert(err.message || 'Failed to update plan')
        }
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>User Management</h1>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex items-center justify-between flex-wrap gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8] transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setPlanFilter(''); setPage(1); }}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${planFilter === '' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => { setPlanFilter('FREE'); setPage(1); }}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${planFilter === 'FREE' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Free
                    </button>
                    <button
                        onClick={() => { setPlanFilter('PREMIUM'); setPage(1); }}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${planFilter === 'PREMIUM' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Premium
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-center">Plan</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.role === 'ADMIN' ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded">
                                                    <ShieldAlert className="w-3 h-3" /> ADMIN
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-500">USER</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handlePlanToggle(u._id, u.plan)}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                    u.plan === 'PREMIUM'
                                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                            >
                                                {u.plan === 'PREMIUM' && <Crown className="w-3 h-3" />}
                                                {u.plan}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedUserId(u._id)}
                                                className="text-sm font-medium text-[#1A5DC8] hover:text-[#0D3E8E] underline-offset-2 hover:underline"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <span className="text-sm text-gray-500">
                            Page <span className="font-bold text-gray-900">{page}</span> of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedUserId && (
                <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            )}
        </div>
    )
}
