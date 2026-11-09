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

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  })
}

/** 登录用：只在服务端调用，绝不把 password 字段传到客户端 */
export async function getUserByEmailForAuth(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}
