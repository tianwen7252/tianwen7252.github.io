import { Button } from '@/components/ui/button'

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12">
      <h1 className="text-4xl font-bold text-primary">天文 Tianwen V2</h1>
      <p className="text-lg text-muted-foreground">
        POS 管理系統 — Phase 1 基礎建設中
      </p>
      <div className="flex gap-3">
        <Button variant="default">Primary Button</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    </div>
  )
}
