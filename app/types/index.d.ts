
export interface UsersResponse {
    error: boolean
    url: string
    statusCode: number
    statusMessage: string
    message: string
    data: {
        usersCount: number
        users: User[]
    }
}

interface User {
    id: number
    name: string
    email: string
    createdAt: Date
    updatedAt: Date | null
    deletedAt: Date | null
}