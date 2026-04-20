// NotFound.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function NotFound() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const getDashboard = () => {
    if (!user) return '/'
    if (user.role === 'volunteer') return '/volunteer'
    if (user.role === 'ngo_admin') return '/org'
    return '/admin'
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-6">
      <div className="text-center animate-fade-in">
        <div className="font-display text-[10rem] font-bold leading-none text-gradient opacity-20 select-none">
          404
        </div>
        <h1 className="font-display text-3xl font-bold text-white mt-4 mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">← Go back</button>
          <Link to={getDashboard()} className="btn-primary">Go to dashboard</Link>
        </div>
      </div>
    </div>
  )
}
