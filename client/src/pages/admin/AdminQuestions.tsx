import { useState, useEffect } from 'react'
import { adminAPI } from '@/lib/api'
import type { ServerQuestion } from '@/lib/api'
import { Search, Plus, Edit2, X, AlertCircle } from 'lucide-react'

type QuestionFormData = Omit<ServerQuestion, '_id' | 'question_order'>

const DEFAULT_FORM: QuestionFormData = {
    id: '',
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 0,
    explanation: '',
    marks: 1,
    negative_marks: 0,
    subject: ''
}

function QuestionModal({ 
    isOpen, 
    onClose, 
    initialData, 
    onSuccess 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    initialData?: ServerQuestion | null,
    onSuccess: () => void
}) {
    const [formData, setFormData] = useState<QuestionFormData>(DEFAULT_FORM)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isEdit = !!initialData

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? { ...initialData } : { ...DEFAULT_FORM })
            setError(null)
        }
    }, [isOpen, initialData])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isEdit) {
                await adminAPI.updateQuestion(initialData._id, formData)
            } else {
                await adminAPI.createQuestion(formData)
            }
            onSuccess()
            onClose()
        } catch (err: any) {
            console.error('Submit failed', err)
            setError(err.message || 'Failed to save question')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                        {isEdit ? 'Edit Question' : 'Add New Question'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form id="question-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question ID</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.id}
                                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                                    disabled={isEdit}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8] disabled:bg-gray-50 disabled:text-gray-500"
                                    placeholder="e.g. q-logical-01"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Category</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8]"
                                    placeholder="e.g. Logical Reasoning"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.text}
                                onChange={e => setFormData({ ...formData, text: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {[
                                { key: 'option_a', label: 'Option A (0)' },
                                { key: 'option_b', label: 'Option B (1)' },
                                { key: 'option_c', label: 'Option C (2)' },
                                { key: 'option_d', label: 'Option D (3)' }
                            ].map((opt, idx) => (
                                <div key={opt.key}>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                                        <input
                                            type="radio"
                                            name="correct_option"
                                            checked={formData.correct_option === idx}
                                            onChange={() => setFormData({ ...formData, correct_option: idx })}
                                            className="mr-2"
                                        />
                                        {opt.label} {formData.correct_option === idx && <span className="text-green-600 ml-1">(Correct)</span>}
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData[opt.key as keyof QuestionFormData] as string}
                                        onChange={e => setFormData({ ...formData, [opt.key]: e.target.value })}
                                        className={`w-full px-3 py-2 border text-sm rounded-md focus:outline-none transition-colors ${
                                            formData.correct_option === idx 
                                                ? 'border-green-400 bg-green-50 focus:ring-2 focus:ring-green-400/50' 
                                                : 'border-gray-300 focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8]'
                                        }`}
                                    />
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                            <textarea
                                rows={2}
                                value={formData.explanation}
                                onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8]"
                                placeholder="Explain why the answer is correct..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Positive Marks</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={formData.marks}
                                    onChange={e => setFormData({ ...formData, marks: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500/50 focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marks</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.negative_marks}
                                    onChange={e => setFormData({ ...formData, negative_marks: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                                />
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="question-form"
                        disabled={loading}
                        className="px-6 py-2 text-sm font-bold text-white bg-[#1A5DC8] rounded-lg hover:bg-[#0D3E8E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {loading ? 'Saving...' : 'Save Question'}
                    </button>
                </div>
            </div>
        </div>
    )
}


export default function AdminQuestions() {
    const [questions, setQuestions] = useState<ServerQuestion[]>([])
    const [loading, setLoading] = useState(true)
    
    // Filters
    const [search, setSearch] = useState('')
    const [subjectFilter, setSubjectFilter] = useState('')
    
    // Pagination
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<ServerQuestion | null>(null)

    const fetchQuestions = async () => {
        try {
            setLoading(true)
            const res = await adminAPI.listQuestions({ search, subject: subjectFilter, page, limit: 15 })
            if (res.data) {
                setQuestions(res.data.questions)
                setTotalPages(res.data.pagination.totalPages)
            }
        } catch (err) {
            console.error('Failed to fetch questions', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQuestions()
        }, 300)
        return () => clearTimeout(timer)
    }, [search, subjectFilter, page])

    const handleEdit = (q: ServerQuestion) => {
        setEditingQuestion(q)
        setIsModalOpen(true)
    }

    const handleCreate = () => {
        setEditingQuestion(null)
        setIsModalOpen(true)
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>Questions Bank</h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A5DC8] text-white text-sm font-bold rounded-lg hover:bg-[#0D3E8E] transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Question
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search question text..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8] outline-none"
                    />
                </div>
                <div className="w-64">
                    <input
                        type="text"
                        placeholder="Filter by subject..."
                        value={subjectFilter}
                        onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A5DC8]/50 focus:border-[#1A5DC8] outline-none"
                    />
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4 mb-6">
                {loading && questions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">Loading questions...</div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">No questions found matching your criteria.</div>
                ) : (
                    questions.map((q) => (
                        <div key={q._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-bold font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">#{q.id}</span>
                                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded">{q.subject}</span>
                                    <span className="text-xs text-gray-500">+{q.marks} / -{q.negative_marks}</span>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">{q.text}</h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, idx) => (
                                        <div key={idx} className={`flex items-start gap-2 p-2 rounded border ${q.correct_option === idx ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-gray-50 border-transparent text-gray-600'}`}>
                                            <span className="font-bold mb-1 opacity-50">{['A', 'B', 'C', 'D'][idx]}.</span>
                                            <span className="line-clamp-2" title={opt}>{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex items-start justify-end sm:border-l border-gray-100 sm:pl-4 pt-4 sm:pt-0">
                                <button
                                    onClick={() => handleEdit(q)}
                                    className="p-2 text-gray-400 hover:text-[#1A5DC8] hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Question"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Page <span className="font-bold text-gray-900">{page}</span> of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <QuestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingQuestion}
                onSuccess={fetchQuestions}
            />
        </div>
    )
}
