import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STATS = [
  { label: 'Volunteers', value: '2,400+' },
  { label: 'NGOs Onboarded', value: '180+' },
  { label: 'Tasks Completed', value: '8,900+' },
  { label: 'Communities Served', value: '340+' },
]

const FEATURES = [
  {
    icon: '◈',
    title: 'Smart Matching',
    desc: 'AI-powered skill matching connects the right volunteer to the right task instantly.',
    color: 'text-brand-400',
  },
  {
    icon: '◎',
    title: 'Needs Mapping',
    desc: 'Visualize community needs geographically to prioritize high-impact areas.',
    color: 'text-cyan-400',
  },
  {
    icon: '◉',
    title: 'Survey Ingestion',
    desc: 'Upload field reports and surveys. The system extracts and structures urgent needs automatically.',
    color: 'text-violet-400',
  },
  {
    icon: '◐',
    title: 'Real-time Coordination',
    desc: 'Live task boards, notifications, and volunteer dashboards keep everyone in sync.',
    color: 'text-amber-400',
  },
]

export default function Landing() {
  const { user } = useAuth()

  const getDashboardLink = () => {
    if (!user) return null
    if (user.role === 'volunteer') return '/volunteer'
    if (user.role === 'ngo_admin') return '/org'
    if (user.role === 'super_admin') return '/admin'
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-dark-700 bg-dark-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">IL</span>
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">ImpactLink</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to={getDashboardLink()} className="btn-primary">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Sign in</Link>
                <Link to="/register" className="btn-primary">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative">
        {/* Glow blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-900 border border-brand-800 rounded-full text-brand-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
            Smart Resource Allocation Platform
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-bold text-white leading-[1.05] mb-6">
            Connect volunteers to{' '}
            <span className="text-gradient">urgent needs</span>
            {' '}that matter
          </h1>

          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            ImpactLink aggregates scattered community data from NGOs and intelligently
            matches skilled volunteers with the tasks where they're needed most.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary text-base px-7 py-3 glow-green">
              Join as Volunteer
            </Link>
            <Link to="/register?role=ngo_admin" className="btn-secondary text-base px-7 py-3">
              Register your NGO
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="card p-5 text-center animate-slide-up">
              <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Built for real-world impact
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Everything an NGO needs to coordinate volunteers at scale — from data ingestion to task completion.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-7 hover:border-dark-400 transition-all duration-300 group">
                <div className={`text-3xl mb-4 ${f.color} font-mono`}>{f.icon}</div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center card p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="relative">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Ready to make an impact?
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of volunteers and NGOs already coordinating through ImpactLink.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/register" className="btn-primary text-base px-8 py-3">
                Create free account
              </Link>
              <Link to="/login" className="btn-ghost text-base px-8 py-3">
                Sign in →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">IL</span>
            </div>
            <span className="font-display font-bold text-gray-400 text-sm">ImpactLink</span>
          </div>
          <p className="text-gray-600 text-sm">© 2025 ImpactLink. Data-driven volunteer coordination.</p>
        </div>
      </footer>
    </div>
  )
}
