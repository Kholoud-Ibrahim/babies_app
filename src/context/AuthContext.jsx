import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setGuest({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email,
          email: session.user.email,
        })
      }
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setGuest({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email,
          email: session.user.email,
        })
      } else if (event === 'SIGNED_OUT') {
        setGuest(null)
      } else if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const register = async (name, email, pin) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pin,
      options: {
        data: { name: name.trim() }
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'This email is already registered. Please log in instead.' }
      }
      return { error: error.message }
    }

    // Handle case where email confirmation is enabled but user already exists
    if (data.user && data.user.identities?.length === 0) {
      return { error: 'This email is already registered. Please log in instead.' }
    }

    // If no session, email confirmation is required
    if (!data.session) {
      return { success: true, confirmEmail: true }
    }

    return { success: true }
  }

  const login = async (email, pin) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pin,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Invalid email or PIN. Please try again.' }
      }
      return { error: error.message }
    }

    return { success: true }
  }

  const changePin = async (currentPin, newPin) => {
    if (!guest) return { error: 'You must be logged in.' }

    // Verify current PIN by re-signing in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: guest.email,
      password: currentPin,
    })

    if (verifyError) {
      return { error: 'Current PIN is incorrect.' }
    }

    // Update to new PIN
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPin,
    })

    if (updateError) {
      return { error: 'Failed to update PIN. Please try again.' }
    }

    return { success: true }
  }

  const resetPassword = async (email) => {
    const redirectUrl = `${window.location.origin}/reset-pin`

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }

  const updatePasswordFromRecovery = async (newPin) => {
    const { error } = await supabase.auth.updateUser({
      password: newPin,
    })

    if (error) {
      return { error: error.message }
    }

    setIsRecoveryMode(false)
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setGuest(null)
  }

  const openAuthModal = useCallback(() => {
    setShowAuthModal(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false)
  }, [])

  const requireAuth = useCallback(() => {
    if (!guest) {
      setShowAuthModal(true)
      return false
    }
    return true
  }, [guest])

  return (
    <AuthContext.Provider value={{
      guest,
      loading,
      register,
      login,
      logout,
      changePin,
      resetPassword,
      updatePasswordFromRecovery,
      isRecoveryMode,
      showAuthModal,
      openAuthModal,
      closeAuthModal,
      requireAuth,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
