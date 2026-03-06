import { useState } from 'react'
import { TestCard } from '@/components/mocks/TestCard'
import { allMockTests } from '@/data/mockTests'

export default function MockTest() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const categories = Array.from(new Set(allMockTests.map((t) => t.category)))

    const filteredTests = selectedCategory
        ? allMockTests.filter((t) => t.category === selectedCategory)
        : allMockTests

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
                        <TestCard key={test.id} test={test} />
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