// server/api/v1/auth/refresh.post.ts

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { useErrorHandler } from '~~/server/composables/useErrorHandler';
import { generateTokens, decodeRefreshToken } from '~~/server/utils/token';
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

        // กำหนด refresh token ใน cookie
        setCookie(event, 'refresh_token', refreshToken, {
            httpOnly: false, // ⚠️ ให้ JavaScript อ่านได้
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        })

        // กำหนด access token ใน cookie
        setCookie(event, 'access_token', accessToken, {
            httpOnly: false, // ⚠️ ให้ JavaScript อ่านได้
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // ⭐ แนะนำ: ป้องกัน CSRF + UX ดี
            maxAge: 1 * 60,  // 15 minutes
        })

        return responseSuccess({
            refreshToken: refreshToken,
            accessToken: accessToken,
        }, 'Tokens refreshed successfully')
    } catch (error: unknown) {
        handleAndThrow(error);
    }
})