// server/api/v1/users.get.ts

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    const { responseSuccess } = useResponseHandler(event);

    const users = await prisma.users.findMany({
        omit: {
            password: true
        }
    })

    return responseSuccess({
        usersCount: users?.length || 0,
        users: users
    }, 'Users retrieved successfully')
})