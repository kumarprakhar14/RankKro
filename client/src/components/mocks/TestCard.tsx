import { Link } from 'react-router-dom'
import { Clock, Users, Star, Lock, Zap } from 'lucide-react'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type TestStatus = 'free' | 'premium'

export interface MockTest {
  id: string
  title: string
  examType: string
  questions: number
  totalMarks: number
  duration: number // minutes
  attempted: number
  difficulty: Difficulty
  status: TestStatus
  category: string
  isLive?: boolean
  isPYQ?: boolean
}

interface TestCardProps {
  test: MockTest
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; color: string; bg: string }
> = {
  Easy: { label: 'Easy', color: 'text-green-700', bg: 'bg-green-100' },
  Medium: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-100' },
  Hard: { label: 'Hard', color: 'text-red-700', bg: 'bg-red-100' },
}

export function TestCard({ test }: TestCardProps) {
  const diff = difficultyConfig[test.difficulty]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
      {/* Top band */}
      <div className="h-1.5 bg-gradient-to-r from-[#1A5DC8] to-[#FF6B00]" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-[#1A5DC8] bg-blue-50 px-2 py-0.5 rounded-md">
                {test.examType}
              </span>
              {test.isLive && (
                <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </span>
              )}
              {test.isPYQ && (
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  PYQ
                </span>
              )}
            </div>
            <h3
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="text-sm font-bold text-[#1E293B] leading-snug"
            >
              {test.title}
            </h3>
          </div>
          <div className="flex-shrink-0">
            {test.status === 'premium' ? (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-lg">
                <Lock className="w-3 h-3" />
                Premium
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                <Zap className="w-3 h-3" />
                Free
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <Star className="w-3.5 h-3.5 text-gray-400 mb-0.5" />
            <span className="text-xs font-bold text-[#1E293B]">
              {test.questions}Q
            </span>
            <span className="text-[10px] text-gray-400">Questions</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-gray-400 mb-0.5" />
            <span className="text-xs font-bold text-[#1E293B]">
              {test.duration}m
            </span>
            <span className="text-[10px] text-gray-400">Duration</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <Users className="w-3.5 h-3.5 text-gray-400 mb-0.5" />
            <span className="text-xs font-bold text-[#1E293B]">
              {(test.attempted / 1000).toFixed(1)}K
            </span>
            <span className="text-[10px] text-gray-400">Attempted</span>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${diff.bg} ${diff.color}`}
          >
            {diff.label}
          </span>
          <span className="text-xs text-gray-400">{test.totalMarks} Marks</span>
          <Link
            to={`/exam?testId=${test.id}`}
            className="px-4 py-2 bg-[#1A5DC8] hover:bg-[#0D3E8E] text-white text-xs font-bold rounded-lg transition-all duration-200 group-hover:shadow-md"
          >
            Attempt Now
          </Link>
        </div>
      </div>
    </div>
  )
}
