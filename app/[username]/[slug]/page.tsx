type Props = {
  params: Promise<{ username: string; slug: string }>
}

export default async function BookingPage({ params }: Props) {
  const { username, slug } = await params

  return (
    <main className="container-page py-24">
      <h1 className="text-3xl font-semibold tracking-tight">预约页</h1>
      <p className="mt-3 text-ink-secondary">
        {username} / {slug} · T3.1 由 Agent-Booking 实现
      </p>
    </main>
  )
}
