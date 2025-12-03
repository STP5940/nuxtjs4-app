// app/middleware/auth.ts

import { jwtDecode, type JwtPayload } from 'jwt-decode';

/**
 * ฟังก์ชันสำหรับขอ Access Token ใหม่โดยใช้ Refresh Token
 * @returns {Promise<boolean>} - true ถ้าการ Refresh สำเร็จ, false ถ้าไม่สำเร็จ
 */
async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = useCookie('refresh_token');
    const accessToken = useCookie('access_token');

    if (!refreshToken.value) {
        console.error("No refresh token found for refreshing.");
        return false;
    }

    try {
        const response = await $fetch<{
            error: boolean;
            message: string;
            data: {
                refreshToken: string;
                accessToken: string;
            };
        }>('/api/v1/auth/refresh', {
            method: 'POST',
            body: {
                refreshToken: refreshToken.value
            }
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        if (newAccessToken && newRefreshToken) {
            console.log("✅ Access Token refreshed successfully.");

            // อัปเดตค่า token ใน cookie
            accessToken.value = newAccessToken;
            refreshToken.value = newRefreshToken;
            return true; // สำเร็จ
        }
        return false; // กรณีที่ API ไม่ได้โยน error แต่ไม่มี token ใหม่
    } catch (refreshError) {
        console.error("❌ Could not refresh token. Redirecting to login:", refreshError);

        // ถ้า refresh ไม่สำเร็จ ให้ลบ token ทั้งหมดและไปหน้า login
        accessToken.value = null;
        refreshToken.value = null;
        
        return false;
    }
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    const refreshToken = useCookie('refresh_token');
    const accessToken = useCookie('access_token');

    // ฟังก์ชันช่วยในการล้าง Token และ Redirect ไปหน้า Login
    const redirectToLogin = () => {
        accessToken.value = null;
        refreshToken.value = null;
        return navigateTo('/login');
    };

    try {
        // ถ้าไม่มี refresh token ให้ไปหน้า login
        if (!refreshToken.value) {
            return redirectToLogin();
        }

        // ถ้ามี access token ให้ตรวจสอบต่อ
        if (accessToken.value) {
            const accessTokenDecode: JwtPayload = jwtDecode(accessToken.value);
            const currentTime = Date.now() / 1000;

            // ถ้า access token หมดอายุ ให้ลองขอ Access Token ใหม่
            if (accessTokenDecode.exp && accessTokenDecode.exp < currentTime) {

                // ถ้า Access Token หมดอายุ ให้ลองขอ Access Token ใหม่
                const refreshSuccess = await refreshAccessToken();

                if (!refreshSuccess) {
                    // ถ้า refresh ไม่สำเร็จ
                    return redirectToLogin();
                }
            }

            // ถ้า Access Token ยังไม่หมดอายุ หรือ Refresh สำเร็จแล้ว
            return;
        } else {
            // ให้ลองขอ Access Token ใหม่
            const refreshSuccess = await refreshAccessToken();

            if (!refreshSuccess) {
                // ถ้า refresh ไม่สำเร็จ
                return redirectToLogin();
            }
        }
    } catch (accessError) {
        // ดักจับข้อผิดพลาดทั่วไป (เช่น jwtDecode ล้มเหลว)
        console.error("❌ Authentication process failed:", accessError);
        return redirectToLogin();
    }
})
