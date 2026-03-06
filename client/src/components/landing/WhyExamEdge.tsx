import { motion } from 'motion/react'
import {
  Timer,
  Brain,
  TrendingUp,
  BookOpen,
  Smartphone,
  Shield,
} from 'lucide-react'

const features = [
  {
    icon: Timer,
    title: 'Real Exam Timer',
    description:
      'Server-synced countdown timer that matches the actual exam experience. Auto-submit when time runs out.',
    color: 'text-[#1A5DC8]',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description:
      'Section-wise performance breakdown with topic-level weak area identification to guide your prep.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    icon: TrendingUp,
    title: 'Live Rank Tracking',
    description:
      'See exactly where you stand among thousands of aspirants. Track your rank progression over time.',
    color: 'text-[#FF6B00]',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    icon: BookOpen,
    title: 'Bilingual Questions',
    description:
      'All questions available in Hindi and English. Switch language mid-test without losing progress.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description:
      'Full exam experience on any device. Collapsible question palette optimized for smaller screens.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: Shield,
    title: 'Anti-Cheating System',
    description:
      'Tab-switch detection, full-screen enforcement, and server-side answer validation.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
]

export function WhyExamEdge() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-orange-100 text-[#FF6B00] text-sm font-bold rounded-full mb-4">
            Why ExamEdge?
          </span>
          <h2
            style={{ fontFamily: "'Sora', sans-serif" }}
            className="text-4xl font-extrabold text-[#1E293B] mb-4"
          >
            Built for Serious Aspirants
          </h2>
          <p className="text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Every feature designed to replicate the pressure, pattern, and
            performance feedback of actual government exams.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className={`relative p-6 rounded-2xl border ${feature.border} hover:shadow-lg transition-all duration-300 group hover:-translate-y-1`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3
                  style={{ fontFamily: "'Sora', sans-serif" }}
                  className="font-bold text-[#1E293B] text-base mb-2"
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 relative overflow-hidden bg-gradient-to-r from-[#1A5DC8] to-[#0D3E8E] rounded-3xl p-8 md:p-12 text-center"
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="relative z-10">
            <h3
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="text-2xl md:text-3xl font-extrabold text-white mb-3"
            >
              Start Your Free Mock Today
            </h3>
            <p className="text-blue-200 mb-6 max-w-lg mx-auto">
              No credit card required. Access 10 free mock tests across SSC and
              Railway exams instantly.
            </p>
            <a
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-bold rounded-xl transition-all duration-200 shadow-lg"
            >
              Create Free Account
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
