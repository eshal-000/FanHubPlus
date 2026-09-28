import { useState } from 'react'
import { requestPasswordReset } from '../services/authApi.js'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const { data } = await requestPasswordReset({ email })
      setMessage(data.message || 'If that email exists, a password reset link has been sent.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not request a reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-20">
      <form className="surface-panel w-full p-8" onSubmit={handleSubmit}>
        <p className="ui-label text-sm uppercase tracking-[0.2em] text-yellow">Password reset</p>
        <h1 className="mt-4 text-3xl font-black text-cream">Forgot Password</h1>
        {message && <p className="mt-4 rounded-xl border border-yellow/40 bg-yellow/10 p-3 text-sm text-cream">{message}</p>}
        {error && <p className="mt-4 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm text-cream">{error}</p>}
        <label className="mt-8 grid gap-2 text-sm font-semibold text-muted" htmlFor="email">
          Email address
          <input id="email" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="Email address" required type="email" value={email} />
        </label>
        <button className="btn-primary mt-5 w-full font-bold disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </section>
  )
}

export default ForgotPassword
