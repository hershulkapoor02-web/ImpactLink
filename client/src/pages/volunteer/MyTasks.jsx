// MyTasks.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export function VolunteerMyTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    api.get('/tasks/volunteer/mine').then(r => setTasks(r.data.tasks || [])).finally(() => setLoading(false))
  }, [])

  const filtered = tasks.filter(t => {
    if (tab === 'pending') return t.applicants?.some(a => a.user === user?._id && a.status === 'pending')
    if (tab === 'assigned') return t.assignedVolunteers?.some(v => v._id === user?._id || v === user?._id)
    if (tab === 'completed') return t.status === 'completed'
    return true
  })

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="page-header">My Tasks</h1>
        <p className="text-gray-500 mt-1">Track your applications and assignments</p>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'assigned', 'completed'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-brand-900 text-brand-400 border border-brand-800' : 'btn-ghost'
            }`}
          >{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3 opacity-20">◱</div>
          <p className="text-gray-400">No tasks in this category yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const myApp = task.applicants?.find(a => a.user === user?._id)
            const isAssigned = task.assignedVolunteers?.some(v => v._id === user?._id || v === user?._id)
            return (
              <div key={task._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${
                        isAssigned ? 'badge-green' :
                        myApp?.status === 'accepted' ? 'badge-green' :
                        myApp?.status === 'rejected' ? 'badge-red' : 'badge-amber'
                      }`}>
                        {isAssigned ? '✓ Assigned' : myApp?.status || 'pending'}
                      </span>
                      <span className="badge badge-gray">{task.category?.replace('_', ' ')}</span>
                    </div>
                    <h3 className="font-medium text-gray-200">{task.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{task.description}</p>
                    <div className="text-xs text-gray-600 mt-2 flex gap-3">
                      {task.orgId?.name && <span>🏢 {task.orgId.name}</span>}
                      {task.deadline && <span>⏰ Due {new Date(task.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default VolunteerMyTasks
