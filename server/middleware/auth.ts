// server/middleware/auth.ts

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { AccessTokenPayload } from '~~/server/utils/token';
import prisma from '~~/lib/prisma'

import { jwtDecode } from 'jwt-decode';

// กำหนดรายการ API ที่ไม่ต้องตรวจสอบสิทธิ์ (ส่วนใหญ่จะเป็น Authentication endpoint)
const PUBLIC_API_PREFIXES = [
    '/api/v1/auth/login', '/api/v1/auth/logout', '/api/v1/auth/refresh'
];

export default defineEventHandler(async (event) => {
    const { responseUnauthorized } = useResponseHandler(event);

    const path = event.path;

    // ถ้าไม่ใช่ API ให้ข้ามการตรวจสอบสิทธิ์
    if (!path.startsWith('/api/v1/')) {
        return;
    }

    // ถ้าเป็น API ที่อนุญาตให้เข้าถึงโดยไม่ต้องมี Token ให้ผ่านไป
    if (PUBLIC_API_PREFIXES.some(prefix => path.startsWith(prefix))) {
        return;
    }

    const INVALID_TOKEN_VALUES = ['null', 'undefined'];

    // Extract and validate Bearer token
    const authHeader = getHeader(event, 'Authorization');
    const Bypassexpiredtoken = getHeader(event, 'Bypassexpiredtoken');
    if (!authHeader) {
        return responseUnauthorized('Authorization header is missing', 401);
    }

    const [scheme, accessToken] = authHeader.trim().split(/\s+/);
    if (scheme !== 'Bearer' || !accessToken || INVALID_TOKEN_VALUES.includes(accessToken)) {
        return responseUnauthorized('Invalid or missing token', 401);
    }

    try {
        // อ่านค่า Token และถอดรหัส
        const accessTokenDecode: AccessTokenPayload = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (accessTokenDecode.exp && accessTokenDecode.exp < currentTime && (!Boolean(Bypassexpiredtoken) && process.env.NODE_ENV === 'development')) {
            // ตรวจสอบว่า Token ถ้าหมดอายุให้คืนสถานะ Unauthorized
            return responseUnauthorized('Token expired');
        }

        // ค้นหา Token ในฐานข้อมูลและตรวจสอบว่าถูก Revoke หรือไม่
        const dbRefreshToken = await prisma.refreshtoken.findUnique({
            where: {
                jti: String(accessTokenDecode?.rtid),
                revoked: false
            }
        });

        // ไม่พบ Token หรือถูก Revoke แล้ว 
        if (!dbRefreshToken) {

            deleteCookie(event, 'access_token');
            deleteCookie(event, 'refresh_token');

            return responseUnauthorized('Refresh token is invalid or has been revoked', 403);
        }
    } catch (error: unknown) {
        // เกิดข้อผิดพลาด ให้คืนสถานะ Unauthorized
        return responseUnauthorized('Authentication failed');
    }
});