# Nuxt4 Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash [Terminal]
npm install
```

## ติดตั้ง Prisma CLI

```bash
# รันคำสั่งนี้แค่ครั้งแรก ของการติดตั้งโปรแกรม
$ npm install prisma -g
```

## สร้าง structure ฐานข้อมูล และใส่ข้อมูลตัวอย่าง

- *** ใช้ฐานข้อมูล ในเครื่องตัวเอง

```bash
# รันคำสั่งนี้แค่ครั้งแรก ของการติดตั้งโปรแกรม
$ npx prisma migrate reset
$ npx prisma migrate dev --name init
```

```bash
# Table: T_Users
# รันคำสั่งนี้แค่ครั้งแรก ของการติดตั้งโปรแกรม
$ npm run seed
```

- คำสั่งอื่นๆ

```bash
# เรียกใช้ Prisma Studio เพื่อใช้แก้ไขข้อมูลในฐานข้อมูล
$ npx prisma studio
```

```bash
# สร้างไฟล์มิกเรตใหม่ อัปเดตฐานข้อมูล
$ npx prisma migrate dev
```

```bash
# init คือชื่อของการ migrate ตัวอย่าง
$ npx prisma migrate dev --name create_signinlogs_table
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash [Terminal]
npm run dev
```

## Production

Build the application for production:

```bash [Terminal]
npm run build
```

Locally preview production build:

```bash [Terminal]
npm run preview
```

Install prisma global

```bash [Terminal]
npm install -g prisma@6.7.0
```

Install seed

```bash [Terminal]
npm run seed
```

Server api best practices

```bash [Terminal]
server/
├── api/
│   └── v1/
│       └── users/
│           ├── index.get.ts    // GET     ดึงรายชื่อผู้ใช้ทั้งหมด (List)
│           ├── index.post.ts   // POST    สร้างผู้ใช้ใหม่ (Create)
│           ├── [id].get.ts     // GET     ดูรายละเอียดรายคน (Detail)
│           ├── [id].put.ts     // PUT     แก้ไขข้อมูล (Update)
│           └── [id].delete.ts  // DELETE  ลบผู้ใช้ (Delete)
```

## Extensions VS Code
- ไม่ควรใช้ Vetur ให้ใช้ Volar
- Vetur ไม่รองรับ Top-level await ใน script setup


Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
