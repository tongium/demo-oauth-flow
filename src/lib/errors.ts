/**
 * Custom error classes for OAuth flow
 */

export class OAuthError extends Error {
    constructor(
        message: string,
        public code?: string,
        public statusCode?: number
    ) {
        super(message)
        this.name = 'OAuthError'
    }
}

export class TokenExchangeError extends OAuthError {
    constructor(message: string, code?: string) {
        super(message, code)
        this.name = 'TokenExchangeError'
    }
}

export class ValidationError extends OAuthError {
    constructor(message: string) {
        super(message)
        this.name = 'ValidationError'
    }
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof OAuthError) {
        return error.message
    }
    if (error instanceof Error) {
        return error.message
    }
    if (typeof error === 'string') {
        return error
    }
    return 'An unexpected error occurred'
}
