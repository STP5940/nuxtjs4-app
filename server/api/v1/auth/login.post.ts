// server/api/v1/auth/login.post.ts

import { generateTokens, setAccessTokenCookie, setRefreshTokenCookie, getRefreshTokenMaxAge } from '~~/server/utils/token';
import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { useErrorHandler } from '~~/server/composables/useErrorHandler';
import { randomRoles } from '~~/constants/roles'
import { verifyPassword } from '~~/lib/auth';
import prisma from '~~/lib/prisma'

import { getRequestIP, getHeader } from 'h3';
import { z } from 'zod';

const userSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export default defineEventHandler(async (event) => {
    const { handleAndThrow } = useErrorHandler();
    const { responseSuccess } = useResponseHandler(event);

    const ipAddress = getRequestIP(event, { xForwardedFor: true });
    const userAgent = getHeader(event, 'user-agent');

    try {
        const body = await readBody(event)
        const validatedData = userSchema.parse(body)

        // เช็ค username เข้า้สู่ระบบ
        const findingUser = await prisma.users.findFirst({
            where: {
                username: validatedData.username
            }
        });

        if (!findingUser) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: 'username or password is incorrect'
            });
        }

        // ตรวจสอบรหัสผ่าน
        const isValidPassword = await verifyPassword(
            validatedData.password,
            findingUser.password
        );

        if (!isValidPassword) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: 'username or password is incorrect'
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

        const REFRESH_TOKEN_MAX_AGE_MS = getRefreshTokenMaxAge();

        // เพิ่ม RefreshToken ลงในฐานข้อมูล
        await prisma.refreshToken.create({
            data: {
                jti: refreshTokenId,
                token: refreshToken,
                userId: transformedUser.id,
                ipAddress: ipAddress ? String(ipAddress) : null,
                userAgent: userAgent ? String(userAgent) : null,
                expiresIn: Math.floor((Date.now() + REFRESH_TOKEN_MAX_AGE_MS) / 1000),
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS)
            }
        });

        // กำหนด Token Cookies ให้ accessToken และ refreshToken
        setAccessTokenCookie(event, accessToken)
        setRefreshTokenCookie(event, refreshToken)

        return responseSuccess({
            user: transformedUser
        }, 'User logged in successfully')
    } catch (error: unknown) {
        handleAndThrow(error);
    }
})