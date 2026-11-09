import { formatTimeInTimeZone } from '@/lib/utils/timezone'

type BookingEmailData = {
  eventTitle: string
  duration: number
  hostName: string
  guestName: string
  guestEmail: string
  guestTimezone: string
  hostTimezone: string
  startTime: Date
  endTime: Date
  bookingId: string
  appUrl: string
  notes?: string | null
}

/** 邮件 HTML 的转义。访客姓名和备注是用户输入，不转义就能注入标签。 */
function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })
}

function formatDate(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(instant)
}

function formatRange(data: BookingEmailData, timeZone: string): string {
  return `${formatTimeInTimeZone(data.startTime, timeZone)} — ${formatTimeInTimeZone(
    data.endTime,
    timeZone,
  )}`
}

/**
 * 邮件 HTML。
 * 内联样式 + table 布局：邮件客户端对 CSS 的支持停留在很久以前，
 * 外部样式表和 flex/grid 一律不可靠。
 */
export function renderBookingEmail(
  data: BookingEmailData,
  audience: 'guest' | 'host',
) {
  const isGuest = audience === 'guest'

  const eventTitle = esc(data.eventTitle)
  const hostName = esc(data.hostName)
  const guestName = esc(data.guestName)
  const guestEmail = esc(data.guestEmail)
  const notes = data.notes ? esc(data.notes) : null

  const subject = isGuest
    ? `预约已确认：${data.eventTitle} · ${formatDate(data.startTime, data.guestTimezone)}`
    : `新预约：${data.guestName} · ${formatDate(data.startTime, data.hostTimezone)}`

  const primaryTimezone = isGuest ? data.guestTimezone : data.hostTimezone
  const secondaryTimezone = isGuest ? data.hostTimezone : data.guestTimezone
  const showSecondary = primaryTimezone !== secondaryTimezone

  const detailUrl = `${data.appUrl}/booking/${data.bookingId}`

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:#0f1115;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <div style="padding:20px 22px;border-bottom:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">${isGuest ? '预约已确认' : '新的预约'}</p>
      <h1 style="margin:6px 0 0;font-size:18px;line-height:1.4;font-weight:600;">${eventTitle}</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#4b5563;">${
        isGuest ? `与 ${hostName}` : `访客：${guestName}`
      }</p>
    </div>

    <div style="padding:20px 22px;">
      <p style="margin:0 0 4px;font-size:11.5px;color:#9ca3af;">${esc(primaryTimezone)}</p>
      <p style="margin:0;font-size:16px;font-weight:600;">${formatDate(data.startTime, primaryTimezone)}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#4b5563;font-variant-numeric:tabular-nums;">${formatRange(data, primaryTimezone)}</p>

      ${
        showSecondary
          ? `<div style="margin-top:14px;padding:10px 12px;background:#f9fafb;border-radius:8px;">
        <p style="margin:0 0 2px;font-size:11.5px;color:#9ca3af;">${esc(secondaryTimezone)}</p>
        <p style="margin:0;font-size:13px;color:#4b5563;font-variant-numeric:tabular-nums;">${formatDate(data.startTime, secondaryTimezone)} ${formatRange(data, secondaryTimezone)}</p>
      </div>`
          : ''
      }

      <table style="width:100%;margin-top:18px;border-top:1px solid #e5e7eb;font-size:13px;" cellpadding="0" cellspacing="0">
        <tr><td style="padding-top:12px;color:#9ca3af;width:64px;">姓名</td><td style="padding-top:12px;">${guestName}</td></tr>
        <tr><td style="padding-top:6px;color:#9ca3af;">邮箱</td><td style="padding-top:6px;">${guestEmail}</td></tr>
        <tr><td style="padding-top:6px;color:#9ca3af;">时长</td><td style="padding-top:6px;">${data.duration} 分钟</td></tr>
      </table>

      ${
        notes
          ? `<div style="margin-top:16px;padding:10px 12px;background:#f9fafb;border-radius:8px;">
        <p style="margin:0 0 3px;font-size:11.5px;color:#9ca3af;">访客留言</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#4b5563;white-space:pre-wrap;">${notes}</p>
      </div>`
          : ''
      }

      <a href="${detailUrl}" style="display:block;margin-top:20px;padding:11px 0;background:#2b54d4;color:#ffffff;text-align:center;text-decoration:none;border-radius:8px;font-size:13.5px;font-weight:500;">查看预约详情</a>

      <p style="margin:16px 0 0;font-size:11.5px;line-height:1.7;color:#9ca3af;">
        附件是日历文件，点开可以一键加进手机或电脑日历。
      </p>
    </div>
  </div>

  <p style="max-width:520px;margin:14px auto 0;text-align:center;font-size:11px;color:#9ca3af;">
    这封邮件由预约系统自动发出
  </p>
</body>
</html>`

  return { subject, html }
}
