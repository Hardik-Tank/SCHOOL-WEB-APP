import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable.jsx'
import { listStudents } from '../../api/students.js'
import { listClasses } from '../../api/classes.js'
import { getErrorMessage } from '../../api/axios.js'

export default function MyStudents() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [classFilter, setClassFilter] = useState('')

  useEffect(() => {
    listClasses()
      .then((res) => setClasses(res.data.data))
      .catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    listStudents({ schoolClass: classFilter || undefined, page, limit: 10 })
      .then((res) => {
        setStudents(res.data.data)
        setPagination(res.data.pagination)
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [classFilter, page])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    { key: 'name', header: 'Name', render: (row) => row.user?.name },
    { key: 'rollNumber', header: 'Roll No.' },
    { key: 'class', header: 'Class', render: (row) => row.schoolClass?.name || '—' },
    { key: 'email', header: 'Email', render: (row) => row.user?.email },
    { key: 'guardianName', header: 'Guardian', render: (row) => row.guardianName || '—' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select
          className="input w-56"
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <DataTable columns={columns} data={students} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No students found" />
    </div>
  )
}
