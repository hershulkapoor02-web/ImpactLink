// Notifications.jsx
import { useState, useEffect } from 'react'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

export default function VolunteerNotifications() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications').then(r => setNotifs(r.data.notifications || [])).finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    setNotifs(n => n.map(x => ({ ...x, isRead: true })))
  }

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`)
    setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x))
  }

  const TYPE_ICONS = {
    task_assigned: '✓', application_update: '◎', new_task: '◫',
    org_approved: '◉', general: '◈'
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Notifications</h1>
          <p className="text-gray-500 mt-1">{notifs.filter(n => !n.isRead).length} unread</p>
        </div>
        {notifs.some(n => !n.isRead) && (
          <button className="btn-ghost text-sm" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3 opacity-20">◎</div>
          <p className="text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
              className={`card p-4 flex gap-4 cursor-pointer hover:border-dark-400 transition-all ${!n.isRead ? 'border-brand-900' : 'opacity-60'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                !n.isRead ? 'bg-brand-900 text-brand-400' : 'bg-dark-700 text-gray-500'
              }`}>
                {TYPE_ICONS[n.type] || '◈'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-gray-200 text-sm font-medium">{n.title}</p>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{n.message}</p>
                <p className="text-gray-600 text-xs mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
