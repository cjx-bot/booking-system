/**
 * 首页文案。集中放这里，区块组件只负责排版。
 *
 * 一条纪律：这里写的每一句都必须是产品真实具备的能力。
 * 首页结构照 cal.com，但内容不能照抄——它讲团队排班，我们讲一个人怎么少发十条微信。
 */

export const NAV_ITEMS = [
  { label: '怎么用', href: '#how' },
  { label: '能力', href: '#capabilities' },
  { label: '谁在用', href: '#stories' },
  { label: '常见问题', href: '#faq' },
  { label: '定价', href: '/pricing' },
] as const

export const HERO = {
  eyebrow: '给独立职业者的预约工具',
  /** 两行，第二行是重点。字数按中文节奏控制在 7 + 8 */
  title: ['把约时间这件事', '压缩成一个链接'],
  lead: '客户点开就能看到你什么时候有空，自己挑一个。不用再一句句确认「周三下午行不行」。',
  primaryCta: { label: '免费开始', href: '/login' },
  secondaryCta: { label: '打开演示页', href: '/demo' },
  /** 客户 logo 行。没有真实企业客户，就写真实的使用场景——不编 logo。 */
  audienceLabel: '正在被这些人在用',
  audiences: [
    '私教工作室',
    '独立设计师',
    '咨询顾问',
    '语言教室',
    '摄影工作室',
  ],
} as const

export const PROBLEM = {
  eyebrow: '为什么需要它',
  /** 数组 = 两段，桌面在逗号处断，移动端自然折行 */
  title: ['约一次会，', '来回发了十一封邮件'],
  lead: '四个人、三个时区、十一封邮件，最后还是没定下来。问题不在沟通意愿，在于「什么时候有空」这件事没有唯一的答案来源。',
  steps: [
    {
      index: '01',
      title: '你在邮件里报时间',
      body: '「周四上午可以，但十点之后。」对方回：「十点是我这边凌晨三点。」',
    },
    {
      index: '02',
      title: '改成发一个链接',
      body: '链接里只有你真的能到场的时间，其他的根本不显示。',
    },
    {
      index: '03',
      title: '他自己选一个',
      body: '选完就落进日历，双方各收一封确认邮件，不需要再回一句「好的」。',
    },
  ],
  /** 右侧邮件流示意用的假数据 */
  inbox: [
    { from: '客户', time: '09:14', text: '这周能约半小时吗？' },
    { from: '你', time: '09:52', text: '周四上午可以。' },
    { from: '客户', time: '11:03', text: '周四十点？' },
    { from: '你', time: '13:40', text: '十点是我这边凌晨三点。' },
    { from: '客户', time: '16:22', text: '那下午呢？我这周在里斯本。' },
    { from: '你', time: '次日 10:17', text: '下周一行吗？' },
  ],
  /** 底部数据条：按真实往返轮次估算，不编造客户成果 */
  stat: {
    value: '11 封',
    label: '一次跨时区约会的平均往返邮件数',
    note: '换成一条链接后，这个数字是 0。',
  },
} as const

export const CAPABILITIES = {
  eyebrow: '它具体做什么',
  title: '一个人也够用的一套排期',
  lead: '没有团队排班、没有表单路由、没有自动提醒。只把「什么时候能约」这件事做对。',
  items: [
    {
      title: '预约链接',
      body: '发一个地址出去，谁点开都能约。链接里只显示你设过的时段。',
      icon: 'link',
    },
    {
      title: '周可用时间',
      body: '按星期设起止，一天可以拆成上午下午两段。设完立刻生效。',
      icon: 'calendar',
    },
    {
      title: '时段生成',
      body: '按你的时长和间隔算出的真实可约时间，已经排掉的不会再出现。',
      icon: 'grid',
    },
    {
      title: '缓冲间隔',
      body: '两场之间自动留空，上一场拖堂不会撞到下一场。前后可分别设。',
      icon: 'clock',
    },
    {
      title: '确认邮件',
      body: '预约成功立刻发信，带日历附件，点一下进手机日历。',
      icon: 'mail',
    },
    {
      title: '时区换算',
      body: '客户在纽约、你在上海，他看到的是他自己的时间，两边都不会约错。',
      icon: 'globe',
    },
  ],
} as const

export const TOOLS = {
  eyebrow: '不用换工具',
  title: ['它只负责挑时间，', '见面在哪还是你说了算'],
  lead: '不需要把客户从微信里拽出来，也不用改掉现在的沟通习惯。链接发过去，剩下的照旧。',
  /** 12 个格子，对应 cal.com 的集成墙。这里是使用场景，不是技术集成。 */
  items: [
    '微信',
    '企业微信',
    '飞书',
    '钉钉',
    '邮件',
    'Notion',
    '腾讯会议',
    'Zoom',
    '日程表',
    '系统日历',
    '名片二维码',
    '个人主页',
  ],
} as const

