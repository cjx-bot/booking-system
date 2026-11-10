/**
 * 企业版落地页文案。
 *
 * 一条纪律：只写系统真实具备的能力。
 * cal.com/enterprise 讲 SSO、SCIM、审计日志——我们没有，就不写。
 * 企业客户真正会问的四件事其实是：会不会重、会不会被绕过、数据归谁、出问题找谁。
 * 这四条我们答得上，就够了。
 */

export const ENT_HERO = {
  eyebrow: '企业版',
  /** 两行各 9 字。52px 下每行约 468px，稳定落在容器内不溢出 */
  title: ['一个团队怎么排期，', '不该十个人各说各话'],
  /** 36 字，在 46ch 宽度里正好落成两行 18 字，断点在冒号处 */
  lead: '每个成员一条链接，规则统一由你定：多长、留多久缓冲、提前多久才能约。',
  primary: { label: '预约一次方案沟通', href: '/demo/30min' },
  secondary: { label: '看看后台长什么样', href: '/login' },
  /** Hero 下方横排的四条硬指标 */
  proofs: [
    '并发提交只成一个',
    '后端二次校验，绕过界面也拦得住',
    '数据在你自己的库里',
    '取消要验归属',
  ],
} as const

export const ENT_OUTCOMES = {
  title: '已经在用它的几种团队',
  note: '下面三个数字是产品指标，不是客户案例——我们还没攒到愿意署名的企业客户。',
  items: [
    {
      metric: '3',
      unit: '条链接',
      headline: '替代一轮邮件',
      body: '初谈、方案、复盘各一条，客户按阶段自己选，不用你先问「这次聊多久」。',
    },
    {
      metric: '0',
      unit: '次重复',
      headline: '两个人抢不到同一个时段',
      body: '防重靠数据库唯一约束，不是先查后写。并发下只有一个能落库，另一个立刻提示换时间。',
    },
    {
      metric: '1',
      unit: '个时区',
      headline: '客户永远看到自己的时间',
      body: '内部统一存 UTC，展示按访客所在时区换算。确认页和邮件里两个时区并排列出。',
    },
  ],
} as const

export const ENT_AUDIENCES = {
  label: '适合这些团队',
  items: ['咨询公司', '设计工作室', '律所', '私立诊所', '培训机构', '猎头团队'],
} as const

export const ENT_CAPABILITIES = {
  eyebrow: '团队怎么用',
  /** 数组 = 在逗号处断行。让 balance 自己断会断在「不/写在」之间 */
  title: ['规则写在系统里，', '不写在某个人脑子里'],
  lead: '人一多，最容易出错的不是排期本身，是「谁的时间按什么规则开放」。这些规则集中在一处配置，新人进来照做就行。',
  items: [
    {
      title: '一人一条链接，规则统一',
      body: '每个成员有自己的公开页，但可用时间、时长档位、缓冲间隔由同一套配置决定。换人不用重新教一遍。',
      icon: 'link',
    },
    {
      title: '按阶段拆会议类型',
      body: '初谈 30 分钟、方案 60 分钟、复盘 15 分钟各自独立。客户按所处阶段选，不用你在邮件里解释。',
      icon: 'grid',
    },
    {
      title: '缓冲间隔强制生效',
      body: '两场之间自动留空，上一场拖堂不会撞到下一场。前缓冲和后缓冲可以分别设，按会议类型不同而不同。',
      icon: 'clock',
    },
    {
      title: '跨时区不出错',
      body: '客户在纽约、团队在上海，他看到的是他自己的时间。确认邮件里两个时区并排，谁都不会记错。',
      icon: 'globe',
    },
  ],
} as const

export const ENT_SCALE = {
  eyebrow: '系统的边界',
  title: '不吹规模，只说清它算得准什么',
  lead: '这些数字是当前版本的取值，写在配置里、可在代码中调整。知道边界，比听「弹性扩容」有用。',
  metrics: [
    { value: '15', unit: '分钟', label: '最小时段粒度', note: '再细没有意义，人的会议不会按 5 分钟排' },
    { value: '14', unit: '天', label: '可约窗口', note: '看得到太远只会让改期变多' },
    { value: '60', unit: '分钟', label: '最短提前量', note: '防止「十分钟后见」这种不可能的要求' },
    { value: '1', unit: '个库', label: '数据归属', note: '标准 SQL 库，随时导出，不锁死' },
  ],
} as const

