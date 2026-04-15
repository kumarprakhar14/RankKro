import { useState, useEffect } from 'react'
import { adminAPI } from '@/lib/api'
import type { AdminAnalyticsData } from '@/lib/api'
import { Users, BookOpen, Target, Clock, Trophy, RefreshCw } from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminAnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await adminAPI.getAnalytics()
            if (res.data) setStats(res.data)
        } catch (err: any) {
            console.error('Failed to fetch analytics:', err)
            setError(err.message || 'Failed to open analytics dashboard')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-[#1A5DC8] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg m-8">
                <p className="font-medium">{error || 'Failed to load data'}</p>
                <button 
                    onClick={fetchAnalytics}
                    className="mt-4 px-4 py-2 bg-white text-gray-900 rounded-md font-medium border border-gray-200 hover:bg-gray-50 flex flex-center gap-2 mx-auto"
                >
                    <RefreshCw className="w-4 h-4" /> Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: "'Sora', sans-serif" }}>Platform Overview</h1>

            {/* Stat Cards Level 1: Users & General */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100text-blue-600 rounded-lg flex items-center justify-center text-blue-700">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Premium Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.users.premium}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Recent Signups (7d)</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.users.recentSignups}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Attempts</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.attempts.total}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Content Overview Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Content Library</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-5 h-5 text-gray-400" />
                                    <span className="font-medium text-gray-700">Total Tests</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">{stats.content.totalTests}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileQuestion className="w-5 h-5 text-gray-400" />
                                    <span className="font-medium text-gray-700">Total Questions</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">{stats.content.totalQuestions}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Exam Sessions</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <span className="font-medium text-green-800">Completed</span>
                                <span className="text-xl font-bold text-green-700">{stats.attempts.submitted}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <span className="font-medium text-blue-800">In Progress / Expired</span>
                                <span className="text-xl font-bold text-blue-700">{stats.attempts.inProgress}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Tests Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                        <h2 className="text-lg font-bold text-gray-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Most Popular Tests</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Test Title</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3 text-right rounded-r-lg">Total Attempts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topTests.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                                No test attempts yet
                                            </td>
                                        </tr>
                                    ) : (
                                        stats.topTests.map((t) => (
                                            <tr key={t._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 font-medium text-gray-900">{t.title}</td>
                                                <td className="px-4 py-4">
                                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                                                        {t.examType}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right font-bold text-gray-900">{t.attempts}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FileQuestion(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <path d="M10 10.3c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2" />
            <path d="M12 17h.01" />
        </svg>
    )
}
