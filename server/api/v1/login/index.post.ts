// server/api/v1/login/index.post.ts

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { useErrorHandler } from '~~/server/composables/useErrorHandler';
import { generateTokens } from '~~/server/utils/token';
import { randomRoles } from '~~/constants/roles'
import { verifyPassword } from '~~/lib/auth';
import prisma from '~~/lib/prisma'

import { defineEventHandler, setCookie } from 'h3';
import parseDuration from 'parse-duration';
import { z } from 'zod';

const userSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export default defineEventHandler(async (event) => {
    const { handleAndThrow } = useErrorHandler();
    const { responseSuccess } = useResponseHandler(event);

    try {
        const body = await readBody(event)
        const validatedData = userSchema.parse(body)

        // เช็ค username เข้า้สู่ระบบ
        const findingUser = await prisma.users.findFirst({
            where: {
                username: validatedData.username
            }
        });

        if (!findingUser) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: 'username or password is incorrect'
            });
        }

        // ตรวจสอบรหัสผ่าน
        const isValidPassword = await verifyPassword(
            validatedData.password,
            findingUser.password
        );

        if (!isValidPassword) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: 'username or password is incorrect'
            });
        }

        // เอา password ออกก่อนส่ง response
        const { password, ...userWithoutPassword } = findingUser;

        const transformedUser = {
            ...userWithoutPassword,
            role: randomRoles[Math.floor(Math.random() * randomRoles.length)]
        };

        const { accessToken, refreshToken, refreshTokenId } = generateTokens(
            transformedUser.id,
            transformedUser.role
        );

        // อ่านค่าจาก .env หรือใช้ค่าเริ่มต้น 7 วัน
        const DEFAULT_REFRESH_TOKEN_MAX_AGE_MS: number = 7 * 24 * 60 * 60 * 1000;
        const refreshDurationString: string = process.env.REFRESH_TOKEN_MAX_AGE || '7d';
        const REFRESH_TOKEN_MAX_AGE_MS: number = parseDuration(refreshDurationString) || DEFAULT_REFRESH_TOKEN_MAX_AGE_MS;

        // กำหนด refresh token ใน cookie
        setCookie(event, 'refresh_token', refreshToken, {
            httpOnly: false, // ⚠️ ให้ JavaScript อ่านได้
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: REFRESH_TOKEN_MAX_AGE_MS / 1000, // เปลี่ยนเป็นวินาที
        })

        // อ่านค่าจาก .env หรือใช้ค่าเริ่มต้น 15 นาที
        const DEFAULT_ACCESS_TOKEN_MAX_AGE_MS: number = 15 * 60 * 1000;
        const durationString: string = process.env.ACCESS_TOKEN_MAX_AGE || '15m';
        const ACCESS_TOKEN_MAX_AGE_MS: number = parseDuration(durationString) || DEFAULT_ACCESS_TOKEN_MAX_AGE_MS;

        // กำหนด access token ใน cookie
        setCookie(event, 'access_token', accessToken, {
            httpOnly: false, // ⚠️ ให้ JavaScript อ่านได้
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // ⭐ แนะนำ: ป้องกัน CSRF + UX ดี
            maxAge: ACCESS_TOKEN_MAX_AGE_MS / 1000,  // เปลี่ยนเป็นวินาที
        })

        return responseSuccess({
            user: transformedUser
        }, 'User logged in successfully')
    } catch (error: unknown) {
        handleAndThrow(error);
    }
})