export const ENT_ASSURANCE = {
  eyebrow: '出问题之前',
  title: '四条防线，都是写在代码里的',
  lead: '企业采购最怕的不是功能少，是「说得好听但没验证」。下面四条都可以当场复现。',
  items: [
    {
      title: '并发提交只成一个',
      body: '唯一约束绑在「人 + 时刻」上，两个请求同时进来，数据库只认一个。另一个拿到冲突提示，不是系统错误。',
    },
    {
      title: '绕过界面也约不上',
      body: '时段是否可约由后端重新算一遍，不看前端传什么。直接构造请求提交一个不存在的时间，会被拒绝。',
    },
    {
      title: '取消要验归属',
      body: '只能取消自己名下的预约。拿别人的编号来取消，返回的是「不存在」，不泄露这条预约是否存在。',
    },
    {
      title: '数据随时能带走',
      body: '没有专有格式，没有导出次数限制。库在你自己的服务器上，换系统时不需要求人。',
    },
  ],
} as const

export const ENT_FAQ = {
  eyebrow: '采购会问的',
  title: '先把边界说清楚',
  items: [
    {
      id: 'sso',
      question: '支持 SAML SSO 或者 SCIM 吗？',
      answer:
        '不支持，也不打算做。这套系统的目标是 5 到 50 人的团队：成员各有独立链接，不需要统一身份源。真要做 SSO，说明规模已经超出它的设计范围，换工具更划算。',
    },
    {
      id: 'multi-user',
      question: '几个人能共用一个链接吗？',
      answer:
        '不能。现在的模型是「一人一条链接、一套自己的可用时间」。多人轮询分配（比如销售团队轮流接单）不在当前版本里。',
    },
    {
      id: 'api',
      question: '有 API 吗？能不能对接我们自己的系统？',
      answer:
        '目前没有公开 API。但数据是标准 SQL 表结构，读预约数据直接查库即可，不需要经过我们。',
    },
    {
      id: 'whitelabel',
      question: '能换成我们自己的品牌吗？',
      answer:
        '可以。页面文案、品牌名、配色都集中在设计令牌和文案文件里，改一处全站生效，不需要逐页替换。',
    },
    {
      id: 'hosting',
      question: '部署在哪里？数据出境吗？',
      answer:
        '部署位置由你决定。本地一台机器就能跑，也可以放在自己的云主机上。数据库是文件级的，备份就是一个文件。',
    },
    {
      id: 'support',
      question: '出问题找谁？',
      answer:
        '直接联系对接人。没有工单系统，也没有分级 SLA——这套系统的复杂度还不到需要那套流程的程度。',
    },
  ],
} as const

export const ENT_CTA = {
  title: '先约一次，看它适不适合你们',
  lead: '三十分钟，聊清楚你们团队现在怎么排期、卡在哪。不合适我会直接说，不占你时间。',
  primary: { label: '预约一次讨论', href: '/demo/30min' },
  secondary: { label: '自己先试试', href: '/login' },
  footnote: '不需要留电话，也不用填公司规模',
} as const

/** 页脚列（企业版比首页多一列「合规」） */
export const ENT_FOOTER_COLUMNS = [
  {
    title: '产品',
    links: [
      { label: '个人版', href: '/' },
      { label: '企业版', href: '/enterprise' },
      { label: '定价', href: '/pricing' },
    ],
  },
  {
    title: '试用',
    links: [
      { label: '演示预约页', href: '/demo/30min' },
      { label: '后台登录', href: '/login' },
      { label: '组件预览', href: '/design-system' },
    ],
  },
  {
    title: '说明',
    links: [
      { label: '常见问题', href: '#faq' },
      { label: '保障与边界', href: '#assurance' },
      { label: '系统取值', href: '#scale' },
    ],
  },
] as const
