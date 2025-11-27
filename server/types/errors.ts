export type ErrorCode =
    | 'NOT_FOUND'
    | 'AUTH_ERROR'
    | 'DATABASE_ERROR'
    | 'INTERNAL_ERROR'
    | 'DUPLICATE_ENTRY'
    | 'VALIDATION_ERROR'
    | 'UNKNOWN_ERROR';

export interface AppError {
    statusCode: number;
    statusMessage: string;    // HTTP status message
    message: string;          // User-friendly error message
    errorCode: ErrorCode;        // Application-specific error code
    details?: any;            // Additional error details
}