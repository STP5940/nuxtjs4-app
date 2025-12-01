// server/api/v1/users.delete.ts

import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    const userId = getRouterParam(event, 'id');
    console.log(userId);
    return {
        api: 'delete users',
    }
})