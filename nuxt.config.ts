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
    '@vueuse/nuxt',
    'nuxt-security',

    // Development only modules
    ...(process.env.NODE_ENV !== 'production' ? ['@prisma/nuxt'] : []),
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light' // 👈 กำหนดให้ค่าที่ชอบคือ 'system' or 'light' or 'dark'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // เพิ่มการตั้งค่าสำหรับโมดูล @prisma/nuxt ตรงนี้
  // @ts-ignore
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
        ? 'unsafe-none' // require-corp or unsafe-none
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
        'img-src': ["'self'", 'data:', 'blob:', 'https:'],
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
    '/api/v1/auth/login': {
      security: {
        rateLimiter: {
          tokensPerInterval: 10,   // Limit to 10 requests
          interval: 60000,         // per 60 seconds (1 minute)
          throwError: true         // Throw a 429 error when exceeded
        }
      }
    },

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