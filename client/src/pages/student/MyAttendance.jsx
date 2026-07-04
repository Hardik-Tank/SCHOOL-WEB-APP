import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import Spinner from '../../components/Spinner.jsx'
import StatCard from '../../components/StatCard.jsx'
import { CheckCircle2, XCircle, CalendarClock, Percent } from 'lucide-react'
import { getMyAttendance } from '../../api/attendance.js'
import { getErrorMessage } from '../../api/axios.js'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const statusStyle = {
  present: 'bg-emerald-50 text-emerald-700',
  absent: 'bg-red-50 text-red-700',
  leave: 'bg-amber-50 text-amber-700',
}

const now = new Date()

export default function MyAttendance() {
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    getMyAttendance({ month, year })
      .then((res) => {
        setRecords(res.data.data.records || [])
        setSummary(res.data.data.summary || null)
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [month, year])

  useEffect(() => {
    load()
  }, [load])

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i)

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-end gap-4">
        <div>
          <label className="label">Month</label>
          <select className="input w-40" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Year</label>
          <select className="input w-32" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Percent} label="Percentage" value={`${summary.percentage ?? 0}%`} color="indigo" />
          <StatCard icon={CheckCircle2} label="Present" value={summary.present} color="green" />
          <StatCard icon={XCircle} label="Absent" value={summary.absent} color="red" />
          <StatCard icon={CalendarClock} label="Leave" value={summary.leave} color="amber" />
        </div>
      )}

      <div className="card overflow-hidden p-0">
        {loading ? (
          <Spinner className="py-16" />
        ) : records.length === 0 ? (
          <p className="py-14 text-center text-sm text-gray-400">No attendance records for this month.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.date} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
