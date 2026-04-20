import { useState, useEffect } from 'react'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

const CAT_BADGE = {
  education: 'badge-blue', health: 'badge-red', environment: 'badge-green',
  poverty: 'badge-amber', disaster_relief: 'badge-red', other: 'badge-gray'
}

export default function AdminOrgs() {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [approving, setApproving] = useState(null)

  const fetchOrgs = async () => {
    setLoading(true)
    try {
      // fetch all orgs including unapproved — admin endpoint
      const { data } = await api.get('/orgs?includeAll=true')
      setOrgs(data.orgs || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrgs() }, [])

  const approve = async (id) => {
    setApproving(id)
    try {
      await api.put(`/orgs/${id}/approve`)
      setOrgs(prev => prev.map(o => o._id === id ? { ...o, isApproved: true } : o))
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed')
    } finally {
      setApproving(null)
    }
  }

  const filtered = orgs.filter(o => {
    if (tab === 'pending') return !o.isApproved
    if (tab === 'approved') return o.isApproved
    return true
  })

  const pendingCount = orgs.filter(o => !o.isApproved).length

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="page-header">Organizations</h1>
        <p className="text-gray-500 mt-1">Review and approve NGO registrations</p>
      </div>

      <div className="flex gap-2 items-center">
        {[
          { key: 'pending', label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { key: 'approved', label: 'Approved' },
          { key: 'all', label: 'All' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-violet-950 text-violet-400 border border-violet-900'
                : 'btn-ghost'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3 opacity-20">◎</div>
          <p className="text-gray-400">
            {tab === 'pending' ? 'No pending organizations. All caught up!' : 'No organizations found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(org => (
            <div key={org._id} className={`card p-5 transition-all ${!org.isApproved ? 'border-amber-900/50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-dark-600 border border-dark-500 flex items-center justify-center text-gray-300 font-display font-bold text-lg shrink-0">
                    {org.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display font-semibold text-gray-200">{org.name}</h3>
                      {org.isApproved
                        ? <span className="badge-green">✓ Approved</span>
                        : <span className="badge-amber">⏳ Pending</span>
                      }
                      <span className={`badge ${CAT_BADGE[org.category] || 'badge-gray'}`}>
                        {org.category?.replace('_', ' ')}
                      </span>
                    </div>
                    {org.description && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-2">{org.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      <span>✉ {org.email}</span>
                      {org.location?.city && <span>📍 {org.location.city}, {org.location.state}</span>}
                      {org.website && (
                        <a href={org.website} target="_blank" rel="noreferrer" className="text-cyan-500 hover:text-cyan-400">
                          🌐 Website
                        </a>
                      )}
                      <span>Registered {org.createdAt ? formatDistanceToNow(new Date(org.createdAt), { addSuffix: true }) : '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {!org.isApproved ? (
                    <button
                      onClick={() => approve(org._id)}
                      disabled={approving === org._id}
                      className="btn-primary text-xs py-2"
                    >
                      {approving === org._id
                        ? <><span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Approving...</>
                        : '✓ Approve NGO'
                      }
                    </button>
                  ) : (
                    <div className="flex flex-col items-end gap-1 text-xs text-gray-600">
                      <span>{org.tasksPosted || 0} tasks</span>
                      <span>{org.volunteersCount || 0} volunteers</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
