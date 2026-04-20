import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const CATEGORIES = ['education', 'health', 'environment', 'poverty', 'disaster_relief', 'other']
const BLANK = { title: '', description: '', category: 'other', urgencyLevel: 3, skillsRequired: [], location: { city: '', state: '' }, deadline: '', maxVolunteers: 1, hoursEstimated: 0 }

export default function OrgTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const fetchTasks = async () => {
    setLoading(true)
    api.get('/tasks/org/mine').then(r => setTasks(r.data.tasks || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchTasks() }, [])

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      setForm(f => ({ ...f, skillsRequired: [...new Set([...f.skillsRequired, skillInput.trim()])] }))
      setSkillInput('')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/tasks', form)
      setForm(BLANK)
      setShowForm(false)
      fetchTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status })
      setTasks(ts => ts.map(t => t._id === id ? { ...t, status } : t))
    } catch {}
  }

  const URGENCY_LABELS = ['', 'Low', 'Moderate', 'Important', 'High', 'Critical']

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Task management</h1>
          <p className="text-gray-500 mt-1">Post and manage volunteer tasks</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New task'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-6 animate-slide-up">
          <h2 className="font-display font-semibold text-gray-200 mb-5">Create new task</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Task title</label>
              <input className="input" placeholder="e.g. Teach basic literacy to 10 adults" required
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none h-24" placeholder="Describe what needs to be done, who benefits, and any requirements..."
                required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Urgency (1-5)</label>
                <select className="input" value={form.urgencyLevel} onChange={e => setForm({ ...form, urgencyLevel: Number(e.target.value) })}>
                  {[1,2,3,4,5].map(u => <option key={u} value={u}>{u} - {URGENCY_LABELS[u]}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Max volunteers</label>
                <input type="number" className="input" min="1" max="100"
                  value={form.maxVolunteers} onChange={e => setForm({ ...form, maxVolunteers: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Est. hours</label>
                <input type="number" className="input" min="0"
                  value={form.hoursEstimated} onChange={e => setForm({ ...form, hoursEstimated: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="Kolkata"
                  value={form.location.city} onChange={e => setForm({ ...form, location: { ...form.location, city: e.target.value } })} />
              </div>
              <div>
                <label className="label">Deadline</label>
                <input type="date" className="input"
                  value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Required skills (press Enter to add)</label>
              <input className="input" placeholder="e.g. Teaching"
                value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.skillsRequired.map(s => (
                  <span key={s} className="badge-gray flex items-center gap-1">
                    {s}
                    <button type="button" onClick={() => setForm(f => ({ ...f, skillsRequired: f.skillsRequired.filter(x => x !== s) }))} className="text-gray-500 hover:text-red-400">✕</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create task'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3 opacity-20">◫</div>
          <p className="text-gray-400">No tasks yet. Create your first task above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="badge badge-gray">{task.category?.replace('_', ' ')}</span>
                    <span className="text-xs text-amber-400">Urgency {task.urgencyLevel}/5</span>
                  </div>
                  <h3 className="font-medium text-gray-200">{task.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{task.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    <span>{task.applicants?.length || 0} applicants</span>
                    <span>{task.assignedVolunteers?.length || 0}/{task.maxVolunteers} assigned</span>
                    {task.deadline && <span>Due {new Date(task.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span className={`badge ${task.status === 'open' ? 'badge-green' : task.status === 'in_progress' ? 'badge-amber' : 'badge-gray'}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  {task.status === 'in_progress' && (
                    <button className="btn-secondary text-xs py-1.5"
                      onClick={() => updateStatus(task._id, 'completed')}>Mark done</button>
                  )}
                </div>
              </div>

              {/* Applicants */}
              {task.applicants?.filter(a => a.status === 'pending').length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-700">
                  <p className="text-xs text-gray-500 mb-2">Pending applicants</p>
                  <div className="flex flex-wrap gap-2">
                    {task.applicants.filter(a => a.status === 'pending').map(a => (
                      <div key={a.user} className="flex items-center gap-2 bg-dark-700 rounded-lg px-3 py-1.5 text-xs">
                        <span className="text-gray-300">{a.user}</span>
                        <button onClick={() => api.put(`/tasks/${task._id}/applicants/${a.user}`, { status: 'accepted' }).then(() => { a.status = 'accepted'; setTasks([...tasks]) })}
                          className="text-brand-400 hover:text-brand-300">Accept</button>
                        <button onClick={() => api.put(`/tasks/${task._id}/applicants/${a.user}`, { status: 'rejected' }).then(() => { a.status = 'rejected'; setTasks([...tasks]) })}
                          className="text-red-400 hover:text-red-300">Reject</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
