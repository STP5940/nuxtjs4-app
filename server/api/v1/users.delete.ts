// server/api/v1/users.delete.ts

import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    return {
        api: 'delete users',
    }
})