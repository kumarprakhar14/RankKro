import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { testAPI } from '@/lib/api'
import type { ServerQuestion, ServerSection } from '@/lib/api'
import { Timer, ChevronLeft, AlertTriangle, User } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OPTION_LABELS = ['A', 'B', 'C', 'D']

type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'marked-answered'

function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function getStatusStyle(st: QuestionStatus, isActive: boolean): string {
    const base =
        'w-10 h-8 flex items-center justify-center text-xs font-semibold cursor-pointer border transition-all relative'
    const activeRing = isActive ? 'ring-2 ring-blue-400 ring-offset-1 z-10' : ''

    switch (st) {
        case 'answered':
            return `${base} ${activeRing} bg-green-600 text-white border-green-700 nta-clip-answered`
        case 'not-answered':
            return `${base} ${activeRing} bg-red-600 text-white border-red-700 nta-clip-not-answered`
        case 'marked':
            return `${base} ${activeRing} bg-purple-700 text-white border-purple-800 rounded-full`
        case 'marked-answered':
            return `${base} ${activeRing} bg-purple-700 text-white border-purple-800 rounded-full after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3 after:bg-green-500 after:rounded-full after:border-2 after:border-white`
        case 'not-visited':
        default:
            return `${base} ${activeRing} bg-slate-100 text-slate-800 border-slate-300`
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExamEngine() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const testId = searchParams.get('testId')

    // ── Session state (copied from Exam.tsx) ──────────────────────────────────
    const [attemptId, setAttemptId] = useState<string | null>(null)
    const [testTitle, setTestTitle] = useState('')
    const [sections, setSections] = useState<ServerSection[]>([])
    const [allQuestions, setAllQuestions] = useState<ServerQuestion[]>([])

    // ── UI state ──────────────────────────────────────────────────────────────
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // NTA-style palette status
    const [questionStatus, setQuestionStatus] = useState<QuestionStatus[]>([])

    // Confirm-submit modal
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    // ── Refs to avoid stale closures in timer (copied from Exam.tsx) ──────────
    const expiresAtRef = useRef<Date | null>(null)
    const submitRef = useRef<() => void>(() => {})
    const effectRan = useRef(false)

    // =========================================================================
    // 1. START TEST SESSION  (copied verbatim from Exam.tsx)
    // =========================================================================
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
                    const flat = secs.flatMap((s) => s.questions)
                    setAllQuestions(flat)

                    // Initialise palette: all 'not-visited'
                    setQuestionStatus(new Array(flat.length).fill('not-visited'))

                    // Calculate remaining time from server's expiresAt
                    const expiresAt = new Date(attempt.expiresAt)
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

        if (effectRan.current === false) {
            startSession()
        }

        return () => {
            effectRan.current = true
        }
    }, [testId])

    // =========================================================================
    // 2. COUNTDOWN TIMER  (copied verbatim from Exam.tsx)
    // =========================================================================
    useEffect(() => {
        if (timeRemaining <= 0) return
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    submitRef.current()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [timeRemaining > 0]) // only re-run when going from 0 → positive

    // =========================================================================
    // SUBMIT  (copied verbatim from Exam.tsx)
    // =========================================================================
    const handleSubmit = async () => {
        if (!attemptId || submitting) return
        setSubmitting(true)
        setShowConfirmModal(false)

        try {
            const answers = allQuestions.map((q) => ({
                questionId: q._id,
                selectedOption: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : null,
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

    // Keep submitRef updated with the latest handleSubmit closure
    useEffect(() => {
        submitRef.current = handleSubmit
    })

    // =========================================================================
    // PALETTE STATUS HELPER
    // =========================================================================
    const updateStatus = (index: number, type: QuestionStatus) => {
        setQuestionStatus((prev) => {
            const next = [...prev]
            next[index] = type
            return next
        })
    }

    // =========================================================================
    // ANSWER / NAVIGATION HANDLERS
    // =========================================================================
    const handleAnswer = (optionIndex: number) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [allQuestions[currentQuestionIndex]._id]: optionIndex,
        }))
    }

    const handleSaveNext = () => {
        const qId = allQuestions[currentQuestionIndex]._id
        const hasAnswer = selectedAnswers[qId] !== undefined
        updateStatus(currentQuestionIndex, hasAnswer ? 'answered' : 'not-answered')
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
            setQuestionStatus((prev) => {
                const next = [...prev]
                if (next[currentQuestionIndex + 1] === 'not-visited') {
                    next[currentQuestionIndex + 1] = 'not-answered'
                }
                return next
            })
        }
    }

    const handleMarkReviewNext = () => {
        const qId = allQuestions[currentQuestionIndex]._id
        const hasAnswer = selectedAnswers[qId] !== undefined
        updateStatus(currentQuestionIndex, hasAnswer ? 'marked-answered' : 'marked')
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
        }
    }

    const handleClearAnswer = () => {
        const qId = allQuestions[currentQuestionIndex]._id
        setSelectedAnswers((prev) => {
            const next = { ...prev }
            delete next[qId]
            return next
        })
        updateStatus(currentQuestionIndex, 'not-answered')
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const handleNavigate = (index: number) => {
        if (questionStatus[currentQuestionIndex] === 'not-visited') {
            updateStatus(currentQuestionIndex, 'not-answered')
        }
        setCurrentQuestionIndex(index)
    }

    // =========================================================================
    // LOADING / ERROR STATES
    // =========================================================================
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

    // =========================================================================
    // DERIVED VALUES FOR RENDER
    // =========================================================================
    const currentQuestion = allQuestions[currentQuestionIndex]
    const options = [
        currentQuestion.option_a,
        currentQuestion.option_b,
        currentQuestion.option_c,
        currentQuestion.option_d,
    ]

    const answeredCount = questionStatus.filter(
        (s) => s === 'answered' || s === 'marked-answered',
    ).length
    const notAnsweredCount = questionStatus.filter((s) => s === 'not-answered').length
    const notVisitedCount = questionStatus.filter((s) => s === 'not-visited').length

    // Which section tab is currently active
    let currentSectionName = ''
    if (sections.length > 1) {
        let offset = 0
        for (const sec of sections) {
            if (currentQuestionIndex < offset + sec.questions.length) {
                currentSectionName = sec.name
                break
            }
            offset += sec.questions.length
        }
    }

    // =========================================================================
    // RENDER — NTA-style UI
    // =========================================================================
    return (
        <div className="h-screen flex flex-col bg-slate-50 font-sans select-none overflow-hidden">

            {/* ── HEADER ──────────────────────────────────────────────────────── */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="bg-[#1a237e] text-white px-4 py-1 rounded font-bold text-sm tracking-wide shadow-sm">
                        RankKro
                    </div>
                    <span className="hidden md:inline text-slate-500 font-bold uppercase text-xs tracking-wider truncate max-w-xs">
                        {testTitle}
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    {/* Timer */}
                    <div
                        className={`flex items-center gap-3 px-4 py-1.5 rounded-lg border ${
                            timeRemaining < 300
                                ? 'bg-red-50 border-red-200 animate-pulse'
                                : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                        <Timer
                            size={18}
                            className={timeRemaining < 300 ? 'text-red-500' : 'text-slate-500'}
                        />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-0.5">
                                Time Left
                            </span>
                            <span
                                className={`text-xl font-mono font-bold leading-none ${
                                    timeRemaining < 300 ? 'text-red-600' : 'text-slate-700'
                                }`}
                            >
                                {formatTime(timeRemaining)}
                            </span>
                        </div>
                    </div>

                    {/* Candidate avatar */}
                    <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-200">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 leading-none mb-1">CANDIDATE</p>
                            <p className="text-sm font-black text-slate-800 leading-none">USER</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 border border-slate-300">
                            <User size={24} />
                        </div>
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
            <main className="flex-1 flex overflow-hidden">

                {/* LEFT: QUESTION AREA */}
                <section className="flex-1 flex flex-col bg-white overflow-hidden relative">

                    {/* Section / Subject Tab Row */}
                    <div className="h-12 border-b flex items-center bg-slate-50 shrink-0 overflow-x-auto">
                        {sections.length > 1 ? (
                            sections.map((sec, secIdx) => {
                                let offset = 0
                                for (let i = 0; i < secIdx; i++) offset += sections[i].questions.length
                                const isActive = currentSectionName === sec.name
                                return (
                                    <button
                                        key={sec._id}
                                        onClick={() => handleNavigate(offset)}
                                        className={`h-full px-6 border-r text-sm font-bold whitespace-nowrap transition-colors ${
                                            isActive
                                                ? 'bg-white border-t-2 border-t-blue-600 text-blue-800'
                                                : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        {sec.name}
                                    </button>
                                )
                            })
                        ) : (
                            <button className="h-full px-6 bg-white border-t-2 border-t-blue-600 border-r text-sm font-bold text-blue-800">
                                {testTitle}
                            </button>
                        )}
                    </div>

                    {/* Question Info Bar */}
                    <div className="flex justify-between items-center px-6 py-2 border-b bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-600">Single Correct Type</span>
                            <span className="h-4 w-[1px] bg-slate-300" />
                            <span className="text-xs font-bold text-green-700">
                                +{currentQuestion.marks} Correct
                            </span>
                            {currentQuestion.negativeMarks > 0 && (
                                <span className="text-xs font-bold text-red-600">
                                    -{currentQuestion.negativeMarks} Incorrect
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                            Q {currentQuestionIndex + 1} / {allQuestions.length}
                        </span>
                    </div>

                    {/* Scrollable Question Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10" id="question-area">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex gap-4">
                                {/* Question number badge */}
                                <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold shadow-md shrink-0 mt-1">
                                    {currentQuestionIndex + 1}
                                </div>

                                <div className="flex-1">
                                    {/* Question text */}
                                    <div className="text-xl text-slate-800 font-medium leading-loose mb-8">
                                        {currentQuestion.text}
                                    </div>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        {options.map((option, i) => (
                                            <label
                                                key={i}
                                                onClick={() => handleAnswer(i)}
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50 group ${
                                                    selectedAnswers[currentQuestion._id] === i
                                                        ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                                        : 'border-slate-200'
                                                }`}
                                            >
                                                {/* Radio circle */}
                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                        selectedAnswers[currentQuestion._id] === i
                                                            ? 'border-blue-600'
                                                            : 'border-slate-300 group-hover:border-slate-400'
                                                    }`}
                                                >
                                                    {selectedAnswers[currentQuestion._id] === i && (
                                                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                                                    )}
                                                </div>
                                                {/* Option label */}
                                                <span className="text-sm font-bold text-slate-500 w-5 shrink-0">
                                                    {OPTION_LABELS[i]}.
                                                </span>
                                                <span className="text-lg text-slate-700 font-medium">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="h-16 border-t bg-white shrink-0 flex items-center justify-between px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                        <div className="flex gap-2">
                            <button
                                onClick={handleMarkReviewNext}
                                className="px-4 py-2 rounded-lg border border-purple-200 text-purple-700 font-bold text-xs uppercase tracking-wider hover:bg-purple-50 transition-colors"
                            >
                                Mark for Review &amp; Next
                            </button>
                            <button
                                onClick={handleClearAnswer}
                                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
                            >
                                Clear
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                                className="px-3 py-2 rounded border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={handleSaveNext}
                                disabled={currentQuestionIndex === allQuestions.length - 1}
                                className="px-8 py-2 bg-[#1a237e] text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-blue-900 shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-40"
                            >
                                Save &amp; Next
                            </button>
                        </div>
                    </div>
                </section>

                {/* RIGHT: QUESTION PALETTE */}
                <aside className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col shrink-0 hidden md:flex">
                    {/* Candidate Mini Profile */}
                    <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Candidate</p>
                            <p className="text-sm font-bold text-slate-800">USER</p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="p-4 grid grid-cols-2 gap-3 border-b border-slate-200 bg-white">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-600 rounded-sm nta-clip-answered" />
                            <span className="text-[10px] font-bold text-slate-600">Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-600 rounded-sm nta-clip-not-answered" />
                            <span className="text-[10px] font-bold text-slate-600">Not Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded-sm" />
                            <span className="text-[10px] font-bold text-slate-600">Not Visited</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-700 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-600">Marked</span>
                        </div>
                    </div>

                    {/* Question number grid — grouped by section if multi-section */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {sections.length > 1 ? (
                            (() => {
                                let offset = 0
                                return sections.map((sec) => {
                                    const start = offset
                                    offset += sec.questions.length
                                    return (
                                        <div key={sec._id}>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                {sec.name}
                                            </p>
                                            <div className="grid grid-cols-5 gap-1.5">
                                                {sec.questions.map((_, qi) => {
                                                    const globalIdx = start + qi
                                                    return (
                                                        <button
                                                            key={globalIdx}
                                                            onClick={() => handleNavigate(globalIdx)}
                                                            className={getStatusStyle(
                                                                questionStatus[globalIdx],
                                                                globalIdx === currentQuestionIndex,
                                                            )}
                                                        >
                                                            {globalIdx + 1}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })
                            })()
                        ) : (
                            <div className="grid grid-cols-5 gap-1.5">
                                {allQuestions.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleNavigate(i)}
                                        className={getStatusStyle(questionStatus[i], i === currentQuestionIndex)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="p-4 bg-white border-t border-slate-200">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            disabled={submitting}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-md transition-colors uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting…' : 'Submit Test'}
                        </button>
                    </div>
                </aside>
            </main>

            {/* ── CONFIRMATION MODAL ───────────────────────────────────────────── */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                        <div className="bg-[#1a237e] p-4 flex justify-between items-center text-white">
                            <h3 className="font-bold flex items-center gap-2">
                                <AlertTriangle size={18} /> Test Summary
                            </h3>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="text-white/70 hover:text-white font-bold text-xl"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                                    <span className="text-sm font-bold text-slate-600">Answered</span>
                                    <span className="font-mono font-bold text-lg text-green-700">{answeredCount}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                                    <span className="text-sm font-bold text-slate-600">Not Answered</span>
                                    <span className="font-mono font-bold text-lg text-red-600">{notAnsweredCount}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                                    <span className="text-sm font-bold text-slate-600">Not Visited</span>
                                    <span className="font-mono font-bold text-lg text-slate-400">{notVisitedCount}</span>
                                </div>
                            </div>

                            <p className="text-center text-sm text-slate-600 mb-6">
                                Are you sure you want to submit?{' '}
                                <br />
                                <span className="text-xs text-slate-400">
                                    You cannot change your answers after submitting.
                                </span>
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-3 border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 py-3 bg-[#1a237e] text-white rounded font-bold hover:bg-blue-900 shadow-lg"
                                >
                                    Yes, Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NTA clip-path shapes */}
            <style>{`
        .nta-clip-answered {
          clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%);
        }
        .nta-clip-not-answered {
          clip-path: polygon(0% 25%, 50% 0%, 100% 25%, 100% 100%, 0% 100%);
        }
      `}</style>
        </div>
    )
}