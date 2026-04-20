import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import PanicButton from '../PanicButton'
import { useAuthStore } from '../../stores/authStore'

export default function DashboardLayout() {
  const { role } = useAuthStore()
  return (
    <div className="flex min-h-screen bg-warm-white">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
      {role === 'patient' && <PanicButton />}
    </div>
  )
}
