import { useEffect, useState } from 'react'
import { School, Clock, CheckCircle2, XCircle, Users } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import StatCard from '../../components/StatCard.jsx'
import Spinner from '../../components/Spinner.jsx'
import { getSuperAdminDashboard } from '../../api/dashboard.js'
import { getErrorMessage } from '../../api/axios.js'

const COLORS = ['#f59e0b', '#10b981', '#ef4444']

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSuperAdminDashboard()
      .then((res) => setStats(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner size={32} className="py-20" />
  if (!stats) return null

  const chartData = [
    { name: 'Pending', value: stats.pendingSchools },
    { name: 'Approved', value: stats.approvedSchools },
    { name: 'Rejected', value: stats.rejectedSchools },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={School} label="Total Schools" value={stats.totalSchools} color="indigo" />
        <StatCard icon={Clock} label="Pending" value={stats.pendingSchools} color="amber" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approvedSchools} color="green" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejectedSchools} color="red" />
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="blue" />
      </div>

      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Schools by status</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
