import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const SKILLS_OPTIONS = ['Teaching', 'Healthcare', 'Construction', 'IT/Tech', 'Logistics', 'Counseling', 'Agriculture', 'Legal', 'Finance', 'Media', 'Translation', 'Social Work', 'Cooking', 'Driving', 'First Aid']
const AVAILABILITY_OPTIONS = [
  { value: 'full_time', label: 'Full time' },
  { value: 'part_time', label: 'Part time' },
  { value: 'weekends', label: 'Weekends only' },
  { value: 'on_demand', label: 'On demand' },
]

export default function VolunteerProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    availability: user?.availability || 'on_demand',
    location: { city: user?.location?.city || '', state: user?.location?.state || '' },
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f, skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    try {
      const { data } = await api.put('/auth/updateprofile', form)
      updateUser(data.user)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-header">Your profile</h1>
        <p className="text-gray-500 mt-1">Keeping your profile updated helps us match you better</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-900 border-2 border-brand-800 flex items-center justify-center text-brand-400 font-display font-bold text-2xl">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="badge-green">Volunteer</span>
            {user?.tasksCompleted > 0 && <span className="badge-blue">{user.tasksCompleted} tasks done</span>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-gray-200">Basic info</h2>
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input resize-none h-24" placeholder="Tell NGOs about yourself and why you volunteer..."
              value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City</label>
              <input className="input" placeholder="Kolkata"
                value={form.location.city} onChange={e => setForm({ ...form, location: { ...form.location, city: e.target.value } })} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input" placeholder="West Bengal"
                value={form.location.state} onChange={e => setForm({ ...form, location: { ...form.location, state: e.target.value } })} />
            </div>
          </div>
          <div>
            <label className="label">Availability</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setForm({ ...form, availability: opt.value })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    form.availability === opt.value
                      ? 'bg-brand-900 text-brand-400 border-brand-700'
                      : 'bg-dark-700 text-gray-400 border-dark-600 hover:border-dark-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-gray-200 mb-4">Your skills</h2>
          <p className="text-gray-500 text-sm mb-4">Select skills to get matched with relevant tasks</p>
          <div className="flex flex-wrap gap-2">
            {SKILLS_OPTIONS.map(skill => (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  form.skills.includes(skill)
                    ? 'bg-brand-900 text-brand-400 border-brand-700'
                    : 'bg-dark-700 text-gray-400 border-dark-600 hover:border-dark-400'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {form.skills.length > 0 && (
            <p className="text-brand-400 text-xs mt-3">{form.skills.length} skill{form.skills.length !== 1 ? 's' : ''} selected</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : 'Save changes'}
          </button>
          {success && <span className="text-brand-400 text-sm">✓ Profile saved</span>}
        </div>
      </form>
    </div>
  )
}
