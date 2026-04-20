// OrgNeeds.jsx
import { useState, useEffect } from 'react'
import api from '../../services/api'

const BLANK = { title: '', description: '', category: 'other', priorityScore: 50, affectedPeople: 0, location: { city: '', state: '' } }
const CATEGORIES = ['education', 'health', 'environment', 'poverty', 'disaster_relief', 'other']

export default function OrgNeeds() {
  const [needs, setNeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const fetchNeeds = () => {
    setLoading(true)
    api.get('/needs').then(r => setNeeds(r.data.needs || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchNeeds() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/needs', form)
      setForm(BLANK)
      setShowForm(false)
      fetchNeeds()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add need')
    } finally {
      setSaving(false)
    }
  }

  const deleteNeed = async (id) => {
    if (!confirm('Delete this community need?')) return
    await api.delete(`/needs/${id}`)
    setNeeds(n => n.filter(x => x._id !== id))
  }

  const getPriorityColor = (score) => {
    if (score >= 75) return 'text-red-400'
    if (score >= 50) return 'text-amber-400'
    if (score >= 25) return 'text-blue-400'
    return 'text-gray-400'
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Community needs</h1>
          <p className="text-gray-500 mt-1">Document and track community needs data</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add need'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 animate-slide-up">
          <h2 className="font-display font-semibold text-gray-200 mb-5">Document a community need</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Need title</label>
              <input className="input" placeholder="e.g. Lack of clean water in Block C" required
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-none h-20" placeholder="Describe the need in detail..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Priority (0-100)</label>
                <input type="number" className="input" min="0" max="100"
                  value={form.priorityScore} onChange={e => setForm({ ...form, priorityScore: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">People affected</label>
                <input type="number" className="input" min="0"
                  value={form.affectedPeople} onChange={e => setForm({ ...form, affectedPeople: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="City"
                  value={form.location.city} onChange={e => setForm({ ...form, location: { ...form.location, city: e.target.value } })} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save need'}</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : needs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3 opacity-20">◉</div>
          <p className="text-gray-400">No needs documented yet. Start adding community data.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {needs.map(need => (
            <div key={need._id} className="card p-5 hover:border-dark-400 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-gray">{need.category?.replace('_', ' ')}</span>
                    <span className={`font-mono text-sm font-bold ${getPriorityColor(need.priorityScore)}`}>P{need.priorityScore}</span>
                  </div>
                  <h3 className="font-medium text-gray-200 text-sm">{need.title}</h3>
                  {need.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{need.description}</p>}
                  <div className="flex gap-3 mt-2 text-xs text-gray-600">
                    {need.affectedPeople > 0 && <span>👥 {need.affectedPeople.toLocaleString()} people</span>}
                    {need.location?.city && <span>📍 {need.location.city}</span>}
                  </div>
                </div>
                <button onClick={() => deleteNeed(need._id)} className="text-gray-600 hover:text-red-400 text-xs transition-colors shrink-0">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
