import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Check, Sparkles, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './ResetPin.css'

function ResetPin() {
  const { isRecoveryMode, updatePasswordFromRecovery, guest } = useAuth()
  const navigate = useNavigate()
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // If not in recovery mode and no user, wait a moment for Supabase to process the token
  const [waiting, setWaiting] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setWaiting(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!/^\d{8}$/.test(newPin)) {
      setError('PIN must be exactly 8 digits')
      return
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await updatePasswordFromRecovery(newPin)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setIsSubmitting(false)
  }

  // Show waiting state while Supabase processes the recovery token
  if (waiting && !isRecoveryMode && !guest) {
    return (
      <div className="reset-pin-page">
        <motion.div 
          className="reset-pin-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="reset-pin-header">
            <span className="reset-pin-emoji">⏳</span>
            <h2>Processing...</h2>
            <p>Please wait while we verify your reset link.</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // If not in recovery mode after waiting, show error
  if (!isRecoveryMode && !success && !guest) {
    return (
      <div className="reset-pin-page">
        <motion.div 
          className="reset-pin-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="reset-pin-header">
            <span className="reset-pin-emoji">❌</span>
            <h2>Invalid or Expired Link</h2>
            <p>This reset link is no longer valid. Please request a new one.</p>
          </div>
          <button 
            className="reset-pin-btn"
            onClick={() => navigate('/')}
          >
            <Home size={18} />
            Go Home
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="reset-pin-page">
      <motion.div 
        className="reset-pin-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {success ? (
          <>
            <div className="reset-pin-header">
              <span className="reset-pin-emoji">✅</span>
              <h2>PIN Reset Successfully!</h2>
              <p>Your new PIN is ready. You can now log in with it.</p>
            </div>
            <button 
              className="reset-pin-btn"
              onClick={() => navigate('/')}
            >
              <Home size={18} />
              Go to App
            </button>
          </>
        ) : (
          <>
            <div className="reset-pin-header">
              <span className="reset-pin-emoji">🔑</span>
              <h2>Set New PIN</h2>
              <p>Choose a new 8-digit PIN for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="reset-pin-form">
              <div className="reset-pin-field">
                <label>
                  <Lock size={16} />
                  New 8-Digit PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="\d{8}"
                  maxLength={8}
                  placeholder="••••••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
              </div>

              <div className="reset-pin-field">
                <label>
                  <Lock size={16} />
                  Confirm New PIN
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
                  className="reset-pin-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <button 
                type="submit" 
                className="reset-pin-btn"
                disabled={isSubmitting || newPin.length !== 8 || confirmPin.length !== 8}
              >
                {isSubmitting ? (
                  <>
                    <Sparkles size={18} className="spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Set New PIN
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default ResetPin

