import { prisma } from '@/lib/db'

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      timezone: true,
      image: true,
    },
  })
}

/** 后台设置页用：不带 password，避免哈希被传到客户端组件 */
export async function getUserProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      timezone: true,
      createdAt: true,
    },
  })
}

/** 登录用：只在服务端调用，绝不把 password 字段传到客户端 */
export async function getUserByEmailForAuth(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}
