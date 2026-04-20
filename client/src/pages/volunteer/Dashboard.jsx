import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

const URGENCY_LABELS = ['', 'Low', 'Moderate', 'Important', 'High', 'Critical']
const URGENCY_BADGE = ['', 'badge-gray', 'badge-blue', 'badge-amber', 'badge-amber', 'badge-red']

const CAT_COLORS = {
  education: 'badge-blue', health: 'badge-red', environment: 'badge-green',
  poverty: 'badge-amber', disaster_relief: 'badge-red', other: 'badge-gray'
}

export default function VolunteerDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tasks?limit=6&status=open'),
      api.get('/tasks/volunteer/mine'),
      api.get('/notifications'),
    ]).then(([t, m, n]) => {
      setTasks(t.data.tasks || [])
      setMyTasks(m.data.tasks || [])
      setNotifs(n.data.notifications?.slice(0, 4) || [])
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Applied Tasks', value: myTasks.filter(t => t.applicants?.some(a => a.user === user?._id && a.status === 'pending')).length, color: 'text-amber-400' },
    { label: 'Active Assignments', value: myTasks.filter(t => t.assignedVolunteers?.includes(user?._id)).length, color: 'text-brand-400' },
    { label: 'Completed', value: user?.tasksCompleted || 0, color: 'text-cyan-400' },
    { label: 'Hours Given', value: user?.hoursContributed || 0, color: 'text-violet-400' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="page-header">Good to see you, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your community today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Open tasks */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Open tasks near you</h2>
            <Link to="/volunteer/tasks" className="btn-ghost text-xs">View all →</Link>
          </div>
          <div className="space-y-3">
            {tasks.length === 0 && (
              <div className="card p-8 text-center text-gray-500">No open tasks right now.</div>
            )}
            {tasks.map(task => (
              <TaskCard key={task._id} task={task} userId={user?._id} />
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-5">
          {/* Profile completeness */}
          <div className="card p-5">
            <h3 className="font-medium text-gray-200 text-sm mb-4">Profile completeness</h3>
            {[
              { label: 'Name & Email', done: true },
              { label: 'Skills added', done: user?.skills?.length > 0 },
              { label: 'Location set', done: !!user?.location?.city },
              { label: 'Bio written', done: !!user?.bio },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 py-2 border-b border-dark-700 last:border-0">
                <span className={`text-sm ${item.done ? 'text-brand-400' : 'text-dark-400'}`}>
                  {item.done ? '✓' : '○'}
                </span>
                <span className={`text-sm ${item.done ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}</span>
              </div>
            ))}
            <Link to="/volunteer/profile" className="btn-secondary w-full justify-center mt-4 text-xs">
              Complete profile
            </Link>
          </div>

          {/* Recent notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-200 text-sm">Recent notifications</h3>
              <Link to="/volunteer/notifications" className="text-brand-400 text-xs hover:text-brand-300">See all</Link>
            </div>
            {notifs.length === 0 && <p className="text-gray-600 text-sm">No notifications yet.</p>}
            <div className="space-y-3">
              {notifs.map(n => (
                <div key={n._id} className={`flex gap-3 ${!n.isRead ? 'opacity-100' : 'opacity-60'}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-brand-500' : 'bg-dark-500'}`} />
                  <div>
                    <p className="text-gray-300 text-xs font-medium">{n.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                    <p className="text-gray-600 text-xs mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task, userId }) {
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(
    task.applicants?.some(a => a.user === userId) || task.assignedVolunteers?.includes(userId)
  )

  const apply = async (e) => {
    e.preventDefault()
    setApplying(true)
    try {
      await api.post(`/tasks/${task._id}/apply`)
      setApplied(true)
    } catch (err) {
      alert(err.response?.data?.message || 'Could not apply')
    } finally {
      setApplying(false)
    }
  }

  const urgency = task.urgencyLevel || 1

  return (
    <div className="card p-4 hover:border-dark-400 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`badge ${URGENCY_BADGE[urgency]}`}>
              {'▲'.repeat(Math.min(urgency, 3))} {URGENCY_LABELS[urgency]}
            </span>
            <span className={`badge ${CAT_COLORS[task.category] || 'badge-gray'}`}>
              {task.category?.replace('_', ' ')}
            </span>
          </div>
          <h3 className="font-medium text-gray-200 text-sm leading-snug">{task.title}</h3>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{task.description}</p>
          <div className="flex items-center gap-3 mt-2 text-gray-600 text-xs">
            {task.orgId?.name && <span>🏢 {task.orgId.name}</span>}
            {task.location?.city && <span>📍 {task.location.city}</span>}
            {task.deadline && <span>⏰ Due {new Date(task.deadline).toLocaleDateString()}</span>}
          </div>
          {task.skillsRequired?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {task.skillsRequired.slice(0, 3).map(s => (
                <span key={s} className="badge-gray text-xs px-2 py-0.5 rounded-md">{s}</span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={apply} disabled={applied || applying || task.status !== 'open'}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
            applied ? 'bg-brand-900 text-brand-400 border-brand-800 cursor-default'
            : 'bg-dark-700 hover:bg-dark-600 text-gray-300 border-dark-500'
          }`}
        >
          {applying ? '...' : applied ? '✓ Applied' : 'Apply'}
        </button>
      </div>
    </div>
  )
}
