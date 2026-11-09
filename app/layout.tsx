import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '预约系统 · 一个链接，客户自助约时间',
    template: '%s · 预约系统',
  },
  description: '给独立职业者的预约工具：发一个链接，客户自己挑时间，不用来回问。',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh bg-canvas text-ink antialiased">{children}</body>
    </html>
  )
}
