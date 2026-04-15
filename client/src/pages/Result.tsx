import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { testAPI } from '@/lib/api'
import type { ResultAnswer } from '@/lib/api'
import { ArrowLeft, CheckCircle, XCircle, MinusCircle } from 'lucide-react'

const optionLabels = ['A', 'B', 'C', 'D']

export default function Result() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const testId = searchParams.get('testId')
    const attemptId = searchParams.get('attemptId')

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [testTitle, setTestTitle] = useState('')
    const [score, setScore] = useState(0)
    const [summary, setSummary] = useState({ total: 0, correct: 0, incorrect: 0, skipped: 0 })
    const [answers, setAnswers] = useState<ResultAnswer[]>([])
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

    useEffect(() => {
        if (!testId || !attemptId) return

        const fetchResult = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await testAPI.getResult(testId, attemptId)

                if (res.data) {
                    setTestTitle(res.data.test.title)
                    setScore(res.data.attempt.finalScore)
                    setSummary(res.data.summary)
                    setAnswers(res.data.answers)
                }
            } catch (err: any) {
                console.error('Failed to fetch result:', err)
                setError(err.message || 'Failed to load result')
            } finally {
                setLoading(false)
            }
        }

        fetchResult()
    }, [testId, attemptId])

    if (!testId || !attemptId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Missing Parameters</h1>
                    <p className="text-gray-600">Test ID and Attempt ID are required.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#1A5DC8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading results...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/mocks')}
                        className="px-4 py-2 bg-[#1A5DC8] text-white rounded-lg font-medium hover:bg-[#0D3E8E] transition"
                    >
                        Back to Tests
                    </button>
                </div>
            </div>
        )
    }

    const getOptionValue = (question: ResultAnswer['question'], index: number) => {
        const keys = ['option_a', 'option_b', 'option_c', 'option_d'] as const
        return question[keys[index]]
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/mocks')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Tests
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{testTitle} — Results</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Score Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                        <p className="text-sm text-gray-500 mb-1">Score</p>
                        <p className="text-3xl font-bold text-[#1A5DC8]">{score}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                        <p className="text-sm text-gray-500 mb-1">Correct</p>
                        <p className="text-3xl font-bold text-green-600">{summary.correct}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                        <p className="text-sm text-gray-500 mb-1">Incorrect</p>
                        <p className="text-3xl font-bold text-red-600">{summary.incorrect}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 text-center">
                        <p className="text-sm text-gray-500 mb-1">Skipped</p>
                        <p className="text-3xl font-bold text-gray-400">{summary.skipped}</p>
                    </div>
                </div>

                {/* Question-by-Question Review */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Review</h2>

                    {answers.map((answer, index) => {
                        const isExpanded = expandedQuestion === answer._id
                        const q = answer.question

                        return (
                            <div
                                key={answer._id}
                                className="bg-white rounded-xl shadow-sm overflow-hidden"
                            >
                                {/* Question Header */}
                                <button
                                    onClick={() => setExpandedQuestion(isExpanded ? null : answer._id)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        {answer.selectedOption === null ? (
                                            <MinusCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        ) : answer.is_correct ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                        )}
                                        <span className="text-sm font-medium text-gray-900">
                                            Q{index + 1}. {q.text}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                        {isExpanded ? '▲' : '▼'}
                                    </span>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-gray-100">
                                        {/* Options */}
                                        <div className="space-y-2 mt-4 mb-4">
                                            {[0, 1, 2, 3].map((optIdx) => {
                                                const isCorrect = optIdx === q.correctOption
                                                const isSelected = optIdx === answer.selectedOption

                                                let bg = 'bg-gray-50'
                                                let border = 'border-gray-200'
                                                let text = 'text-gray-700'

                                                if (isCorrect) {
                                                    bg = 'bg-green-50'
                                                    border = 'border-green-300'
                                                    text = 'text-green-800'
                                                } else if (isSelected && !isCorrect) {
                                                    bg = 'bg-red-50'
                                                    border = 'border-red-300'
                                                    text = 'text-red-800'
                                                }

                                                return (
                                                    <div
                                                        key={optIdx}
                                                        className={`flex items-start gap-3 p-3 border rounded-lg ${bg} ${border}`}
                                                    >
                                                        <span className={`font-bold text-sm ${text}`}>
                                                            {optionLabels[optIdx]}.
                                                        </span>
                                                        <span className={`text-sm ${text}`}>
                                                            {getOptionValue(q, optIdx)}
                                                        </span>
                                                        {isCorrect && (
                                                            <span className="ml-auto text-xs font-bold text-green-700">✓ Correct</span>
                                                        )}
                                                        {isSelected && !isCorrect && (
                                                            <span className="ml-auto text-xs font-bold text-red-700">✗ Your answer</span>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Explanation */}
                                        {q.explanation && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <p className="text-sm font-semibold text-blue-900 mb-1">Explanation</p>
                                                <p className="text-sm text-blue-800">{q.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
