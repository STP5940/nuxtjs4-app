import { useErrorHandler } from '~~/server/composables/useErrorHandler';
import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { hashPassword } from '~~/lib/auth';
import prisma from '~~/lib/prisma'

import { z } from 'zod';

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export default defineEventHandler(async (event) => {
    const { handleAndThrow } = useErrorHandler();
    const { created } = useResponseHandler(event);

    try {
        const body = await readBody(event)
        const validatedData = userSchema.parse(body)

        // เช็ค email ซ้ำ
        const existingUser = await prisma.users.findFirst({
            where: {
                email: validatedData.email
            }
        });

        if (existingUser) {
            throw createError({
                statusCode: 409,
                statusMessage: "Conflict",
                message: 'Email already exists'
            });
        }

        const user = await prisma.users.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: await hashPassword(validatedData.password),
                createdAt: new Date(),
            },
            omit: {
                password: true
            }
        });

        return created({ user }, 'User created successfully')
    } catch (error: unknown) {
        handleAndThrow(error);
    }
})