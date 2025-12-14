/**
 * Admin dashboard page
 */
import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../contexts/AuthContext'
import { useSweets, useCategories } from '../lib/hooks'
import { apiClient } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent, Alert, Button, Spinner } from '../components/ui'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const { data: sweets, isLoading: sweetsLoading, refetch: refetchSweets } = useSweets()
  const { data: categories } = useCategories()
  
  // Filter sweets to only show those created by current user
  const userSweets = sweets?.filter((sweet: any) => sweet.userId === user?.id) || []
  
  const [createDialog, setCreateDialog] = useState(false)
  const [updateDialog, setUpdateDialog] = useState<{ open: boolean; sweet: any | null }>({ open: false, sweet: null })
  const [restockDialog, setRestockDialog] = useState<{ open: boolean; sweet: any | null }>({ open: false, sweet: null })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; sweet: any | null }>({ open: false, sweet: null })
  const [createCategoryDialog, setCreateCategoryDialog] = useState(false)
  
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', categoryId: '' })
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' })
  const [restockAmount, setRestockAmount] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateSweet = async () => {
    setError('')
    setLoading(true)
    try {
      await apiClient.post('/sweets', {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId
      })
      refetchSweets()
      setCreateDialog(false)
      setFormData({ name: '', price: '', stock: '', categoryId: '' })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create sweet')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSweet = async () => {
    if (!updateDialog.sweet) return
    setError('')
    setLoading(true)
    try {
      await apiClient.put(`/sweets/${updateDialog.sweet.id}`, {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId
      })
      refetchSweets()
      setUpdateDialog({ open: false, sweet: null })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update sweet')
    } finally {
      setLoading(false)
    }
  }

  const handleRestock = async () => {
    if (!restockDialog.sweet) return
    setError('')
    setLoading(true)
    try {
      await apiClient.post(`/sweets/${restockDialog.sweet.id}/restock`, { quantity: restockAmount })
      refetchSweets()
      setRestockDialog({ open: false, sweet: null })
      setRestockAmount(0)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to restock')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.sweet) return
    setLoading(true)
    try {
      await apiClient.delete(`/sweets/${deleteDialog.sweet.id}`)
      refetchSweets()
      setDeleteDialog({ open: false, sweet: null })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete sweet')
    } finally {
      setLoading(false)
    }
  }

  const openUpdateDialog = (sweet: any) => {
    setFormData({
      name: sweet.name,
      price: sweet.price.toString(),
      stock: sweet.stock.toString(),
      categoryId: sweet.categoryId
    })
    setUpdateDialog({ open: true, sweet })
    setError('')
  }

  const openCreateDialog = () => {
    setFormData({ name: '', price: '', stock: '', categoryId: categories?.[0]?.id || '' })
    setCreateDialog(true)
    setError('')
  }

  const handleCreateCategory = async () => {
    setError('')
    setLoading(true)
    try {
      await apiClient.post('/category', {
        name: categoryFormData.name,
        description: categoryFormData.description
      })
      // Refetch categories (need to add refetch to useCategories hook or reload)
      window.location.reload() // Simple way to refresh categories
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your sweets shop inventory</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => { setCategoryFormData({ name: '', description: '' }); setCreateCategoryDialog(true); setError('') }} variant="outline">
              Create Category
            </Button>
            <Button onClick={openCreateDialog} disabled={!categories || categories.length === 0}>
              Create New Sweet
            </Button>
          </div>
        </div>

        {(!categories || categories.length === 0) && (
          <Alert className="mb-6">
            No categories available. Please create a category first before adding sweets.
          </Alert>
        )}

        {sweetsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userSweets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No sweets created yet. Click "Create New Sweet" to add one.
                    </td>
                  </tr>
                ) : (
                  userSweets.map((sweet: any) => (
                    <tr key={sweet.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sweet.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(sweet.price).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sweet.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sweet.category?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => openUpdateDialog(sweet)}>Update</Button>
                          <Button variant="outline" onClick={() => { setRestockDialog({ open: true, sweet }); setRestockAmount(0); setError('') }}>Restock</Button>
                          <Button variant="outline" onClick={() => { setDeleteDialog({ open: true, sweet }); setError('') }}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      {createDialog && (
        <Dialog title="Create New Sweet" onClose={() => setCreateDialog(false)}>
          <div className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              >
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setCreateDialog(false)} variant="outline" className="flex-1" disabled={loading}>Cancel</Button>
              <Button onClick={handleCreateSweet} className="flex-1" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Update Dialog */}
      {updateDialog.open && (
        <Dialog title="Update Sweet" onClose={() => setUpdateDialog({ open: false, sweet: null })}>
          <div className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              >
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setUpdateDialog({ open: false, sweet: null })} variant="outline" className="flex-1" disabled={loading}>Cancel</Button>
              <Button onClick={handleUpdateSweet} className="flex-1" disabled={loading}>
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Restock Dialog */}
      {restockDialog.open && restockDialog.sweet && (
        <Dialog title={`Restock ${restockDialog.sweet.name}`} onClose={() => setRestockDialog({ open: false, sweet: null })}>
          <div className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Stock: {restockDialog.sweet.stock}</p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Quantity</label>
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-sm text-gray-600 mt-2">New Stock: {restockDialog.sweet.stock + restockAmount}</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setRestockDialog({ open: false, sweet: null })} variant="outline" className="flex-1" disabled={loading}>Cancel</Button>
              <Button onClick={handleRestock} className="flex-1" disabled={loading}>
                {loading ? 'Restocking...' : 'Restock'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {deleteDialog.open && deleteDialog.sweet && (
        <Dialog title="Delete Sweet" onClose={() => setDeleteDialog({ open: false, sweet: null })}>
          <div className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{deleteDialog.sweet.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setDeleteDialog({ open: false, sweet: null })} variant="outline" className="flex-1" disabled={loading}>Cancel</Button>
              <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Create Category Dialog */}
      {createCategoryDialog && (
        <Dialog title="Create New Category" onClose={() => setCreateCategoryDialog(false)}>
          <div className="space-y-4">
            {error && <Alert variant="destructive">{error}</Alert>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Chocolates"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                rows={3}
                placeholder="e.g., Delicious chocolate treats"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setCreateCategoryDialog(false)} variant="outline" className="flex-1" disabled={loading}>Cancel</Button>
              <Button onClick={handleCreateCategory} className="flex-1" disabled={loading}>
                {loading ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  )
}
