// server/api/v1/auth/refresh.post.ts

import {
    generateRefreshToken, generateAccessToken, decodeRefreshToken, setAccessTokenCookie,
    setRefreshTokenCookie, getRefreshTokenMaxAge, type RefreshTokenPayload, hashToken
} from '~~/server/utils/token';
import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { useErrorHandler } from '~~/server/composables/useErrorHandler';
import { randomRoles } from '~~/constants/roles'
import prisma from '~~/lib/prisma'

import { getRequestIP, getHeader, getCookie, deleteCookie } from 'h3';
import { z } from 'zod';

const tokenRequestSchema = z.object({
    grantType: z.literal(['refresh_token', 'access_token']),
    // refreshToken: z.string().min(1, "Refresh token is required")
});

export default defineEventHandler(async (event) => {
    const { handleAndThrow } = useErrorHandler();
    const { responseSuccess } = useResponseHandler(event);

    const ipAddress = getRequestIP(event, { xForwardedFor: true });
    const userAgent = getHeader(event, 'user-agent');
    const refreshToken = getCookie(event, 'refresh_token');

    if (!refreshToken) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
            message: 'Invalid refresh token'
        });
    }

    try {
        /** 
         * เริ่มต้น การตรวจสอบทั่วไปสำหรับทั้งสองกรณี 
         * Start of common validation for both cases
         */
        const body = await readBody(event)
        const validatedData = tokenRequestSchema.parse(body)

        const refreshPayload: RefreshTokenPayload | null = decodeRefreshToken(refreshToken);

        // ตรวจสอบว่า payload ที่ถอดรหัสได้ถูกต้องหรือไม่
        if (!refreshPayload) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: 'Invalid refresh token'
            });
        }

        // ค้นหา Token ในฐานข้อมูลและตรวจสอบว่าถูก Revoke หรือไม่
        const dbRefreshToken = await prisma.refreshToken.findUnique({
            where: {
                jti: refreshPayload.jti,
                revoked: false
            }
        });

        // ไม่พบ Token หรือถูก Revoke แล้ว
        if (!dbRefreshToken) {
            deleteCookie(event, 'access_token');
            deleteCookie(event, 'refresh_token');
            throw createError({
                statusCode: 403,
                statusMessage: "Forbidden",
                message: 'Refresh token is invalid or has been revoked'
            });
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const dbExpiresIn: number = dbRefreshToken.expiresIn;

        // ตรวจสอบว่า Token หมดอายุหรือไม่
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
                id: String(refreshPayload.sub)
            }
        })

        // ไม่พบผู้ใช้
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
        /** 
         * สิ้นสุด การตรวจสอบทั่วไปสำหรับทั้งสองกรณี 
         * End of common validation for both cases
         */


        // 1. คำขอ Refresh Token ใหม่
        if (validatedData.grantType === 'refresh_token') {


            // สร้าง Refresh Token ใหม่
            const { refreshToken, refreshTokenId } = generateRefreshToken(
                transformedUser.id
            );

            // สร้าง Access Token ใหม่
            const { accessToken } = await generateAccessToken(
                transformedUser.id,
                transformedUser.role,
                refreshTokenId
            );

            // เพิกถอน Token เก่า
            await prisma.refreshToken.update({
                where: {
                    jti: refreshPayload.jti
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
                    token: hashToken(refreshToken),
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
                // refreshToken: refreshToken,
                accessToken: accessToken,
            }, 'Tokens refreshed successfully')
        }

        // 2. คำขอ Access Token ใหม่
        if (validatedData.grantType === 'access_token') {

            const { accessToken } = await generateAccessToken(
                transformedUser.id,
                transformedUser.role,
                refreshPayload.jti
            );

            // กำหนด Token Cookies ให้ accessToken 
            setAccessTokenCookie(event, accessToken)

            return responseSuccess({
                accessToken: accessToken,
            }, 'Access token refreshed successfully')
        }

        // หาก grant_type ไม่ตรงกับเงื่อนไขใดๆ
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: 'Invalid grant_type: access_token or refresh_token'
        });
    } catch (error: unknown) {
        handleAndThrow(error);
    }
})