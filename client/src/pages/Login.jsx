import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { loginUser } from '../services/authApi.js'

const ADMIN_HOME = '/admin'
const USER_HOME = '/dashboard'

function getRequestedPath(from) {
  if (!from?.pathname) return ''
  return `${from.pathname}${from.search || ''}${from.hash || ''}`
}

function getPostLoginPath(user, from) {
  const requestedPath = getRequestedPath(from)
  const requestedRoute = from?.pathname || ''

  if (user?.role === 'admin') {
    return requestedRoute.startsWith('/admin') ? requestedPath : ADMIN_HOME
  }

  if (
    requestedRoute &&
    !requestedRoute.startsWith('/admin') &&
    requestedRoute !== '/login' &&
    requestedRoute !== '/admin/login'
  ) {
    return requestedPath
  }

  return USER_HOME
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await loginUser(form)
      setSession({ token: data.token, user: data.user })
      navigate(getPostLoginPath(data.user, location.state?.from), { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-20">
      <form className="surface-panel w-full p-8" onSubmit={handleSubmit}>
        <p className="ui-label text-sm uppercase tracking-[0.2em] text-yellow">Fan Hub Plus</p>
        <h1 className="mt-4 text-3xl font-black text-cream">Login</h1>
        {error && <p className="mt-4 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm text-cream">{error}</p>}
        <div className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-muted" htmlFor="email">
            Email address
            <input id="email" name="email" onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" required type="email" value={form.email} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-muted" htmlFor="password">
            Password
            <input id="password" name="password" onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" required type="password" value={form.password} />
          </label>
          <button className="btn-primary font-bold disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Continue'}
          </button>
          <p className="text-center text-sm text-muted">
            New to Fan Hub Plus?{' '}
            <Link className="font-bold text-yellow transition hover:text-primary" to="/register">
              Create an account
            </Link>
          </p>
          <Link className="text-center text-sm font-semibold text-muted transition hover:text-yellow" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
      </form>
    </section>
  )
}

export default Login
