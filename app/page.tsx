import { CapabilityGrid } from '@/components/sections/CapabilityGrid'
import { CustomerStories } from '@/components/sections/CustomerStories'
import { Faq } from '@/components/sections/Faq'
import { FinalCta } from '@/components/sections/FinalCta'
import { Hero } from '@/components/sections/Hero'
import { IntegrationWall } from '@/components/sections/IntegrationWall'
import { Principles } from '@/components/sections/Principles'
import { ProblemSolution } from '@/components/sections/ProblemSolution'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { SiteNav } from '@/components/sections/SiteNav'

export const metadata = {
  title: '预约系统 · 把约时间这件事压缩成一个链接',
  description:
    '给独立职业者的预约工具：发一个链接，客户自己挑时间。时区自动换算，两场之间自动留空。',
}

/**
 * 首页区块顺序（照 cal.com 的 10 段结构）：
 * Nav → Hero → 问题-解决 → 六能力 → 工具墙 → 场景数据 → 设计取舍 → FAQ → 尾部 CTA → Footer
 *
 * 每个区块自己管背景和上下间距（通过 Section 组件），page.tsx 只负责顺序。
 */
export default function HomePage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <SiteNav />

      <main>
        <Hero />
        <ProblemSolution />
        <CapabilityGrid />
        <IntegrationWall />
        <CustomerStories />
        <Principles />
        <Faq />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  )
}
