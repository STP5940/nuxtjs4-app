// ~~/server/composables/useResponseHandler.ts
export function useResponseHandler(event: any) {
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

    // หรือจะใช้ชื่ออื่นๆ ที่สื่อความหมาย
    // const ok = success; // alias
    // const createdResponse = created; // alias

    return {
        success,
        created,
    };
}