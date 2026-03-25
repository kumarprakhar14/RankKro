import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { testAPI } from '@/lib/api'
import type { ServerQuestion, ServerSection } from '@/lib/api'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Exam() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const testId = searchParams.get('testId')

    // Session state
    const [attemptId, setAttemptId] = useState<string | null>(null)
    const [testTitle, setTestTitle] = useState('')
    const [sections, setSections] = useState<ServerSection[]>([])
    const [allQuestions, setAllQuestions] = useState<ServerQuestion[]>([])

    // UI state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Ref for expires_at to avoid stale closures in timer
    const expiresAtRef = useRef<Date | null>(null)

    // ============================================
    // 1. START TEST SESSION
    // ============================================
    useEffect(() => {
        if (!testId) return

        const startSession = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await testAPI.startTest(testId)

                if (res.data) {
                    const { attempt, test, sections: secs } = res.data
                    setAttemptId(attempt._id)
                    setTestTitle(test.title)
                    setSections(secs)

                    // Flatten all questions across sections
                    const flat = secs.flatMap(s => s.questions)
                    setAllQuestions(flat)

                    // Calculate remaining time from server's expires_at
                    const expiresAt = new Date(attempt.expires_at)
                    expiresAtRef.current = expiresAt
                    const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
                    setTimeRemaining(remaining)
                }
            } catch (err: any) {
                console.error('Failed to start test:', err)
                if (err.code === 'PREMIUM_REQUIRED') {
                    setError('This test requires a premium subscription.')
                } else {
                    setError(err.message || 'Failed to start test session')
                }
            } finally {
                setLoading(false)
            }
        }

        startSession()
    }, [testId])

    // ============================================
    // 2. COUNTDOWN TIMER
    // ============================================
    useEffect(() => {
        if (timeRemaining <= 0) return
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    // Auto-submit when time runs out
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [timeRemaining > 0]) // only re-run setup when going from 0→positive

    // ============================================
    // LOADING / ERROR STATES
    // ============================================
    if (!testId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">No Test Selected</h1>
                    <p className="text-gray-600">Please select a test from the mock tests page.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#1A5DC8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Starting test session...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Cannot Start Test</h1>
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

    if (allQuestions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">No Questions Found</h1>
                    <p className="text-gray-600">This test doesn't have any questions yet.</p>
                </div>
            </div>
        )
    }

    // ============================================
    // HELPERS
    // ============================================
    const currentQuestion = allQuestions[currentQuestionIndex]
    const options = [
        currentQuestion.option_a,
        currentQuestion.option_b,
        currentQuestion.option_c,
        currentQuestion.option_d,
    ]

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    const handleAnswer = (optionIndex: number) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestion._id]: optionIndex,
        })
    }

    const handleNext = () => {
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    // ============================================
    // SUBMIT
    // ============================================
    const handleSubmit = async () => {
        if (!attemptId || submitting) return
        setSubmitting(true)

        try {
            // Build answers array — include all questions (answered or skipped)
            const answers = allQuestions.map(q => ({
                question_id: q._id,
                selected_option: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : null,
            }))

            const res = await testAPI.submitTest(testId!, { attemptId, answers })

            if (res.data) {
                navigate(`/result?testId=${testId}&attemptId=${res.data.attemptId}`)
            }
        } catch (err: any) {
            console.error('Submit failed:', err)
            if (err.code === 'TIME_EXPIRED') {
                alert('Time expired! Your test session has ended.')
                navigate('/mocks')
            } else {
                alert(err.message || 'Failed to submit test. Please try again.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{testTitle}</h1>
                            <p className="text-sm text-gray-600">
                                Question {currentQuestionIndex + 1} of {allQuestions.length}
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-lg font-bold">
                                <Clock className="w-5 h-5 text-red-600" />
                                <span className={`${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg font-medium hover:bg-[#e55a00] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting...' : 'Submit Test'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Panel */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm p-8">
                            {/* Question Text */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    {currentQuestion.text}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    ({currentQuestion.marks} marks{currentQuestion.negative_marks > 0 ? `, -${currentQuestion.negative_marks} negative` : ''})
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 mb-8">
                                {options.map((option, index) => (
                                    <label
                                        key={index}
                                        className={`block p-4 border-2 rounded-lg cursor-pointer transition ${selectedAnswers[currentQuestion._id] === index
                                                ? 'border-[#1A5DC8] bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestion._id}`}
                                                value={index}
                                                checked={selectedAnswers[currentQuestion._id] === index}
                                                onChange={() => handleAnswer(index)}
                                                className="mt-1"
                                            />
                                            <span className="text-gray-700">{option}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentQuestionIndex === 0}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={currentQuestionIndex === allQuestions.length - 1}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Question Navigator Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
                            <div className="grid grid-cols-4 lg:grid-cols-5 gap-2">
                                {allQuestions.map((q, index) => (
                                    <button
                                        key={q._id}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={`w-full aspect-square rounded-lg font-medium text-sm transition ${index === currentQuestionIndex
                                                ? 'bg-[#1A5DC8] text-white'
                                                : selectedAnswers[q._id] !== undefined
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Section legend */}
                            {sections.length > 1 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Sections</h4>
                                    {sections.map((s) => (
                                        <p key={s._id} className="text-xs text-gray-600 mb-1">
                                            {s.name} ({s.questions.length}Q)
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}