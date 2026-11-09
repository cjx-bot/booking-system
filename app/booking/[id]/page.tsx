type Props = {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="container-page py-24">
      <h1 className="text-3xl font-semibold tracking-tight">预约详情</h1>
      <p className="mt-3 text-ink-secondary">
        booking = <code className="font-mono text-brand">{id}</code> · T3.1 由
        Agent-Booking 实现
      </p>
    </main>
  )
}
