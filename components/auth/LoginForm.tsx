'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { loginAction } from '@/lib/actions/auth'
import type { ActionResult } from '@/lib/actions/types'

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState<
    ActionResult<null> | null,
    FormData
  >(loginAction, null)

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined
  const formError = state && !state.ok ? state.error : undefined

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ''} />

      <div className="space-y-1.5">
        <Label htmlFor="email" required>
          邮箱
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="demo@example.com"
          aria-invalid={fieldErrors?.email ? true : undefined}
          aria-describedby={fieldErrors?.email ? 'email-error' : undefined}
        />
        {fieldErrors?.email ? (
          <p id="email-error" className="text-[12px] text-danger">
            {fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" required>
          密码
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="至少 8 位"
          aria-invalid={fieldErrors?.password ? true : undefined}
          aria-describedby={fieldErrors?.password ? 'password-error' : undefined}
        />
        {fieldErrors?.password ? (
          <p id="password-error" className="text-[12px] text-danger">
            {fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      {formError ? (
        <div
          role="alert"
          className="rounded-field border border-danger-line bg-danger-soft px-3 py-2 text-[13px] text-danger"
        >
          {formError}
        </div>
      ) : null}

      <Button type="submit" className="w-full" size="lg" loading={pending}>
        {pending ? '登录中' : '登录'}
      </Button>
    </form>
  )
}
