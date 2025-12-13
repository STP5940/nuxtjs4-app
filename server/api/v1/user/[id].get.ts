// server/api/v1/users.get.ts

import type { AvatarProps } from '@nuxt/ui'

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { randomRoles } from '~~/constants/roles'
import prisma from '~~/lib/prisma'
import { decodeAccessToken } from '~~/server/utils/token';

export default defineEventHandler(async (event) => {
    // เพิ่ม responseUnauthorized เข้ามา
    const { responseSuccess, responseUnauthorized } = useResponseHandler(event);

    const userId = getRouterParam(event, 'id');

    const accessToken = getCookie(event, 'access_token');

    // ตรวจสอบว่ามี accessToken หรือไม่
    if (!accessToken) {
        return responseUnauthorized('No token provided');
    }

    const userPayload = decodeAccessToken(accessToken);

    if (userId === 'me') {
        const user = await prisma.users.findFirst({
            where: {
                id: userPayload?.sub
            },
            omit: {
                password: true
            }
        })

        return responseSuccess({ ...user }, 'Users retrieved successfully')
    }

    return responseSuccess({}, 'Users retrieved successfully')
})