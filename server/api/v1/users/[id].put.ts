// server/api/v1/users.put.ts

import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'id');
    console.log(userId);
    return {
        api: 'update users',
    }
})