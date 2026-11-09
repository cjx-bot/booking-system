# 工程约定

> 对应任务：T0.2
> 所有 agent 开工前必须先读完本文件。违反约定的 PR 直接打回，不讨论。

## 1. 技术栈（已冻结）

| 层 | 选型 | 锁定版本 | 说明 |
|---|---|---|---|
| 框架 | Next.js App Router | `16.4.5` | 根级 `app/`，不用 `src/` |
| UI | React | `19.3.1` | Server Component 优先 |
| 语言 | TypeScript | `5.9.3` | strict + noUncheckedIndexedAccess |
| 样式 | Tailwind CSS | `4.3.5` | 无 `tailwind.config.js`，令牌写在 `app/globals.css` 的 `@theme` |
| 数据库 | PostgreSQL + Prisma | `7.10.1` | **必须锁版本**，见下方警告 |
| 校验 | Zod | `4.x` | 契约唯一来源 |
| 认证 | Auth.js (next-auth) | `5.0.0-beta.32` | **必须用 `next-auth@beta`** |
| 邮件 | Resend | `6.x` | 只在服务端调用 |

### 版本陷阱（照抄手册会踩的三个坑）

2026-11-09 实测 npm dist-tag：

1. `pnpm add prisma` 装到的是 **8.0.0-rc.33**。Prisma 8 是 RC，不读 `schema.prisma`，**没有 `migrate dev` / `db push` / `generate` 命令**，查询 API 也换了（`db.orm.public.User.where()`）。
   → 必须写死 `prisma@7.10.1` 和 `@prisma/client@7.10.1`。
2. `pnpm add next-auth` 装到的是 **4.24.15**（v4），不是手册要的 v5。
   → 必须写 `next-auth@beta`。
3. `pnpm add typescript` 装到的是 **7.0.2**（原生移植版）。Next 16.4 能跑，但 ESLint 插件生态尚未全跟上。
   → 本期锁 `typescript@5.9.3`，等 Wave 4 再评估升级。

## 2. 目录职责

```
app/                     路由与页面组装。只做「取数 → 传参 → 渲染」
  (路由)/page.tsx        页面
  layout.tsx             布局
  globals.css            设计令牌 + 基础样式
components/
  ui/                    原子组件：无业务语义、无数据请求、可被任何页面复用
  marketing/             营销页专用区块
  booking/               预约流程专用组件
  dashboard/             后台专用组件
lib/
  db/                    Prisma Client 单例（全局唯一连接）
  queries/               只读查询函数。第一参数永远是 userId / username
  actions/               Server Action（写操作）。唯一写入口
  schemas/               Zod 契约 + 推断类型
  utils/                 纯函数工具（时间、时区、格式化、cn）
prisma/
  schema.prisma          数据模型（冻结后改要走契约变更流程）
  migrations/            迁移文件，只增不改
  seed.ts                幂等种子数据
docs/                    PRD / 页面清单 / 术语表 / 本文件
```

## 3. 依赖方向（单向，不许反向）

```
app/  ──→  components/  ──→  lib/
 │                              ↑
 └──────────────────────────────┘
```

硬规则：

- `lib/` **禁止** import 任何来自 `components/` 或 `app/` 的东西。
- `components/ui/` **禁止** import 业务代码（`lib/queries`、`lib/actions`、其他业务组件）。
- `components/*/` 业务组件**可以** import `components/ui/`，**不可以** import `app/`。
- `lib/queries/` **禁止** import `lib/actions/`；反向也禁止。
- 任何地方都**禁止**用相对路径跨两级以上（`../../..`），一律用 `@/` 别名。

违反的后果是循环依赖。`pnpm build` 不会报错，但会在运行时出现 `undefined is not a function`。

## 4. 命名

| 对象 | 规则 | 例 |
|---|---|---|
| 文件（组件） | PascalCase | `EventTypeCard.tsx` |
| 文件（非组件） | kebab-case | `event-type.ts`、`timezone.ts` |
| 组件 | PascalCase，默认导出 | `export default function EventTypeCard()` |
| 函数 | camelCase，动词开头 | `getEventTypesByUser`、`createBooking` |
| 查询函数 | `get*` / `list*` | `getBookingById` |
| 写操作 | 动词原形 | `createBooking`、`cancelBooking` |
| Zod schema | camelCase + `Schema` 后缀 | `createBookingSchema` |
| 推断类型 | PascalCase + `Input` 后缀 | `CreateBookingInput` |
| 布尔值 | `is` / `has` / `can` 前缀 | `isActive`、`hasConflict` |
| 常量 | SCREAMING_SNAKE | `MAX_BOOKING_DAYS_AHEAD` |
| 数据库列 | camelCase（Prisma 默认），加 `@@map` 时才用 snake_case | `startTime` |

**禁止**：`data`、`item`、`res`、`obj`、`temp` 作为变量名（回调参数 `_` 除外）。`data` 只允许出现在解构和第三方 API 返回值里。

## 5. 写操作的统一形状

```ts
'use server'

export async function createBooking(
  input: unknown,
): Promise<ActionResult<Booking>> {
  // 1. 校验（必须第一步）
  const parsed = createBookingSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: '参数不合法',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  // 2. 鉴权（由调用层或本函数内 auth() 完成，二者选一，不许两处都做）
  // 3. 业务校验
  // 4. 写库
  // 5. revalidatePath
}
```

返回类型定义在 `lib/actions/types.ts`：

```ts
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
```

**所有 action 都不许抛异常给客户端。** 唯一例外是 `redirect()` 和 `notFound()`（Next 用异常实现控制流，必须让它穿透）。

## 6. 时间处理

- 数据库列一律 `DateTime`（映射 `timestamptz`），存 UTC。
- 时区字段只存 IANA 名（`Asia/Shanghai`），**禁止**存 `+08:00`。
- 换算一律走 `lib/utils/timezone.ts`，禁止在组件里手写 `new Date(x + 8 * 3600 * 1000)`。
- 面向用户展示的时间必须带时区标注，不允许出现「2026-11-10 10:00」这种无时区文本。

## 7. 提交信息

格式：`type(scope): 一句话`

| type | 含义 |
|---|---|
| `feat` | 新功能 |
| `fix` | 修 bug |
| `chore` | 配置、依赖、脚本 |
| `docs` | 只改文档 |
| `refactor` | 重构，行为不变 |
| `test` | 只加测试 |

`scope` 用任务模块名：`infra`、`data`、`auth`、`marketing`、`algo`、`booking`、`dashboard`、`notify`、`ci`。

例：`feat(algo): 实现按 buffer 扩张的时段生成`

**禁止**：`update`、`修改`、`fix bug`、`wip` 这类无信息量的信息。

## 8. 提交前自检（本地必跑）

```bash
pnpm typecheck && pnpm lint && pnpm build
```

三条全绿才能提交。CI 会再跑一遍，红则阻断合并。

## 9. 文件所有权

见手册第 05 节。一句话：**只能写自己任务卡里列出的目录，别人的目录只读。**
需要改别人的文件 → 提 issue，不要「顺手改一下」。
