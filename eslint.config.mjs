import next from 'eslint-config-next'

const config = [
  ...next,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'prisma/migrations/**',
      // Prisma 7 生成的是 .ts 源码，不参与 lint
      'lib/generated/**',
    ],
  },
]

export default config
