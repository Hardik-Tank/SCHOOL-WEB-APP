import { useEffect, useState, useCallback } from 'react'
import { Users, GraduationCap, BookOpen, Percent } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import StatCard from '../../components/StatCard.jsx'
import Spinner from '../../components/Spinner.jsx'
import { getSchoolAdminDashboard } from '../../api/dashboard.js'
import { listClasses } from '../../api/classes.js'
import { getAttendanceSummary } from '../../api/attendance.js'
import { getErrorMessage } from '../../api/axios.js'

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

export default function SchoolAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    getSchoolAdminDashboard()
      .then((res) => setStats(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))

    listClasses()
      .then((res) => {
        const list = res.data.data
        setClasses(list)
        if (list.length) setSelectedClass(list[0]._id)
      })
      .catch(() => {})
  }, [])

  const loadChart = useCallback((classId) => {
    if (!classId) return
    setChartLoading(true)
    const today = new Date()
    const from = formatDate(startOfWeek(today))
    const to = formatDate(today)
    getAttendanceSummary({ schoolClass: classId, from, to })
      .then((res) => setChartData(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setChartLoading(false))
  }, [])

  useEffect(() => {
    if (selectedClass) loadChart(selectedClass)
  }, [selectedClass, loadChart])

  if (loading) return <Spinner size={32} className="py-20" />
  if (!stats) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Teachers" value={stats.totalTeachers} color="indigo" />
        <StatCard icon={Users} label="Students" value={stats.totalStudents} color="blue" />
        <StatCard icon={BookOpen} label="Classes" value={stats.totalClasses} color="green" />
        <StatCard icon={Percent} label="Today's Attendance" value={`${stats.todayAttendancePercent ?? 0}%`} color="amber" />
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">This week's attendance</h3>
          {classes.length > 0 && (
            <select className="input w-48" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {classes.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">Create a class first to see attendance trends.</p>
        ) : chartLoading ? (
          <Spinner className="py-16" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leave" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
