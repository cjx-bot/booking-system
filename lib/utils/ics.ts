/** 生成 .ics 日历附件。手写而不是引库：格式就这几行，引库反而要处理它的各种选项。 */

function toIcsTime(instant: Date): string {
  return `${instant.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
}

/** RFC 5545 的文本转义：反斜杠、分号、逗号、换行 */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

const encoder = new TextEncoder()

/**
 * 每行不得超过 75 **字节**（不是字符），超出要折行，续行以空格开头。
 * 中文一个字 3 字节，按字符数折行会在 26 个字左右就超限——
 * Outlook 和部分安卓日历会截断或拒收超长行的 .ics。
 * 折行不能从多字节字符中间切，所以逐字符累加字节数。
 */
function foldLine(line: string): string {
  if (encoder.encode(line).length <= 75) return line

  const parts: string[] = []
  let current = ''

  for (const char of line) {
    if (encoder.encode(current + char).length > 75) {
      parts.push(current)
      current = char
    } else {
      current += char
    }
  }

  if (current !== '') parts.push(current)

  return parts.join('\r\n ')
}

export function buildIcs(args: {
  uid: string
  start: Date
  end: Date
  summary: string
  description?: string
  location?: string
  organizerName?: string
  organizerEmail?: string
  attendeeName?: string
  attendeeEmail?: string
}): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Booking System//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${args.uid}@booking`,
    `DTSTAMP:${toIcsTime(new Date())}`,
    `DTSTART:${toIcsTime(args.start)}`,
    `DTEND:${toIcsTime(args.end)}`,
    `SUMMARY:${escapeIcsText(args.summary)}`,
  ]

  if (args.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(args.description)}`)
  }
  if (args.location) {
    lines.push(`LOCATION:${escapeIcsText(args.location)}`)
  }
  if (args.organizerEmail) {
    const name = args.organizerName ? `;CN=${escapeIcsText(args.organizerName)}` : ''
    lines.push(`ORGANIZER${name}:mailto:${args.organizerEmail}`)
  }
  if (args.attendeeEmail) {
    const name = args.attendeeName ? `;CN=${escapeIcsText(args.attendeeName)}` : ''
    lines.push(
      `ATTENDEE${name};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${args.attendeeEmail}`,
    )
  }

  lines.push('STATUS:CONFIRMED', 'SEQUENCE:0', 'END:VEVENT', 'END:VCALENDAR')

  return lines.map(foldLine).join('\r\n')
}
