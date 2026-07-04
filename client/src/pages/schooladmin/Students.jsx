import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import DataTable from '../../components/DataTable.jsx'
import Modal from '../../components/Modal.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { listStudents, createStudent, updateStudent, deleteStudent } from '../../api/students.js'
import { listClasses } from '../../api/classes.js'
import { getErrorMessage } from '../../api/axios.js'

export default function Students() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    listClasses()
      .then((res) => setClasses(res.data.data))
      .catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    listStudents({ schoolClass: classFilter || undefined, search: search || undefined, page, limit: 10 })
      .then((res) => {
        setStudents(res.data.data)
        setPagination(res.data.pagination)
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [classFilter, search, page])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    reset({
      name: '',
      email: '',
      password: '',
      phone: '',
      schoolClass: classes[0]?._id || '',
      rollNumber: '',
      guardianName: '',
      guardianPhone: '',
      dob: '',
      admissionDate: '',
    })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    reset({
      name: row.user?.name || '',
      email: row.user?.email || '',
      password: '',
      phone: row.user?.phone || '',
      schoolClass: row.schoolClass?._id || '',
      rollNumber: row.rollNumber || '',
      guardianName: row.guardianName || '',
      guardianPhone: row.guardianPhone || '',
      dob: row.dob ? row.dob.slice(0, 10) : '',
      admissionDate: row.admissionDate ? row.admissionDate.slice(0, 10) : '',
    })
    setModalOpen(true)
  }

  const onSubmit = async (values) => {
    const payload = { ...values }
    if (editing && !payload.password) delete payload.password
    try {
      if (editing) {
        await updateStudent(editing._id, payload)
        toast.success('Student updated')
      } else {
        await createStudent(payload)
        toast.success('Student created')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await deleteStudent(deleteTarget._id)
      toast.success('Student deleted')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name', render: (row) => row.user?.name },
    { key: 'rollNumber', header: 'Roll No.' },
    { key: 'class', header: 'Class', render: (row) => row.schoolClass?.name || '—' },
    { key: 'guardianName', header: 'Guardian', render: (row) => row.guardianName || '—' },
    { key: 'guardianPhone', header: 'Guardian Phone', render: (row) => row.guardianPhone || '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button className="btn-secondary btn-sm" onClick={() => openEdit(row)}>
            <Pencil size={14} /> Edit
          </button>
          <button className="btn-danger btn-sm" onClick={() => setDeleteTarget(row)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search students…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
          <select
            className="input w-48"
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
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Student
        </button>
      </div>

      <DataTable columns={columns} data={students} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No students found" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'New Student'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input className="input" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{editing ? 'Password (leave blank to keep)' : 'Password'}</label>
              <input
                type="password"
                className="input"
                {...register('password', editing ? {} : { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" {...register('phone')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Class</label>
              <select className="input" {...register('schoolClass', { required: 'Class is required' })}>
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.schoolClass && <p className="error-text">{errors.schoolClass.message}</p>}
            </div>
            <div>
              <label className="label">Roll Number</label>
              <input className="input" {...register('rollNumber', { required: 'Roll number is required' })} />
              {errors.rollNumber && <p className="error-text">{errors.rollNumber.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Guardian Name</label>
              <input className="input" {...register('guardianName')} />
            </div>
            <div>
              <label className="label">Guardian Phone</label>
              <input className="input" {...register('guardianPhone')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" className="input" {...register('dob')} />
            </div>
            <div>
              <label className="label">Admission Date</label>
              <input type="date" className="input" {...register('admissionDate')} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete student"
        message={`Are you sure you want to delete "${deleteTarget?.user?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={actionLoading}
      />
    </div>
  )
}
