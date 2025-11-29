// server/middleware/auth.ts

import { jwtDecode, JwtPayload } from 'jwt-decode';
import { defineEventHandler, getCookie, deleteCookie } from 'h3';

// กำหนดรายการ API ที่ไม่ต้องตรวจสอบสิทธิ์ (ส่วนใหญ่จะเป็น Authentication endpoint)
const PUBLIC_API_PREFIXES = ['/api/auth/login', '/api/auth/register'];

export default defineEventHandler(async (event) => {
    const getCurrentUrl = () => getRequestURL(event).href;

    // 💡 ขั้นตอนที่ 1: ตรวจสอบ Path
    const path = event.path;

    // ตรวจสอบว่า Path ไม่ได้ขึ้นต้นด้วย '/api/'
    // ถ้าไม่ใช่งาน API, ให้หยุดการทำงานของ Middleware นี้ทันที
    if (!path.startsWith('/api/')) {
        return;
    }

    // Optional: ถ้าเป็น API ที่อนุญาตให้เข้าถึงโดยไม่ต้องมี Token ให้ผ่านไป
    if (PUBLIC_API_PREFIXES.some(prefix => path.startsWith(prefix))) {
        return;
    }

    // 💡 ขั้นตอนที่ 2: รันตรรกะการตรวจสอบสิทธิ์ (เฉพาะเมื่อเป็น API)
    const token = getCookie(event, 'authToken');

    // console.log("Auhten", token);
    // console.log(event.path);

    try {
        if (token) {
            // อ่านค่า Token และถอดรหัส
            const decodedToken: JwtPayload = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp && decodedToken.exp < currentTime) {
                // ตรวจสอบว่า Token หมดอายุหรือไม่
                // และถ้าหมดอายุ, ให้ลบ Cookie และให้คืนสถานะ Unauthorized
                deleteCookie(event, 'authToken');
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
            // By pass this part to allow public API access
            // setResponseStatus(event, 401);
            // return {
            //     error: true,
            //     url: getCurrentUrl(),
            //     statusCode: 401,
            //     statusMessage: 'Unauthorized',
            //     message: 'Unauthorized: No token provided',
            // };
        }
    } catch (error: unknown) {
        // ถ้าเกิดข้อผิดพลาดในการถอดรหัส Token
        // ให้ลบ Cookie และให้คืนสถานะ Unauthorized
        deleteCookie(event, 'authToken');
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