// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  logLevel: 'silent',

  modules: [
    // '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@prisma/nuxt',
    'nuxt-security'
  ],

  // เพิ่มการตั้งค่าสำหรับโมดูล @prisma/nuxt ตรงนี้
  prisma: {
    // คุณสามารถใช้ skipPrompts: true แทนได้เช่นกัน
    skipPrompts: true, 
  },

  vite: {
    build: {
      sourcemap: false      // ปิด sourcemap ถ้าไม่ต้องการใช้งาน
    }
  },

  security: {
    // การตั้งค่าพื้นฐาน
    // ปิด security headers ในโหมด development
    headers: {
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
        ? 'require-corp'
        : false,

      crossOriginOpenerPolicy: process.env.NODE_ENV === 'production'
        ? 'same-origin'
        : false,

      crossOriginResourcePolicy: process.env.NODE_ENV === 'production'
        ? 'same-origin'
        : false,

      contentSecurityPolicy: {
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'frame-src': ["'self'"], // สำคัญสำหรับ DevTools
        'img-src': ["'self'", 'data:', 'https:'],
        'object-src': ["'none'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])
        ],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
      },
    },

    rateLimiter: {
      tokensPerInterval: 1000,  // จำนวน request ที่อนุญาต
      interval: 60000,         // ช่วงเวลา (มิลลิวินาที) - 60000 = 1 นาที
      throwError: true,        // โยน error เมื่อเกิน limit
    }
  },

  // ตั้งค่า Rate Limiting เฉพาะ API routes
  routeRules: {
    '/api/**': {
      security: {
        rateLimiter: {
          tokensPerInterval: 100,  // จำนวน request ที่อนุญาต
          interval: 60000,        // ช่วงเวลา (มิลลิวินาที) - 60000 = 1 นาที
          throwError: true        // โยน error เมื่อเกิน limit
        }
      }
    },
  }

})