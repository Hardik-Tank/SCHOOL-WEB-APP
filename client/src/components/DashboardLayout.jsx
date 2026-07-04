import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function DashboardLayout({ navItems }) {
  const location = useLocation()
  const active = navItems.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))
  const title = active?.label || 'Dashboard'

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar navItems={navItems} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
