type Props = {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params

  return (
    <main className="container-page py-24">
      <h1 className="text-3xl font-semibold tracking-tight">个人主页</h1>
      <p className="mt-3 text-ink-secondary">
        username = <code className="font-mono text-brand">{username}</code> · T3.1 由
        Agent-Booking 实现
      </p>
    </main>
  )
}
