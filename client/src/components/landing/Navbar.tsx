import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Zap } from 'lucide-react'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Mocks', to: '/mocks' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Pricing', to: '/pricing' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-blue-900/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1A5DC8] to-[#0D3E8E] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-blue-400/30 transition-all duration-300">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="text-xl font-800 text-[#1E293B] tracking-tight"
            >
              Exam<span className="text-[#FF6B00]">Edge</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-[#475569] hover:text-[#1A5DC8] font-medium text-sm transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#1A5DC8] group-hover:w-full transition-all duration-300 rounded-full" />
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/sign-in"
              className="text-sm font-semibold text-[#1A5DC8] hover:text-[#0D3E8E] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/sign-up"
              className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55A00] text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-orange-400/30 hover:-translate-y-0.5"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-[#1E293B] hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block px-4 py-3 text-[#475569] hover:text-[#1A5DC8] hover:bg-blue-50 rounded-lg font-medium transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 pb-1 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to="/sign-in"
                  className="block px-4 py-3 text-center text-[#1A5DC8] font-semibold border border-[#1A5DC8] rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/sign-up"
                  className="block px-4 py-3 text-center bg-[#FF6B00] text-white font-bold rounded-lg hover:bg-[#E55A00] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
