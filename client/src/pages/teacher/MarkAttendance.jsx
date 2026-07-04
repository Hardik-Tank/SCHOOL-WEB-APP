import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { CheckCheck, Save } from 'lucide-react'
import Spinner from '../../components/Spinner.jsx'
import { listClasses } from '../../api/classes.js'
import { getAttendance, markAttendance } from '../../api/attendance.js'
import { getErrorMessage } from '../../api/axios.js'

const STATUSES = [
  { key: 'present', label: 'Present', activeClass: 'bg-emerald-600 text-white' },
  { key: 'absent', label: 'Absent', activeClass: 'bg-red-600 text-white' },
  { key: 'leave', label: 'Leave', activeClass: 'bg-amber-500 text-white' },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function MarkAttendance() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [date, setDate] = useState(today())
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listClasses()
      .then((res) => {
        const list = res.data.data
        setClasses(list)
        if (list.length) setSelectedClass(list[0]._id)
      })
      .catch((err) => toast.error(getErrorMessage(err)))
  }, [])

  const loadRoster = useCallback(() => {
    if (!selectedClass || !date) return
    setLoading(true)
    getAttendance({ schoolClass: selectedClass, date })
      .then((res) => {
        const list = res.data.data || []
        setRoster(
          list.map((row) => ({
            studentId: row.student?._id || row.student,
            name: row.student?.name || row.name || 'Unknown',
            rollNumber: row.student?.rollNumber ?? row.rollNumber ?? '—',
            status: row.status || 'present',
          })),
        )
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [selectedClass, date])

  useEffect(() => {
    loadRoster()
  }, [loadRoster])

  const setStatus = (studentId, status) => {
    setRoster((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)))
  }

  const markAllPresent = () => {
    setRoster((prev) => prev.map((r) => ({ ...r, status: 'present' })))
  }

  const handleSave = async () => {
    if (!roster.length) return
    setSaving(true)
    try {
      await markAttendance({
        schoolClass: selectedClass,
        date,
        records: roster.map((r) => ({ student: r.studentId, status: r.status })),
      })
      toast.success('Attendance saved')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-end gap-4">
        <div>
          <label className="label">Class</label>
          <select className="input w-56" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input w-48" value={date} onChange={(e) => setDate(e.target.value)} max={today()} />
        </div>
        <button className="btn-secondary" onClick={markAllPresent} disabled={!roster.length}>
          <CheckCheck size={16} /> Mark all present
        </button>
        <button className="btn-primary ml-auto" onClick={handleSave} disabled={saving || !roster.length}>
          <Save size={16} /> {saving ? 'Saving…' : 'Save attendance'}
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <Spinner className="py-16" />
        ) : classes.length === 0 ? (
          <p className="py-14 text-center text-sm text-gray-400">No classes assigned.</p>
        ) : roster.length === 0 ? (
          <p className="py-14 text-center text-sm text-gray-400">No students found for this class.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Roll No.</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roster.map((r) => (
                <tr key={r.studentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{r.rollNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{r.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {STATUSES.map((s) => (
                        <button
                          key={s.key}
                          onClick={() => setStatus(r.studentId, s.key)}
                          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                            r.status === s.key ? s.activeClass : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
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
