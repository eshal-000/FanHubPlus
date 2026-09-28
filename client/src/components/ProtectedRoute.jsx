import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useEffect, useState } from 'react'

function ProtectedRoute({ allowedRoles, loginPath = '/login' }) {
  const location = useLocation()
  const { hasRole, isAuthChecking, isAuthenticated, refreshSession, user } = useAuth()
  const [roleRefreshAttempted, setRoleRefreshAttempted] = useState(false)
  const [roleRefreshing, setRoleRefreshing] = useState(false)

  const roleDenied = Boolean(
    allowedRoles?.length &&
      isAuthenticated &&
      !isAuthChecking &&
      !hasRole(allowedRoles),
  )

  useEffect(() => {
    setRoleRefreshAttempted(false)
  }, [location.pathname])

  useEffect(() => {
    let cancelled = false

    if (!roleDenied || roleRefreshAttempted) return undefined

    setRoleRefreshing(true)
    refreshSession()
      .catch(() => null)
      .finally(() => {
        if (cancelled) return
        setRoleRefreshAttempted(true)
        setRoleRefreshing(false)
      })

    return () => {
      cancelled = true
    }
  }, [refreshSession, roleDenied, roleRefreshAttempted])

  if (isAuthChecking || roleRefreshing || (roleDenied && !roleRefreshAttempted)) {
    return (
      <main className="min-h-screen bg-bg px-4 py-24 text-cream">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-2xl shadow-black/30">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow">
            Verifying session
          </p>
          <p className="mt-2 text-sm text-muted">
            Checking your Fan Hub Plus access...
          </p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={loginPath} />
  }

  if (allowedRoles?.length && !hasRole(allowedRoles)) {
    return <Navigate replace to={user?.role === 'admin' ? '/admin' : '/dashboard'} />
  }

  return <Outlet />
}

export default ProtectedRoute
