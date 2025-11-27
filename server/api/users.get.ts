import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    const users = await prisma.users.findMany({
        omit: {
            password: true
        }
    })
    return users
})