

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCurrentUser } from '../services/authApi.js'

const STORAGE_KEY = 'fanHubPlusAuth'

const AuthContext = createContext(null)

function readStoredSession() {
  try {
    if (typeof window === 'undefined') return { token: null, user: null }
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : { token: null, user: null }
  } catch {
    return { token: null, user: null }
  }
}

function persistSession(nextSession) {
  if (typeof window === 'undefined') return
  if (nextSession?.token) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(readStoredSession)
  const [sessionVerified, setSessionVerified] = useState(() => !readStoredSession().token)
  const [isAuthChecking, setIsAuthChecking] = useState(() => Boolean(readStoredSession().token))

  const setSession = useCallback((nextSession, options = {}) => {
    const normalizedSession = {
      token: nextSession?.token || null,
      user: nextSession?.user || null,
    }
    const verified = options.verified ?? true
    setSessionState(normalizedSession)
    setSessionVerified(normalizedSession.token ? verified : true)
    persistSession(normalizedSession)
  }, [])

  const clearSession = useCallback(() => {
    const emptySession = { token: null, user: null }
    setSessionState(emptySession)
    setSessionVerified(true)
    setIsAuthChecking(false)
    window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  const refreshSession = useCallback(async () => {
    if (!session.token) {
      clearSession()
      return null
    }

    setIsAuthChecking(true)
    try {
      const { data } = await fetchCurrentUser()
      const verifiedUser = data?.user || null
      const verifiedSession = { token: session.token, user: verifiedUser }
      setSessionState(verifiedSession)
      setSessionVerified(true)
      persistSession(verifiedSession)
      return verifiedUser
    } catch {
      clearSession()
      return null
    } finally {
      setIsAuthChecking(false)
    }
  }, [clearSession, session.token])

  useEffect(() => {
    let cancelled = false

    if (!session.token) {
      setIsAuthChecking(false)
      setSessionVerified(true)
      return undefined
    }

    if (sessionVerified) {
      setIsAuthChecking(false)
      return undefined
    }

    setIsAuthChecking(true)
    fetchCurrentUser()
      .then(({ data }) => {
        if (cancelled) return
        const verifiedSession = {
          token: session.token,
          user: data?.user || null,
        }
        setSessionState(verifiedSession)
        setSessionVerified(true)
        persistSession(verifiedSession)
      })
      .catch(() => {
        if (!cancelled) clearSession()
      })
      .finally(() => {
        if (!cancelled) setIsAuthChecking(false)
      })

    return () => {
      cancelled = true
    }
  }, [clearSession, session.token, sessionVerified])

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated: Boolean(session.token && sessionVerified && session.user),
      isAuthChecking,
      refreshSession,
      hasRole: (roles) => {
        if (!session.token || !sessionVerified || !session.user) return false
        if (!roles?.length) return true
        return roles.includes(session.user?.role)
      },
      setSession,
      clearSession,
    }),
    [clearSession, isAuthChecking, refreshSession, session, sessionVerified, setSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
