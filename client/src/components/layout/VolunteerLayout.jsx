import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const NAV = [
  { to: '/volunteer', label: 'Dashboard', icon: '⊞', end: true },
  { to: '/volunteer/tasks', label: 'Browse Tasks', icon: '◫' },
  { to: '/volunteer/my-tasks', label: 'My Tasks', icon: '◱' },
  { to: '/volunteer/leaderboard', label: 'Leaderboard', icon: '◈' },
  { to: '/volunteer/notifications', label: 'Notifications', icon: '◎' },
  { to: '/volunteer/profile', label: 'Profile', icon: '◉' },
]

export default function VolunteerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    api.get('/notifications').then(r => setUnread(r.data.unreadCount)).catch(() => {})
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex min-h-screen bg-dark-900">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-60 bg-dark-800 border-r border-dark-700 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-dark-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-xs">IL</span>
            </div>
            <span className="font-display font-bold text-white text-base">ImpactLink</span>
          </div>
        </div>

        {/* User chip */}
        <div className="px-4 py-4 border-b border-dark-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-900 border border-brand-800 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-gray-200 text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs">Volunteer</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="text-base leading-none">{n.icon}</span>
              <span>{n.label}</span>
              {n.label === 'Notifications' && unread > 0 && (
                <span className="ml-auto bg-brand-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-dark-700 shrink-0">
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-400 hover:bg-red-950">
            <span>⊗</span> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-dark-800 border-b border-dark-700 flex items-center px-6 gap-4 sticky top-0 z-10">
          <button className="lg:hidden btn-ghost p-2" onClick={() => setSidebarOpen(true)}>
            <span className="text-lg">≡</span>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="badge-green">Volunteer</span>
          </div>
        </header>

        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
