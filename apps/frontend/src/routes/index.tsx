/**
 * Home page component
 *
 * Displays a list of sweets with filtering and search capabilities.
 * Uses TanStack Query for state management and shadcn UI components
 * for the interface.
 */
import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSweets, useCategories, useSearchSweets } from '../lib/hooks'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Spinner,
  Alert,
  cn,
} from '../components/ui'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [purchaseDialog, setPurchaseDialog] = useState<{ open: boolean; sweet: any | null }>({ open: false, sweet: null })
  const [quantity, setQuantity] = useState(1)
  const [purchaseError, setPurchaseError] = useState('')
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  // Determine if we should search
  const hasFilters = Boolean(
    searchQuery || selectedCategory || priceMin || priceMax
  )

  // Fetch data (hooks must be called before any conditional returns)
  const sweetsQuery = useSweets()
  const categoriesQuery = useCategories()
  const searchQuery_result = useSearchSweets(
    {
      name: searchQuery,
      categoryId: selectedCategory,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
    },
    hasFilters
  )

  // Redirect to login if not authenticated
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    navigate({ to: '/login' })
    return null
  }

  // Determine which data to display
  const sweets = hasFilters ? searchQuery_result.data : sweetsQuery.data
  const isLoading = hasFilters ? searchQuery_result.isLoading : sweetsQuery.isLoading
  const isError = hasFilters ? searchQuery_result.isError : sweetsQuery.isError

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setPriceMin('')
    setPriceMax('')
  }

  const handleOpenPurchaseDialog = (sweet: any) => {
    setPurchaseDialog({ open: true, sweet })
    setQuantity(1)
    setPurchaseError('')
  }

  const handleClosePurchaseDialog = () => {
    setPurchaseDialog({ open: false, sweet: null })
    setQuantity(1)
    setPurchaseError('')
    setPurchaseLoading(false)
  }

  const handlePurchase = async () => {
    if (!purchaseDialog.sweet) return
    
    if (quantity < 1 || quantity > purchaseDialog.sweet.stock) {
      setPurchaseError(`Please enter a quantity between 1 and ${purchaseDialog.sweet.stock}`)
      return
    }

    setPurchaseLoading(true)
    setPurchaseError('')

    try {
      await apiClient.post(`/sweets/${purchaseDialog.sweet.id}/purchase`, { quantity })
      // Refetch sweets to update stock
      sweetsQuery.refetch()
      if (hasFilters) searchQuery_result.refetch()
      handleClosePurchaseDialog()
    } catch (err: any) {
      setPurchaseError(err.response?.data?.error || 'Purchase failed. Please try again.')
    } finally {
      setPurchaseLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Sweet Shop</h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse our delicious selection of sweets
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardContent>
            <div className="space-y-4 py-4">
              {/* Search Bar */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Search by name
                </label>
                <input
                  type="text"
                  placeholder="Search sweets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showFilters ? '- Hide' : '+ Show'} Advanced Filters
              </button>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 gap-4 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">All categories</option>
                      {categoriesQuery.data?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Min */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Price Max */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="999"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Clear Filters Button */}
              {hasFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {isError && (
          <Alert variant="destructive" className="mb-8">
            Failed to load sweets. Please try again.
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sweets && sweets.length === 0 && (
          <Alert className="mb-8">
            No sweets found. Try adjusting your filters.
          </Alert>
        )}

        {/* Sweets Grid */}
        {!isLoading && sweets && sweets.length > 0 && (
          <div>
            <p className="mb-4 text-sm text-gray-600">
              Showing {sweets.length} sweet{sweets.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sweets.map((sweet) => (
                <Card key={sweet.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="flex-1 text-lg">
                        {sweet.name}
                      </CardTitle>
                      {sweet.stock <= 5 && sweet.stock > 0 && (
                        <Badge variant="secondary">Low Stock</Badge>
                      )}
                      {sweet.stock === 0 && (
                        <Badge variant="outline" className="bg-red-100 text-red-800">Out of Stock</Badge>
                      )}
                    </div>
                    {sweet.category && (
                      <Badge variant="outline" className="mt-2 w-fit">
                        {sweet.category.name}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Price */}
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${Number(sweet.price).toFixed(2)}
                        </p>
                      </div>

                      {/* Stock */}
                      <div>
                        <p className="text-sm text-gray-600">Stock</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {sweet.stock} units
                        </p>
                      </div>

                      {/* Created By */}
                      {sweet.user && (
                        <div className="border-t border-gray-200 pt-2">
                          <p className="text-xs text-gray-500">
                            Created by {sweet.user.name}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="border-t border-gray-200 pt-4">
                        <Button
                          className="w-full"
                          disabled={sweet.stock === 0}
                          onClick={() => handleOpenPurchaseDialog(sweet)}
                        >
                          {sweet.stock === 0 ? 'Out of Stock' : 'Purchase'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Purchase Dialog */}
      {purchaseDialog.open && purchaseDialog.sweet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Purchase {purchaseDialog.sweet.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Price per unit</p>
                <p className="text-xl font-bold text-blue-600">
                  ${Number(purchaseDialog.sweet.price).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Available Stock: {purchaseDialog.sweet.stock}</p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={purchaseDialog.sweet.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Total Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${(Number(purchaseDialog.sweet.price) * quantity).toFixed(2)}
                </p>
              </div>

              {purchaseError && (
                <Alert variant="destructive">
                  {purchaseError}
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleClosePurchaseDialog}
                  variant="outline"
                  className="flex-1"
                  disabled={purchaseLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  className="flex-1"
                  disabled={purchaseLoading}
                >
                  {purchaseLoading ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
