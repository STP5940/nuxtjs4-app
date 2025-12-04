import { jwtDecode, type JwtPayload } from 'jwt-decode'

// import { refreshAccessToken } from '~/middleware/auth'

export default defineNuxtRouteMiddleware(async () => {
  const refreshToken = useCookie('refresh_token');
  const accessToken = useCookie('access_token');

  // ถ้ามี refresh token และยังไม่หมดอายุ ให้ redirect ไปที่หน้าแรก
  if (refreshToken.value) {
    try {
      const decoded: JwtPayload = jwtDecode(refreshToken.value)
      const currentTime = Math.floor(Date.now() / 1000)

      if (decoded.exp && decoded.exp > currentTime) {
        // refresh token ยังไม่หมดอายุ ให้ลอง refresh access token ใหม่
        // const refreshSuccess = await refreshAccessToken();

        // if (refreshSuccess) {
        // ถ้า refresh สำเร็จ ให้ไปที่หน้าแรก
        return navigateTo("/");
        // }

        // ถ้า refresh ไม่สำเร็จ ให้ลบ token ทั้งหมด
        // accessToken.value = null;
        // refreshToken.value = null;
      }
    } catch (error) {
      // ถ้า decode ไม่สำเร็จ (token ไม่ถูกต้อง) ให้ปล่อยผ่าน
      // เพื่อให้ผู้ใช้สามารถเข้าสู่หน้า login ได้ตามปกติ
      console.error('❌ Invalid refresh token on guest page')
    }
  }
})