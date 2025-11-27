import { useErrorHandler } from '~~/server/composables/useErrorHandler';
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

    try {
        const body = await readBody(event)
        const validatedData = userSchema.parse(body)

        if (!body.name || !body.email || !body.password) {
            throw createError({
                statusCode: 400,
                statusMessage: 'name, email and password are required'
            })
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

        return { user: user }
    } catch (error: unknown) {
        handleAndThrow(error);
    }
})