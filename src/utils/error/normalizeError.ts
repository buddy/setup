/**
 * Normalizes any error into a string message
 * @param error - The error to normalize
 * @returns A string error message
 */
export function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}
