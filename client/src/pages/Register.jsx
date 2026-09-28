import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { registerUser } from '../services/authApi.js'

function Register() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [form, setForm] = useState({ email: '', name: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await registerUser(form)
      setSession({ token: data.token, user: data.user })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-20">
      <form className="surface-panel w-full p-8" onSubmit={handleSubmit}>
        <p className="ui-label text-sm uppercase tracking-[0.2em] text-yellow">Create account</p>
        <h1 className="mt-4 text-3xl font-black text-cream">Register</h1>
        {error && <p className="mt-4 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm text-cream">{error}</p>}
        <div className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-muted" htmlFor="name">
            Name
            <input id="name" name="name" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" required type="text" value={form.name} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-muted" htmlFor="email">
            Email address
            <input id="email" name="email" onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" required type="email" value={form.email} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-muted" htmlFor="password">
            Password
            <input id="password" minLength={6} name="password" onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" required type="password" value={form.password} />
          </label>
          <button className="btn-primary font-bold disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-muted">
            Already part of the fandom?{' '}
            <Link className="font-bold text-yellow transition hover:text-primary" to="/login">
              Login
            </Link>
          </p>
        </div>
      </form>
    </section>
  )
}

export default Register
