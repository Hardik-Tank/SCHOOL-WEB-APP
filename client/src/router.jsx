import { Routes, Route, Navigate } from 'react-router-dom'
import { LayoutDashboard, School, Users, GraduationCap, BookOpen, ClipboardCheck } from 'lucide-react'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'
import Spinner from './components/Spinner.jsx'

import Login from './pages/auth/Login.jsx'
import RegisterSchool from './pages/auth/RegisterSchool.jsx'
import Unauthorized from './pages/auth/Unauthorized.jsx'

import SuperAdminDashboard from './pages/superadmin/Dashboard.jsx'
import SuperAdminSchools from './pages/superadmin/Schools.jsx'

import SchoolAdminDashboard from './pages/schooladmin/Dashboard.jsx'
import SchoolAdminClasses from './pages/schooladmin/Classes.jsx'
import SchoolAdminTeachers from './pages/schooladmin/Teachers.jsx'
import SchoolAdminStudents from './pages/schooladmin/Students.jsx'

import TeacherDashboard from './pages/teacher/Dashboard.jsx'
import MarkAttendance from './pages/teacher/MarkAttendance.jsx'
import MyStudents from './pages/teacher/MyStudents.jsx'

import StudentDashboard from './pages/student/Dashboard.jsx'
import MyAttendance from './pages/student/MyAttendance.jsx'

const superAdminNav = [
  { to: '/super-admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/super-admin/schools', label: 'Schools', icon: School },
]

const schoolAdminNav = [
  { to: '/school-admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/school-admin/teachers', label: 'Teachers', icon: GraduationCap },
  { to: '/school-admin/students', label: 'Students', icon: Users },
  { to: '/school-admin/classes', label: 'Classes', icon: BookOpen },
]

const teacherNav = [
  { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/teacher/attendance', label: 'Mark Attendance', icon: ClipboardCheck },
  { to: '/teacher/students', label: 'My Students', icon: Users },
]

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/attendance', label: 'My Attendance', icon: ClipboardCheck },
]

const roleHome = {
  super_admin: '/super-admin',
  school_admin: '/school-admin',
  teacher: '/teacher',
  student: '/student',
}

function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={roleHome[user.role] || '/login'} replace />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register-school" element={<RegisterSchool />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardLayout navItems={superAdminNav} />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="schools" element={<SuperAdminSchools />} />
      </Route>

      <Route
        path="/school-admin"
        element={
          <ProtectedRoute allowedRoles={['school_admin']}>
            <DashboardLayout navItems={schoolAdminNav} />
          </ProtectedRoute>
        }
      >
        <Route index element={<SchoolAdminDashboard />} />
        <Route path="classes" element={<SchoolAdminClasses />} />
        <Route path="teachers" element={<SchoolAdminTeachers />} />
        <Route path="students" element={<SchoolAdminStudents />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DashboardLayout navItems={teacherNav} />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="attendance" element={<MarkAttendance />} />
        <Route path="students" element={<MyStudents />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout navItems={studentNav} />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="attendance" element={<MyAttendance />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
