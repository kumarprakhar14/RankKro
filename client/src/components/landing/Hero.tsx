import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, BarChart3, Trophy } from 'lucide-react'

const trustBadges = [
  {
    icon: ShieldCheck,
    title: 'Real Mock Tests',
    desc: 'Exam-pattern questions curated by experts',
    color: 'text-[#1A5DC8]',
    bg: 'bg-blue-50',
  },
  {
    icon: Trophy,
    title: 'Rank Tracking',
    desc: 'Live rank among all aspirants',
    color: 'text-[#FF6B00]',
    bg: 'bg-orange-50',
  },
  {
    icon: BarChart3,
    title: 'Result Analysis',
    desc: 'Detailed section-wise performance',
    color: 'text-[#22C55E]',
    bg: 'bg-green-50',
  },
]

const stats = [
  { value: '50,000+', label: 'Active Students' },
  { value: '2,000+', label: 'Mock Tests' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '3,500+', label: 'Questions' },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#EBF3FF] via-[#F4F6FB] to-[#FFF4EC] pt-16">
      {/* Background geometry */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#1A5DC8]/8 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-[#FF6B00]/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-100/30 blur-3xl" />
        {/* Grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1A5DC8"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-full text-sm font-semibold text-[#1A5DC8] shadow-sm mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              India's #1 Govt Exam Mock Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#1E293B] leading-tight tracking-tight mb-4"
            >
              Mock Do.{' '}
              <span className="relative">
                <span className="text-[#FF6B00]">Rank</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10 C 50 2, 150 2, 198 10"
                    stroke="#FF6B00"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>{' '}
              Kro.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="text-lg text-[#475569] leading-relaxed mb-8 max-w-lg"
            >
              Improve your rank with exam-level mock tests for{' '}
              <strong className="text-[#1E293B]">SSC, Railway & UPSC</strong>.
              Real interface, real timer, real results — just like the actual
              exam.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                to="/mocks"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold text-base rounded-xl transition-all duration-200 shadow-lg shadow-orange-400/30 hover:shadow-orange-400/50 hover:-translate-y-0.5"
              >
                Start Free Mock
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/mocks"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-blue-50 text-[#1A5DC8] font-bold text-base rounded-xl border-2 border-[#1A5DC8]/20 hover:border-[#1A5DC8]/40 transition-all duration-200 shadow-sm"
              >
                View All Tests
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{ fontFamily: "'Sora', sans-serif" }}
                    className="text-2xl font-extrabold text-[#1A5DC8]"
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Exam Engine Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-blue-900/15 border border-blue-100 overflow-hidden">
              {/* Fake exam interface preview */}
              <div className="bg-[#1A5DC8] px-4 py-3 flex items-center justify-between">
                <span className="text-white text-sm font-semibold">
                  SSC CGL Mock Test #12
                </span>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-white text-sm font-bold">24:47</span>
                </div>
              </div>
              <div className="flex gap-0 border-b border-gray-100 text-xs font-semibold">
                {['Gen. Awareness', 'Quant', 'Reasoning', 'English'].map(
                  (s, i) => (
                    <div
                      key={s}
                      className={`px-3 py-2 border-b-2 ${
                        i === 0
                          ? 'border-[#1A5DC8] text-[#1A5DC8] bg-blue-50'
                          : 'border-transparent text-gray-400'
                      }`}
                    >
                      {s}
                    </div>
                  ),
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-500 mb-2 font-semibold">
                  Question 7 of 25
                </p>
                <p className="text-sm font-medium text-[#1E293B] mb-4 leading-relaxed">
                  The Preamble to the Indian Constitution was amended by which
                  Constitutional Amendment Act?
                </p>
                <div className="space-y-2">
                  {[
                    '24th Amendment Act',
                    '42nd Amendment Act',
                    '44th Amendment Act',
                    '52nd Amendment Act',
                  ].map((opt, i) => (
                    <div
                      key={opt}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        i === 1
                          ? 'border-[#1A5DC8] bg-blue-50 text-[#1A5DC8] font-semibold'
                          : 'border-gray-200 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs ${
                          i === 1
                            ? 'border-[#1A5DC8] bg-[#1A5DC8] text-white font-bold'
                            : 'border-gray-300'
                        }`}
                      >
                        {i === 1 && '✓'}
                      </span>
                      {String.fromCharCode(65 + i)}. {opt}
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-5 pb-5 flex gap-2">
                <button className="flex-1 py-2 text-xs font-bold bg-[#1A5DC8] text-white rounded-lg">
                  Save & Next
                </button>
                <button className="flex-1 py-2 text-xs font-semibold bg-purple-100 text-purple-700 rounded-lg">
                  Mark for Review
                </button>
              </div>
            </div>
            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-8 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1E293B]">
                  All India Rank
                </p>
                <p className="text-lg font-extrabold text-[#22C55E]">#342</p>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-4 -right-6 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3"
            >
              <p className="text-xs text-gray-500">Your Score</p>
              <p className="text-2xl font-extrabold text-[#1A5DC8]">164/200</p>
              <p className="text-xs text-green-600 font-semibold">
                +12 pts vs last test
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-5"
        >
          {trustBadges.map((badge) => {
            const Icon = badge.icon
            return (
              <div
                key={badge.title}
                className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300"
              >
                <div className={`p-3 rounded-xl ${badge.bg} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${badge.color}`} />
                </div>
                <div>
                  <h3
                    style={{ fontFamily: "'Sora', sans-serif" }}
                    className="font-bold text-[#1E293B] text-sm mb-1"
                  >
                    {badge.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {badge.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
