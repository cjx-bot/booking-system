'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import {
  createEventType,
  deleteEventType,
  updateEventType,
} from '@/lib/actions/event-type'

export type EventTypeRow = {
  id: string
  title: string
  slug: string
  description: string | null
  duration: number
  bufferBefore: number
  bufferAfter: number
  isActive: boolean
}

const DURATIONS = [15, 30, 45, 60, 90, 120]

export function EventTypeManager({ items }: { items: EventTypeRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EventTypeRow | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  // 列表级错误：删除失败时弹窗是关着的，错误必须渲染在页面上
  const [listError, setListError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setErrors({})
    setFormError(null)
    setOpen(true)
  }

  function openEdit(item: EventTypeRow) {
    setEditing(item)
    setErrors({})
    setFormError(null)
    setOpen(true)
  }

  function handleSubmit(formData: FormData) {
    setErrors({})
    setFormError(null)

    const payload = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      description: formData.get('description') || undefined,
      duration: Number(formData.get('duration')),
      bufferBefore: Number(formData.get('bufferBefore') ?? 0),
      bufferAfter: Number(formData.get('bufferAfter') ?? 0),
      isActive: formData.get('isActive') === 'on',
      ...(editing ? { id: editing.id } : {}),
    }

    startTransition(async () => {
      const result = editing
        ? await updateEventType(payload)
        : await createEventType(payload)

      if (result.ok) {
        setOpen(false)
        router.refresh()
        return
      }

      setFormError(result.error)
      if (result.fieldErrors) setErrors(result.fieldErrors)
    })
  }

  function handleDelete(item: EventTypeRow) {
    const confirmed = window.confirm(
      `删除「${item.title}」？这个项目的预约记录也会一起删掉，无法恢复。`,
    )
    if (!confirmed) return

    setListError(null)

    startTransition(async () => {
      const result = await deleteEventType({ id: item.id })
      if (result.ok) {
        router.refresh()
        return
      }
      setListError(result.error)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">事件类型</h1>
          <p className="mt-1 text-[13px] text-ink-secondary">
            每个事件类型就是一个可预约的项目，有自己的链接和时长。
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          新建
        </Button>
      </div>

      {listError ? (
        <div
          role="alert"
          className="rounded-field border border-danger-line bg-danger-soft px-3 py-2 text-[12.5px] text-danger"
        >
          {listError}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-card border border-line bg-canvas p-10 text-center">
          <p className="text-[14px] font-medium">还没有事件类型</p>
          <p className="mt-1.5 text-[13px] text-ink-secondary">
            建一个「30 分钟初谈」，客户就能约你了。
          </p>
          <Button onClick={openCreate} className="mt-4">
            新建第一个
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-card border border-line bg-canvas p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[14px] font-semibold tracking-tight">
                    {item.title}
                  </h2>
                  <Badge tone="neutral">{item.duration} 分钟</Badge>
                  {item.isActive ? (
                    <Badge tone="success">启用中</Badge>
                  ) : (
                    <Badge tone="neutral">已停用</Badge>
                  )}
                </div>

                <p className="mt-1 font-mono text-[11.5px] text-ink-muted">
                  /{item.slug}
                </p>

                {item.description ? (
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-secondary">
                    {item.description}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                  编辑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger-soft"
                  onClick={() => handleDelete(item)}
                  disabled={pending}
                >
                  删除
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '编辑事件类型' : '新建事件类型'}
        description="客户看到的就是这里填的内容。"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" form="event-type-form" loading={pending}>
              保存
            </Button>
          </>
        }
      >
        {/* key 让表单在切换编辑对象时重建：
            Dialog 只切换 open，子元素始终挂载，非受控输入的 dirty 状态会串到下一个项目 */}
        <form
          key={editing?.id ?? 'new'}
          id="event-type-form"
          action={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title" required>
              标题
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={editing?.title ?? ''}
              required
              maxLength={60}
              placeholder="30 分钟初谈"
              aria-invalid={errors.title ? true : undefined}
            />
            {errors.title ? (
              <p className="text-[11.5px] text-danger">{errors.title[0]}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug" required>
              链接短标识
            </Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={editing?.slug ?? ''}
              required
              maxLength={40}
              placeholder="30min"
              aria-invalid={errors.slug ? true : undefined}
              aria-describedby="slug-hint"
            />
            <p id="slug-hint" className="text-[11.5px] text-ink-muted">
              你的公开页地址会是 /用户名/
              <span className="font-mono text-ink-secondary">
                {editing?.slug || '30min'}
              </span>
            </p>
            {errors.slug ? (
              <p className="text-[11.5px] text-danger">{errors.slug[0]}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">描述</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={500}
              defaultValue={editing?.description ?? ''}
              placeholder="这次会面适合聊什么，客户看得到"
              className="w-full resize-y rounded-field border border-line-strong bg-canvas px-3 py-2 text-sm placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="duration" required>
                时长
              </Label>
              <Select
                id="duration"
                name="duration"
                defaultValue={String(editing?.duration ?? 30)}
              >
                {DURATIONS.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute} 分钟
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="isActive">状态</Label>
              <label className="flex h-9 items-center gap-2 rounded-field border border-line-strong px-3 text-[13px]">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  defaultChecked={editing?.isActive ?? true}
                  className="size-3.5 accent-brand"
                />
                启用预约
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bufferBefore">之前留空（分钟）</Label>
              <Input
                id="bufferBefore"
                name="bufferBefore"
                type="number"
                min={0}
                max={120}
                defaultValue={editing?.bufferBefore ?? 0}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bufferAfter">之后留空（分钟）</Label>
              <Input
                id="bufferAfter"
                name="bufferAfter"
                type="number"
                min={0}
                max={120}
                defaultValue={editing?.bufferAfter ?? 0}
              />
            </div>
          </div>

          {formError ? (
            <div
              role="alert"
              className="rounded-field border border-danger-line bg-danger-soft px-3 py-2 text-[12.5px] text-danger"
            >
              {formError}
            </div>
          ) : null}
        </form>
      </Dialog>
    </div>
  )
}
