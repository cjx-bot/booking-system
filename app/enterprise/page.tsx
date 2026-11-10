import { SiteFooter } from '@/components/sections/SiteFooter'
import { SiteNav } from '@/components/sections/SiteNav'
import { AssuranceList } from '@/components/sections/enterprise/AssuranceList'
import { EnterpriseCapabilities } from '@/components/sections/enterprise/EnterpriseCapabilities'
import { EnterpriseCta, EnterpriseFaq } from '@/components/sections/enterprise/EnterpriseFaq'
import { EnterpriseHero } from '@/components/sections/enterprise/EnterpriseHero'
import { OutcomeStrip } from '@/components/sections/enterprise/OutcomeStrip'
import { ScaleBand } from '@/components/sections/enterprise/ScaleBand'
import { ENT_FOOTER_COLUMNS } from '@/lib/content/enterprise'

export const metadata = {
  title: '企业版 · 一个团队怎么排期',
  description:
    '每个成员一条自己的预约链接，规则统一配置。跨时区自动换算，并发提交只成一个，数据在自己的库里。',
}

const NAV = [
  { label: '团队怎么用', href: '#capabilities' },
  { label: '系统边界', href: '#scale' },
  { label: '保障', href: '#assurance' },
  { label: '常见问题', href: '#faq' },
  { label: '个人版', href: '/' },
] as const

/**
 * 企业版落地页。
 *
 * 结构和 cal.com/enterprise 同构：Hero → 成果 → 能力 → 规模 → 治理 → FAQ → CTA。
 * 但内容换成了这套系统真实具备的能力——它没有 SSO、没有审计日志、没有多租户，
 * 把那些写上去只是把采购方骗进来，然后在试用第一天翻车。
 *
 * 视觉上刻意不用 01/02/03 编号（能力是并列不是序列），
 * 能力段用清单而不是网格（首页已经有一个网格），全页只有一处深色。
 */
export default function EnterprisePage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <SiteNav items={NAV} />

      <main>
        <EnterpriseHero />
        <OutcomeStrip />
        <EnterpriseCapabilities />
        <ScaleBand />
        <AssuranceList />
        <EnterpriseFaq />
        <EnterpriseCta />
      </main>

      <SiteFooter
        columns={ENT_FOOTER_COLUMNS}
        tagline="团队排期，规则集中配置，客户自己挑时间。"
        note="预约系统 · 企业版"
      />
    </div>
  )
}
