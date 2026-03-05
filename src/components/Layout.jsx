import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Gift, Heart, Baby, Lightbulb, LogIn, LogOut, Lock, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import ChangePinModal from './ChangePinModal'
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
  const { guest, isAdmin, logout, showAuthModal, openAuthModal, closeAuthModal } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showChangePin, setShowChangePin] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside (desktop)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

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
            <span className="logo-text">Noah & Yousef</span>
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

          {/* Auth section in nav */}
          <div className="nav-auth" ref={dropdownRef}>
            {guest ? (
              <div className="identity-wrapper">
                <button 
                  className="identity-bar"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="identity-avatar">
                    {guest.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="identity-name">{guest.name}</span>
                  {isAdmin && <span className="admin-badge">Admin</span>}
                  <ChevronDown size={14} className={`identity-chevron ${showDropdown ? 'open' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div 
                      className="identity-dropdown"
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <button 
                        className="dropdown-item"
                        onClick={() => { setShowChangePin(true); setShowDropdown(false) }}
                      >
                        <Lock size={15} />
                        Change PIN
                      </button>
                      <button 
                        className="dropdown-item dropdown-item-danger"
                        onClick={async () => { await logout(); setShowDropdown(false) }}
                      >
                        <LogOut size={15} />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button className="login-nav-btn" onClick={openAuthModal}>
                <LogIn size={16} />
                <span>Log In</span>
              </button>
            )}
          </div>

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
            {/* Mobile auth button */}
            {guest ? (
              <button
                className="mobile-nav-link mobile-auth-btn"
                onClick={() => setShowMobileMenu(true)}
              >
                <div className="mobile-avatar">{guest.name.charAt(0).toUpperCase()}</div>
                <span className="mobile-auth-name">{guest.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                className="mobile-nav-link mobile-auth-btn mobile-login-btn"
                onClick={openAuthModal}
              >
                <LogIn size={20} />
                <span>Log In</span>
              </button>
            )}
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

      {/* Global Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />

      {/* Change PIN Modal */}
      <ChangePinModal isOpen={showChangePin} onClose={() => setShowChangePin(false)} />

      {/* Mobile Account Menu (bottom sheet) */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              className="mobile-sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              className="mobile-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="mobile-sheet-handle" />
              {guest && (
                <div className="mobile-sheet-header">
                  <div className="mobile-sheet-avatar">{guest.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="mobile-sheet-name">{guest.name}</div>
                    <div className="mobile-sheet-email">{guest.email}</div>
                  </div>
                </div>
              )}
              <div className="mobile-sheet-actions">
                <button
                  className="mobile-sheet-btn"
                  onClick={() => { setShowMobileMenu(false); setShowChangePin(true) }}
                >
                  <Lock size={18} />
                  Change PIN
                </button>
                <button
                  className="mobile-sheet-btn mobile-sheet-btn-danger"
                  onClick={async () => { setShowMobileMenu(false); await logout() }}
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Layout
