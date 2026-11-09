# 页面清单

> 对应任务：T0.1
> 共 10 个路由，不多不少。新增路由必须先改本文件并广播。

## 路由总表

| # | 路由 | 用途 | 渲染方式 | 需登录 | 数据来源 | 负责 Agent |
|---|---|---|---|---|---|---|
| 1 | `/` | 营销首页 | SSG | 否 | 静态文案 | Agent-Marketing |
| 2 | `/pricing` | 定价页 | SSG | 否 | 静态文案 | Agent-Marketing |
| 3 | `/[username]` | 个人主页：列出其可预约事件 | ISR（revalidate 300s） | 否 | `User`、`EventType` | Agent-Booking |
| 4 | `/[username]/[slug]` | 预约页：选日 → 选时段 → 填表 | SSR（dynamic） | 否 | `EventType`、`Availability`、`Booking`、时段算法 | Agent-Booking |
| 5 | `/booking/[id]` | 预约成功 / 详情页 | SSR（dynamic，no-store） | 否（凭 ID） | `Booking`、`EventType`、`User` | Agent-Booking |
| 6 | `/login` | 登录 | CSR | 否 | 无 | Agent-Auth |
| 7 | `/dashboard` | 后台概览 | CSR | 是 | `Booking` 聚合 | Agent-Dashboard |
| 8 | `/dashboard/event-types` | 事件类型管理 | CSR | 是 | `EventType` | Agent-Dashboard |
| 9 | `/dashboard/availability` | 可用时间 | CSR | 是 | `Availability` | Agent-Dashboard |
| 10 | `/dashboard/bookings` | 预约列表 | CSR | 是 | `Booking` | Agent-Dashboard |

---

## 渲染方式的实现口径

手册给了一条判断规则（公开且稳定 = ISR/SSG；公开但要实时时段 = SSR；登录后交互 = CSR）。落到 Next.js 16 App Router 上，这三种"方式"的实现口径如下——**列名沿用手册，实现照此表**：

| 标称 | App Router 里的写法 | 缓存行为 |
|---|---|---|
| SSG | 无动态 API 的 Server Component，默认静态 | `next build` 时生成，永不重验 |
| ISR | Server Component + `export const revalidate = 300` | 首次访问生成，5 分钟后后台重验 |
| SSR | Server Component + `export const dynamic = 'force-dynamic'` | 每次请求都重新渲染 |
| CSR | Server Component 外壳（做鉴权重定向）+ `'use client'` 子树（TanStack Query 取数） | 数据在浏览器侧拉取 |

**为什么后台标 CSR 但不是纯客户端**：鉴权必须在服务端做（`auth()` 读 session 后 `redirect('/login')`），否则会闪一下未授权内容。所以是"服务端守门 + 客户端交互"，不是把整页丢给浏览器。

---

## 每个路由的边界

### 1. `/` 营销首页

- 区块：导航 / Hero（一句话价值 + 主 CTA「免费开始」）/ 三张功能卡 / 一张预约页截图式预览 / 页脚
- CTA 指向 `/login`
- 不含真实数据，不查库
- 边界：不做轮播、不做视频、不引入动画库

### 2. `/pricing`

- 两档：Free（1 个事件类型）/ Pro（无限事件类型）
- 价格写死在前端常量，不查库、不接支付
- 边界：不做"月付年付切换"，不做优惠码

### 3. `/[username]`

- 展示主理人头像、姓名、简介 + 事件类型卡片列表（标题、时长、描述、CTA）
- `isActive = false` 的事件不展示
- 无可用事件时展示空状态
- 边界：不做搜索、不做筛选、不做排序

### 4. `/[username]/[slug]`

- 两栏（桌面）：左侧事件信息与主理人，右侧日历 + 时段按钮
- 移动端单栏，信息在上
- 状态机：`选日期 → 选时段 → 填表 → 提交中 → 成功跳转`
- 时段列表为空时展示"这天没有可约时间"，不是空白
- 边界：不做"多时区并排显示"，只显示访客时区（确认页才给双时区）

### 5. `/booking/[id]`

- 展示预约详情；`status=cancelled` 时顶部显示已取消横幅
- 边界：不做访客自助改期（本期只有取消，且取消入口在邮件里）

### 6. `/login`

- 本期只做一种方式：邮箱 + 密码（走 Auth.js Credentials Provider）
- 不做注册页——账号由种子数据创建，或后台创建
- 边界：不做 OAuth、不做魔法链接、不做验证码

### 7-10. `/dashboard/*`

- 统一外壳：左侧导航（概览 / 事件类型 / 可用时间 / 预约）+ 顶部当前用户名与登出
- 概览：未来 7 天预约数、总预约数、最忙的事件类型
- 事件类型：表格 + 新建/编辑抽屉
- 可用时间：7 行（周日→周六），每行可加多个时间段，右下角统一保存
- 预约列表：筛选 + 分页 + 取消操作
- 边界：不做图表、不做导出、不做批量操作

---

## 全局布局

| 布局文件 | 覆盖路由 | 内容 |
|---|---|---|
| `app/layout.tsx` | 全部 | `<html lang="zh-CN">`、字体、全局 CSS |
| `app/(marketing)/layout.tsx` | 1、2 | 顶部导航 + 页脚（本期先用 `app/layout.tsx` 内条件渲染，路由分组留到 v2） |
| `app/dashboard/layout.tsx` | 7-10 | 侧边导航 + 鉴权守门 |

> 注：路由分组 `(marketing)` 会改变目录结构但**不改变 URL**。本期为了 wave 并行简单，营销页导航写在各自页面里，不抽布局。v2 再分组。

---

## 404 / 错误边界

| 文件 | 作用 |
|---|---|
| `app/not-found.tsx` | 全局 404（username / slug / booking 不存在都走这里） |
| `app/error.tsx` | 全局错误兜底（客户端组件） |
| `app/dashboard/error.tsx` | 后台错误兜底，避免整站白屏 |
