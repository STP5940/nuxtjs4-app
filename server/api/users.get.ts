import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    const { success } = useResponseHandler(event);

    const users = await prisma.users.findMany({
        omit: {
            password: true
        }
    })

    return success({ users: users }, 'Users retrieved successfully')
})