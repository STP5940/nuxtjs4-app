// server/middleware/auth.ts

import { jwtDecode, JwtPayload } from 'jwt-decode';
import { getCookie, deleteCookie } from 'h3';

// กำหนดรายการ API ที่ไม่ต้องตรวจสอบสิทธิ์ (ส่วนใหญ่จะเป็น Authentication endpoint)
const PUBLIC_API_PREFIXES = ['/api/v1/auth/login', '/api/v1/auth/refresh'];

export default defineEventHandler(async (event) => {
    const getCurrentUrl = () => getRequestURL(event).href;

    // ตรวจสอบว่าเป็นการเรียกใช้งานจากฝั่ง Client หรือไม่
    // ถ้าเป็น Client ให้ข้ามการตรวจสอบสิทธิ์นี้ไป
    if (!import.meta.client) {
        return;
    }

    // Optional: ถ้าเป็น API ที่อนุญาตให้เข้าถึงโดยไม่ต้องมี Token ให้ผ่านไป
    if (PUBLIC_API_PREFIXES.some(prefix => event.path.startsWith(prefix))) {
        return;
    }

    // ดึง Access Token จาก Cookie
    const accessToken = getCookie(event, 'access_token');

    try {
        if (accessToken) {
            // อ่านค่า Token และถอดรหัส
            const accessTokenDecode: JwtPayload = jwtDecode(accessToken);
            const currentTime = Date.now() / 1000;

            if (accessTokenDecode.exp && accessTokenDecode.exp < currentTime) {
                // ตรวจสอบว่า Token หมดอายุหรือไม่
                // และถ้าหมดอายุ, ให้ลบ Cookie และให้คืนสถานะ Unauthorized
                deleteCookie(event, 'access_token');
                setResponseStatus(event, 401);
                return {
                    error: true,
                    url: getCurrentUrl(),
                    statusCode: 401,
                    statusMessage: 'Unauthorized',
                    message: 'Unauthorized: Token expired',
                };
            }
        } else {
            // ถ้าไม่มี Token ให้คืนสถานะ Unauthorized
            setResponseStatus(event, 401);
            return {
                error: true,
                url: getCurrentUrl(),
                statusCode: 401,
                statusMessage: 'Unauthorized',
                message: 'Unauthorized: No token provided',
            };
        }
    } catch (error: unknown) {
        // ถ้าเกิดข้อผิดพลาดในการถอดรหัส Token
        // ให้ลบ Cookie และให้คืนสถานะ Unauthorized
        deleteCookie(event, 'access_token');
        setResponseStatus(event, 401);
        return {
            error: true,
            url: getCurrentUrl(),
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Unauthorized: Invalid token',
        };
    }
});