export const STORIES = {
  eyebrow: '实际用起来',
  title: '一个人的排期，长什么样',
  lead: '下面三个数字是按「每周 8 场、每场来回 4 轮」估出来的，不是客户案例——我们还没攒到愿意署名的客户。',
  primary: {
    title: '一周省下的沟通时间',
    metrics: [
      { value: '8 场', label: '每周典型预约量' },
      { value: '0 封', label: '确认时间的往返邮件' },
      { value: '约 2 小时', label: '每周少花的沟通时间' },
    ],
    note: '按每场 4 轮往返、每轮 4 分钟估算。',
  },
  secondary: [
    {
      title: '客户不用注册',
      body: '填名字和邮箱就能约。没有账号、没有验证码、没有下载。',
    },
    {
      title: '数据在你自己手里',
      body: '库是你的，导出随时能做。没有第三方账号体系卡在中间。',
    },
    {
      title: '约错会当场被挡',
      body: '两个人同时点同一时段，数据库只认一个，另一个立刻提示换时间。',
    },
  ],
} as const

export const PRINCIPLES = {
  eyebrow: '设计上的取舍',
  title: '有些东西是故意没做的',
  lead: '做一个「什么都能干」的排期系统很容易，难的是砍到只剩必要的。下面三条是我们主动放弃的。',
  items: [
    {
      quote:
        '没有支付。收钱要先想清楚退款、对账、发票，任何一个没想明白，都比不做更糟。',
      source: '支付',
    },
    {
      quote:
        '没有日历双向同步。OAuth 授权、增量同步、webhook 续订，工作量超过整个系统本身。',
      source: '同步',
    },
    {
      quote:
        '没有团队排班。目标用户是一个人干活，轮询分配在他的场景里全是空转。',
      source: '排班',
    },
  ],
} as const

export const FAQ = {
  eyebrow: '常见问题',
  title: '你可能想问的',
  items: [
    {
      id: 'guest-account',
      question: '客户需要注册账号吗？',
      answer:
        '不需要。访客只填姓名和邮箱就能约，不建账号、不发验证码。预约成功后凭链接可以回来看详情。',
    },
    {
      id: 'timezone',
      question: '客户在国外，时间会不会约错？',
      answer:
        '不会。系统内部统一按 UTC 存时间，展示时按访客所在时区换算。确认页和邮件里会把你和客户两个时区并排列出来。',
    },
    {
      id: 'double-booking',
      question: '两个人同时约同一个时段怎么办？',
      answer:
        '只有一个人能约上。防重复靠数据库的唯一约束，不是靠先查一遍再写——后者在并发下必然会漏。没约上的人会立刻看到「刚被约走」。',
    },
    {
      id: 'cancel',
      question: '客户临时不来，能取消吗？',
      answer:
        '可以。你在后台能取消，取消后时间立刻释放，别人又能约了。已经在进行的预约不能取消。',
    },
    {
      id: 'buffer',
      question: '两场之间能留出休息时间吗？',
      answer:
        '能。每个事件类型可以单独设「之前留空」和「之后留空」，单位是分钟。系统算时段时会把这部分一起排掉。',
    },
    {
      id: 'data',
      question: '我的预约数据能导走吗？',
      answer:
        '库就在你自己手里，标准 SQL 库，导出不限次数。不存在「不续费就锁死数据」这种事。',
    },
  ],
} as const

export const FINAL_CTA = {
  title: ['先把它跑起来，', '再决定要不要长期用'],
  lead: '配置大概十五分钟：建一个事件类型、设一下每周有空的时段、把链接发出去。',
  primary: { label: '免费开始', href: '/login' },
  secondary: { label: '看一个真实页面', href: '/demo' },
  footnote: '不需要信用卡，不收押金',
} as const

export const FOOTER_COLUMNS = [
  {
    title: '产品',
    links: [
      { label: '怎么用', href: '#how' },
      { label: '能力', href: '#capabilities' },
      { label: '定价', href: '/pricing' },
    ],
  },
  {
    title: '试用',
    links: [
      { label: '演示页面', href: '/demo' },
      { label: '登录', href: '/login' },
      { label: '看一个预约', href: '/demo/30min' },
    ],
  },
  {
    title: '说明',
    links: [
      { label: '常见问题', href: '#faq' },
      { label: '设计取舍', href: '#principles' },
      { label: '技术栈', href: '#tools' },
    ],
  },
] as const

export const FOOTER_NOTE = '预约系统 · 一个人也够用的排期工具'
