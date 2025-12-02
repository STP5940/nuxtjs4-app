// app/middleware/auth.ts

// import { jwtDecode, JwtPayload } from 'jwt-decode';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

// ฟังก์ชันสำหรับขอ Access Token ใหม่
async function refreshAccessToken() {
    const refreshToken = useCookie('refresh_token');
    const accessToken = useCookie('access_token');

    if (!refreshToken.value) {
        console.log("No refresh token available.");
        accessToken.value = null;
        return navigateTo('/login');
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

        if (newAccessToken) {
            accessToken.value = newAccessToken;
            refreshToken.value = newRefreshToken;
            console.log("Access Token has been refreshed.");
            return true; // สำเร็จ
        }
        return false;
    } catch (refreshError) {
        console.error("Could not refresh token:", refreshError);

        // ถ้า refresh ไม่สำเร็จ ให้ลบ token ทั้งหมดและไปหน้า login
        accessToken.value = null;
        refreshToken.value = null;
        return navigateTo('/login');
    }
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log("This is my global middleware!");
    const accessToken = useCookie('access_token');
    const refreshToken = useCookie('refresh_token');

    try {
        // ถ้ามี refresh token ให้ตรวจสอบต่อ
        if (typeof refreshToken.value === 'string') {

            // ถ้ามี access token ให้ตรวจสอบต่อ
            if (typeof accessToken.value === 'string') {

                // อ่านค่า Token และถอดรหัส
                const accessTokenDecode: JwtPayload = jwtDecode(accessToken.value);
                const currentTime = Date.now() / 1000;

                // ถ้า access token หมดอายุ ให้ลองขอ Access Token ใหม่
                if (accessTokenDecode.exp && accessTokenDecode.exp < currentTime) {
                    console.log("Access Token expired");
                    await refreshAccessToken();
                }

                // ถ้า access token ยังไม่หมดอายุ ให้ผ่านไป
                return;
            } else {
                // ถ้ามี Refresh token ให้ลองขอ Access Token ใหม่
                await refreshAccessToken();
            }
        } else {
            // ถ้าไม่มี refresh token ให้ลบ token ทั้งหมดและไปหน้า login
            accessToken.value = null;
            refreshToken.value = null;
            return navigateTo('/login');
        }
    } catch (accessError) {
        accessToken.value = null;
        refreshToken.value = null;
        return navigateTo('/login');
    }
})
