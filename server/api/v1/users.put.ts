// server/api/v1/users.put.ts

import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    return {
        api: 'update users',
    }
})