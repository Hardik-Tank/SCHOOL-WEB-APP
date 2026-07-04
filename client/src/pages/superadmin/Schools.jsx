import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle2, XCircle } from 'lucide-react'
import DataTable from '../../components/DataTable.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { listSchools, approveSchool, rejectSchool } from '../../api/schools.js'
import { getErrorMessage } from '../../api/axios.js'

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const statusBadge = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
}

export default function Schools() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [schools, setSchools] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    listSchools({ status: status || undefined, page, limit: 10 })
      .then((res) => {
        setSchools(res.data.data)
        setPagination(res.data.pagination)
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [status, page])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = async (school) => {
    try {
      await approveSchool(school._id)
      toast.success(`${school.name} approved`)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleReject = async () => {
    if (!confirmTarget) return
    setActionLoading(true)
    try {
      await rejectSchool(confirmTarget._id)
      toast.success(`${confirmTarget.name} rejected`)
      setConfirmTarget(null)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { key: 'name', header: 'School' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'admin', header: 'Admin', render: (row) => row.admin?.name || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge[row.status] || 'bg-gray-100 text-gray-600'}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Requested',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex gap-2">
            <button className="btn-primary btn-sm" onClick={() => handleApprove(row)}>
              <CheckCircle2 size={14} /> Approve
            </button>
            <button className="btn-danger btn-sm" onClick={() => setConfirmTarget(row)}>
              <XCircle size={14} /> Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">No actions</span>
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatus(tab.key)
              setPage(1)
            }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              status === tab.key ? 'bg-white text-accent-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={schools} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No schools found" />

      <ConfirmDialog
        open={!!confirmTarget}
        title="Reject school"
        message={`Are you sure you want to reject "${confirmTarget?.name}"? This action can be reconsidered later by an admin.`}
        confirmLabel="Reject"
        onConfirm={handleReject}
        onCancel={() => setConfirmTarget(null)}
        loading={actionLoading}
      />
    </div>
  )
}
