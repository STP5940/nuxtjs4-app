// server/composables/useResponseHandler.ts
import type { H3Event } from 'h3';

/**
 * ฟังก์ชันสำหรับจัดการการตอบสนอง (response) ในแอปพลิเคชัน
 * @param event - H3Event ที่ใช้ในการดึง URL ปัจจุบัน
 * @returns ฟังก์ชันสำหรับสร้างการตอบสนองที่ประสบความสำเร็จ
 */
export function useResponseHandler(event: H3Event) {
    const getCurrentUrl = () => getRequestURL(event).href;

    const success = <T = any>(data: T, message?: string) => {
        return {
            error: false,
            url: getCurrentUrl(),
            statusCode: 200,
            statusMessage: 'OK',
            message: message || 'Success',
            data
        };
    };

    const created = <T = any>(data: T, message?: string) => {
        return {
            error: false,
            url: getCurrentUrl(),
            statusCode: 201,
            statusMessage: 'Created',
            message: message || 'Resource created successfully',
            data
        };
    };

    const unauthorized = (message: string, statusCode: number = 401) => {
        setResponseStatus(event, statusCode);
        return {
            error: true,
            url: getCurrentUrl(),
            statusCode: statusCode,
            statusMessage: 'Unauthorized',
            message: message || 'Unauthorized access',
        };
    }

    // หรือจะใช้ชื่ออื่นๆ ที่สื่อความหมาย
    const responseSuccess = success; // alias
    const responseCreated = created; // alias
    const responseUnauthorized = unauthorized; // alias

    return {
        responseSuccess,
        responseCreated,
        responseUnauthorized,
    };
}