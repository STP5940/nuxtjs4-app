// app/middleware/auth.ts

import { jwtDecode, type JwtPayload } from 'jwt-decode';

/**
 * ฟังก์ชันสำหรับขอ Access Token ใหม่โดยใช้ Refresh Token
 * @returns {Promise<boolean>} - true ถ้าการ Refresh สำเร็จ, false ถ้าไม่สำเร็จ
 */
export async function callRefreshToken(grantType: string = 'access_token'): Promise<boolean> {
    const accessToken = useCookie('access_token');
    const refreshToken = useCookie('refresh_token');

    // ถ้าไม่มี refresh token ให้คืนค่า false ทันที  
    if (!refreshToken.value) {
        console.error("No refresh token found for refreshing.");
        return false;
    }

    try {
        // เรียก API เพื่อขอ Access Token ใหม่
        const response = await $fetch<{
            error: boolean;
            message: string;
            data: {
                refreshToken?: string;
                accessToken: string;
            };
        }>('/api/v1/auth/refresh', {
            method: 'POST',
            body: {
                grantType: grantType,
                refreshToken: refreshToken.value
            }
        });

        // ถ้ามี token ใหม่ที่ได้กลับมา
        if (response.data) {
            return true; // สำเร็จ
        }

        return false; // กรณีที่ API ไม่ได้โยน error แต่ไม่มี token ใหม่
    } catch (refreshError: unknown) {
        const status = (refreshError as any)?.response?.status;

        // refresh token ไม่มีจริงเพราะถูกลบออกไปแล้วจากฐานข้อมูล
        if (typeof status === 'number' && status === 403) {
            console.log("❌ Kill Token: Refresh token is invalid/revoked (403).");
            accessToken.value = null;
            refreshToken.value = null;
            return false;
        }

        // ข้อผิดพลาดทั่วไปในการขอ refresh token
        console.error("❌ Could not refresh token. Redirecting to login");
        return false;
    }
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    const refreshToken = useCookie('refresh_token');
    const accessToken = useCookie('access_token');

    // ฟังก์ชันช่วยในการล้าง Token และ Redirect ไปหน้า Login
    const redirectToLogin = async () => {
        return navigateTo("/login", { external: true });
    };

    try {
        // ถ้าไม่มี refresh token ให้ไปหน้า login
        if (!refreshToken.value) {
            return redirectToLogin();
        }

        // ถ้ามี access token ให้ตรวจสอบต่อ
        if (accessToken.value) {
            const accessTokenDecode: JwtPayload = jwtDecode(accessToken.value);
            const currentTime = Math.floor(Date.now() / 1000);

            // ถ้า access token หมดอายุ ให้ลองขอ Access Token ใหม่
            if (accessTokenDecode.exp && accessTokenDecode.exp < currentTime) {

                // ถ้า Access Token หมดอายุ ให้ลองขอ Access Token ใหม่
                const refreshSuccess = await callRefreshToken('access_token');
                if (!refreshSuccess) {
                    // ถ้า refresh ไม่สำเร็จ
                    return redirectToLogin();
                }
            }
            return;
        } else {
            // ให้ลองขอ Access Token ใหม่
            const refreshSuccess = await callRefreshToken('access_token');
            if (!refreshSuccess) {
                // ถ้า refresh ไม่สำเร็จ
                return redirectToLogin();
            }
            return;
        }
    } catch (accessError) {
        // ดักจับข้อผิดพลาดทั่วไป (เช่น jwtDecode ล้มเหลว)
        console.error("❌ Authentication process failed:", accessError);
        return redirectToLogin();
    }
})
