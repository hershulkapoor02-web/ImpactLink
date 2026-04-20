import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const SKILLS_OPTIONS = ['Teaching', 'Healthcare', 'Construction', 'IT/Tech', 'Logistics', 'Counseling', 'Agriculture', 'Legal', 'Finance', 'Media', 'Translation', 'Social Work']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const defaultRole = params.get('role') || 'volunteer'

  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole, orgName: '', skills: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f, skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      const user = await register(form)
      if (user.role === 'volunteer') navigate('/volunteer')
      else if (user.role === 'ngo_admin') navigate('/org')
      else navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative animate-slide-up">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">IL</span>
          </div>
          <span className="font-display font-bold text-white text-lg">ImpactLink</span>
        </Link>

        <div className="card p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-7">Join the platform making real social impact</p>

          {error && (
            <div className="bg-red-950 border border-red-900 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          {/* Role toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-dark-700 rounded-xl">
            {[
              { value: 'volunteer', label: 'Volunteer' },
              { value: 'ngo_admin', label: 'NGO / Organization' },
            ].map(r => (
              <button
                key={r.value} type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.role === r.value ? 'bg-dark-900 text-white border border-dark-500' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" className="input" placeholder="Jane Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            {form.role === 'ngo_admin' && (
              <div>
                <label className="label">Organization name</label>
                <input type="text" className="input" placeholder="Your NGO name"
                  value={form.orgName} onChange={e => setForm({ ...form, orgName: e.target.value })} required />
              </div>
            )}

            {form.role === 'volunteer' && (
              <div>
                <label className="label">Your skills (select all that apply)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SKILLS_OPTIONS.map(skill => (
                    <button key={skill} type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        form.skills.includes(skill)
                          ? 'bg-brand-900 text-brand-400 border-brand-700'
                          : 'bg-dark-700 text-gray-400 border-dark-600 hover:border-dark-400'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : 'Create account →'}
            </button>
          </form>

          <div className="divider mt-6 mb-5" />
          <p className="text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
