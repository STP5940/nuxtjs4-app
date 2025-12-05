// server/composables/useErrorHandler.ts

import { handleError, throwAppError } from '~~/server/utils/errorHandler';

/**
 * ฟังก์ชัน composable สำหรับจัดการ errors ในแอปพลิเคชัน
 * @return วัตถุที่ประกอบด้วยฟังก์ชันจัดการ errors
 */
export const useErrorHandler = () => {
  const handleAndThrow = (error: unknown): never => {
    throwAppError(error);
  };

  const handleAndLog = (error: unknown, context?: string) => {
    const appError = handleError(error);

    // Log error for monitoring
    console.error(`Error${context ? ` in ${context}` : ''}:`, {
      error: appError,
      originalError: error
    });

    return appError;
  };

  return {
    handleAndThrow,
    handleAndLog,
    handleError
  };
};