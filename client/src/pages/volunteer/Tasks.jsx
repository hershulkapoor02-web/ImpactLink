import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const CATEGORIES = ['all', 'education', 'health', 'environment', 'poverty', 'disaster_relief', 'other']
const URGENCY_BADGE = ['', 'badge-gray', 'badge-blue', 'badge-amber', 'badge-amber', 'badge-red']
const URGENCY_LABELS = ['', 'Low', 'Moderate', 'Important', 'High', 'Critical']

export default function VolunteerTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ category: '', urgency: '', search: '' })

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (filters.category) params.set('category', filters.category)
      if (filters.urgency) params.set('urgency', filters.urgency)
      if (filters.search) params.set('search', filters.search)
      const { data } = await api.get(`/tasks?${params}`)
      setTasks(data.tasks || [])
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }))
    setPage(1)
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="page-header">Browse tasks</h1>
        <p className="text-gray-500 mt-1">{total} open tasks waiting for volunteers</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input
          type="text" className="input max-w-xs" placeholder="Search tasks..."
          value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)}
        />
        <select className="input max-w-[180px]" value={filters.category}
          onChange={e => handleFilterChange('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.slice(1).map(c => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
        <select className="input max-w-[160px]" value={filters.urgency}
          onChange={e => handleFilterChange('urgency', e.target.value)}>
          <option value="">Any urgency</option>
          {[5, 4, 3, 2, 1].map(u => (
            <option key={u} value={u}>{URGENCY_LABELS[u]}+</option>
          ))}
        </select>
        {(filters.category || filters.urgency || filters.search) && (
          <button className="btn-ghost text-xs" onClick={() => setFilters({ category: '', urgency: '', search: '' })}>
            Clear filters ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3 opacity-30">◫</div>
          <p className="text-gray-400 font-medium">No tasks match your filters</p>
          <p className="text-gray-600 text-sm mt-1">Try adjusting the search or category</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tasks.map(task => (
              <FullTaskCard key={task._id} task={task} userId={user?._id} onApply={fetchTasks} />
            ))}
          </div>

          {/* Pagination */}
          {total > 12 && (
            <div className="flex items-center justify-center gap-2">
              <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="text-gray-500 text-sm">Page {page} of {Math.ceil(total / 12)}</span>
              <button className="btn-ghost" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FullTaskCard({ task, userId, onApply }) {
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(
    task.applicants?.some(a => a.user === userId) || task.assignedVolunteers?.includes(userId)
  )

  const apply = async () => {
    setApplying(true)
    try {
      await api.post(`/tasks/${task._id}/apply`)
      setApplied(true)
      onApply?.()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not apply')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="card p-5 flex flex-col gap-3 hover:border-dark-400 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`badge ${URGENCY_BADGE[task.urgencyLevel]}`}>
            {URGENCY_LABELS[task.urgencyLevel]}
          </span>
          <span className="badge badge-gray">{task.category?.replace('_', ' ')}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
          task.status === 'open' ? 'text-brand-400 bg-brand-950' : 'text-gray-500 bg-dark-700'
        }`}>
          {task.status}
        </span>
      </div>

      <div>
        <h3 className="font-display font-semibold text-gray-100 text-base leading-snug">{task.title}</h3>
        <p className="text-gray-500 text-sm mt-1.5 line-clamp-3">{task.description}</p>
      </div>

      {task.skillsRequired?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.skillsRequired.map(s => (
            <span key={s} className="text-xs px-2 py-0.5 bg-dark-700 text-gray-400 rounded-md border border-dark-600">{s}</span>
          ))}
        </div>
      )}

      <div className="divider" />

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-gray-600 space-y-0.5">
          {task.orgId?.name && <div>🏢 {task.orgId.name}</div>}
          <div className="flex gap-3">
            {task.location?.city && <span>📍 {task.location.city}</span>}
            {task.hoursEstimated > 0 && <span>⏱ {task.hoursEstimated}h est.</span>}
          </div>
        </div>
        <button
          onClick={apply} disabled={applied || applying || task.status !== 'open'}
          className={`shrink-0 btn-primary text-xs py-2 px-4 ${applied ? 'bg-brand-900 hover:bg-brand-900 opacity-70' : ''}`}
        >
          {applying ? '...' : applied ? '✓ Applied' : 'Apply now'}
        </button>
      </div>
    </div>
  )
}
