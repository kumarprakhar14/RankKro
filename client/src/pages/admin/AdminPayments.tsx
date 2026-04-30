import { useState, useEffect } from 'react'
import { adminAPI } from '@/lib/api'
import { Search, IndianRupee, Calendar, CheckCircle2 } from 'lucide-react'

export default function AdminPayments() {
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    
    // Pagination
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [statusFilter, setStatusFilter] = useState('')
    const [paymentIdSearch, setPaymentIdSearch] = useState('')
    const [orderIdSearch, setOrderIdSearch] = useState('')
    const [userIdSearch, setUserIdSearch] = useState('')

    const fetchPayments = async () => {
        try {
            setLoading(true)
            const params: any = { page, limit: 20 }
            if (statusFilter) params.status = statusFilter
            if (paymentIdSearch) params.paymentId = paymentIdSearch
            if (orderIdSearch) params.orderId = orderIdSearch
            if (userIdSearch) params.userId = userIdSearch

            const res = await adminAPI.listPayments(params)
            if (res.data) {
                setPayments(res.data.payments)
                setTotalPages(res.data.pagination.totalPage || res.data.pagination.totalPages || 1)
            }
        } catch (err) {
            console.error('Failed to fetch payments', err)
        } finally {
            setLoading(false)
        }
    }

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPayments()
        }, 300)
        return () => clearTimeout(timer)
    }, [page, statusFilter, paymentIdSearch, orderIdSearch, userIdSearch])

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>Payment History</h1>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Payment ID..."
                        value={paymentIdSearch}
                        onChange={(e) => { setPaymentIdSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8] transition-all"
                    />
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Order ID..."
                        value={orderIdSearch}
                        onChange={(e) => { setOrderIdSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8] transition-all"
                    />
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search User ID..."
                        value={userIdSearch}
                        onChange={(e) => { setUserIdSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8] transition-all"
                    />
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8] transition-all"
                    >
                        <option value="">All Statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                        <option value="PENDING">Pending</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Loading payments...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No payments found.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{p.paymentId || p.orderId}</p>
                                            <p className="text-xs text-gray-500">{p._id}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.userId ? (
                                                <div>
                                                    <p className="font-medium text-gray-900">{p.userId.name}</p>
                                                    <p className="text-xs text-gray-500">{p.userId.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">Unknown User</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-semibold text-gray-900">
                                                <IndianRupee className="w-4 h-4 text-gray-500" />
                                                {p.amount}
                                            </div>
                                            <span className="text-xs text-gray-500">{p.currency}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.status === 'SUCCESS' ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                                                    <CheckCircle2 className="w-3 h-3" /> {p.status}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                                                    {p.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(p.createdAt).toLocaleString()}
                                            </div>
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
        </div>
    )
}
