import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const COLORS = ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#f43f5e', '#64748b']

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/stats').then(r => setStats(r.data.stats)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const topStats = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, color: 'text-violet-400', sub: 'registered accounts' },
    { label: 'Volunteers', value: stats?.totalVolunteers ?? 0, color: 'text-brand-400', sub: 'active contributors' },
    { label: 'NGOs', value: stats?.totalNGOs ?? 0, color: 'text-cyan-400', sub: 'organizations' },
    { label: 'Total Tasks', value: stats?.totalTasks ?? 0, color: 'text-amber-400', sub: 'posted tasks' },
  ]

  const taskStatusData = (stats?.tasksByStatus || []).map(t => ({
    name: t._id?.replace('_', ' ') || 'unknown', value: t.count
  }))

  const needsCatData = (stats?.needsByCategory || []).map(n => ({
    name: n._id?.replace('_', ' ') || 'other', count: n.count
  }))

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="page-header">Platform overview</h1>
        <p className="text-gray-500 mt-1">ImpactLink system-wide metrics and controls</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`font-display text-4xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-300 font-medium text-sm">{s.label}</div>
            <div className="text-gray-600 text-xs">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {taskStatusData.length > 0 && (
          <div className="card p-6">
            <h2 className="section-title mb-6">Task status breakdown</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {taskStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1a2330', borderRadius: 8, color: '#e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {needsCatData.length > 0 && (
          <div className="card p-6">
            <h2 className="section-title mb-6">Community needs by category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={needsCatData} layout="vertical">
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={90} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1a2330', borderRadius: 8, color: '#e5e7eb' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Empty state for charts */}
        {taskStatusData.length === 0 && needsCatData.length === 0 && (
          <div className="lg:col-span-2 card p-12 text-center">
            <div className="text-4xl mb-3 opacity-20">◈</div>
            <p className="text-gray-400">No data to display yet. Charts will appear as users create tasks and needs.</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/admin/users" className="card p-5 hover:border-violet-800 transition-all group">
          <div className="text-violet-400 text-2xl mb-3">◉</div>
          <h3 className="font-display font-semibold text-gray-200 group-hover:text-white">Manage users</h3>
          <p className="text-gray-500 text-sm mt-1">View, activate or deactivate accounts</p>
        </Link>
        <Link to="/admin/orgs" className="card p-5 hover:border-cyan-800 transition-all group">
          <div className="text-cyan-400 text-2xl mb-3">◎</div>
          <h3 className="font-display font-semibold text-gray-200 group-hover:text-white">Approve NGOs</h3>
          <p className="text-gray-500 text-sm mt-1">Review and approve organization applications</p>
        </Link>
        <Link to="/admin/analytics" className="card p-5 hover:border-amber-800 transition-all group">
          <div className="text-amber-400 text-2xl mb-3">◈</div>
          <h3 className="font-display font-semibold text-gray-200 group-hover:text-white">Full analytics</h3>
          <p className="text-gray-500 text-sm mt-1">Deep-dive into platform performance</p>
        </Link>
      </div>
    </div>
  )
}
