// server/api/v1/users.get.ts

import type { AvatarProps } from '@nuxt/ui'

import { useResponseHandler } from '~~/server/composables/useResponseHandler';
import { randomRoles } from '~~/constants/roles'
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    const { responseSuccess } = useResponseHandler(event);

    const users = await prisma.users.findMany({
        omit: {
            password: true
        }
    })

    const transformedUsers = users.map(user => {
        const avatarProps: AvatarProps | undefined = user.avatar ? {
            src: user.avatar,
            alt: `${user.name || user.email}'s avatar`
        } : undefined;

        return {
            ...user,
            role: randomRoles[Math.floor(Math.random() * randomRoles.length)],
            avatar: avatarProps,
        }
    })

    return responseSuccess({
        usersCount: users?.length || 0,
        users: transformedUsers
    }, 'Users retrieved successfully')
})