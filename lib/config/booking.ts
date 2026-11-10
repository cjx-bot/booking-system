/**
 * 预约相关的业务参数。
 *
 * 之前这些数字散在三个文件里（action / 查询层 / 算法默认值），
 * 改一处忘一处就会出现「界面说 14 天、后端放到 60 天」这种契约不一致。
 * 现在只有一个来源，文案也从这里派生。
 */

/** 公开页最多展示未来多少天 */
export const BOOKING_WINDOW_DAYS = 14

/**
 * 后端接受预约的最大天数。
 * 刻意与展示窗口保持一致——允许「看不到但能约上」的时段没有意义。
 */
export const MAX_DAYS_AHEAD = BOOKING_WINDOW_DAYS

/** 距离现在至少多久之后才能约（分钟） */
export const LEAD_TIME_MINUTES = 60

/** 候选时段的步进（分钟） */
export const SLOT_INTERVAL_MINUTES = 15

export const MS_PER_DAY = 86_400_000
export const MS_PER_MINUTE = 60_000
