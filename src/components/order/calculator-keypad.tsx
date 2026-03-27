import { RippleButton } from '@/components/ui/ripple-button'
import { cn } from '@/lib/cn'
import type { CalculatorKey } from '@/lib/calculator-engine'

// ─── Types ──────────────────────────────────────────────────────────────────

interface CalculatorKeypadProps {
  readonly activeOperator: string | null
  readonly onKey: (key: CalculatorKey) => void
}

// ─── Key definitions ────────────────────────────────────────────────────────

interface KeyDef {
  readonly key: CalculatorKey
  readonly label: string
  readonly type: 'digit' | 'operator' | 'action' | 'equals'
}

const ROWS: readonly (readonly KeyDef[])[] = [
  [
    { key: 'backspace', label: '←', type: 'action' },
    { key: 'c', label: 'C', type: 'action' },
    { key: '%', label: '%', type: 'action' },
    { key: '/', label: '÷', type: 'operator' },
  ],
  [
    { key: '7', label: '7', type: 'digit' },
    { key: '8', label: '8', type: 'digit' },
    { key: '9', label: '9', type: 'digit' },
    { key: '-', label: '-', type: 'operator' },
  ],
  [
    { key: '4', label: '4', type: 'digit' },
    { key: '5', label: '5', type: 'digit' },
    { key: '6', label: '6', type: 'digit' },
    { key: '+', label: '+', type: 'operator' },
  ],
  [
    { key: '1', label: '1', type: 'digit' },
    { key: '2', label: '2', type: 'digit' },
    { key: '3', label: '3', type: 'digit' },
    { key: '*', label: '×', type: 'operator' },
  ],
  [
    { key: '+/-', label: '+/-', type: 'action' },
    { key: '0', label: '0', type: 'digit' },
    { key: '.', label: '.', type: 'digit' },
    { key: '=', label: '=', type: 'equals' },
  ],
]

// ─── Style helpers ──────────────────────────────────────────────────────────

function getButtonClass(def: KeyDef, isActive: boolean): string {
  const base =
    'flex items-center justify-center rounded-xl border text-lg transition-all duration-200 active:scale-[0.9]'

  if (def.type === 'equals') {
    return cn(base, 'border-primary/30 bg-primary text-primary-foreground')
  }
  if (def.type === 'operator') {
    return cn(
      base,
      isActive
        ? 'border-primary/50 bg-primary/20 text-primary'
        : 'border-[#efefef] bg-card/80 text-card-foreground',
    )
  }
  if (def.key === 'c') {
    return cn(base, 'border-destructive/30 bg-destructive/10 text-destructive')
  }
  if (def.type === 'action') {
    return cn(base, 'border-[#efefef] bg-card/60 text-muted-foreground')
  }
  // digit
  return cn(base, 'border-[#efefef] bg-card text-card-foreground shadow-sm')
}

// ─── Component ──────────────────────────────────────────────────────────────

/** 4-column x 5-row calculator keypad with product-card-like button styling. */
export function CalculatorKeypad({
  activeOperator,
  onKey,
}: CalculatorKeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
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
