import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function OrgProfile() {
  const [org, setOrg] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get('/orgs/mine').then(r => {
      setOrg(r.data.org)
      setForm({ name: r.data.org?.name || '', description: r.data.org?.description || '', website: r.data.org?.website || '', phone: r.data.org?.phone || '', location: r.data.org?.location || {} })
    })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/orgs/${org._id}`, form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) { alert(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  if (!org) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-header">Organization profile</h1>
        <p className="text-gray-500 mt-1">Manage your NGO's public information</p>
      </div>

      <div className="card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-900 border border-cyan-800 flex items-center justify-center text-cyan-400 font-display font-bold text-xl">
          {org.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold">{org.name}</p>
          <div className="flex gap-2 mt-1">
            {org.isApproved
              ? <span className="badge-green">✓ Approved</span>
              : <span className="badge-amber">⏳ Pending approval</span>
            }
            <span className="badge badge-gray">{org.category}</span>
          </div>
        </div>
      </div>

      {!org.isApproved && (
        <div className="bg-amber-950 border border-amber-900 rounded-xl p-4 text-amber-400 text-sm">
          ⚠ Your organization is pending admin approval. You can still create tasks, but they won't be publicly visible until approved.
        </div>
      )}

      <form onSubmit={handleSave} className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-gray-200">Organization details</h2>
        <div>
          <label className="label">Organization name</label>
          <input className="input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none h-24" placeholder="What does your organization do?"
            value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Website</label>
            <input className="input" placeholder="https://..."
              value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+91..."
              value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">City</label>
            <input className="input" value={form.location?.city || ''} onChange={e => setForm({ ...form, location: { ...form.location, city: e.target.value } })} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={form.location?.state || ''} onChange={e => setForm({ ...form, location: { ...form.location, state: e.target.value } })} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          {success && <span className="text-brand-400 text-sm">✓ Saved</span>}
        </div>
      </form>
    </div>
  )
}
