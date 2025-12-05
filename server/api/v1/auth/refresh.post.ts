// server/api/v1/auth/refresh.post.ts

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { useErrorHandler } from '~~/server/composables/useErrorHandler';
import { generateTokens, decodeRefreshToken, setTokenCookies, getRefreshTokenMaxAge, type RefreshTokenPayload } from '~~/server/utils/token';
import { randomRoles } from '~~/constants/roles'
import prisma from '~~/lib/prisma'

import { getRequestIP, getHeader } from 'h3';
import { z } from 'zod';

const userSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required")
});

export default defineEventHandler(async (event) => {
    const { handleAndThrow } = useErrorHandler();
    const { responseSuccess } = useResponseHandler(event);

    const ipAddress = getRequestIP(event, { xForwardedFor: true });
    const userAgent = getHeader(event, 'user-agent');

    try {
        const body = await readBody(event)
        const validatedData = userSchema.parse(body)

        const payload: RefreshTokenPayload | null = decodeRefreshToken(validatedData.refreshToken)

        if (!payload) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: 'Invalid refresh token'
            });
        }

        // ค้นหา Token ในฐานข้อมูลและตรวจสอบว่าถูก Revoke หรือไม่
        const dbRefreshToken = await prisma.refreshToken.findUnique({
            where: {
                jti: payload.jti,
                revoked: false
            }
        });

        if (!dbRefreshToken) {
            // ไม่พบ Token หรือถูก Revoke แล้ว
            throw createError({
                statusCode: 403,
                statusMessage: "Forbidden",
                message: 'Refresh token is invalid or has been revoked'
            });
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const dbExpiresIn: number = dbRefreshToken.expiresIn;

        // console.log('dbExpiresIn: ', dbExpiresIn);
        // console.log('currentTime: ', currentTime);


        if (dbExpiresIn && dbExpiresIn < currentTime) {
            // ตรวจสอบว่า Token ถ้าหมดอายุให้คืนสถานะ Unauthorized
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: 'Refresh token has expired'
            });
        }

        // ค้นหาผู้ใช้จาก userId ใน token
        const findingUser = await prisma.users.findUnique({
            where: {
                id: String(payload.userId)
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

        // เพิกถอน Token เก่า
        await prisma.refreshToken.update({
            where: {
                jti: payload.jti
            },
            data: {
                revoked: true
            }
        });

        const REFRESH_TOKEN_MAX_AGE_MS = getRefreshTokenMaxAge();

        // บันทึก Refresh Token ใหม่ลงในฐานข้อมูล
        await prisma.refreshToken.create({
            data: {
                jti: refreshTokenId,
                token: refreshToken,
                userId: transformedUser.id,
                ipAddress: String(ipAddress),
                userAgent: String(userAgent),
                expiresIn: Math.floor((Date.now() + REFRESH_TOKEN_MAX_AGE_MS) / 1000),
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS)
            }
        });

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