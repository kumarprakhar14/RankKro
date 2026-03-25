import { useState, useEffect } from 'react'
import { TestCard } from '@/components/mocks/TestCard'
import { testAPI } from '@/lib/api'
import type { ServerTest } from '@/lib/api'

export default function MockTest() {
    const [tests, setTests] = useState<ServerTest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Fetch tests from server
    useEffect(() => {
        const fetchTests = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await testAPI.listTests({ limit: 50 })
                setTests(res.data?.tests || [])
            } catch (err: any) {
                console.error('Failed to fetch tests:', err)
                setError(err.message || 'Failed to load tests')
            } finally {
                setLoading(false)
            }
        }
        fetchTests()
    }, [])

    // Derive unique categories from fetched tests
    const categories = Array.from(new Set(tests.map((t) => t.exam_type)))

    const filteredTests = selectedCategory
        ? tests.filter((t) => t.exam_type === selectedCategory)
        : tests

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#1A5DC8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading tests...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#1A5DC8] text-white rounded-lg font-medium hover:bg-[#0D3E8E] transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Mock Tests</h1>

                {/* Category Filter */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${selectedCategory === null
                                ? 'bg-[#1A5DC8] text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                    >
                        All Tests
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${selectedCategory === cat
                                    ? 'bg-[#1A5DC8] text-white'
                                    : 'bg-white text-gray-700 border border-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Tests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.map((test) => (
                        <TestCard key={test._id} test={test} />
                    ))}
                </div>

                {filteredTests.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No tests found</p>
                    </div>
                )}
            </div>
        </div>
    )
}