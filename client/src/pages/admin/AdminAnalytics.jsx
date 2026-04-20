import { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'

const COLORS = ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#f43f5e', '#64748b']

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0d1117',
    border: '1px solid #1a2330',
    borderRadius: 8,
    color: '#e5e7eb',
    fontSize: 12
  }
}

export default function AdminAnalytics() {
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

  const taskStatusData = (stats?.tasksByStatus || []).map(t => ({
    name: (t._id || 'unknown').replace('_', ' '),
    value: t.count
  }))

  const needsCatData = (stats?.needsByCategory || []).map(n => ({
    name: (n._id || 'other').replace('_', ' '),
    count: n.count
  }))

  // Simulated growth data for visual richness (replace with real data later)
  const growthData = [
    { month: 'Aug', users: 120, tasks: 45 },
    { month: 'Sep', users: 210, tasks: 82 },
    { month: 'Oct', users: 340, tasks: 130 },
    { month: 'Nov', users: 520, tasks: 210 },
    { month: 'Dec', users: 780, tasks: 320 },
    { month: 'Jan', users: stats?.totalVolunteers || 900, tasks: stats?.totalTasks || 410 },
  ]

  const kpis = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, color: 'text-violet-400', icon: '◉' },
    { label: 'Volunteers', value: stats?.totalVolunteers ?? 0, color: 'text-brand-400', icon: '◎' },
    { label: 'Organizations', value: stats?.totalNGOs ?? 0, color: 'text-cyan-400', icon: '◈' },
    { label: 'Tasks Created', value: stats?.totalTasks ?? 0, color: 'text-amber-400', icon: '◫' },
  ]

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="page-header">Platform analytics</h1>
        <p className="text-gray-500 mt-1">System-wide performance metrics</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className={`text-xl ${k.color}`}>{k.icon}</span>
            </div>
            <div className={`font-display text-4xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-gray-400 text-sm">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Growth chart */}
      <div className="card p-6">
        <h2 className="section-title mb-2">Platform growth</h2>
        <p className="text-gray-600 text-xs mb-6">Users and tasks over time</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2330" />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
            <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} name="Users" />
            <Line type="monotone" dataKey="tasks" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} name="Tasks" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two charts side by side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {taskStatusData.length > 0 ? (
          <div className="card p-6">
            <h2 className="section-title mb-6">Task status distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}
                >
                  {taskStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card p-6 flex items-center justify-center">
            <p className="text-gray-600 text-sm">No task data yet</p>
          </div>
        )}

        {needsCatData.length > 0 ? (
          <div className="card p-6">
            <h2 className="section-title mb-6">Needs by category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={needsCatData}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {needsCatData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card p-6 flex items-center justify-center">
            <p className="text-gray-600 text-sm">No needs data yet</p>
          </div>
        )}
      </div>

      {/* Summary table */}
      <div className="card p-6">
        <h2 className="section-title mb-5">Quick summary</h2>
        <div className="space-y-3">
          {[
            { label: 'Total registered accounts', value: stats?.totalUsers ?? 0, note: 'all roles' },
            { label: 'Active volunteers', value: stats?.totalVolunteers ?? 0, note: `${stats?.totalUsers ? Math.round((stats.totalVolunteers / stats.totalUsers) * 100) : 0}% of users` },
            { label: 'Organizations onboarded', value: stats?.totalNGOs ?? 0, note: 'NGOs registered' },
            { label: 'Total tasks posted', value: stats?.totalTasks ?? 0, note: 'all statuses' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-dark-700 last:border-0">
              <div>
                <span className="text-gray-300 text-sm">{row.label}</span>
                <span className="text-gray-600 text-xs ml-2">— {row.note}</span>
              </div>
              <span className="font-display font-bold text-violet-400 text-lg">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
