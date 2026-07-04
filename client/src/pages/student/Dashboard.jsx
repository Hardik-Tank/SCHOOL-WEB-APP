import { useEffect, useState } from 'react'
import { Percent, CheckCircle2, XCircle, CalendarClock } from 'lucide-react'
import toast from 'react-hot-toast'
import StatCard from '../../components/StatCard.jsx'
import Spinner from '../../components/Spinner.jsx'
import { getStudentDashboard } from '../../api/dashboard.js'
import { getErrorMessage } from '../../api/axios.js'

export default function StudentDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudentDashboard()
      .then((res) => setStats(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner size={32} className="py-20" />
  if (!stats) return null

  return (
    <div className="space-y-6">
      <div className="card flex items-center gap-3">
        <CalendarClock size={20} className="text-accent-600" />
        <p className="text-sm text-gray-600">
          You are enrolled in <span className="font-semibold text-gray-900">{stats.className}</span>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Percent} label="Attendance %" value={`${stats.attendancePercent ?? 0}%`} color="indigo" />
        <StatCard icon={CheckCircle2} label="Present Days" value={stats.presentDays} color="green" />
        <StatCard icon={XCircle} label="Absent Days" value={stats.absentDays} color="red" />
        <StatCard icon={CalendarClock} label="Leave Days" value={stats.leaveDays} color="amber" />
      </div>
    </div>
  )
}
