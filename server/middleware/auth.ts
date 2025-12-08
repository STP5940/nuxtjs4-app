// server/middleware/auth.ts

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { AccessTokenPayload } from '~~/server/utils/token';
import prisma from '~~/lib/prisma'

import { jwtDecode } from 'jwt-decode';

// กำหนดรายการ API ที่ไม่ต้องตรวจสอบสิทธิ์ (ส่วนใหญ่จะเป็น Authentication endpoint)
const PUBLIC_API_PREFIXES = ['/api/v1/auth/login', '/api/v1/auth/logout', '/api/v1/auth/refresh'];

export default defineEventHandler(async (event) => {
    const { responseUnauthorized } = useResponseHandler(event);

    const path = event.path;

    // ถ้าไม่ใช่ API ให้ข้ามการตรวจสอบสิทธิ์
    if (!path.startsWith('/api/')) {
        return;
    }

    // ถ้าเป็น API ที่อนุญาตให้เข้าถึงโดยไม่ต้องมี Token ให้ผ่านไป
    if (PUBLIC_API_PREFIXES.some(prefix => path.startsWith(prefix))) {
        return;
    }

    // ดึง Access Token จาก Cookie
    const authorizationHeader = getHeader(event, 'Authorization');

    if (!authorizationHeader) {
        // ถ้าไม่มี header
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: Missing Authorization header',
        });
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        // ตรวจสอบว่ารูปแบบถูกต้องหรือไม่
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: Invalid token format',
        });
    }

    const accessToken = token;

    if (!accessToken) {
        // ถ้าไม่มี Token ให้คืนสถานะ Unauthorized
        return responseUnauthorized('No token provided');
    }

    try {
        // อ่านค่า Token และถอดรหัส
        const accessTokenDecode: AccessTokenPayload = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (accessTokenDecode.exp && accessTokenDecode.exp < currentTime) {
            // ตรวจสอบว่า Token ถ้าหมดอายุให้คืนสถานะ Unauthorized
            return responseUnauthorized('Token expired');
        }

        // ค้นหา Token ในฐานข้อมูลและตรวจสอบว่าถูก Revoke หรือไม่
        const dbRefreshToken = await prisma.refreshToken.findUnique({
            where: {
                jti: String(accessTokenDecode?.rtid),
                revoked: false
            }
        });

        // ไม่พบ Token หรือถูก Revoke แล้ว 
        if (!dbRefreshToken) {
            return responseUnauthorized('Refresh token is invalid or has been revoked', 403);
            // throw createError({
            //     statusCode: 403,
            //     statusMessage: "Forbidden",
            //     message: 'Refresh token is invalid or has been revoked'
            // });
        }
    } catch (error: unknown) {
        // เกิดข้อผิดพลาด ให้คืนสถานะ Unauthorized
        return responseUnauthorized('Invalid token format');
    }
});