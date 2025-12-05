// server/api/v1/auth/login.post.ts

import { decodeRefreshToken, type RefreshTokenPayload } from '~~/server/utils/token';
import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { useErrorHandler } from '~~/server/composables/useErrorHandler';

import { defineEventHandler, getCookie, deleteCookie } from 'h3';
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    const { handleAndThrow } = useErrorHandler();
    const { responseSuccess } = useResponseHandler(event);

    const refreshToken = getCookie(event, 'refresh_token');

    if (!refreshToken) {
        return responseSuccess(null, 'Already logged out');
    }

    const payload: RefreshTokenPayload | null = decodeRefreshToken(refreshToken);

    if (!payload) {
        deleteCookie(event, 'access_token');
        deleteCookie(event, 'refresh_token');
        return responseSuccess(null, 'Already logged out');
    }

    try {
        const { count } = await prisma.refreshToken.updateMany({
            where: {
                jti: String(payload.jti),
                userId: String(payload.sub),
                revoked: false
            },
            data: {
                revoked: true
            }
        });

        // ลบ cookies ต่อเมื่อมีการ update record ใน DB เท่านั้น (count > 0)
        if (count > 0) {
            deleteCookie(event, 'access_token');
            deleteCookie(event, 'refresh_token');
            return responseSuccess(null, 'Logged out successfully');
        }

        return responseSuccess(null, 'Already logged out');
    } catch (error: unknown) {
        // หากเกิดข้อผิดพลาดอื่นๆ ที่ไม่ใช่การหา token ไม่เจอ
        // ให้ลบ cookie ออกเพื่อความปลอดภัย
        deleteCookie(event, 'access_token');
        deleteCookie(event, 'refresh_token');
        handleAndThrow(error);
    }
});