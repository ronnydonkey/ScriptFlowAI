/**
 * Retry utility with exponential backoff for API calls
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Retry a function with exponential backoff
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function if successful
 * @throws The last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying after ${delay}ms...`);
      console.log(`[Retry] Error:`, error.message || error);

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  throw lastError;
}

/**
 * Determine if an error is retryable
 * @param error - The error to check
 * @returns True if the error should be retried
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.message?.includes('fetch failed')) return true;
  if (error.message?.includes('network')) return true;

  // HTTP status codes that should be retried
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (error.status && retryableStatusCodes.includes(error.status)) return true;

  // Timeout errors
  if (error.message?.includes('timeout')) return true;
  if (error.code === 'ETIMEDOUT') return true;

  return false;
}

/**
 * Retry only if the error is retryable
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function if successful
 */
export async function retryIfRetryable<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await retryWithBackoff(fn, {
      ...options,
      maxRetries: 1, // First try
    });
  } catch (error) {
    if (isRetryableError(error)) {
      console.log('[Retry] Error is retryable, attempting retry...');
      return await retryWithBackoff(fn, options);
    }
    throw error;
  }
}

/**
 * Get a user-friendly error message based on error type
 * @param error - The error to process
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
  // Rate limit errors
  if (error.status === 429) {
    return 'Rate limit exceeded. Please wait a moment and try again.';
  }

  // Server errors
  if (error.status >= 500) {
    return 'Server error occurred. Retrying automatically...';
  }

  // Timeout errors
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Retrying with longer timeout...';
  }

  // Network errors
  if (error.message?.includes('fetch failed') || error.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Token limit errors
  if (error.message?.includes('token') || error.message?.includes('context length')) {
    return 'Content too long. Try shortening your input or removing some research sources.';
  }

  // API key errors
  if (error.status === 401 || error.message?.includes('api key')) {
    return 'Authentication error. Please check your API keys in environment variables.';
  }

  // Generic error
  return error.message || 'An unexpected error occurred. Please try again.';
}
