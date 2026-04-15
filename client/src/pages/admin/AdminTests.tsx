import { useState, useEffect } from 'react'
import { adminAPI } from '@/lib/api'
import type { ServerTest, ServerSection, ServerQuestion } from '@/lib/api'
import { Plus, Edit2, Search, BookOpen, Clock, AlertCircle, X, ChevronRight, Check } from 'lucide-react'

// ============================================
// MODAL: Create/Edit Test
// ============================================
type TestFormData = Omit<ServerTest, '_id' | 'createdAt' | 'attempted_count'> & {
    initial_sections?: string[] // comma separated section names for creation
}
const DEFAULT_TEST_FORM: TestFormData = {
    id: '',
    title: '',
    exam_type: '',
    duration_minutes: 60,
    difficulty: 'EASY',
    status: 'FREE',
    is_pyq: false,
    initial_sections: []
}

function TestModal({ isOpen, onClose, initialData, onSuccess }: any) {
    
    const [formData, setFormData] = useState<TestFormData>(DEFAULT_TEST_FORM)
    const [sectionInput, setSectionInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isEdit = !!initialData

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? { ...initialData } : { ...DEFAULT_TEST_FORM })
            setSectionInput(initialData?.sections?.map(s => s.name).join(', ') || '')
            setError(null)
        }
    }, [isOpen, initialData])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const parsedSections = sectionInput.split(',').map(s => s.trim()).filter(Boolean)
        const payload = {
            ...formData,
            initial_sections: isEdit ? formData.initial_sections || [] : parsedSections,
            sections: isEdit 
                ? undefined 
                : parsedSections.map(name => ({ name }))
        }
        console.log(sectionInput);
        
        console.log(payload)

        try {
            if (isEdit) {
                await adminAPI.updateTest(initialData._id, payload)
            } else {
                await adminAPI.createTest(payload)
            }
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Failed to save test')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                        {isEdit ? 'Edit Test' : 'Create New Test'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Test ID</label>
                            <input required disabled={isEdit} type="text" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50" placeholder="e.g. upsc-pre-2026-01" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                            <input required type="text" value={formData.exam_type} onChange={e => setFormData({ ...formData, exam_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. UPSC Prelims" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                        <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. Full Length Mock 1" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                            <input required type="number" min="1" value={formData.duration_minutes} onChange={e => setFormData({ ...formData, duration_minutes: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                            <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                                <option value="EASY">EASY</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HARD">HARD</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                                <option value="FREE">FREE</option>
                                <option value="PREMIUM">PREMIUM</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" id="is_pyq" checked={formData.is_pyq} onChange={e => setFormData({ ...formData, is_pyq: e.target.checked })} className="w-4 h-4 text-[#1A5DC8] rounded border-gray-300" />
                        <label htmlFor="is_pyq" className="text-sm font-medium text-gray-700">Mark as Previous Year Question (PYQ)</label>
                    </div>

                    {!isEdit && (
                        <div className="pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Sections (Comma separated)</label>
                            <input type="text" value={sectionInput} onChange={e => setSectionInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. Reasoning, Quantitative, English" />
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 mt-8 border-t border-gray-200">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#1A5DC8] text-white rounded-lg text-sm font-bold hover:bg-[#0D3E8E] disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Test'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


// ============================================
// MAIN PAGE
// ============================================
export default function AdminTests() {
    const [tests, setTests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filters & Pagination
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Modals & Detail View
    const [isTestModalOpen, setIsTestModalOpen] = useState(false)
    const [editingTest, setEditingTest] = useState<ServerTest | null>(null)
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null)

    // Test Detail State
    const [testDetail, setTestDetail] = useState<{ test: ServerTest, sections: ServerSection[] } | null>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    const fetchTests = async () => {
        try {
            setLoading(true)
            const res = await adminAPI.listTests({ exam_type: search, status: statusFilter, page, limit: 10 })
            if (res.data) {
                setTests(res.data.tests)
                setTotalPages(res.data.pagination.totalPages)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => fetchTests(), 300)
        return () => clearTimeout(timer)
    }, [search, statusFilter, page])

    const loadTestDetail = async (id: string) => {
        try {
            setLoadingDetail(true)
            setSelectedTestId(id)
            const res = await adminAPI.getTestDetail(id)
            if (res.data) setTestDetail(res.data)
        } catch (err) {
            console.error(err)
            setSelectedTestId(null)
        } finally {
            setLoadingDetail(false)
        }
    }


    const navigateBack = () => {
        setSelectedTestId(null)
        setTestDetail(null)
        fetchTests() // Refresh main list to update question counts
    }


    if (selectedTestId && testDetail) {
        return (
            <div className="h-full flex flex-col p-8">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={navigateBack} className="text-gray-500 hover:text-gray-900 transition-colors">
                        ← Back to Tests
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                    <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                        {testDetail.test.title}
                    </h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                    <div className="p-6 bg-slate-50 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <span className="text-xs font-bold font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mb-2">
                                {testDetail.test.id}
                            </span>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{testDetail.test.exam_type}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {testDetail.test.duration_minutes} mins</span>
                                <span>•</span>
                                <span className={testDetail.test.status === 'PREMIUM' ? 'text-amber-600 font-bold' : 'text-green-600 font-bold'}>
                                    {testDetail.test.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="mb-6 flex justify-between items-end">
                            <h2 className="text-lg font-bold text-gray-900">Sections & Questions</h2>
                            <p className="text-sm text-gray-500">
                                To assign questions, use Postman for now. The Admin API allows passing an array of <code>{`[{ "question_id": "...", "question_order": 1 }]`}</code> to <code>/api/admin/tests/:testId/sections/:sectionId/questions</code>.
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            {testDetail.sections.map((section) => (
                                <div key={section._id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-medium text-gray-900 flex justify-between items-center">
                                        <span>Section {section.display_order}: {section.name}</span>
                                        <span className="text-sm font-normal text-gray-500">{section.questions.length} questions</span>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {section.questions.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-500">No questions mapped to this section yet.</div>
                                        ) : (
                                            section.questions.map((q: any, idx) => (
                                                <div key={q._id} className="p-4 flex gap-4 hover:bg-gray-50">
                                                    <span className="text-sm font-medium text-gray-400 w-6">Q{idx + 1}</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{q.question?.text || 'Unknown Question'}</p>
                                                        <div className="flex mt-2 gap-2 text-xs text-gray-500">
                                                            <span className="bg-gray-100 px-1.5 rounded">{q.question?.subject || ''}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                            {testDetail.sections.length === 0 && (
                                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg text-gray-500 bg-gray-50">
                                    No sections created for this test. Edit test to recreate it with sections.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>Test Management</h1>
                <button
                    onClick={() => { setEditingTest(null); setIsTestModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A5DC8] text-white text-sm font-bold rounded-lg hover:bg-[#0D3E8E] transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Create Test
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && tests.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500">Loading tests...</div>
                ) : tests.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">No tests found.</div>
                ) : (
                    tests.map(test => (
                        <div key={test._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${test.status === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                    {test.status}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setEditingTest(test); setIsTestModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-[#1A5DC8] hover:bg-blue-50 rounded transition-colors" title="Edit Metadata">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{test.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                                {test.exam_type} • <Clock className="w-3 h-3 ml-1" /> {test.duration_minutes}m
                            </p>

                            <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                    <span className="block text-xl font-bold text-[#1A5DC8]">{test.section_count || 0}</span>
                                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Sections</span>
                                </div>
                                <button 
                                    onClick={() => loadTestDetail(test.id)}
                                    className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <BookOpen className="w-4 h-4" /> Manage
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <TestModal
                isOpen={isTestModalOpen}
                initialData={editingTest}
                onClose={() => setIsTestModalOpen(false)}
                onSuccess={fetchTests}
            />
        </div>
    )
}
