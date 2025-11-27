import { z } from 'zod';
import { Prisma } from '@prisma/client';
import type { AppError } from '~~/server/types/errors'

export function handleError(error: unknown): AppError {
    // Zod errors
    if (error instanceof z.ZodError) {
        return {
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Validation failed',
            errorCode: 'VALIDATION_ERROR',
            details: error.issues
        };
    }

    // Prisma known errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return {
                    statusCode: 409,
                    statusMessage: 'Conflict',
                    message: 'Duplicate entry found',
                    errorCode: 'DUPLICATE_ENTRY',
                    details: { target: error.meta?.target }
                };
            case 'P2025':
                return {
                    statusCode: 404,
                    statusMessage: 'Not Found',
                    message: 'Record not found',
                    errorCode: 'NOT_FOUND'
                };
            default:
                return {
                    statusCode: 500,
                    statusMessage: 'Internal Server Error',
                    message: 'Database operation failed',
                    errorCode: 'DATABASE_ERROR',
                    details: { code: error.code }
                };
        }
    }

    // Prisma unknown errors
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        return {
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Database request failed',
            errorCode: 'DATABASE_ERROR'
        };
    }

    // Generic errors
    if (error instanceof Error) {
        if (error.message.includes('bcrypt')) {
            return {
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                message: 'Password processing failed',
                errorCode: 'AUTH_ERROR'
            };
        }

        return {
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: error.message || 'An unexpected error occurred',
            errorCode: 'INTERNAL_ERROR'
        };
    }

    // Unknown errors
    return {
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'An unknown error occurred',
        errorCode: 'UNKNOWN_ERROR'
    };
}

export function throwAppError(error: unknown): never {
    const appError = handleError(error);

    throw createError({
        statusCode: appError.statusCode,
        statusMessage: appError.statusMessage,
        message: appError.message,
        data: appError.details
    });
}