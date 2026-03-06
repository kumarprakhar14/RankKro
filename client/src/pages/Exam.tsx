import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { allMockTests } from '@/data/mockTests'
import { sampleQuestions } from '@/data/sampleQuestions'
import type { MockTest } from '@/components/mocks/TestCard'
import type { Question } from '@/data/sampleQuestions'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Exam() {
    const [searchParams] = useSearchParams()
    const testId = searchParams.get('testId')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
    const [timeRemaining, setTimeRemaining] = useState(0)

    const test = allMockTests.find((t) => t.id === testId)
    const questions = sampleQuestions // Replace with actual questions based on test

    // Timer
    useEffect(() => {
        if (!test) return
        setTimeRemaining(test.duration * 60) // Convert minutes to seconds
    }, [test])

    useEffect(() => {
        if (timeRemaining <= 0) return
        const timer = setInterval(() => {
            setTimeRemaining((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [timeRemaining])

    if (!test) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Not Found</h1>
                    <p className="text-gray-600">The test you're looking for doesn't exist.</p>
                </div>
            </div>
        )
    }

    const currentQuestion = questions[currentQuestionIndex]
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    const handleAnswer = (optionIndex: number) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestion.id]: optionIndex,
        })
    }

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const handleSubmit = () => {
        // Calculate score
        let score = 0
        questions.forEach((q) => {
            if (selectedAnswers[q.id] === q.correctOption) {
                score += q.marks
            }
        })
        console.log('Final Score:', score)
        // Redirect to results page
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
                            <p className="text-sm text-gray-600">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-lg font-bold">
                                <Clock className="w-5 h-5 text-red-600" />
                                <span className="text-red-600">{formatTime(timeRemaining)}</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg font-medium hover:bg-[#e55a00] transition"
                            >
                                Submit Test
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
                                    ({currentQuestion.marks} marks, {currentQuestion.difficulty})
                                </p>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 mb-8">
                                {currentQuestion.options.map((option, index) => (
                                    <label
                                        key={index}
                                        className={`block p-4 border-2 rounded-lg cursor-pointer transition ${selectedAnswers[currentQuestion.id] === index
                                                ? 'border-[#1A5DC8] bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestion.id}`}
                                                value={index}
                                                checked={selectedAnswers[currentQuestion.id] === index}
                                                onChange={() => handleAnswer(index)}
                                                className="mt-1"
                                            />
                                            <span className="text-gray-700">{option}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Show Explanation (after answering) */}
                            {selectedAnswers[currentQuestion.id] !== undefined && (
                                <div
                                    className={`p-4 rounded-lg mb-8 ${selectedAnswers[currentQuestion.id] === currentQuestion.correctOption
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-red-50 border border-red-200'
                                        }`}
                                >
                                    <p className="font-semibold text-gray-900 mb-2">Explanation:</p>
                                    <p className="text-gray-700">{currentQuestion.explanation}</p>
                                </div>
                            )}

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
                                    disabled={currentQuestionIndex === questions.length - 1}
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
                                {questions.map((q, index) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={`w-full aspect-square rounded-lg font-medium text-sm transition ${index === currentQuestionIndex
                                                ? 'bg-[#1A5DC8] text-white'
                                                : selectedAnswers[q.id] !== undefined
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}