// server/api/hello.get.ts
export default defineEventHandler(async () => {
    return { message: 'Hello from API!' }
})