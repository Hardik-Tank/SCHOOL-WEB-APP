import { NavLink } from 'react-router-dom'
import { GraduationCap, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Sidebar({ navItems }) {
  const { user, logout } = useAuth()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-600 text-white">
          <GraduationCap size={20} />
        </div>
        <span className="text-lg font-semibold text-gray-900">School ERP</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-accent-50 text-accent-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="truncate text-xs capitalize text-gray-500">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-secondary w-full">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}
