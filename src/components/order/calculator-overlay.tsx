import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createInitialState,
  processKey,
  getNumericValue,
  isError as isCalcError,
  type CalculatorKey,
  type CalculatorState,
} from '@/lib/calculator-engine'
import { getCustomOrderNameRepo } from '@/lib/repositories/provider'
import { useOrderStore } from '@/stores/order-store'
import { RippleButton } from '@/components/ui/ripple-button'
import type { ComboboxOption } from '@/components/ui/combobox'
import { CalculatorKeypad } from './calculator-keypad'
import { CalculatorDisplay } from './calculator-display'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CalculatorOverlayProps {
  readonly onClose: () => void
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Full calculator overlay rendered inside ProductGrid.
 * Glassmorphism style, absolute positioned to fill the parent container.
 */
export function CalculatorOverlay({ onClose }: CalculatorOverlayProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const addCustomItem = useOrderStore(s => s.addCustomItem)

  // Calculator engine state
  const [calcState, setCalcState] =
    useState<CalculatorState>(createInitialState)

  // Custom order name
  const [customName, setCustomName] = useState('')

  // Fetch saved custom order names
  const { data: savedNames = [] } = useQuery({
    queryKey: ['custom-order-names'],
    queryFn: () => getCustomOrderNameRepo().findAll(),
  })

  const nameOptions: ComboboxOption[] = savedNames.map(n => ({
    value: n.id,
    label: n.name,
  }))

  // Handle calculator key press
  const handleKey = useCallback((key: CalculatorKey) => {
    setCalcState(prev => processKey(prev, key))
  }, [])

  // Handle name option deletion
  const handleDeleteNameOption = useCallback(
    async (id: string) => {
      await getCustomOrderNameRepo().remove(id)
      queryClient.invalidateQueries({ queryKey: ['custom-order-names'] })
    },
    [queryClient],
  )

  // Handle submit
  const handleSubmit = useCallback(async () => {
    const value = getNumericValue(calcState)
    if (value === null || value === 0) return

    // Determine the order name
    let orderName = customName.trim()
    if (!orderName) {
      orderName =
        value < 0 ? t('order.discountDefault') : t('order.customOrderDefault')
    }

    // Add to cart
    addCustomItem(orderName, value)

    // Save custom name to DB if it's a new name (not empty and not a default)
    if (
      customName.trim() &&
      customName.trim() !== t('order.customOrderDefault') &&
      customName.trim() !== t('order.discountDefault')
    ) {
      await getCustomOrderNameRepo().create(customName.trim())
      queryClient.invalidateQueries({ queryKey: ['custom-order-names'] })
    }

    // Close overlay
    onClose()
  }, [calcState, customName, addCustomItem, onClose, queryClient, t])

  const numericValue = getNumericValue(calcState)
  const errorState = isCalcError(calcState)

  return (
    <div
      data-testid="calculator-overlay"
      className="absolute inset-0 z-20 flex flex-col gap-3 rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-xl"
    >
      {/* Close button */}
      <div className="flex justify-end">
        <RippleButton
          onClick={onClose}
          rippleColor="rgba(255,255,255,0.2)"
          className="flex size-8 items-center justify-center rounded-full text-white/60 hover:text-white"
        >
          <X className="size-5" />
        </RippleButton>
      </div>

      {/* Main content: keypad (left) + display (right) */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Left: Keypad */}
        <div className="flex-1 flex flex-col">
          <CalculatorKeypad
            activeOperator={calcState.operator}
            onKey={handleKey}
          />
        </div>

        {/* Right: Display + Combobox + Submit */}
        <div className="w-[40%] flex flex-col">
          <CalculatorDisplay
            display={calcState.display}
            expression={calcState.expression}
            isError={errorState}
            numericValue={numericValue}
            name={customName}
            onNameChange={setCustomName}
            nameOptions={nameOptions}
            onDeleteNameOption={handleDeleteNameOption}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
