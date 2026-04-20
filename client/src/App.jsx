import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import VolunteerLayout from './components/layout/VolunteerLayout'
import VolunteerDashboard from './pages/volunteer/Dashboard'
import VolunteerTasks from './pages/volunteer/Tasks'
import VolunteerMyTasks from './pages/volunteer/MyTasks'
import VolunteerProfile from './pages/volunteer/Profile'
import VolunteerNotifications from './pages/volunteer/Notifications'
import Leaderboard from './pages/volunteer/Leaderboard'

import OrgLayout from './components/layout/OrgLayout'
import OrgDashboard from './pages/org/OrgDashboard'
import OrgTasks from './pages/org/OrgTasks'
import OrgNeeds from './pages/org/OrgNeeds'
import OrgProfile from './pages/org/OrgProfile'

import AdminLayout from './components/layout/AdminLayout'
import AdminPanel from './pages/admin/AdminPanel'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrgs from './pages/admin/AdminOrgs'
import AdminAnalytics from './pages/admin/AdminAnalytics'

import NotFound from './pages/shared/NotFound'
import Unauthorized from './pages/shared/Unauthorized'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-500 text-sm">Loading...</span>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Volunteer */}
          <Route path="/volunteer" element={
            <ProtectedRoute roles={['volunteer']}>
              <VolunteerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<VolunteerDashboard />} />
            <Route path="tasks" element={<VolunteerTasks />} />
            <Route path="my-tasks" element={<VolunteerMyTasks />} />
            <Route path="profile" element={<VolunteerProfile />} />
            <Route path="notifications" element={<VolunteerNotifications />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>

          {/* NGO Admin */}
          <Route path="/org" element={
            <ProtectedRoute roles={['ngo_admin']}>
              <OrgLayout />
            </ProtectedRoute>
          }>
            <Route index element={<OrgDashboard />} />
            <Route path="tasks" element={<OrgTasks />} />
            <Route path="needs" element={<OrgNeeds />} />
            <Route path="profile" element={<OrgProfile />} />
          </Route>

          {/* Super Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['super_admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminPanel />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orgs" element={<AdminOrgs />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
