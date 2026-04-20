import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Leaderboard() {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/leaderboard').then(r => setLeaders(r.data.users || [])).finally(() => setLoading(false))
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-header">Leaderboard</h1>
        <p className="text-gray-500 mt-1">Top volunteers making the biggest impact</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {leaders.map((leader, i) => (
            <div key={leader._id}
              className={`card p-4 flex items-center gap-4 transition-all ${
                leader._id === user?._id ? 'border-brand-800 bg-brand-950' : 'hover:border-dark-400'
              }`}
            >
              <div className="w-8 text-center font-display font-bold text-lg shrink-0">
                {i < 3 ? medals[i] : <span className="text-gray-600 text-sm">#{i + 1}</span>}
              </div>
              <div className="w-9 h-9 rounded-xl bg-dark-600 border border-dark-500 flex items-center justify-center font-bold text-gray-300 shrink-0">
                {leader.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-gray-200 font-medium text-sm truncate">{leader.name}</p>
                  {leader._id === user?._id && <span className="badge-green text-xs">You</span>}
                </div>
                {leader.skills?.length > 0 && (
                  <p className="text-gray-600 text-xs truncate">{leader.skills.slice(0, 3).join(' · ')}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-brand-400 font-display font-bold">{leader.tasksCompleted}</div>
                <div className="text-gray-600 text-xs">tasks</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-cyan-400 font-display font-bold">{leader.hoursContributed}h</div>
                <div className="text-gray-600 text-xs">hours</div>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3 opacity-20">◈</div>
              <p className="text-gray-400">No leaderboard data yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
