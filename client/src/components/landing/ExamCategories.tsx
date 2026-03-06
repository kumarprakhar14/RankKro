import { motion } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Users, FileText } from 'lucide-react'

const examCategories = [
  {
    name: 'SSC CGL',
    fullName: 'Staff Selection Commission CGL',
    tests: 48,
    students: '12,400',
    color: 'from-blue-500 to-blue-700',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-100',
    emoji: '🏛️',
    badge: 'Most Popular',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'SSC CHSL',
    fullName: 'Combined Higher Secondary Level',
    tests: 36,
    students: '9,200',
    color: 'from-indigo-500 to-indigo-700',
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-100',
    emoji: '📋',
    badge: 'Trending',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'RRB NTPC',
    fullName: 'Railway Recruitment Board NTPC',
    tests: 42,
    students: '15,800',
    color: 'from-emerald-500 to-emerald-700',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-100',
    emoji: '🚂',
    badge: 'New Tests',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    name: 'RRB Group D',
    fullName: 'Railway Group D Recruitment',
    tests: 30,
    students: '18,300',
    color: 'from-teal-500 to-teal-700',
    lightColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-100',
    emoji: '🛤️',
    badge: 'High Demand',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
  {
    name: 'SSC MTS',
    fullName: 'Multi Tasking Staff',
    tests: 24,
    students: '6,700',
    color: 'from-violet-500 to-violet-700',
    lightColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-100',
    emoji: '📌',
    badge: null,
    badgeColor: '',
  },
  {
    name: 'Delhi Police',
    fullName: 'Delhi Police Constable / SI',
    tests: 18,
    students: '5,400',
    color: 'from-rose-500 to-rose-700',
    lightColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-100',
    emoji: '🚔',
    badge: 'Updated',
    badgeColor: 'bg-rose-100 text-rose-700',
  },
]

export function ExamCategories() {
  return (
    <section className="py-20 bg-[#F4F6FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-[#1A5DC8] text-sm font-bold rounded-full mb-4">
            Exam Categories
          </span>
          <h2
            style={{ fontFamily: "'Sora', sans-serif" }}
            className="text-4xl font-extrabold text-[#1E293B] mb-4"
          >
            Pick Your Exam. Start Preparing.
          </h2>
          <p className="text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Expert-crafted mock tests aligned with the latest exam pattern and
            syllabus. New tests added every week.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {examCategories.map((exam, index) => (
            <motion.div
              key={exam.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={`group bg-white rounded-2xl border ${exam.borderColor} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
            >
              {/* Card Header */}
              <div
                className={`bg-gradient-to-r ${exam.color} p-5 relative overflow-hidden`}
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 top-4 w-16 h-16 rounded-full bg-white/5" />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <span className="text-3xl">{exam.emoji}</span>
                    <h3
                      style={{ fontFamily: "'Sora', sans-serif" }}
                      className="text-xl font-extrabold text-white mt-2"
                    >
                      {exam.name}
                    </h3>
                    <p className="text-white/80 text-xs mt-0.5">
                      {exam.fullName}
                    </p>
                  </div>
                  {exam.badge && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${exam.badgeColor}`}
                    >
                      {exam.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${exam.lightColor}`}>
                      <FileText className={`w-3.5 h-3.5 ${exam.textColor}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Mock Tests</p>
                      <p className="text-sm font-bold text-[#1E293B]">
                        {exam.tests} Available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${exam.lightColor}`}>
                      <Users className={`w-3.5 h-3.5 ${exam.textColor}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Students</p>
                      <p className="text-sm font-bold text-[#1E293B]">
                        {exam.students}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/mocks"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm ${exam.lightColor} ${exam.textColor} hover:opacity-80 transition-all duration-200 group-hover:shadow-sm`}
                >
                  Start Mock
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link
            to="/mocks"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A5DC8] hover:bg-[#0D3E8E] text-white font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-blue-400/30"
          >
            View All Exam Tests
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
