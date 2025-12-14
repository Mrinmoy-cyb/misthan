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

  // Determine if we should search
  const hasFilters = Boolean(
    searchQuery || selectedCategory || priceMin || priceMax
  )

  // Fetch data
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
                          ${sweet.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Stock */}
                      <div>
                        <p className="text-sm text-gray-600">Stock</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1 rounded-full bg-gray-200 h-2">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                sweet.stock > 5
                                  ? 'bg-green-500'
                                  : sweet.stock > 0
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              )}
                              style={{
                                width: `${Math.min((sweet.stock / 10) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {sweet.stock}
                          </span>
                        </div>
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
                        >
                          {sweet.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
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
    </div>
  )
}
