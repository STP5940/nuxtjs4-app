// server/api/v1/users.post.ts

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { useErrorHandler } from '~~/server/composables/useErrorHandler';
import { generateTokens } from '~~/server/utils/token';
import { randomRoles } from '~~/constants/roles'
import { verifyPassword } from '~~/lib/auth';
import prisma from '~~/lib/prisma'

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

        return responseSuccess({
            refreshToken: refreshToken,
            accacessToken: accessToken,
            user: transformedUser
        }, 'User logged in successfully')
    } catch (error: unknown) {
        handleAndThrow(error);
    }
})