import type { AvatarProps } from '@nuxt/ui'
import { randomRoles } from '~/constants/roles'; // สมมติว่า path ถูกต้อง

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}


// app/types/index.d.ts

type UserRole = typeof randomRoles[number];

export interface Users {
  id: number
  name: string
  username: string
  email: string
  role: UserRole
  avatar: AvatarProps | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export interface UsersResponse {
  error: boolean
  url: string
  statusCode: number
  statusMessage: string
  message: string
  data: {
    usersCount: number
    users: Users[]
  }
}

export interface ErrorResponse {
  error: boolean;
  url: string;
  statusCode: number;
  statusMessage: string;
  message: string;
}