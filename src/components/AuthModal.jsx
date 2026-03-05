import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, LogIn, UserPlus, ArrowLeft, Sparkles, Mail, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './AuthModal.css'

function AuthModal({ isOpen, onClose }) {
  const { register, login, resetPassword } = useAuth()
  const [mode, setMode] = useState('welcome') // 'welcome', 'login', 'register', 'forgot', 'confirm-email'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const resetForm = () => {
    setName('')
    setEmail('')
    setPin('')
    setConfirmPin('')
    setError('')
    setResetSent(false)
  }

  const switchMode = (newMode) => {
    resetForm()
    setMode(newMode)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !pin) return

    setIsSubmitting(true)
    setError('')

    const result = await login(email, pin)
    
    if (result.error) {
      setError(result.error)
    } else {
      resetForm()
      setMode('welcome')
      onClose()
    }
    setIsSubmitting(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !pin) return

    if (pin.length !== 8 || !/^\d{8}$/.test(pin)) {
      setError('PIN must be exactly 8 digits')
      return
    }

    if (pin !== confirmPin) {
      setError('PINs do not match')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await register(name, email, pin)
    
    if (result.error) {
      setError(result.error)
    } else if (result.confirmEmail) {
      // Email confirmation required — show check-your-email screen
      setMode('confirm-email')
    } else {
      // No confirmation needed — auto-logged in
      resetForm()
      setMode('welcome')
      onClose()
    }
    setIsSubmitting(false)
  }

  const handleForgotPin = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setError('')

    const result = await resetPassword(email)
    
    if (result.error) {
      setError(result.error)
    } else {
      setResetSent(true)
    }
    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        className="auth-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="auth-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          {mode === 'welcome' && (
            <motion.div 
              className="auth-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="auth-header">
                <span className="auth-emoji">💙</span>
                <h2>Welcome!</h2>
                <p>Join us to claim gifts and track your contributions for Idris & Yousef</p>
              </div>

              <div className="auth-buttons">
                <button 
                  className="auth-btn auth-btn-primary"
                  onClick={() => switchMode('login')}
                >
                  <LogIn size={20} />
                  Log In
                </button>
                <button 
                  className="auth-btn auth-btn-secondary"
                  onClick={() => switchMode('register')}
                >
                  <UserPlus size={20} />
                  Create Account
                </button>
              </div>

              <button className="auth-skip" onClick={onClose}>
                Continue as guest (browse only)
              </button>
            </motion.div>
          )}

          {mode === 'login' && (
            <motion.div 
              className="auth-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button className="auth-back" onClick={() => switchMode('welcome')}>
                <ArrowLeft size={18} />
                Back
              </button>

              <div className="auth-header">
                <span className="auth-emoji">👋</span>
                <h2>Welcome Back!</h2>
                <p>Enter your email and PIN to log in</p>
              </div>

              <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-field">
                  <label>
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="auth-field">
                  <label>
                    <Lock size={16} />
                    8-Digit PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="\d{8}"
                    maxLength={8}
                    placeholder="••••••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                {error && (
                  <motion.div 
                    className="auth-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  className="auth-btn auth-btn-primary"
                  disabled={isSubmitting || !email.trim() || pin.length !== 8}
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles size={18} className="spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Log In
                    </>
                  )}
                </button>
              </form>

              <p className="auth-switch">
                <button onClick={() => switchMode('forgot')}>Forgot PIN?</button>
              </p>
              <p className="auth-switch">
                Don't have an account?{' '}
                <button onClick={() => switchMode('register')}>Create one</button>
              </p>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div 
              className="auth-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button className="auth-back" onClick={() => switchMode('welcome')}>
                <ArrowLeft size={18} />
                Back
              </button>

              <div className="auth-header">
                <span className="auth-emoji">✨</span>
                <h2>Join Us!</h2>
                <p>Create an account with your name, email, and a simple PIN</p>
              </div>

              <form onSubmit={handleRegister} className="auth-form">
                <div className="auth-field">
                  <label>
                    <User size={16} />
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="auth-field">
                  <label>
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label>
                    <Lock size={16} />
                    Create an 8-Digit PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="\d{8}"
                    maxLength={8}
                    placeholder="••••••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label>
                    <Lock size={16} />
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="\d{8}"
                    maxLength={8}
                    placeholder="••••••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                {error && (
                  <motion.div 
                    className="auth-error"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  className="auth-btn auth-btn-primary"
                  disabled={isSubmitting || !name.trim() || !email.trim() || pin.length !== 8 || confirmPin.length !== 8}
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles size={18} className="spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              <p className="auth-switch">
                Already have an account?{' '}
                <button onClick={() => switchMode('login')}>Log in</button>
              </p>
            </motion.div>
          )}

          {mode === 'confirm-email' && (
            <motion.div 
              className="auth-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="auth-header">
                <span className="auth-emoji">📧</span>
                <h2>Check Your Email!</h2>
                <p>
                  We've sent a confirmation link to <strong>{email}</strong>. 
                  Please check your inbox and click the link to activate your account.
                </p>
              </div>

              <div className="auth-confirm-tips">
                <p>📥 Check your <strong>inbox</strong> (and spam/junk folder)</p>
                <p>🔗 Click the <strong>confirmation link</strong> in the email</p>
                <p>🔑 Then come back here and <strong>log in</strong> with your email & PIN</p>
              </div>

              <div className="auth-buttons">
                <button 
                  className="auth-btn auth-btn-primary"
                  onClick={() => { resetForm(); switchMode('login') }}
                >
                  <LogIn size={18} />
                  Go to Login
                </button>
              </div>

              <button className="auth-skip" onClick={() => { resetForm(); setMode('welcome'); onClose() }}>
                Close
              </button>
            </motion.div>
          )}

          {mode === 'forgot' && (
            <motion.div 
              className="auth-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button className="auth-back" onClick={() => switchMode('login')}>
                <ArrowLeft size={18} />
                Back to Login
              </button>

              <div className="auth-header">
                <span className="auth-emoji">{resetSent ? '📬' : '🔑'}</span>
                <h2>{resetSent ? 'Check Your Email!' : 'Forgot PIN?'}</h2>
                <p>
                  {resetSent 
                    ? 'We\'ve sent a reset link to your email. Click it to set a new PIN.'
                    : 'Enter your email and we\'ll send you a link to reset your PIN.'
                  }
                </p>
              </div>

              {!resetSent ? (
                <form onSubmit={handleForgotPin} className="auth-form">
                  <div className="auth-field">
                    <label>
                      <Mail size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  {error && (
                    <motion.div 
                      className="auth-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <button 
                    type="submit" 
                    className="auth-btn auth-btn-primary"
                    disabled={isSubmitting || !email.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles size={18} className="spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="auth-buttons">
                  <button 
                    className="auth-btn auth-btn-primary"
                    onClick={() => { resetForm(); switchMode('login') }}
                  >
                    <LogIn size={18} />
                    Back to Login
                  </button>
                </div>
              )}

              <p className="auth-switch">
                Remember your PIN?{' '}
                <button onClick={() => switchMode('login')}>Log in</button>
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthModal
