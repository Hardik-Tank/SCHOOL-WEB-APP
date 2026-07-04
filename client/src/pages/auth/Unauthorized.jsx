import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <ShieldAlert size={32} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900">403 — Unauthorized</h1>
      <p className="max-w-sm text-sm text-gray-500">You don't have permission to view this page. Please contact your administrator if you believe this is a mistake.</p>
      <Link to="/" className="btn-primary">
        Go home
      </Link>
    </div>
  )
}
