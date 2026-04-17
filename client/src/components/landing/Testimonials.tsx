import { motion } from 'motion/react'
import { Star, TrendingUp } from 'lucide-react'

const testimonials = [
  {
    name: 'Rohit Sharma',
    exam: 'SSC CGL 2023',
    rank: 'AIR 234',
    prev: 'Rank ~4,500',
    quote:
      'RankKro ka question palette aur section-wise analysis ne mujhe exactly pata chala kahan weak tha. Mock dene ke baad confidence 10x ho gaya.',
    avatar: 'RS',
    color: 'from-blue-500 to-blue-700',
    improvement: '+4,266 ranks',
    stars: 5,
  },
  {
    name: 'Priya Kumari',
    exam: 'RRB NTPC 2023',
    rank: 'AIR 189',
    prev: 'Rank ~3,200',
    quote:
      'Timer feature aur bilingual support ne mujhe real exam jaisa feel karaya. Results page ka analysis bahut detailed hai — better than any other platform.',
    avatar: 'PK',
    color: 'from-violet-500 to-violet-700',
    improvement: '+3,011 ranks',
    stars: 5,
  },
  {
    name: 'Aakash Singh',
    exam: 'SSC CHSL 2024',
    rank: 'AIR 67',
    prev: 'Rank ~1,800',
    quote:
      'Leaderboard dekh ke motivation milti thi roz. RankKro ne mujhe top 100 mein pahunchaya — yaar main believe nahi kar sakta tha jab result aaya!',
    avatar: 'AS',
    color: 'from-emerald-500 to-emerald-700',
    improvement: '+1,733 ranks',
    stars: 5,
  },
  {
    name: 'Deepika Yadav',
    exam: 'Delhi Police SI',
    rank: 'AIR 412',
    prev: 'Rank ~5,000+',
    quote:
      'Previous year papers section is gold! Exact same pattern, same difficulty. Jo yahan practice kiya wahi exam mein aya. Highly recommend to all aspirants.',
    avatar: 'DY',
    color: 'from-rose-500 to-rose-700',
    improvement: '+4,588+ ranks',
    stars: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-[#F4F6FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-full mb-4">
            Success Stories
          </span>
          <h2
            style={{ fontFamily: "'Sora', sans-serif" }}
            className="text-4xl font-extrabold text-[#1E293B] mb-4"
          >
            Real Students. Real Ranks.
          </h2>
          <p className="text-[#64748B] max-w-xl mx-auto">
            Thousands of aspirants have improved their ranks with RankKro mock
            tests.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[#475569] text-sm leading-relaxed mb-5 italic">
                  "{t.quote}"
                </p>

                {/* Author Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-extrabold`}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-[#1E293B] text-sm">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-400">{t.exam}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 line-through">
                      {t.prev}
                    </p>
                    <p
                      style={{ fontFamily: "'Sora', sans-serif" }}
                      className="text-base font-extrabold text-[#1A5DC8]"
                    >
                      {t.rank}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom improvement bar */}
              <div className="border-t border-gray-50 px-6 py-3 bg-green-50 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-bold text-green-700">
                  Improved by {t.improvement}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
