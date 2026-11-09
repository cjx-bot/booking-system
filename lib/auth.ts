import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { loginSchema } from '@/lib/schemas/auth'

/**
 * Auth.js v5 配置。
 *
 * 为什么用 JWT session 而不是 database session：
 * Credentials Provider 官方只支持 JWT——密码校验发生在 authorize 里，
 * 此时还没有 session 记录可写。换成 OAuth 时再考虑切回 database。
 *
 * 为什么这版没挂 PrismaAdapter：
 * 纯 Credentials 登录不需要 adapter，手动查 User 表就够。
 * Adapter 的作用是给 OAuth 存 account、给 database session 存 session，
 * 这两个能力本期都用不到。Account / Session 表先留着，加 OAuth 时再接。
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            timezone: true,
            password: true,
          },
        })

        if (!user?.password) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          timezone: user.timezone,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // 首次登录时把业务字段塞进 token，后续请求不再查库
      if (user) {
        token.id = user.id
        token.username = user.username
        token.timezone = user.timezone
      }
      return token
    },
    session({ session, token }) {
      if (typeof token.id === 'string') session.user.id = token.id
      if (typeof token.username === 'string') session.user.username = token.username
      session.user.timezone =
        typeof token.timezone === 'string' ? token.timezone : 'Asia/Shanghai'
      return session
    },
  },
})
