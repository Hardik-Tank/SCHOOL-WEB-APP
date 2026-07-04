import { useEffect, useState } from 'react'
import { BookOpen, Users, ClipboardCheck, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import StatCard from '../../components/StatCard.jsx'
import Spinner from '../../components/Spinner.jsx'
import { getTeacherDashboard } from '../../api/dashboard.js'
import { getErrorMessage } from '../../api/axios.js'

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeacherDashboard()
      .then((res) => setStats(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner size={32} className="py-20" />
  if (!stats) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={BookOpen} label="My Classes" value={stats.myClassesCount} color="indigo" />
      <StatCard icon={Users} label="My Students" value={stats.myStudentsCount} color="blue" />
      <StatCard icon={ClipboardCheck} label="Marked Today" value={stats.todayMarkedCount} color="green" />
      <StatCard icon={ClipboardList} label="Total Students Today" value={stats.todayTotalStudents} color="amber" />
    </div>
  )
}
