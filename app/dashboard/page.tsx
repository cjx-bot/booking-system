import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">概览</h1>
      <p className="mt-1 mb-6 text-[13px] text-ink-secondary">
        这里会显示未来 7 天的预约和最近动态。
      </p>

      <Card className="text-[13px] text-ink-secondary">
        概览页在 T3.2 实现。
      </Card>
    </div>
  )
}
