import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Check, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './AuthModal.css'

function ChangePinModal({ isOpen, onClose }) {
  const { changePin } = useAuth()
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const resetForm = () => {
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
    setError('')
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!/^\d{8}$/.test(newPin)) {
      setError('New PIN must be exactly 8 digits')
      return
    }

    if (newPin !== confirmPin) {
      setError('New PINs do not match')
      return
    }

    if (currentPin === newPin) {
      setError('New PIN must be different from current PIN')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await changePin(currentPin, newPin)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 1500)
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
        onClick={handleClose}
      >
        <motion.div
          className="auth-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            className="auth-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {success ? (
              <div className="auth-header">
                <span className="auth-emoji">✅</span>
                <h2>PIN Changed!</h2>
                <p>Your PIN has been updated successfully.</p>
              </div>
            ) : (
              <>
                <div className="auth-header">
                  <span className="auth-emoji">🔒</span>
                  <h2>Change PIN</h2>
                  <p>Enter your current PIN and choose a new one</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-field">
                    <label>
                      <Lock size={16} />
                      Current PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="\d{8}"
                      maxLength={8}
                      placeholder="••••••••"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label>
                      <Lock size={16} />
                      New PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="\d{8}"
                      maxLength={8}
                      placeholder="••••••••"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>

                  <div className="auth-field">
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
                      className="auth-error"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="auth-buttons" style={{ flexDirection: 'row', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="auth-btn auth-btn-secondary"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="auth-btn auth-btn-primary"
                      disabled={isSubmitting || currentPin.length !== 8 || newPin.length !== 8 || confirmPin.length !== 8}
                    >
                      {isSubmitting ? (
                        <>
                          <Sparkles size={18} className="spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check size={18} />
                          Update PIN
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ChangePinModal
