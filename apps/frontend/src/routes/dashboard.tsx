/**
 * Admin dashboard page
 */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent, Alert } from '../components/ui'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  // Check if user is loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if user is not authenticated
  if (!user) {
    navigate({ to: '/login' })
    return null
  }

  // Check if user is not admin
  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            You do not have permission to access this page.
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your sweets shop</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Sweet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Add a new sweet to your inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Create and manage sweet categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">See all sweets and their stock levels</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Add stock to your sweets</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
