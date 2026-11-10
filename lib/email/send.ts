import { Resend } from 'resend'
import { buildIcs } from '@/lib/utils/ics'
import { renderBookingEmail } from './templates'

type BookingEmailData = {
  eventTitle: string
  duration: number
  hostName: string
  hostEmail: string
  guestName: string
  guestEmail: string
  guestTimezone: string
  hostTimezone: string
  startTime: Date
  endTime: Date
  bookingId: string
  notes?: string | null
}

/**
 * 发确认邮件给访客和主理人。
 *
 * 没配 RESEND_API_KEY 时不报错，只打一条日志——
 * 本地开发和演示环境不该因为缺一个 key 就约不了时间。
 * 返回值只用于日志，调用方不依赖它。
 */
export async function sendBookingEmails(data: BookingEmailData): Promise<{
  sent: boolean
  reason?: string
}> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const emailData = { ...data, appUrl }

  if (!apiKey || !from) {
    console.log('[email] 未配置 RESEND_API_KEY / MAIL_FROM，跳过邮件发送', {
      bookingId: data.bookingId,
      guestEmail: data.guestEmail,
    })
    return { sent: false, reason: 'not-configured' }
  }

  const icsContent = buildIcs({
    uid: data.bookingId,
    start: data.startTime,
    end: data.endTime,
    summary: `${data.eventTitle} · ${data.hostName}`,
    description: data.notes ?? undefined,
    organizerName: data.hostName,
    organizerEmail: data.hostEmail,
    attendeeName: data.guestName,
    attendeeEmail: data.guestEmail,
  })

  const attachment = {
    filename: 'booking.ics',
    content: Buffer.from(icsContent, 'utf8').toString('base64'),
    contentType: 'text/calendar; charset=utf-8; method=REQUEST',
  }

  const resend = new Resend(apiKey)

  const guest = renderBookingEmail(emailData, 'guest')
  const host = renderBookingEmail(emailData, 'host')

  const results = await Promise.allSettled([
    resend.emails.send({
      from,
      to: data.guestEmail,
      subject: guest.subject,
      html: guest.html,
      attachments: [attachment],
    }),
    resend.emails.send({
      from,
      to: data.hostEmail,
      subject: host.subject,
      html: host.html,
      attachments: [attachment],
    }),
  ])

  // resend 的 send() 在 API 报错时不 throw，而是把错误放在返回值里。
  // 只看 rejected 会把「域名没验证 / 退信 / 配额超限」全当成成功。
  const failures = results.filter(
    (item) =>
      item.status === 'rejected' ||
      (item.status === 'fulfilled' && item.value.error !== null),
  )

  if (failures.length > 0) {
    console.error(
      '[email] 部分邮件发送失败',
      failures.map((item) =>
        item.status === 'rejected' ? item.reason : item.value.error,
      ),
    )
    return { sent: false, reason: 'partial-failure' }
  }

  return { sent: true }
}
