// server/composables/useErrorHandler.ts

import { handleError, throwAppError } from '~~/server/utils/errorHandler';

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