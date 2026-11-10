import { Accordion } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Section } from '@/components/ui/Section'

export const metadata = {
  title: '组件预览',
  robots: { index: false, follow: false },
}

const DEMO_FAQ = [
  {
    id: 'demo-1',
    question: '这是展开状态的样子',
    answer: '面板正文用 text-body，颜色走 ink-secondary。一次只允许开一条。',
  },
  {
    id: 'demo-2',
    question: '这是收起状态',
    answer: '点一下展开，再点一下收起。键盘 Tab 聚焦、Enter 或空格触发。',
  },
]

export default function DesignSystemPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <Section spacing="tight" divided={false}>
        <Container>
          <p className="text-micro mb-2 font-medium text-brand normal-case">
            内部页面 · 不对外
          </p>
          <h1 className="text-section text-ink">组件与令牌</h1>
          <p className="text-body mt-2 max-w-[56ch] text-ink-secondary">
            后续所有区块只从这里取零件。新增组件先加到这一页再进业务页，
            避免出现第二个按钮样式。
          </p>
        </Container>
      </Section>

      <Section tone="surface" divided spacing="tight">
        <Container>
          <h2 className="text-card mb-4 text-ink">Button</h2>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button>primary</Button>
            <Button variant="secondary">secondary</Button>
            <Button variant="ghost">ghost</Button>
            <Button variant="danger">danger</Button>
            <Button loading>loading</Button>
            <Button disabled>disabled</Button>
            <Button size="sm">small</Button>
            <Button size="lg">large</Button>
          </div>
        </Container>
      </Section>

      <Section divided spacing="tight">
        <Container>
          <h2 className="text-card mb-4 text-ink">Badge / Label / Input / Select</h2>

          <div className="mb-5 flex flex-wrap gap-2">
            <Badge>neutral</Badge>
            <Badge tone="brand">brand</Badge>
            <Badge tone="success">success</Badge>
            <Badge tone="warning">warning</Badge>
            <Badge tone="danger">danger</Badge>
          </div>

          <div className="grid max-w-xl gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="demo-input" required>
                输入框
              </Label>
              <Input id="demo-input" placeholder="占位文字" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="demo-select">下拉</Label>
              <Select id="demo-select" defaultValue="30">
                <option value="30">30 分钟</option>
                <option value="60">60 分钟</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="demo-invalid">错误态</Label>
              <Input id="demo-invalid" aria-invalid defaultValue="不合法的值" />
              <p className="text-[11.5px] text-danger">这里会显示具体错误</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="demo-disabled">禁用态</Label>
              <Input id="demo-disabled" disabled defaultValue="不可编辑" />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="surface" divided spacing="tight">
        <Container>
          <h2 className="text-card mb-4 text-ink">Card</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>普通卡片</CardTitle>
                <CardDescription>带描边和极轻阴影。</CardDescription>
              </CardHeader>
            </Card>

            <Card interactive>
              <CardHeader>
                <CardTitle>可点击卡片</CardTitle>
                <CardDescription>hover 时阴影加深。</CardDescription>
              </CardHeader>
            </Card>

            <Card flush>
              <div className="border-b border-line px-5 py-3 text-[13px] font-medium">
                贴边卡片
              </div>
              <p className="px-5 py-4 text-small text-ink-secondary">
                去掉内边距，用于表格或图片贴边。
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      <Section divided spacing="tight">
        <Container width="narrow">
          <h2 className="text-card mb-4 text-ink">Accordion</h2>
          <Accordion items={DEMO_FAQ} single defaultOpenId="demo-1" />
        </Container>
      </Section>

      <Section tone="inverse" spacing="tight">
        <Container>
          <h2 className="text-card mb-2 text-canvas">深色区块</h2>
          <p className="text-small text-canvas/70">
            整页只允许出现一次，用来打断节奏。正文色是 canvas/70。
          </p>
        </Container>
      </Section>
    </div>
  )
}
