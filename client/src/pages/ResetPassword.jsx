import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { resetPassword } from '../services/authApi.js'

function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const { data } = await resetPassword(token, { password })
      setMessage(data.message || 'Password reset successful.')
      window.setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-20">
      <form className="surface-panel w-full p-8" onSubmit={handleSubmit}>
        <p className="ui-label text-sm uppercase tracking-[0.2em] text-yellow">Secure reset</p>
        <h1 className="mt-4 text-3xl font-black text-cream">Reset Password</h1>
        {message && <p className="mt-4 rounded-xl border border-yellow/40 bg-yellow/10 p-3 text-sm text-cream">{message}</p>}
        {error && <p className="mt-4 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm text-cream">{error}</p>}
        <label className="mt-8 grid gap-2 text-sm font-semibold text-muted" htmlFor="password">
          New password
          <input id="password" minLength={6} name="password" onChange={(event) => setPassword(event.target.value)} placeholder="New password" required type="password" value={password} />
        </label>
        <button className="btn-primary mt-5 w-full font-bold disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
        <Link className="mt-4 block text-center text-sm font-semibold text-muted transition hover:text-yellow" to="/login">
          Back to login
        </Link>
      </form>
    </section>
  )
}

export default ResetPassword
