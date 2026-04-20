// OrgDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function OrgDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [needs, setNeeds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tasks/org/mine'),
      api.get('/needs'),
    ]).then(([t, n]) => {
      setTasks(t.data.tasks || [])
      setNeeds(n.data.needs || [])
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Tasks', value: tasks.length, color: 'text-cyan-400' },
    { label: 'Open', value: tasks.filter(t => t.status === 'open').length, color: 'text-brand-400' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'text-amber-400' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'text-violet-400' },
  ]

  const categoryData = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1
    return acc
  }, {})
  const chartData = Object.entries(categoryData).map(([name, count]) => ({ name: name.replace('_', ' '), count }))

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="page-header">Organization Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your tasks and community needs</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card p-5">
            <h2 className="section-title mb-5">Tasks by category</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1a2330', borderRadius: 8, color: '#e5e7eb' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#f43f5e'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent tasks</h2>
            <Link to="/org/tasks" className="btn-ghost text-xs">Manage all →</Link>
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).map(t => (
              <div key={t._id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                <div>
                  <p className="text-gray-300 text-sm font-medium">{t.title}</p>
                  <p className="text-gray-600 text-xs">{t.applicants?.length || 0} applicants</p>
                </div>
                <span className={`badge ${t.status === 'open' ? 'badge-green' : t.status === 'in_progress' ? 'badge-amber' : 'badge-gray'}`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-gray-600 text-sm">No tasks yet. <Link to="/org/tasks" className="text-cyan-400">Create one →</Link></p>}
          </div>
        </div>
      </div>
    </div>
  )
}
