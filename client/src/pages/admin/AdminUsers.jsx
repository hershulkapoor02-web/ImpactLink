import { useState, useEffect } from 'react'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

const ROLE_BADGE = {
  volunteer: 'badge-green',
  ngo_admin: 'badge-blue',
  super_admin: 'badge-purple',
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: 50 })
    if (tab !== 'all') params.set('role', tab)
    api.get(`/users/volunteers?${params}`)
      .then(r => { setUsers(r.data.users || []); setTotal(r.data.total || 0) })
      .finally(() => setLoading(false))
  }, [tab])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="page-header">User management</h1>
        <p className="text-gray-500 mt-1">{total} total registered users</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input type="text" className="input max-w-xs" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1.5">
          {['all', 'volunteer', 'ngo_admin'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t ? 'bg-violet-950 text-violet-400 border border-violet-900' : 'btn-ghost'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Skills</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Tasks</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Joined</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user._id} className="border-b border-dark-700 last:border-0 hover:bg-dark-700/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-dark-600 border border-dark-500 flex items-center justify-center text-gray-300 font-bold text-sm shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">{user.name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${ROLE_BADGE[user.role] || 'badge-gray'}`}>
                        {user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {user.skills?.slice(0, 2).map(s => (
                          <span key={s} className="badge-gray text-xs">{s}</span>
                        ))}
                        {user.skills?.length > 2 && (
                          <span className="text-gray-600 text-xs">+{user.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-brand-400 font-mono font-medium">{user.tasksCompleted || 0}</span>
                      <span className="text-gray-600 text-xs ml-1">done</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {user.joinedAt
                        ? formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
