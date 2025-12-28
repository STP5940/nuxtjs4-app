// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  logLevel: 'silent',

  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-security',
    '@vite-pwa/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',

    // Development only modules
    ...(process.env.NODE_ENV !== 'production' ? ['@prisma/nuxt'] : []),
  ],

  i18n: {
    // กำหนดภาษาที่รองรับ
    // https://ui.nuxt.com/docs/getting-started/integrations/i18n/nuxt#supported-languages
    locales: [
      {
        code: 'en',
        name: 'English',
        flag: 'twemoji:flag-united-kingdom',
        file: 'en.json', // English language
      },
      {
        code: 'zh-CN',
        name: '简体中文',
        flag: 'twemoji:flag-china',
        file: 'zh_cn.json', // Chinese language
      },
      {
        code: 'ru',
        name: 'Русский',
        flag: 'twemoji:flag-russia',
        file: 'ru.json', // Russian language
      },
      {
        code: 'th',
        name: 'ไทย',
        flag: 'twemoji:flag-thailand',
        file: 'th.json', // Thai language
      },
    ],
    langDir: 'locales',
    defaultLocale: 'th',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  icon: {
    serverBundle: {
      externalizeIconsJson: false, // ตั้งค่าเป็น false เพื่อฝังไอคอนทั้งหมดใน bundle
    }
  },

  pinia: {
    storesDirs: ['app/stores/**'], // กำหนดให้ Pinia สแกนไฟล์ Store ในโฟลเดอร์ stores
  },

  piniaPluginPersistedstate: {
    cookieOptions: {
      sameSite: 'lax',
    },
    storage: 'cookies', // ใช้ cookies แทน localStorage
  },

  pwa: {
    // 1. เปิดใช้งานการสร้าง Manifest (ไฟล์ที่อธิบาย PWA ของคุณ)
    registerType: 'autoUpdate',

    // 2. การตั้งค่าไฟล์ Manifest (สำคัญสำหรับข้อมูลการติดตั้ง)
    manifest: {
      name: 'Nuxt4 Application', // ชื่อที่จะแสดงเมื่อติดตั้ง
      short_name: 'Nuxt4 App', // ชื่อย่อสำหรับหน้าจอหลัก
      description: 'Nuxt4JS Full Stack Application',
      theme_color: '#ffffff', // สีของแถบเครื่องมือ/เบราว์เซอร์
      background_color: '#ffffff', // สีพื้นหลังระหว่างการโหลด
      display: 'standalone', // โหมดการแสดงผล (standalone, fullscreen, minimal-ui, browser)
      start_url: '/login', // URL เริ่มต้นเมื่อเปิดแอปจากไอคอน
      icons: [
        // เพิ่มไอคอนแอปพลิเคชัน (จำเป็น)
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable', // สำหรับ Android ที่ต้องการไอคอน Maskable
        },
      ],
    },

    // การตั้งค่า Service Worker (สำหรับ Offline และ Caching)
    workbox: {
      navigateFallbackDenylist: [
        /^\/_/,        // Nuxt internal routes
        /^\/api\//,    // API routes
        /^\/sw\.js$/,  // Service Worker file
        /^\/workbox-/, // workbox files
      ], // ป้องกันไม่ให้จับคู่กับ API routes

      // ตัวเลือกการแคชเบื้องต้น: แคชไฟล์ที่สร้างโดย Nuxt โดยอัตโนมัติ
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'], // แพทเทิร์นไฟล์ที่ Workbox จะแคช

      // เพิ่ม runtime caching สำหรับ navigation requests
      runtimeCaching: [
        {
          // ย้าย caching รูปภาพขึ้นมาก่อน (เพื่อให้ match ก่อน rule ของ pages)
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 2592000 // 30 days
            }
          }
        },
        {
          // รองรับ iconify & lucide ทุกอัน
          urlPattern: ({ url }) => /(iconify|lucide)/.test(url.origin),
          handler: 'CacheFirst',
          options: {
            cacheName: 'icons',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 2592000 // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    // เปิดใช้งาน Development (แนะนำให้เปิดเฉพาะในโหมด dev)
    devOptions: {
      enabled: true, // Enable in dev mode to serve sw.js
      type: 'module', // ใช้ ES module (แนะนำ)
    },
  },

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
    },
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
