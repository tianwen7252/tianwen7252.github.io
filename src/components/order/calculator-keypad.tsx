import type { ReactNode } from 'react'
import {
  Delete,
  Divide,
  Equal,
  Minus,
  Percent,
  Plus,
  X as Multiply,
} from 'lucide-react'
import { RippleButton } from '@/components/ui/ripple-button'
import { cn } from '@/lib/cn'
import type { CalculatorKey } from '@/lib/calculator-engine'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CalculatorKeypadProps {
  readonly activeOperator: string | null
  readonly onKey: (key: CalculatorKey) => void
}

interface KeyDef {
  readonly key: CalculatorKey
  readonly label: ReactNode
  readonly type: 'digit' | 'operator' | 'action' | 'equals'
}

// ─── Key layout ─────────────────────────────────────────────────────────────

const ICON_SIZE = 'size-4'

const NEGATE_LABEL = (
  <span className="flex items-center gap-0.5">
    <Plus className="size-3" />
    <span className="text-base">/</span>
    <Minus className="size-3" />
  </span>
)

const ROWS: readonly (readonly KeyDef[])[] = [
  [
    {
      key: 'backspace',
      label: <Delete className={ICON_SIZE} />,
      type: 'action',
    },
    { key: 'c', label: 'C', type: 'action' },
    { key: '%', label: <Percent className={ICON_SIZE} />, type: 'action' },
    { key: '/', label: <Divide className={ICON_SIZE} />, type: 'operator' },
  ],
  [
    { key: '7', label: '7', type: 'digit' },
    { key: '8', label: '8', type: 'digit' },
    { key: '9', label: '9', type: 'digit' },
    { key: '-', label: <Minus className={ICON_SIZE} />, type: 'operator' },
  ],
  [
    { key: '4', label: '4', type: 'digit' },
    { key: '5', label: '5', type: 'digit' },
    { key: '6', label: '6', type: 'digit' },
    { key: '+', label: <Plus className={ICON_SIZE} />, type: 'operator' },
  ],
  [
    { key: '1', label: '1', type: 'digit' },
    { key: '2', label: '2', type: 'digit' },
    { key: '3', label: '3', type: 'digit' },
    { key: '*', label: <Multiply className={ICON_SIZE} />, type: 'operator' },
  ],
  [
    { key: '+/-', label: NEGATE_LABEL, type: 'action' },
    { key: '0', label: '0', type: 'digit' },
    { key: '.', label: '.', type: 'digit' },
    { key: '=', label: <Equal className={ICON_SIZE} />, type: 'equals' },
  ],
]

// ─── Style helpers ──────────────────────────────────────────────────────────

function getButtonClass(def: KeyDef, isActive: boolean): string {
  const base =
    'flex items-center justify-center rounded-xl border text-xl transition-all duration-200 active:scale-[0.9]'

  if (def.type === 'equals') {
    return cn(base, 'border-primary/30 bg-primary text-primary-foreground')
  }
  if (def.type === 'operator') {
    return cn(
      base,
      isActive
        ? 'border-primary/40 bg-primary/15 text-primary'
        : 'border-white/30 bg-white text-foreground shadow-sm',
    )
  }
  if (def.key === 'c') {
    return cn(base, 'border-white/30 bg-white text-destructive shadow-sm')
  }
  if (def.type === 'action') {
    return cn(base, 'border-white/30 bg-white text-muted-foreground shadow-sm')
  }
  // digit
  return cn(base, 'border-white/30 bg-white text-foreground shadow-sm')
}

// ─── Component ──────────────────────────────────────────────────────────────

/** 4-column x 5-row calculator keypad with large white buttons. */
export function CalculatorKeypad({
  activeOperator,
  onKey,
}: CalculatorKeypadProps) {
  return (
    <div className="grid flex-1 grid-cols-4 gap-2">
      {ROWS.flatMap(row =>
        row.map(def => (
          <RippleButton
            key={def.key}
            onClick={() => onKey(def.key)}
            rippleColor="rgba(127, 149, 106, 0.25)"
            className={getButtonClass(def, def.key === activeOperator)}
          >
            {def.label}
          </RippleButton>
        )),
      )}
    </div>
  )
}
