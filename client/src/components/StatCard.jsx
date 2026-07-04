const colorMap = {
  indigo: 'bg-accent-50 text-accent-600',
  green: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  gray: 'bg-gray-100 text-gray-600',
}

export default function StatCard({ icon: Icon, label, value, color = 'indigo' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${colorMap[color] || colorMap.indigo}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
