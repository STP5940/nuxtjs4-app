// server/api/v1/auth/refresh.post.ts

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { useErrorHandler } from '~~/server/composables/useErrorHandler';
import { generateTokens, decodeRefreshToken, setTokenCookies } from '~~/server/utils/token';
import { randomRoles } from '~~/constants/roles'

import prisma from '~~/lib/prisma'
import { z } from 'zod';

const userSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required")
});

export default defineEventHandler(async (event) => {
    const { handleAndThrow } = useErrorHandler();
    const { responseSuccess } = useResponseHandler(event);

    try {
        const body = await readBody(event)
        const validatedData = userSchema.parse(body)

        const payload = decodeRefreshToken(validatedData.refreshToken)

        if (!payload) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: 'Invalid refresh token'
            });
        }

        // ค้นหาผู้ใช้จาก userId ใน token
        const findingUser = await prisma.users.findUnique({
            where: {
                id: payload.userId
            }
        })

        if (!findingUser) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: 'User not found'
            });
        }

        // เอา password ออกก่อนส่ง response
        const { password, ...userWithoutPassword } = findingUser;

        const transformedUser = {
            ...userWithoutPassword,
            role: randomRoles[Math.floor(Math.random() * randomRoles.length)]
        };

        const { accessToken, refreshToken, refreshTokenId } = generateTokens(
            transformedUser.id,
            transformedUser.role
        );

        // กำหนด Token Cookies ให้ accessToken และ refreshToken     
        setTokenCookies(event, accessToken, refreshToken)

        return responseSuccess({
            refreshToken: refreshToken,
            accessToken: accessToken,
        }, 'Tokens refreshed successfully')
    } catch (error: unknown) {
        handleAndThrow(error);
    }
})