import { jwtDecode, type JwtPayload } from 'jwt-decode'

import { callRefreshToken } from '~/middleware/auth'

export default defineNuxtRouteMiddleware(async () => {
  const refreshToken = useCookie('refresh_token');
  const accessToken = useCookie('access_token');

  try {

    if (accessToken.value) {
      const accessTokenDecode: JwtPayload = jwtDecode(accessToken.value)
      const currentTime = Math.floor(Date.now() / 1000)

      if (accessTokenDecode.exp) {
        // ถ้า access token หมดอายุ ให้ลอง refresh access token ใหม่
        if (accessTokenDecode.exp > currentTime) {
          return navigateTo("/");
        }

        // ถ้า access token ยังไม่หมดอายุ ให้ไปหน้าแรก
        if (accessTokenDecode.exp < currentTime) {
          const refreshSuccess = await callRefreshToken('access_token');
          if (refreshSuccess) {
            return navigateTo("/");
          }
        }
      }
    }

    if (refreshToken.value) {
      const refreshTokenDecode: JwtPayload = jwtDecode(refreshToken.value)
      const currentTime = Math.floor(Date.now() / 1000)

      if (refreshTokenDecode.exp) {
        // ถ้า refresh token ยังไม่หมดอายุ ให้ไปหน้าแรก
        if (refreshTokenDecode.exp > currentTime) {
          return navigateTo("/");
        }

        // ถ้า refresh token หมดอายุ ให้ล้าง cookie ทั้งหมด
        if (refreshTokenDecode.exp < currentTime) {
          const refreshSuccess = await callRefreshToken('access_token');
          if (refreshSuccess) {
            return navigateTo("/");
          }
        }
      }
    }

    return;
  } catch (error) {
    console.error('❌ Invalid refresh token on guest page')
  }
})