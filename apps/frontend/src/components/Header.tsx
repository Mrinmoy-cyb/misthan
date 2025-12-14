import { Link, useNavigate } from '@tanstack/react-router'

import { LayoutDashboard, LogOut, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
    navigate({ to: '/login' })
  }

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
        <div className="flex items-center">
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/">
              Misthan
            </Link>
          </h1>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{user.name}</span>
            {user.role === 'ADMIN' && (
              <Link
                to="/dashboard"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Admin Dashboard"
              >
                <LayoutDashboard size={20} />
                
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
              
            </button>
          </div>
        )}
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">

          {user?.role === 'ADMIN' && (
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
              activeProps={{
                className:
                  'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
              }}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>
          )}

        </nav>

        {user && (
          <div className="border-t border-gray-700 p-4 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-red-400"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
