import type { AvatarProps } from '@nuxt/ui'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 1. กำหนด Type สำหรับข้อมูลผู้ใช้ (User Object Type)
// *** ควรตรงกับโครงสร้างข้อมูลที่ Backend ส่งกลับมา ***
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: AvatarProps | null;
}

interface UserResponse {
  error: boolean;
  message: string;
  data: User;
}

// Type ของ Store State ทั้งหมด
// interface AuthState {
//   token: string | null; // JWT จะเป็น string หรือ null
//   user: User | null; // User object หรือ null
//   isAuthenticated: boolean;
// }

export const useAuthStore = defineStore('auth', () => {
  // สถานะ (State) - กำหนด Type ให้กับ ref()
  const token = ref<string | null>(null)
  const user = ref<User | null>(null) // ใช้ Type ที่กำหนดไว้
  const isAuthenticated = ref<boolean>(false)

  // การดำเนินการ (Actions)

  // 1. ตั้งค่า Token หลังจาก Login สำเร็จ
  function setToken(accessToken: string) { // กำหนด Type ให้กับ parameter
    token.value = accessToken
    // Note: การจัดการ Cookie/Storage ควรอยู่ด้านนอก Store หรือใช้ Nuxt Composables ที่เหมาะสม
  }

  // 2. ดึงข้อมูลผู้ใช้
  async function fetchUser(): Promise<void> { // ระบุว่า Action นี้เป็น async และไม่คืนค่า
    if (!token.value) {
      user.value = null
      isAuthenticated.value = false
      return
    }

    try {
      // ใช้ $fetch ใน Nuxt เพื่อเรียก API และกำหนด Response Type เป็น User
      const response = await $fetch<UserResponse>('/api/v1/user/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}` // ส่ง token ใน Header
        }
      })

      user.value = response.data
      isAuthenticated.value = true
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      logout()
    }
  }

  // 3. Logout
  function logout() {
    token.value = null
    user.value = null
    isAuthenticated.value = false
    // Note: ควรลบ token ออกจาก Cookie/Storage ในขั้นตอนนี้
  }

  return { token, user, isAuthenticated, setToken, fetchUser, logout }
}, {
  // persist: true,
  persist: {
    storage: sessionStorage,
    pick: ['token', 'user', 'isAuthenticated'],
  },
})