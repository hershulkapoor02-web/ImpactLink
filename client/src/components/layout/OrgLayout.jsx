import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/org', label: 'Dashboard', icon: '⊞', end: true },
  { to: '/org/tasks', label: 'Manage Tasks', icon: '◫' },
  { to: '/org/needs', label: 'Community Needs', icon: '◉' },
  { to: '/org/profile', label: 'Organization', icon: '◎' },
]

export default function OrgLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-dark-900">
      <aside className="fixed inset-y-0 left-0 z-30 w-60 bg-dark-800 border-r border-dark-700 flex flex-col hidden lg:flex">
        <div className="h-16 flex items-center px-5 border-b border-dark-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-xs">IL</span>
            </div>
            <span className="font-display font-bold text-white text-base">ImpactLink</span>
          </div>
        </div>
        <div className="px-4 py-4 border-b border-dark-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-900 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-gray-200 text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs">NGO Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'bg-cyan-950 text-cyan-400 border border-cyan-900' : ''}`}
            >
              <span className="text-base">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-dark-700 shrink-0">
          <button onClick={() => { logout(); navigate('/') }} className="sidebar-link w-full text-red-500 hover:text-red-400 hover:bg-red-950">
            <span>⊗</span> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="h-16 bg-dark-800 border-b border-dark-700 flex items-center px-6">
          <div className="flex-1" />
          <span className="badge badge-blue">NGO Admin</span>
        </header>
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
