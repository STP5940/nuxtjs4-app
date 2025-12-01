// server/api/v1/users.post.ts

import { useErrorHandler } from '~~/server/composables/useErrorHandler';
import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { hashPassword } from '~~/lib/auth';
import prisma from '~~/lib/prisma'

import { z } from 'zod';

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export default defineEventHandler(async (event) => {
    const { handleAndThrow } = useErrorHandler();
    const { responseCreated } = useResponseHandler(event);

    try {
        const body = await readBody(event)
        const validatedData = userSchema.parse(body)

        // เช็ค email ซ้ำ
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [
                    { email: validatedData.email },
                    { username: validatedData.username }
                ]
            }
        });

        if (existingUser) {
            throw createError({
                statusCode: 409,
                statusMessage: "Conflict",
                message: (
                    existingUser.email === validatedData.email
                        ? 'Email already exists'
                        : 'Username already exists'
                )
            });
        }

        const user = await prisma.users.create({
            data: {
                name: validatedData.name,
                username: validatedData.username,
                email: validatedData.email,
                password: await hashPassword(validatedData.password),
                createdAt: new Date(),
            },
            omit: {
                password: true
            }
        });

        return responseCreated({ user }, 'User created successfully')
    } catch (error: unknown) {
        handleAndThrow(error);
    }
})