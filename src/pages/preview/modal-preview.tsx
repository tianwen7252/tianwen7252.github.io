import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmModal, GlassModal, GlassCard } from '@/components/modal'
import type { GradientVariant } from '@/components/modal'

type DemoType = 'clockIn' | 'clockOut' | 'vacation' | 'form' | null

const DEMO_CONFIG: Record<
  Exclude<DemoType, 'form' | null>,
  {
    title: string
    variant: GradientVariant
    confirmText: string
    infoItems: { label: string; value: string }[]
  }
> = {
  clockIn: {
    title: '確認 小明 的上班打卡？',
    variant: 'green',
    confirmText: '確認打卡',
    infoItems: [
      { label: '目前時間', value: '09:30 AM' },
      { label: '班別類型', value: '正常班' },
    ],
  },
  clockOut: {
    title: '確認 小明 的下班打卡？',
    variant: 'warm',
    confirmText: '確認下班',
    infoItems: [
      { label: '目前時間', value: '06:00 PM' },
      { label: '班別類型', value: '正常班' },
    ],
  },
  vacation: {
    title: '確認 小明 的休假打卡？',
    variant: 'red',
    confirmText: '確認休假',
    infoItems: [
      { label: '休假時間', value: '09:00 AM' },
      { label: '班別類型', value: '正常班' },
    ],
  },
}

export function ModalPreview() {
  const [activeDemo, setActiveDemo] = useState<DemoType>(null)

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        基於 V1 打卡 Modal 設計，支援 Confirm / Form / 自訂內容三種模式。
      </p>

      {/* ConfirmModal demos */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">ConfirmModal (確認模式)</h2>
        <div className="flex gap-3">
          <Button variant="default" onClick={() => setActiveDemo('clockIn')}>
            上班打卡
          </Button>
          <Button variant="secondary" onClick={() => setActiveDemo('clockOut')}>
            下班打卡
          </Button>
          <Button
            variant="destructive"
            onClick={() => setActiveDemo('vacation')}
          >
            休假打卡
          </Button>
        </div>
      </section>

      {/* GlassModal with form demo */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">
          GlassModal (自訂內容 / Form 模式)
        </h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setActiveDemo('form')}>
            Open Form Modal
          </Button>
        </div>
      </section>

      {/* ConfirmModal instances */}
      {activeDemo && activeDemo !== 'form' && (
        <ConfirmModal
          open
          {...DEMO_CONFIG[activeDemo]}
          name="小明"
          avatar="images/aminals/1049013.png"
          roleLabel="管理員"
          onConfirm={() => setActiveDemo(null)}
          onCancel={() => setActiveDemo(null)}
        />
      )}

      {/* GlassModal form demo */}
      {activeDemo === 'form' && (
        <GlassModal
          open
          variant="green"
          systemLabel="員工資料"
          title="編輯員工資訊"
          onClose={() => setActiveDemo(null)}
          footer={
            <div className="flex w-full justify-center gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setActiveDemo(null)}
              >
                取消
              </Button>
              <Button className="flex-1" onClick={() => setActiveDemo(null)}>
                儲存
              </Button>
            </div>
          }
        >
          <GlassCard>
            <div className="w-full space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  姓名
                </label>
                <input
                  type="text"
                  defaultValue="小明"
                  className="w-full rounded-lg border border-input bg-white/60 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  員工編號
                </label>
                <input
                  type="text"
                  defaultValue="001"
                  className="w-full rounded-lg border border-input bg-white/60 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  班別
                </label>
                <select className="w-full rounded-lg border border-input bg-white/60 px-3 py-2 text-sm">
                  <option>正常班</option>
                  <option>輪班</option>
                </select>
              </div>
            </div>
          </GlassCard>
        </GlassModal>
      )}
    </div>
  )
}
