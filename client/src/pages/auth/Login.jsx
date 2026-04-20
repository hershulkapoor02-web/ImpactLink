import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'volunteer') navigate('/volunteer')
      else if (user.role === 'ngo_admin') navigate('/org')
      else navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-brand-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-slide-up">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">IL</span>
          </div>
          <span className="font-display font-bold text-white text-lg">ImpactLink</span>
        </Link>

        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-7">Sign in to your account to continue</p>

          {error && (
            <div className="bg-red-950 border border-red-900 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                required autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign in →'}
            </button>
          </form>

          <div className="divider mt-6 mb-5" />

          <p className="text-center text-gray-500 text-sm">
            No account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>

        {/* Demo accounts hint */}
        <div className="mt-5 card p-4">
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Demo accounts</p>
          <div className="space-y-1 font-mono text-xs text-gray-500">
            <div>volunteer@demo.com / demo1234</div>
            <div>ngo@demo.com / demo1234</div>
            <div>admin@demo.com / demo1234</div>
          </div>
        </div>
      </div>
    </div>
  )
}
