import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calculator } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  getCommondityTypeRepo,
  getCommondityRepo,
} from '@/lib/repositories/provider'
import { useOrderStore } from '@/stores/order-store'
import { Button } from '@/components/ui/button'
import { CategoryTabs } from './category-tabs'
import { ProductCard } from './product-card'

/**
 * Main container component for the product selection area.
 * Fetches categories and commodities via TanStack Query,
 * manages selected category state, and renders the grid of products.
 */
export function ProductGrid() {
  const { t } = useTranslation()
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>('bento')

  const addItem = useOrderStore((state) => state.addItem)

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{t('order.loading')}</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-destructive">{t('order.loadError')}</span>
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
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t('order.calculator')}
          className="border text-muted-foreground"
        >
          <Calculator className="size-5" />
        </Button>
      </div>

      {/* Product grid */}
      {commodities.length === 0 ? (
        <div className="flex items-center justify-center p-12">
          <span className="text-muted-foreground">{t('order.noProducts')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {commodities.map((commodity) => (
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
