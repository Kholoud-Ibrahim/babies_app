import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Gift, Heart, Baby, Lightbulb } from 'lucide-react'
import './Layout.css'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/registry', label: 'Registry', icon: Gift },
  { path: '/send-love', label: 'Send Love', icon: Heart },
  { path: '/updates', label: 'Journey', icon: Baby },
  { path: '/advice', label: 'Advice', icon: Lightbulb },
]

function Layout() {
  const location = useLocation()

  return (
    <div className="layout">
      {/* Decorative background elements */}
      <div className="bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <NavLink to="/" className="nav-logo">
            <span className="logo-icon">⭐</span>
            <span className="logo-text">Twin Boys</span>
          </NavLink>

          <ul className="nav-links">
            {navItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Mobile navigation */}
          <div className="mobile-nav">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>Made with 💙 for our little champions</p>
          <p className="footer-subtitle">Coming Soon • 2026</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
