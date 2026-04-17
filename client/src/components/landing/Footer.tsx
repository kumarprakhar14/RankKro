import { Link } from 'react-router-dom'
import { Zap, Twitter, Youtube, Instagram, Facebook } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Mock Tests', to: '/mocks' },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Dashboard', to: '/dashboard' },
  ],
  Exams: [
    { label: 'SSC CGL', to: '/mocks' },
    { label: 'SSC CHSL', to: '/mocks' },
    { label: 'RRB NTPC', to: '/mocks' },
    { label: 'RRB Group D', to: '/mocks' },
  ],
  Company: [
    { label: 'About Us', to: '/' },
    { label: 'Blog', to: '/' },
    { label: 'Careers', to: '/' },
    { label: 'Contact', to: '/' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
    { label: 'Refund Policy', to: '/' },
  ],
}

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
]

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/RankKro_primary_bg_removed.svg" alt="Logo" className="w-35 h-12" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
              India's most trusted mock test platform for SSC, Railway, and UPSC
              aspirants. Real tests. Real ranks. Real results.
            </p>
            <div className="flex gap-3">
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#1A5DC8] flex items-center justify-center transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 text-gray-300 hover:text-white" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                style={{ fontFamily: "'Sora', sans-serif" }}
                className="text-white font-bold text-sm mb-4"
              >
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Bharatrise Ventures Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}
