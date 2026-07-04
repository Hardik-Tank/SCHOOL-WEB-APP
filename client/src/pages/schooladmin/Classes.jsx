import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable from '../../components/DataTable.jsx'
import Modal from '../../components/Modal.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { listClasses, createClass, updateClass, deleteClass } from '../../api/classes.js'
import { listTeachers } from '../../api/teachers.js'
import { getErrorMessage } from '../../api/axios.js'

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
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
    listClasses()
      .then((res) => setClasses(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    listTeachers({ limit: 500 })
      .then((res) => setTeachers(res.data.data))
      .catch(() => {})
  }, [])

  const teacherName = (id) => teachers.find((t) => t._id === id)?.user?.name || '—'

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', classTeacher: '' })
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    reset({ name: row.name, classTeacher: row.classTeacher?._id || '' })
    setModalOpen(true)
  }

  const onSubmit = async (values) => {
    const payload = { ...values, classTeacher: values.classTeacher || null }
    try {
      if (editing) {
        await updateClass(editing._id, payload)
        toast.success('Class updated')
      } else {
        await createClass(payload)
        toast.success('Class created')
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
      await deleteClass(deleteTarget._id)
      toast.success('Class deleted')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'classTeacher', header: 'Class Teacher', render: (row) => (row.classTeacher ? teacherName(row.classTeacher._id) : '—') },
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
      <div className="flex justify-end">
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> New Class
        </button>
      </div>

      <DataTable columns={columns} data={classes} loading={loading} emptyMessage="No classes yet" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Class' : 'New Class'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Class Teacher (optional)</label>
            <select className="input" {...register('classTeacher')}>
              <option value="">None</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.user?.name} ({t.employeeId})
                </option>
              ))}
            </select>
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
        title="Delete class"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={actionLoading}
      />
    </div>
  )
}
