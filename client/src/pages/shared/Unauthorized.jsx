import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Unauthorized() {
  const { user } = useAuth()

  const getDashboard = () => {
    if (!user) return '/login'
    if (user.role === 'volunteer') return '/volunteer'
    if (user.role === 'ngo_admin') return '/org'
    return '/admin'
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-6">
      <div className="text-center animate-fade-in max-w-md">
        <div className="text-6xl mb-4">⊗</div>
        <h1 className="font-display text-3xl font-bold text-white mb-3">Access denied</h1>
        <p className="text-gray-500 mb-2">
          You don't have permission to view this page.
        </p>
        {user && (
          <p className="text-gray-600 text-sm mb-8">
            You're signed in as <span className="text-gray-400">{user.name}</span> with role{' '}
            <span className="text-amber-400">{user.role?.replace('_', ' ')}</span>.
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Link to={getDashboard()} className="btn-primary">
            Go to my dashboard →
          </Link>
          {!user && <Link to="/login" className="btn-secondary">Sign in</Link>}
        </div>
      </div>
    </div>
  )
}
