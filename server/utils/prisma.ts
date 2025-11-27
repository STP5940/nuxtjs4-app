import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient(/* { log: ['query', 'error', 'warn'] } */)
}

declare global {
    // use a less common name to avoid collisions with other global declarations
    var __prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.__prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma