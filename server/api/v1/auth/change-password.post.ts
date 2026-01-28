// server/api/v1/auth/change-password.post.ts

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { useErrorHandler } from '~~/server/composables/useErrorHandler';
import { verifyPassword, hashPassword } from '~~/lib/auth';
import prisma from '~~/lib/prisma'

import { z } from 'zod';

const passwordSchema = z.object({
    currentPassword: z.string().min(8, "Must be at least 8 characters"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
});

export default defineEventHandler(async (event) => {
    const { handleAndThrow } = useErrorHandler();
    const { responseSuccess, responseUnauthorized } = useResponseHandler(event);

    const accessToken = getCookie(event, 'access_token');

    // ตรวจสอบว่ามี accessToken หรือไม่
    if (!accessToken) {
        return responseUnauthorized('No token provided');
    }

    const userPayload = decodeAccessToken(accessToken);

    try {
        const body = await readBody(event)
        const validatedData = passwordSchema.parse(body)

        const findingUser = await prisma.users.findFirst({
            where: {
                userId: userPayload?.sub,
            },
        })

        // ถ้าไม่พบผู้ใช้
        if (!findingUser) {
            throw createError({
                statusCode: 404,
                statusMessage: "Not Found",
                message: "User not found"
            });
        }

        // ถ้าผู้ใช้ถูกลบออกแล้ว
        if (findingUser.deletedAt) {
            throw createError({
                statusCode: 403,
                statusMessage: "Forbidden",
                message: "User account is deleted"
            });
        }

        // ตรวจสอบรหัสผ่าน
        const isValidPassword = await verifyPassword(
            validatedData.currentPassword,
            findingUser.password
        );

        // ถ้ารหัสผ่านปัจจุบันไม่ถูกต้อง
        if (!isValidPassword) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: "Password is incorrect"
            });
        }

        // รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านปัจจุบัน
        if (validatedData.currentPassword === validatedData.newPassword) {
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Password must be different"
            });
        }

        const newPasswordHash = await hashPassword(validatedData.newPassword);
        const updatedAtUser = new Date();
        await prisma.users.update({
            where: {
                userId: findingUser.userId
            },
            data: {
                password: newPasswordHash,
                updatedAt: updatedAtUser
            }
        });

        return responseSuccess({
            userId: findingUser.userId,
            name: findingUser.name,
            username: findingUser.username,
            email: findingUser.email,
            avatar: findingUser.avatar,
            createdAt: findingUser.createdAt,
            updatedAt: updatedAtUser,
            deletedAt: null
        }, "Password changed successfully")
    } catch (error: unknown) {
        handleAndThrow(error);
    }
})