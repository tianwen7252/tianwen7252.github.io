import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getCommondityTypeRepo,
  getCommondityRepo,
} from '@/lib/repositories/provider'
import { useOrderStore } from '@/stores/order-store'
import { CategoryTabs } from './category-tabs'
import { ProductCard } from './product-card'
import { ViewToggle } from './view-toggle'

/**
 * Main container component for the product selection area.
 * Fetches categories and commodities via TanStack Query,
 * manages selected category state, and renders the grid of products.
 */
export function ProductGrid() {
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>('bento')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const addItem = useOrderStore(state => state.addItem)

  // Fetch all commodity types (categories)
  const {
    data: categories = [],
    isLoading: isLoadingTypes,
    isError: isTypesError,
  } = useQuery({
    queryKey: ['commondity-types'],
    queryFn: () => getCommondityTypeRepo().findAll(),
  })

  // Fetch commodities based on selected category
  const {
    data: commodities = [],
    isLoading: isLoadingCommodities,
    isError: isCommoditiesError,
  } = useQuery({
    queryKey: ['commodities', selectedTypeId],
    queryFn: () => {
      if (selectedTypeId === null) {
        return getCommondityRepo().findOnMarket()
      }
      return getCommondityRepo().findByTypeId(selectedTypeId)
    },
  })

  const isLoading = isLoadingTypes || isLoadingCommodities
  const isError = isTypesError || isCommoditiesError

  const handleAddItem = (commodity: {
    id: string
    name: string
    price: number
  }) => {
    addItem(commodity)
  }

  const handleToggleView = () => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">載入中...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-destructive">載入商品失敗，請重試</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header: category tabs + view toggle */}
      <div className="flex items-center justify-between">
        <CategoryTabs
          categories={categories}
          selectedTypeId={selectedTypeId}
          onSelect={setSelectedTypeId}
        />
        <ViewToggle mode={viewMode} onToggle={handleToggleView} />
      </div>

      {/* Product grid */}
      {commodities.length === 0 ? (
        <div className="flex items-center justify-center p-12">
          <span className="text-muted-foreground">目前沒有商品</span>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {commodities.map(commodity => (
            <ProductCard
              key={commodity.id}
              commodity={commodity}
              onAdd={handleAddItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}
