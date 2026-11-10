'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { changePassword, updateProfile } from '@/lib/actions/user'

type Props = {
  email: string
  username: string
  name: string | null
  timezone: string
  createdAt: string
}

export function AccountSettings({ email, username, name, timezone, createdAt }: Props) {
  const router = useRouter()

  // ---- 资料 ----
  const [profilePending, startProfile] = useTransition()
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)

  function handleProfile(formData: FormData) {
    setProfileError(null)
    setProfileSaved(false)

    startProfile(async () => {
      const result = await updateProfile({ name: formData.get('name') })
      if (result.ok) {
        setProfileSaved(true)
        router.refresh()
        return
      }
      setProfileError(result.error)
    })
  }

  // ---- 密码 ----
  const [passwordPending, startPassword] = useTransition()
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [formKey, setFormKey] = useState(0)

  function handlePassword(formData: FormData) {
    setPasswordError(null)
    setPasswordSaved(false)

    startPassword(async () => {
      const result = await changePassword({
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword'),
      })

      if (result.ok) {
        setPasswordSaved(true)
        // 清空表单：key 变了，输入框重建
        setFormKey((value) => value + 1)
        return
      }

      setPasswordError(result.error)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">账号设置</h1>
        <p className="mt-1 text-[13px] text-ink-secondary">
          登录方式和显示名称都在这里改。
        </p>
      </div>

      {/* 只读信息 */}
      <div className="rounded-card border border-line bg-canvas p-5">
        <h2 className="text-[14px] font-semibold tracking-tight">账号</h2>
        <dl className="mt-3 space-y-2 text-[12.5px]">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-muted">登录邮箱</dt>
            <dd className="break-all text-ink">{email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-muted">公开页</dt>
            <dd className="break-all font-mono text-ink-secondary">/{username}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-muted">时区</dt>
            <dd className="text-ink-secondary">{timezone}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-muted">注册时间</dt>
            <dd className="text-ink-secondary">{createdAt}</dd>
          </div>
        </dl>
        <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink-muted">
          邮箱和用户名同时是公开页地址的一部分，暂不支持在这里修改。
          需要换的话告诉我，我帮你改。
        </p>
      </div>

      {/* 显示名称 */}
      <form
        action={handleProfile}
        className="rounded-card border border-line bg-canvas p-5"
      >
        <h2 className="text-[14px] font-semibold tracking-tight">显示名称</h2>
        <p className="mt-1 text-[12.5px] text-ink-secondary">
          出现在公开页和预约邮件里。
        </p>

        <div className="mt-4 max-w-sm space-y-1.5">
          <Label htmlFor="name">名字</Label>
          <Input
            id="name"
            name="name"
            defaultValue={name ?? ''}
            maxLength={40}
            placeholder="比如 林小满"
          />
        </div>

        {profileError ? (
          <p className="mt-3 text-[12px] text-danger">{profileError}</p>
        ) : null}
        {profileSaved ? (
          <p className="mt-3 text-[12px] text-success">已保存</p>
        ) : null}

        <Button type="submit" className="mt-4" loading={profilePending}>
          保存名称
        </Button>
      </form>

      {/* 改密码 */}
      <form
        key={formKey}
        action={handlePassword}
        className="rounded-card border border-line bg-canvas p-5"
      >
        <h2 className="text-[14px] font-semibold tracking-tight">修改密码</h2>
        <p className="mt-1 text-[12.5px] text-ink-secondary">
          改完当前登录不会掉线，下次登录用新密码。
        </p>

        <div className="mt-4 max-w-sm space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" required>
              当前密码
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" required>
              新密码
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="至少 8 位"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" required>
              再输一次新密码
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
        </div>

        {passwordError ? (
          <div
            role="alert"
            className="mt-4 max-w-sm rounded-field border border-danger-line bg-danger-soft px-3 py-2 text-[12.5px] text-danger"
          >
            {passwordError}
          </div>
        ) : null}
        {passwordSaved ? (
          <div
            role="status"
            className="mt-4 max-w-sm rounded-field border border-success-line bg-success-soft px-3 py-2 text-[12.5px] text-success"
          >
            密码已改。下次登录请用新密码。
          </div>
        ) : null}

        <Button type="submit" className="mt-4" loading={passwordPending}>
          改密码
        </Button>
      </form>
    </div>
  )
}
