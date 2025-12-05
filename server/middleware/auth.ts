// server/middleware/auth.ts

import { jwtDecode, JwtPayload } from 'jwt-decode';
import { getCookie, setResponseStatus } from 'h3';

// กำหนดรายการ API ที่ไม่ต้องตรวจสอบสิทธิ์ (ส่วนใหญ่จะเป็น Authentication endpoint)
const PUBLIC_API_PREFIXES = ['/api/v1/auth/login', '/api/v1/auth/logout', '/api/v1/auth/refresh'];

// Helper function to create the standard unauthorized response object
const createUnauthorizedResponse = (event: any, message: string) => {
    // Set the HTTP status code
    setResponseStatus(event, 401);

    // Get the current URL for the response payload
    const currentUrl = getRequestURL(event).href;

    return {
        error: true,
        url: currentUrl,
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: `Unauthorized: ${message}`,
    };
};

export default defineEventHandler(async (event) => {
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
    const accessToken = getCookie(event, 'access_token');

    if (!accessToken) {
        // ถ้าไม่มี Token ให้คืนสถานะ Unauthorized
        return createUnauthorizedResponse(event, 'No token provided');
    }

    try {
        // อ่านค่า Token และถอดรหัส
        const accessTokenDecode: JwtPayload = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (accessTokenDecode.exp && accessTokenDecode.exp < currentTime) {
            // ตรวจสอบว่า Token ถ้าหมดอายุให้คืนสถานะ Unauthorized
            return createUnauthorizedResponse(event, 'Token expired');
        }
    } catch (error: unknown) {
        // เกิดข้อผิดพลาด ให้คืนสถานะ Unauthorized
        return createUnauthorizedResponse(event, 'Invalid token format');
    }
});