# 预约系统

给独立职业者的自助预约工具。发一个链接，客户自己挑时间。

## 跑起来（三步）

```bash
pnpm install
pnpm db:migrate && pnpm db:seed
pnpm dev
```

打开 http://localhost:3000

Windows 上直接双击 **`启动预览.bat`**，会自动起服务并打开浏览器。

**演示账号**：`demo@example.com` / `demo1234`
**演示公开页**：http://localhost:3000/demo

### 为什么项目里带了一个 node.exe

`runtime/node.exe`（87MB）是项目自带的 Node 22 运行时，启动脚本只认它。

原因：`better-sqlite3` 是原生模块，绑定 Node 的 ABI 版本。
本项目依赖是按 **Node 22（ABI 127）** 装的，用系统里的 Node 24（ABI 137）启动会直接报
`NODE_MODULE_VERSION 127 vs 137`，页面 500。

所以：**不要用系统的 `pnpm dev` 启动**，那会挑到 Node 24。
要么双击 `启动预览.bat`，要么显式用 `runtime\node.exe`。

换机器时如果 `runtime/` 没了，从 nodejs.org 下 **v22** 的 Windows 版，把 `node.exe`
放进 `runtime/` 即可（不要用 v24，会 ABI 不匹配）。

## 现在能做什么

| 功能 | 状态 |
|---|---|
| 公开预约链接 `/[用户名]/[项目]` | ✅ 可用 |
| 事件类型增删改（名称、时长、缓冲、启用） | ✅ 可用 |
| 周可用时间设置（每天多段、防重叠） | ✅ 可用 |
| 时段生成（时区 + 夏令时 + buffer + 已占用） | ✅ 40 个单测覆盖 |
| 提交预约（并发防重，靠数据库唯一约束） | ✅ 可用 |
| 预约确认页（双时区并列） | ✅ 可用 |
| 邮件通知（含 .ics 日历附件） | ⚠️ 代码就绪，需配 `RESEND_API_KEY` |
| 管理后台（概览 / 事件类型 / 可用时间 / 预约列表） | ✅ 可用 |
| 营销首页与定价页 | ✅ 可用 |

## 还没做（按计划就该不做）

团队排班、表单路由、自动提醒、支付、日历双向同步、视频会议集成、
对外 API、多语言、组织权限、第三方应用。

这些不是"以后再说"，是 v1 明确的范围外。详见 `docs/PRD.md` 第 4 节，
每条都写了以后要加会动到哪些表。

## 技术栈与版本

```
Next.js 16.4.5 (App Router) + React 19.3.1 + TypeScript 5.9.3
Tailwind CSS 4.3.5（令牌写在 app/globals.css 的 @theme）
Prisma 7.10.1 + SQLite（driver adapter: @prisma/adapter-better-sqlite3）
Auth.js 5.0.0-beta.32（Credentials + JWT session）
Zod 4.6.7
Vitest 4（40 个单测）
```

### 版本必须锁死，别升 latest

2026-11 的 npm dist-tag 有三个坑：

1. `pnpm add prisma` 会装到 **8.0.0-rc**。那个版本不读 `schema.prisma`、没有 `migrate` 命令、查询 API 全换。
2. `pnpm add next-auth` 会装到 **v4**，不是 v5。v5 要写 `next-auth@beta`。
3. `pnpm add typescript` 会装到 **7.0**（原生重写版），ESLint 插件生态还没跟上。

`package.json` 里已锁死，不要改成 `^`。

## 部署到 Netlify

**为什么不能直接部署**：Netlify 的函数文件系统只读、不持久，SQLite 文件存不住。
所以生产必须走 Postgres，本地继续用 SQLite（双击即用不能丢）。

已接好双 schema：

| 环境 | schema 文件 | provider | 切换方式 |
|---|---|---|---|
| 本地 | `prisma/schema.prisma` | sqlite | 默认 |
| 生产 | `prisma/postgres.prisma` | postgresql | `DATABASE_PROVIDER=postgres` |

两份 schema 内容必须一致，**改模型时两个文件一起改**。
`lib/db/index.ts` 按 `DATABASE_URL` 前缀自动选 adapter，不用改代码。

部署步骤：

1. Netlify 导入本仓库，构建配置读 `netlify.toml`（先 generate、再 db push、最后 build）
2. 创建数据库（Netlify DB 或任意 Postgres），拿到连接串
3. 设置环境变量：

   | 变量 | 值 |
   |---|---|
   | `DATABASE_URL` | `postgres://...`（Netlify DB 里复制） |
   | `AUTH_SECRET` | 随机 32 位以上字符串 |
   | `NEXT_PUBLIC_APP_URL` | 部署后的域名，如 `https://xxx.netlify.app` |
   | `NEXT_PUBLIC_SHOW_DEMO_HINT` | **留空**（生产不能印出可用账号） |

4. 首次部署后跑一次种子：`DATABASE_PROVIDER=postgres DATABASE_URL=... pnpm db:seed`

`lib/generated/` 不进版本库——本地按 SQLite 生成、Netlify 按 Postgres 生成，
两边产物不能共用。clone 下来先跑一次 `pnpm db:generate`。

## 目录

```
app/                    路由与页面
  [username]/[slug]/    公开预约页（核心）
  dashboard/            管理后台
  api/auth/             Auth.js 端点
components/
  ui/                   7 个原子组件，无业务语义
  booking/              预约流程组件
  dashboard/            后台组件
lib/
  actions/              Server Action（唯一写入口）
  queries/              只读查询（第一参数永远是 userId/username）
  schemas/              Zod 契约
  utils/slots.ts        时段生成算法（纯函数）
  utils/timezone.ts     时区工具（DST 处理）
  email/                邮件模板与发送
prisma/
  schema.prisma         7 个模型
  seed.ts               幂等种子数据
docs/                   PRD / 页面清单 / 术语表 / 工程约定
```

## 几个关键设计

**防重复预约只靠数据库唯一约束**，不靠应用层「先查后写」。
两个请求同时提交时，只有一个能插入成功，另一个拿到 P2002 并提示"刚被约走"。

**时段算法是纯函数**，不碰数据库、不读系统时间（`now` 由调用方传入）。
所以能对夏令时、跨时区、跨日逐个写测试——这块是系统里唯一"算错了不报错、只会算错"的地方。

**时区只存 IANA 名**，绝不存 `+08:00`。
`Intl` 会把 `+08:00` 当合法时区接受，所以 `isValidTimeZone` 里专门拦了一道。

**服务端按主理人时区生成时段，客户端按访客时区分组显示。**
可约的时刻是客观的，与访客在哪无关；访客时区只影响这些时刻归到哪一天。

## 命令

```bash
pnpm dev            # 开发
pnpm build          # 生产构建
pnpm test           # 单测
pnpm typecheck      # 类型检查
pnpm lint           # ESLint
pnpm db:migrate     # 迁移
pnpm db:seed        # 种子（幂等，可重复跑）
pnpm db:studio      # 可视化看数据
```
