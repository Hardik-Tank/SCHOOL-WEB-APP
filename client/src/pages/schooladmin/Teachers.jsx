import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import DataTable from '../../components/DataTable.jsx'
import Modal from '../../components/Modal.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { listTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../api/teachers.js'
import { getErrorMessage } from '../../api/axios.js'

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
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

  const load = useCallback(() => {
    setLoading(true)
    listTeachers({ search: search || undefined, page, limit: 10 })
      .then((res) => {
        setTeachers(res.data.data)
        setPagination(res.data.pagination)
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', email: '', password: '', phone: '', employeeId: '', subjects: '', qualification: '', joiningDate: '' })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    reset({
      name: row.user?.name || '',
      email: row.user?.email || '',
      password: '',
      phone: row.user?.phone || '',
      employeeId: row.employeeId || '',
      subjects: (row.subjects || []).join(', '),
      qualification: row.qualification || '',
      joiningDate: row.joiningDate ? row.joiningDate.slice(0, 10) : '',
    })
    setModalOpen(true)
  }

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      subjects: values.subjects
        ? values.subjects.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }
    if (editing && !payload.password) delete payload.password
    try {
      if (editing) {
        await updateTeacher(editing._id, payload)
        toast.success('Teacher updated')
      } else {
        await createTeacher(payload)
        toast.success('Teacher created')
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
      await deleteTeacher(deleteTarget._id)
      toast.success('Teacher deleted')
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
    { key: 'email', header: 'Email', render: (row) => row.user?.email },
    { key: 'employeeId', header: 'Employee ID' },
    { key: 'subjects', header: 'Subjects', render: (row) => (row.subjects || []).join(', ') || '—' },
    { key: 'qualification', header: 'Qualification', render: (row) => row.qualification || '—' },
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
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search teachers…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Teacher
        </button>
      </div>

      <DataTable columns={columns} data={teachers} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No teachers found" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Teacher' : 'New Teacher'} size="lg">
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
              <label className="label">Employee ID</label>
              <input className="input" {...register('employeeId', { required: 'Employee ID is required' })} />
              {errors.employeeId && <p className="error-text">{errors.employeeId.message}</p>}
            </div>
            <div>
              <label className="label">Joining Date</label>
              <input type="date" className="input" {...register('joiningDate')} />
            </div>
          </div>
          <div>
            <label className="label">Subjects (comma separated)</label>
            <input className="input" {...register('subjects')} placeholder="Math, Science" />
          </div>
          <div>
            <label className="label">Qualification</label>
            <input className="input" {...register('qualification')} />
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
        title="Delete teacher"
        message={`Are you sure you want to delete "${deleteTarget?.user?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={actionLoading}
      />
    </div>
  )
}
