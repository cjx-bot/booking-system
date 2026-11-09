import { redirect } from 'next/navigation'
import { EventTypeManager } from '@/components/dashboard/EventTypeManager'
import { auth } from '@/lib/auth'
import { getEventTypesByUser } from '@/lib/queries/event-types'

export const dynamic = 'force-dynamic'
export const metadata = { title: '事件类型' }

export default async function EventTypesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const rows = await getEventTypesByUser(session.user.id)

  const items = rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    duration: row.duration,
    bufferBefore: row.bufferBefore,
    bufferAfter: row.bufferAfter,
    isActive: row.isActive,
  }))

  return <EventTypeManager items={items} />
}
